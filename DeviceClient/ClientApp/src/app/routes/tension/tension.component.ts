import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { MSService } from '../../services/MS.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { CanvasCvsComponent } from '../../shared/canvas-cvs/canvas-cvs.component';
import { NzModalService } from 'ng-zorro-antd';
import { AutoControlData, AutoControl } from '../../utils/autoTension';
import { Observable } from 'rxjs';
import { funcSumData } from '../../model/live.model';

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
  /** 实时数据保存 */
  liveT: any;

  bridgeName = '梁号';
  autoData: AutoControlData;

  ngOnDestroy(): void {
    console.log('自动结束');
    clearInterval(this.selfT);
    clearInterval(this.runT);
    clearInterval(this.pmT);
    clearInterval(this.loadOffT);
    clearInterval(this.doneT);
    clearInterval(this.liveT);
  }
  constructor(
    public _ms: MSService,
    private _router: Router,
    private modal: NzModalService,
    private activatedRoute: ActivatedRoute,
  ) {
    this.activatedRoute.queryParams.subscribe((params: Params) => {
      this.bridgeName = params['bridgeName'];
      const autoData = JSON.parse(localStorage.getItem('autoData'));
      this.autoData = new AutoControl(autoData).data;
      console.log('路由数据', autoData, this.autoData);
    });

  }

  ngOnInit() {

  }
  ngAfterViewInit() {
    this.widthCvs = this.elementCvs.nativeElement.offsetWidth;
    this.heightCvs = this.elementCvs.nativeElement.offsetHeight - 2;
    console.log(this.heightCvs, this.widthCvs);
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
    const data = {
      address: 410,
      mode: this.autoData.task.mode,
      a1: 0,
      a2: 0,
      b1: 0,
      b2: 0
    };
    for (const name of this.autoData.data.modeStr) {
      data[name] = this.autoData.data.PLCMpa[name][this.autoData.state.stage];
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
    this.liveSave();
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
      for (const name of this.autoData.data.modeStr) {
        console.log(name, state.pm, dev[name].liveData.state, (dev[name].liveData.state === '保压' || dev[name].liveData.state === '补压'));
        if (dev[name].liveData.state !== '保压' && dev[name].liveData.state !== '补压') {
          return;
        }
      }
      // alert('保压');
      this.runPm();
      clearInterval(this.runT);
    }, 500);
  }
  /** 保压 */
  runPm() {
    const data = this.autoData;
    data.state.pm = true;

    this.pmT = setInterval(() => {
      data.record.time[data.state.stage] ++;
      if (data.data.time[data.state.stage] === data.record.time[data.state.stage]) {
        this.donePm();
        clearInterval(this.pmT);
      }
    }, 1000);
  }
  /** 保压完成 */
  donePm() {
    const data = this.autoData;
    console.log(data.state.stage, data.record.time.length - 1);
    // alert('保压完成');
    if (data.state.stage === data.record.time.length - 1) {
      data.state.tensionDone = true;
      this.runLoadOff();
    } else {
      data.state.stage ++;
      this.autoData.record.stage ++;
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
    const mpa = {
      aeeress: 412,
      mode: this.autoData.task.mode,
      a1: 0,
      a2: 0,
      b1: 0,
      b2: 0
    };
    for (const name of data.modeStr) {
      mpa[name] = data.PLCMpa[0];
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
      this.autoData.state.loadOffTime ++;
      if (this.autoData.state.loadOffTime === this.autoData.data.loadOffTime) {
        clearInterval(this.loadOffT);
        clearInterval(this.liveT);
        // alert('卸荷完成');
        this.returnStartMpa();
        this.returnBack();
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
      this.modalState.done = true;
      // alert('跳转');
      this.doneT = setInterval(() => {
        this.modalState.doneTime --;
        if (this.modalState.doneTime >= 0) {
          clearInterval(this.doneT);
          history.go(-1);
        }
      }, 1000);
    });
  }
  /** 实时数据保存 */
  liveSave() {
    this.liveT = setInterval(() => {
      const record = this.autoData.record;
      const data = this.autoData.data;
      const state = this.autoData.state;
      const dev = this._ms.Dev;
      const time = new Date().getTime();
      record.cvsData.time.push(time);
      data.modeStr.forEach(name => {
        record.cvsData.mpa[name].push(dev[name].liveData.mpa);
        record.cvsData.mm[name].push(dev[name].liveData.mm);
        if (!state.tensionDone) {
          record.mpa[name][state.stage] = dev[name].liveData.mpa;
          record.mm[name][state.stage] = dev[name].liveData.mm;
        }
      });
      if (state.stage > 0 && !state.tensionDone) {
        this.autoData.sumData = funcSumData(record.mm, this.autoData.task, state.stage);
      }
      this.cvs.updataCvs(record.cvsData);
    }, 1000);
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
}

