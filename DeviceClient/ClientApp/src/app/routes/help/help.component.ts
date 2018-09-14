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
    this._electronService.ipcRenderer.send('updata');
    this._electronService.ipcRenderer.on('updataOk', (event, msg) => {
      this.message.info(msg);
    });
  }
}
