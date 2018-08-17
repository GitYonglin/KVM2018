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
    this._ms.creation();
    this._ms.setDevice();
    this._router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        console.log('全局路由', event);
      }
    });
  }
}
