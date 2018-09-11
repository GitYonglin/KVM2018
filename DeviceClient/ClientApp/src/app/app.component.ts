import { Component, OnInit, Inject } from '@angular/core';
import { Http } from '@angular/http';
import { MSService } from './services/MS.service';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { APIService } from './services/api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {
  title = 'app';

  constructor(
    private _ms: MSService,
    private _router: Router,
    private _service: APIService,
  ) {
  }

  ngOnInit() {
    this.newPLCLive();
    this._ms.setDevice();
    // this._router.events.subscribe((event) => {
    //   if (event instanceof NavigationEnd) {
    //     console.log('全局路由', event);
    //   }
    // });
    console.log('AutoControl', localStorage.getItem('AutoControl'));
    if (localStorage.getItem('AutoControl') === null) {
      localStorage.setItem('AutoControl', JSON.stringify({
        maximumDeviationRate: 6,
        LowerDeviationRate: -6,
        mpaDeviation: 2,
        mmBalanceControl: 2,
        mmGoBack: 70,
        loadOffTime: 15,
      }));
    }
  }
  private newPLCLive() {
    const connect = localStorage.getItem('connect');
    const mode = localStorage.getItem('deviceMode');
    if (!connect && !mode) {
      localStorage.setItem('connect', '1');
      localStorage.setItem('deviceMode', '1');
      console.log('000初始化plc', connect, mode);
    } else {
      this._ms.creation();
    }
  }
}
