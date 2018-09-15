import { Component, OnInit } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.less']
})
export class HelpComponent implements OnInit {

  constructor(
    private _electronService: ElectronService,
    private message: NzMessageService,
  ) { }

  ngOnInit() {
    this.message.info('帮助');
  }
  updata() {
    // const {dialog} = require('electron').remote
    if (this._electronService.isElectronApp) {
      this._electronService.ipcRenderer.send('updata');
      this._electronService.ipcRenderer.on('updataOk', (event, msg) => {
        this.message.info(msg);
      });
      // const window = this._electronService.remote.BrowserWindow;
      // // console.log(this._electronService.remote.dialog.showOpenDialog(new window(), {properties: ['openDirectory']})[0]);
    } else {
      this.message.warning('只能在客服端中使用！');
    }
  }
}
