import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Input, OnDestroy } from '@angular/core';
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
@Component({
  selector: 'app-canvas-cvs',
  templateUrl: './canvas-cvs.component.html',
  styleUrls: ['./canvas-cvs.component.less']
})

export class CanvasCvsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mpaCvs')
  mpaCvs: ElementRef;
  @ViewChild('mmCvs')
  mmCvs: ElementRef;

  mpaChart: Chart = null;
  mmChart: Chart = null;
  mpaData: any;
  mmData: any;
  hehe = false;

  legendItems = [];
  ms = 1000;

  @Input()
  height = '100%';
  @Input()
  width = '100%';
  @Input()
  data = null;

  constructor(private _ms: MSService) { }

  ngOnInit() {
    console.log(this.height, this.width);
  }
  ngAfterViewInit() {
    if (this.data !== null) {
      const data = setCvs(this.data);
      this.mpaChart = this.corterChart(this.mpaCvs, data.mpa);
      this.mmChart = this.corterChart(this.mmCvs, data.mm);
    }
  }

  ngOnDestroy(): void {
    console.log('曲线结束');
  }

  corterChart(cvs, data) {
    const chart = new Chart({
      // id: 'mountNode',
      el: cvs.nativeElement,
      pixelRatio: window.devicePixelRatio
    });

    chart.source(data, defs);

    chart.axis('time', {
      label: (text, index, total) => {
        const cfg = {
          text: '',
          textAlign: 'center'
        };
        cfg.text = text;  // cfg.text 支持文本格式化处理
        if (index === 0) {
          cfg.text = `${text}\n初张拉`;
          cfg.textAlign = 'start';
        }
        if (index > 0 && index === total - 1) {
          cfg.text = `${text}\n完成3`;
          cfg.textAlign = 'end';
        }
        return cfg;
      }
    });

    chart.line().position('time*value')
      .color('type', (type) => {
        switch (type) {
          case 'a1':
            return '#ff0033';
            break;
          case 'a2':
            return '#FFCC14';
            break;
          case 'b1':
            return '#8543E0';
            break;
          case 'b2':
            return '#2FC25B';
            break;
          default:
            break;
        }
      }).animate({
        update: {
          animation: 'lineUpdate'
        }
      });
    chart.legend({
      align: 'center',
      itemWidth: null, // 图例项按照实际宽度渲染
      marker: {
        symbol: 'circle', // marker 的形状
        radius: 10 // 半径大小
      },
      nameStyle: {
        textAlign: 'middle', // 文本对齐方向，可取值为： start middle end
        fill: '#1890FF', // 文本的颜色
        fontSize: '20', // 文本大小
        fontWeight: 'bold', // 文本粗细
      },
      itemFormatter(val) {
        return val.toUpperCase(); // val 为每个图例项的文本值
      }
    });

    chart.render();
    return chart;
  }
  public updataCvs(cvsData) {
    // const time = new Date().getTime();
    // this._ms.recordData.cvsData.time.push(time);
    // this._ms.tensionData.modes.forEach(name => {
    //   this._ms.recordData.cvsData.mpa[name].push(showValue[name].mpa);
    //   this._ms.recordData.cvsData.mm[name].push(showValue[name].mm);
    // });
    const data = setCvs(cvsData);
    if (this.mpaChart !== null && this.mmChart !== null) {
      this.mpaChart.changeData(data.mpa);
      this.mmChart.changeData(data.mm);
    } else {
      this.mpaChart = this.corterChart(this.mpaCvs, data.mpa);
      this.mmChart = this.corterChart(this.mmCvs, data.mm);
    }
  }
}
