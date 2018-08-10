import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Input } from '@angular/core';
import { F2, Chart, Animate } from '@antv/f2';
import { deviceModes } from '../../model/device.model';
import { setCvs } from '../../utils/cvsData';
import { MSService } from '../../services/MS.service';

// 自定义线图变更动画
Animate.registerAnimation('lineUpdate', function (updateShape, animateCfg) {
  const cacheShape = updateShape.get('cacheShape'); // 该动画 shape 的前一个状态
  const cacheAttrs = cacheShape.attrs; // 上一个 shape 属性
  const oldPoints = cacheAttrs.points; // 上一个状态的关键点
  const newPoints = updateShape.attr('points'); // 当前 shape 的关键点

  const oldLength = oldPoints.length;
  const newLength = newPoints.length;
  const deltaLength = newLength - oldLength;

  const lastPoint = newPoints[newPoints.length - 1];
  for (let i = 0; i < deltaLength; i++) {
    oldPoints.push(lastPoint);
  }

  updateShape.attr(cacheAttrs);
  updateShape.animate().to({
    attrs: {
      points: newPoints
    },
    duration: 800,
    easing: animateCfg.easing
  });
});

@Component({
  selector: 'app-canvas-cvs',
  templateUrl: './canvas-cvs.component.html',
  styleUrls: ['./canvas-cvs.component.less']
})

export class CanvasCvsComponent implements OnInit, AfterViewInit {
  @ViewChild('mountNode')
  mountNode: ElementRef;
  chart: any;
  legendItems = [];
  ms = 1000;

  @Input()
  height = '100%';
  @Input()
  width = '100%';
  @Input()
  data = null;
  @Input()
  title = '压力曲线·Mpa';
  @Input()
  yMax = 60;
  @Input()
  ticks = [0, 10, 20, 30, 40, 50, 60];
  @Input()
  mode = [];
  @Input()
  name = null;

  constructor(private _ms: MSService) { }

  ngOnInit() {
    console.log(this.height, this.width);
  }
  ngAfterViewInit() {
    if (this.data === null) {
      this.saveCvs();
      this.setCvs();
      console.log('初始化曲线', this.data, this.chart);
    } else {
      // this.data = [];
      // this.data.push(...this.getRecord(-2));
      // this.data.push(...this.getRecord(-1));
      // this.data.push(...this.getRecord());
      this.data = setCvs(this.data, this.name);
      console.log(this.data);
    }
    this.chart = new Chart({
      // id: 'mountNode',
      el: this.mountNode.nativeElement,
      pixelRatio: window.devicePixelRatio
    });

    const defs = {
      time: {
        type: 'timeCat',
        mask: 'HH:mm:ss',
        tickCount: 4,
        range: [0, 1]
      },
      value: {
        // tickCount: 8,
        // max: this.yMax,
        // ticks: this.ticks,
        // min: 0
      }
    };
    this.chart.source(this.data, defs);
    this.chart.axis('time', {
      label: (text, index, total) => {
        const textCfg = {
          text: '',
          textAlign: 'center'
        };
        if (index === 0) {
          textCfg.textAlign = 'left';
          textCfg.text = text;
        } else if (index === total - 1) {
          textCfg.textAlign = 'right';
          textCfg.text = text;
        }
        return textCfg;
      }
    });

    this.chart.line().position('time*value').color('type').animate({
      update: {
        animation: 'lineUpdate'
      }
    });
    // 设置图例居中显示
    this.chart.legend({
      align: 'center',
      itemWidth: null, // 图例项按照实际宽度渲染
    });

    this.chart.render();
    // 测试动态曲线
    // setInterval(() => {
    //   this.data.push(...this.getRecord());
    //   this.chart.changeData(this.data);
    // }, 1000);
  }
  // 自动张拉曲线监听
  setCvs() {
    console.log('监听曲线');
    setTimeout(() => {
      if (this._ms.runTensionData.state) {
        this.saveCvs();
        this.setCvs();
      }
    }, this.ms);
  }
  // 自动张拉曲线监听
  // liveCvs() {
  //   console.log('监听曲线');
  //   setTimeout(() => {
  //     if (this._ms.runTensionData.state) {
  //       this.saveCvs();
  //       this.setCvs();
  //     }
  //   }, this.ms);
  // }
  public saveCvs(state = false) {
    const showValue = this._ms.showValues;
    this._ms.tensionData.modes.forEach(name => {
      this._ms.recordData.cvsData.timeEnd = new Date().getTime();
      this._ms.recordData.cvsData.mpa[name].push(showValue[name].mpa);
      this._ms.recordData.cvsData.mm[name].push(showValue[name].mm);
      this._ms.recordData.liveMpaCvs.push({time: new Date().getTime(), type: name, value: showValue[name].mpa});
      this._ms.recordData.liveMmCvs.push({time: new Date().getTime(), type: name, value: showValue[name].mm});
    });
    if (this.chart) {
      this.chart.changeData(this._ms.recordData[`live${this.name}Cvs`]);
    } else {
      this.data = this._ms.recordData[`live${this.name}Cvs`];
      console.log('11111', this.data, this._ms.recordData[`live${this.name}Cvs`]);
    }
  }
  // 测试 添加数据，模拟数据，可以指定当前时间的偏移的秒
  getRecord(offset?) {
    offset = offset || 0;
    const time = new Date().getTime() + offset * 1000;
    return [
      {
        time: time,
        value: Math.floor(Math.random() * this.yMax),
        type: 'A1'
      },
      {
        // time: new Date().getTime() + offset * 1000,
        time: time,
        value: Math.floor(Math.random() * this.yMax),
        type: 'A2'
      }
    ];
  }
}
