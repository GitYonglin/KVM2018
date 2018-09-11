import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { MSService } from '../../services/MS.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { CanvasCvsComponent } from '../../shared/canvas-cvs/canvas-cvs.component';
import { NzModalService } from 'ng-zorro-antd';
import { AutoControlData, AutoControl, GetAutoData } from '../../utils/autoTension';
import { Observable } from 'rxjs';
import { funcSumData } from '../../model/live.model';
import { Value2PLC } from '../../utils/PLC8Show';
import { MpaUp } from '../../model/Hub.model';
import { APIService } from '../../services/api.service';
import { N2F } from '../../utils/toFixed';

@Component({
  selector: 'app-tension',
  templateUrl: './tension.component.html',
  styleUrls: ['./tension.component.less']
})
export class TensionComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('cvs')
  private elementCvs: ElementRef;
  @ViewChild(CanvasCvsComponent)
  private cvs: CanvasCvsComponent;
  /** 曲线宽高 */
  heightCvs: any;
  widthCvs: any;
  /** 弹出框 */
  modalState = {
    ready: false,
    stop: false,
    goBack: false,
    done: false,
    doneTime: 5,
  };
  /** 数据下载状态 */
  upPlcState = false;
  /** 自检循环监控 */
  selfT: any;
  /** 定时器 */
  /** 张拉监控 */
  runT: any;
  /** 保压 */
  pmT: any;
  /** 卸荷 */
  loadOffT: any;
  /** 完成跳转延时 */
  doneT: any;
  /** 回顶监控 */
  goBackT: any;
  /** 实时数据保存 */
  liveT: any;

  bridgeName = '梁号';
  autoData: AutoControlData;
  stageSaveDelay = {
    a1: 0,
    a2: 0,
    b1: 0,
    b2: 0,
  };
  deviationRate = {
    a1: false,
    a2: false,
    b1: false,
    b2: false,
  };

  constructor(
    public _ms: MSService,
    private _router: Router,
    private modal: NzModalService,
    private activatedRoute: ActivatedRoute,
    private _service: APIService,
  ) {
    this.activatedRoute.queryParams.subscribe((params: Params) => {
      this.bridgeName = params['bridgeName'];
      const autoData = JSON.parse(localStorage.getItem('autoData'));
      this.autoData = new AutoControl(autoData).data;
      console.log('路由数据', autoData, this.autoData);
    });
    this._ms.liveMonitoringEvent = new Event('liveMonitoring');

  }

  ngOnInit() {
    console.log(this.deviationRate);
    document.addEventListener('liveMonitoring', () => {
      this.pause();

    });

  }
  ngAfterViewInit() {
    this.widthCvs = this.elementCvs.nativeElement.offsetWidth;
    this.heightCvs = this.elementCvs.nativeElement.offsetHeight - 2;
    console.log(this.heightCvs, this.widthCvs);
  }
  ngOnDestroy(): void {
    console.log('自动结束', this._ms.liveMonitoringEvent.type);
    this._ms.liveMonitoringEvent = null;
    clearInterval(this.selfT);
    clearInterval(this.runT);
    clearInterval(this.pmT);
    clearInterval(this.loadOffT);
    clearInterval(this.doneT);
    clearInterval(this.liveT);
    clearInterval(this.goBackT);
  }
  /** 取消张拉 */
  readyCancel() {
    history.go(-1);
  }
  /** 启动张拉 */
  tensionRun() {
    this.UPPLCMpa().subscribe(() => {
      console.log('下载完成');
      this.self();
    }, () => {
      console.error('数据下载错误！！！');
      this.tensionRun();
    });
  }

  /** 压力上载到PLC */
  UPPLCMpa(): Observable<void> {
    this.upPlcState = true;
    const record = this.autoData.record;
    const state = this.autoData.state;
    const data: MpaUp = {
      address: 410,
      mode: this.autoData.task.mode,
      a1: 0,
      a2: 0,
      b1: 0,
      b2: 0
    };
    const affirmMpa: MpaUp = {
      address: 414,
      mode: this.autoData.task.mode,
      a1: 0,
      a2: 0,
      b1: 0,
      b2: 0
    };
    for (const name of this.autoData.data.modeStr) {
      data[name] = this.autoData.data.PLCMpa[name][state.stage];
      if (state.affirmMm[name] === 0) {
        affirmMpa[name] = this.autoData.data.affirmMpa[name];
      }
    }
    if (state.affirmMpa && !state.affirmMpaDone) {
      this._ms.connection.invoke('AffirmMpa', affirmMpa);
    }
    console.log(data, '下载数据');
    return new Observable((ob) => {
      this._ms.connection.invoke('UpMpaAsync', data).then((r) => {
        console.log('返回', r);
        this.upPlcState = false;
        for (const name of this.autoData.data.modeStr) {
          if (this._ms.Dev[name].liveData.setPLCMpa !== data[name]) {
            console.error(name, this._ms.Dev[name].liveData.setPLCMpa, data[name]);
            ob.error();
          }
        }
        ob.next();
      });
    });
  }

  /** 设备自检 */
  self() {
    const live = this._ms.Dev;
    const state = this.autoData.state;
    state.self = true;
    state.selfError = false;
    this.autoData.state.self = true;
    this._ms.connection.invoke('DF05Async', { address: 527, F05: true }).then((r) => {
      this.selfT = setInterval(() => {
        let rState = true;
        console.log('自检中');
        for (const name of this.autoData.data.modeStr) {
          if (live[name].liveData.state === '自检错误') {
            state.selfError = true;
            clearInterval(this.selfT);
          }
          if (live[name].liveData.state !== '自检完成') {
            rState = false;
          }
        }
        if (rState) {
          clearInterval(this.selfT);
          // alert('自检完成');
          this.start();
        }
      }, 200);
    });
  }
  /** 开始张拉 */
  start() {
    this.liveSaveCvs();
    this.autoData.state.run = true;
    this._ms.connection.invoke('AutoStartAsync').then(() => {
    });
    this.pmMonitoring();
  }
  /** 张拉监控 */
  pmMonitoring() {
    const state = this.autoData.state;
    const dev = this._ms.Dev;
    this.runT = setInterval(() => {
      let done = true;
      let affirmDone = true;
      for (const name of this.autoData.data.modeStr) {
        // console.log(name, state.pm, dev[name].liveData.state, (dev[name].liveData.state === '保压' || dev[name].liveData.state === '补压'));
        if (dev[name].liveData.state === '保压' || dev[name].liveData.state === '补压') {
          state.balance = true;
        } else {
          done = false;
        }
        if (state.affirmMpa && !state.affirmMpaDone && state.affirmMm[name] === 0) {
          affirmDone = false;
          this.affirmMpa(name);
        }
      }
      state.affirmMpaDone = affirmDone;

      if (done) {
        // alert('保压');
        this.runPm();
        state.balance = false;
        clearInterval(this.runT);
      }
    }, 500);
  }
  /** 中断压力确认 */
  affirmMpa(name) {
    const state = this.autoData.state;
    const dev = this._ms.Dev;
    if (dev[name].liveData.state === '压力确认完成') {
      state.affirmMm[name] = dev[name].liveData.mm;
      const id = name === 'a1' || name === 'b1' ? 1 : 2;
      const address = name === 'a1' || name === 'a2' ? 414 : 415;
      this._ms.connection.invoke('AffirmMpaDone', {address: address, id: id, F06: 0}).then((r) => {
        console.log(r);
      });
      console.log('压力确认', state.affirmMm);
    }
  }
  /** 保压 */
  runPm() {
    const data = this.autoData;
    data.state.pm = true;

    this.pmT = setInterval(() => {
      if (!this.autoData.state.pause) {
        data.record.time[data.state.stage]++;
        if (data.data.time[data.state.stage] === data.record.time[data.state.stage]) {
          this.donePm();
          clearInterval(this.pmT);
        }
      }
    }, 1000);
  }
  /** 保压完成 */
  donePm() {
    const data = this.autoData;
    console.log(data.state.stage, data.data.stageSrt.length - 1);
    // alert('保压完成');
    if (data.state.stage === data.data.stageSrt.length - 1) {
      data.state.tensionDone = true;
      this.runLoadOff();
    } else {
      data.state.stage++;
      this.autoData.record.stage++;
      this.UPPLCMpa().subscribe(() => {
        this.pmMonitoring();
      }, () => {
        console.error('数据下载错误！！！');
        this.tensionRun();
      });
    }
  }
  /** 启动卸荷 */
  runLoadOff() {
    const data = this.autoData.data;
    const state = this.autoData.state;
    const dev = this._ms.Dev;
    const mpa: MpaUp = {
      address: 412,
      mode: this.autoData.task.mode,
      a1: 0,
      a2: 0,
      b1: 0,
      b2: 0
    };
    for (const name of data.modeStr) {
      mpa[name] = data.PLCMpa[name][0];
    }
    state.loadOffState = true;
    this._ms.connection.invoke('LoadOffAsync', mpa).then((r) => {
      console.log('卸荷请求返回', r);

      for (const name of this.autoData.data.modeStr) {
        if (!state.loadOffDone && dev[name].liveData.state !== '卸荷中' && dev[name].liveData.state !== '卸荷完成') {
          console.log(name, dev[name].liveData.state);
          this.runLoadOff();
          return;
        } else {
          if (state.loadOffDone) {
            return;
          }
          // alert('卸荷延时');
          state.loadOffDone = true;
          this.delayLoadOff();
        }
      }
    });
  }
  /** 卸荷延时 */
  delayLoadOff() {
    this.loadOffT = setInterval(() => {
      if (!this.autoData.state.pause) {
        this.autoData.state.loadOffTime++;
        if (this.autoData.state.loadOffTime === this.autoData.data.loadOffTime) {
          clearInterval(this.loadOffT);
          clearInterval(this.liveT);
          // alert('卸荷完成');
          this.returnStartMpa();
          this.returnBack();
        }
      }
    }, 1000);
  }
  /** 回程 */
  returnBack() {
    this._ms.connection.invoke('AutoDoneAsync').then((r) => {
      const dev = this._ms.Dev;
      console.log('回程', r);
      for (const name of this.autoData.data.modeStr) {
        if ((dev[name].liveData.state === '回程中')) {
        }
      }
      console.log(this.autoData);
      this.saveRecordDB();
      this.modalState.done = true;
      // alert('跳转');
      this.doneT = setInterval(() => {
        this.modalState.doneTime--;
        if (this.modalState.doneTime <= 0) {
          clearInterval(this.doneT);
          history.go(-1);
        }
      }, 1000);
    });
  }

  /** 实时曲线数据保存 */
  liveSaveCvs() {
    const record = this.autoData.record;
    const data = this.autoData.data;
    const dev = this._ms.Dev;
    this.liveT = setInterval(() => {
      const time = new Date().getTime();
      record.cvsData.time.push(time);
      data.modeStr.forEach(name => {
        record.cvsData.mpa[name].push(dev[name].liveData.mpa);
        record.cvsData.mm[name].push(dev[name].liveData.mm);
      });
      this.cvs.updataCvs(record.cvsData);
    }, 1000);
  }
  /** 实时阶段数据保存 */
  liveStageSave() {
    const record = this.autoData.record;
    const data = this.autoData.data;
    const state = this.autoData.state;
    const dev = this._ms.Dev;
    const i = this.stageSaveDelay;
    // console.log(i, this.stageSaveDelay);
    if (state.run && !state.tensionDone && !state.pauseDone) {
      for (const name of data.modeStr) {
        if ((state.affirmMpa && state.affirmMm[name] === 0 ) ||
          dev[name].liveData.state === '张拉暂停' || dev[name].liveData.alarmNumber !== 0) {
          break;
        }
        const devMpa = dev[name].liveData.mpa;
        const devMm =  N2F(state.originalMm[name] + (dev[name].liveData.mm - state.affirmMm[name]));
        let absMpa = 0;
        let absMm = 0;
        if (record.mpa[name][state.stage] !== 0) {
          absMpa = Math.abs(record.mpa[name][state.stage] - devMpa);
          absMm = Math.abs(record.mm[name][state.stage] - devMm);
        }
        // console.log(!state.tensionDone && !state.pause && ((absMm < 15 && absMpa < 1) || i[name] >= 30),
        //   !state.tensionDone, !state.pause, absMm, absMpa, i);
        if (((absMm < 15 && absMpa < 2) || i[name] >= 30)) {
          record.mpa[name][state.stage] = devMpa;
          record.mm[name][state.stage] = devMm;
          i[name] = 0;
        } else {
          // console.log('i++');
          i[name]++;
          if (state.pause) {
            i[name] = 0;
          }
        }
      }
    }
    if (state.stage > 0 && !state.tensionDone) {
      this.autoData.sumData = funcSumData(record.mm, this.autoData.task, state.stage);
      this.BalanceControl();
      this.maximumDeviationRate();
    }
  }
  /** 回油值初张拉数据保存 */
  returnStartMpa() {
    const record = this.autoData.record;
    const data = this.autoData.data;
    const dev = this._ms.Dev;
    data.modeStr.forEach(name => {
      record.returnStart[name].mpa = dev[name].liveData.mpa;
      record.returnStart[name].mm = dev[name].liveData.mm;
    });
  }
  /** 张拉平衡控制 */
  BalanceControl() {
    // const balance = Value2PLC(this.autoData.data.mmBalanceControl, this._ms.deviceParameter.mmCoefficient);
    const balance = this.autoData.data.mmBalanceControl;
    const sum = this.autoData.sumData;
    const data = this.autoData.data;
    const state = this.autoData.state;
    const mm: MpaUp = {
      address: 40,
      mode: this.autoData.task.mode,
      a1: 0,
      a2: 0,
      b1: 0,
      b2: 0
    };
    if (!state.balance) {
      switch (this.autoData.task.mode) {
        case 1:
          mm.a1 = Math.round(sum.a1.mm - sum.a2.mm - balance);
          mm.a2 = Math.round(sum.a2.mm - sum.a1.mm - balance);
          break;
        case 3:
          mm.b1 = Math.round(sum.b1.mm - sum.b2.mm - balance);
          mm.b2 = Math.round(sum.b2.mm - sum.b1.mm - balance);
          break;
        case 4:
          const a1 = Math.round([sum.a1.mm - sum.a2.mm, sum.a1.mm - sum.b1.mm, sum.a1.mm - sum.b2.mm].sort().pop());
          mm.a1 = Math.round(a1 - balance);
          const a2 = Math.round([sum.a2.mm - sum.a1.mm, sum.a2.mm - sum.b1.mm, sum.a2.mm - sum.b2.mm].sort().pop());
          mm.a2 = Math.round(a2 - balance);
          const b1 = Math.round([sum.b1.mm - sum.a1.mm, sum.b1.mm - sum.a2.mm, sum.b1.mm - sum.b2.mm].sort().pop());
          mm.b1 = Math.round(b1 - balance);
          const b2 = Math.round([sum.b2.mm - sum.a1.mm, sum.b2.mm - sum.a2.mm, sum.b2.mm - sum.b1.mm].sort().pop());
          mm.b2 = Math.round(b2 - balance);
          // console.log('a1=', mm.a1, 'a2=', mm.a2, 'b1=', mm.b1, 'b2=', mm.b2);
          break;
          default:
          break;
        }
    }
      // console.log(state.affirmMpa || state.balance);
    data.modeStr.forEach(name => {
      if (state.affirmMpa || state.balance) {
        mm[name] = 0;
      } else if (!state.affirmMpa || (state.affirmMpa && state.affirmMm[name] !== 0)) {
        mm[name] = mm[name] < 0 ? 0 : mm[name];
      }
    });
    this._ms.connection.invoke('Balance', mm).then((r) => {
      // console.log(r);
    });
  }
  /** 超伸长量报警 */
  maximumDeviationRate() {
    const data = this.autoData.data;
    const sumData =  this.autoData.sumData;
    const state = this.autoData.state;
    state.maximumDeviationRate = false;
    console.log(sumData.a1.deviation, sumData.b1.deviation, data.maximumDeviationRate);
    if (data.modeStr.indexOf('a1') > -1 && (sumData.a1.deviation > data.maximumDeviationRate)) {
      this.deviationRate.a1 = true;
    } else {
      this.deviationRate.a1 = false;
    }
    if (data.modeStr.indexOf('b1') > -1 && (sumData.b1.deviation > data.maximumDeviationRate)) {
      this.deviationRate.b1 = true;
    } else {
      this.deviationRate.b1 = false;
    }
    for (const name of data.modeStr) {
      if (this.deviationRate[name]) {
        state.maximumDeviationRate = true;
        return;
      }
    }
  }
  /** 暂停 */
  pause() {
    // console.log('异常监听');
    const state = this.autoData.state;
    const data = this.autoData.data;
    const dev = this._ms.Dev;
    let pauseDone = true;
    if (!state.pauseDone) {
      data.modeStr.forEach(name => {
        if (dev[name].liveData.state === '张拉暂停' ||
          dev[name].liveData.state === '超工作位移上限' ||
          state.maximumDeviationRate) {
          this._ms.connection.invoke('Pause');
          if (dev[name].liveData.state === '超工作位移上限') {
            state.superWorkMm = true;
          }
          state.pause = true;
          state.alarmLift = false;
          state.pauseDone = false;
        } else {
          pauseDone = false;
        }
      });
      state.pauseDone = pauseDone;
    } else {
      data.modeStr.forEach(name => {
        state.alarmLift = true;
        if (!(dev[name].liveData.alarmNumber === 0 && dev[name].liveData.state)) {
          state.alarmLift = false;
        }
      });
    }
    if (state.pause && !state.pauseDone) {
      this._ms.connection.invoke('Pause');
    }
    this.liveStageSave();
  }
  /** 回顶 */
  onGoBack() {
    const F06 = this.autoData.data.mmGoBack;
    const data = this.autoData.data;
    const state = this.autoData.state;
    const dev = this._ms.Dev;
    const oldd = this.autoData;

    clearInterval(this.selfT);
    clearInterval(this.runT);
    clearInterval(this.pmT);
    clearInterval(this.loadOffT);
    clearInterval(this.doneT);
    clearInterval(this.liveT);
    clearInterval(this.goBackT);
    this._ms.connection.invoke('GoBack', {address: 406, F06: F06}).then((r) => {
      console.log(r);
    });
    this.goBackT = setInterval(() => {
      state.goBackDone = true;
      for (const name of data.modeStr) {
        if (dev[name].liveData.state !== '回顶完成') {
          state.goBackDone = false;
          return;
        }
      }
      clearInterval(this.goBackT);
      const d =  new GetAutoData(oldd.task, oldd.record, oldd.KMData, this._ms.Dev, oldd.data);
      this.autoData = new AutoControl(d).data;
      this.autoData.state.goBack = true;
      this.autoData.state.goBackDone = true;
      console.log(this.autoData);
    });
  }
  onShowData() {
    console.log(this.autoData);
  }
  /** 回顶完成 继续张拉 */
  onContinueTension() {
    const state = this.autoData.state;
    state.superWorkMm = false;
    state.goBack = false;
    state.goBackDone = false;
    console.log(this.autoData);
    this.tensionRun();
  }
  /** 暂停继续运行 */
  onPauseRun() {
    const state = this.autoData.state;
    state.pause = false;
    this._ms.connection.invoke('PauseRunAsync').then(() => {
      console.log('暂停继续运行');
      state.alarmLift = false;
      state.pauseDone = false;
    });
  }
  /** 保存记录退出 */
  onSaveExit() {
    console.log(this.autoData);
    this.liveStageSave();
    this.saveRecordDB(true);
    this._router.navigate(['/manual']);
  }
  /** 不保存记录退出 */
  onExit() {
    this._router.navigate(['/manual']);
  }
  /**
   * 保存记录数据到数据库
   *
   * @param {boolean} [state=false] 保存状态 false： 自动结束保存，true： 手动保存
   * @param {boolean} [goBack=false] 回顶记录保存
   * @memberof TensionComponent
   */
  saveRecordDB(saveState: boolean = false, goBack: boolean = false) {
    console.log('数据保存', this.autoData);
    const state = this.autoData.state;
    const data = this.autoData.data;
    const record = this.autoData.record;
    const task = this.autoData.task;
    const httpType = record.state > 0 ? 'put' : 'post';
    const url = record.state > 0 ? `/record/${record.id}` : '/record';
    console.log('张拉记录数据00000000000', record, httpType, url);
    if (!saveState) {
      if (task.twice && (record.state === 0 || record.state === 4)) {
        record.state = 2;
      } else {
        record.state = 1;
      }
    } else {
      if (task.twice && (record.state === 0 || record.state === 4)) {
        record.state = 4;
      } else {
        record.state = 3;
      }
    }
    console.log('张拉记录数据', record, httpType, url);
    const message = { success: '记录保存', error: '' };
    this._service.http(httpType, record, url, message).subscribe(b => {
      console.log('返回数据', b);
    });
  }
}

