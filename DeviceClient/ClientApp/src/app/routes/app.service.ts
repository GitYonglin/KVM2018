import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AppService {
  public editState = false;
  public goUrl = {
    url: null,
    data: null,
  };
  constructor(
    private _router: Router,
  ) {}
  public setGoUrl(url, data) {
    this.goUrl = {
      url: url,
      data: data
    };
    this._router.navigate([url, data]);
  }
}
