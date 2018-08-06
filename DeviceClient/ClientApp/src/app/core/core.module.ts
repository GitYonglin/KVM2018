import { NgModule, Optional, SkipSelf } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { HttpModule } from '@angular/http';

import { AppRoutingModule } from '../routes/app.routing';
import { ProtectEditGuard } from '../routes/protect/edit-guard';

// // import 'hammerjs';
// import 'rxjs/add/operator/take';

// import 'rxjs/add/operator/debounceTime';
// import 'rxjs/add/operator/map';

@NgModule({
  imports: [
    HttpModule,
    AppRoutingModule,
    BrowserAnimationsModule,
  ],
  declarations: [
  ],
  exports: [
    AppRoutingModule,
  ],
  providers: [
    ProtectEditGuard,
    {
      provide: 'BASE_CONFIG',
      useValue: {
        uri: 'api'
        // uri: '',
      }
    }
  ],
})
export class CoreModule {
  // @Optional 首次加载判断
  // @SkipSelf 到父级中查询，避免无限循环
  constructor(
    @Optional()
    @SkipSelf()
    parent: CoreModule,
  ) {
    if (parent) {
      throw new Error('模块已经存在，不需要再次加载！');
    }
  }
}
