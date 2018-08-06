import { Component, OnInit, Inject } from '@angular/core';
import { Http } from '@angular/http';
import { MSService } from './services/MS.service';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';

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
  ) {
  }

  ngOnInit() {
    this._ms.creation();
  }
}
