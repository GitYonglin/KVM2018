import { Injectable, Inject } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Observable } from 'rxjs';
import { projectMenuData } from '../model/project.model';
import { taskMenuData } from '../model/task.model';
import { componentMenusData } from '../model/component.model';
import { deviceMenuData } from '../model/device.model';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';

const headers = new Headers({
  // 'Content-Type': 'multipart/form-data',
  // 'Content-Type': 'application/json'
  cache: false,
  contentType: false,
  processData: false,
});
enum messageType {
  info = 'info',
  success = 'success',
  warning = 'warning',
  error = 'error',
}

@Injectable({ providedIn: 'root' })
export class APIService {
  projectMenuData: any;
  taskMenuData: any;
  componentMenuData: any;
  deviceMenuData: any;

  constructor(private _http: Http,
    @Inject('BASE_CONFIG') private config,
    private message: NzMessageService,
    private modalService: NzModalService,
  ) {
    this.projectMenuData = projectMenuData;
    this.taskMenuData = taskMenuData;
    this.componentMenuData = componentMenusData;
    this.deviceMenuData = deviceMenuData;
  }

  public getMenuData(url: string): Observable<any[]> {
    return Observable.create((observer) => {
      this._http.get(`${this.config.uri}${url}`).subscribe(r => {
        observer.next(r.json());
      });
    });
  }
  public getData(id): Observable<any> {
    return Observable.create((observer) => {
      setTimeout(() => {
        observer.next({});
      }, 0);
    });
  }
  public get(url): Observable<any> {
    return Observable.create((observer) => {
      this._http.get(`${this.config.uri}${url}`).subscribe(
        r => {
        observer.next(r.json());
        }, (error) => {
          observer.next(null);
        }
    );
    });
  }
  public login(fd: FormData, url: string): Observable<any> {
    return Observable.create((observer) => {
      this._http.post(`${this.config.uri}${url}`, fd, { headers: headers })
        .subscribe(data => {
          observer.next({ state: true, data: data.json() });
        }, (error) => {
          observer.next({ state: false, data: error });
        });
    });
  }
  public http(type: string = 'post', fd: FormData, url: string, message: { success: string, error: string }):
    Observable<{ state: string, data: any }> {
      return Observable.create((observer) => {
        this._http[type](`${this.config.uri}${url}`, fd, { headers: headers })
          .subscribe(data => {
            const r = data.json();
            if (r.message) {
              this.message.create(messageType.success, `${message.success}--成功`);
              observer.next({ state: true, data: data.json() });
            } else {
              this.message.create(messageType.error, `${message.error}已经存在，请重新输入！`);
            }
          }, (error) => {
            observer.next({ state: false, data: error });
          });
      });
  }
  public post(fd: FormData, url: string, message: { success: string, error: string }): Observable<{ state: string, data: any }> {
    return Observable.create((observer) => {
      this._http.post(`${this.config.uri}${url}`, fd, { headers: headers })
        .subscribe(data => {
          const r = data.json();
          if (r.message) {
            this.message.create(messageType.success, `${message.success}--成功`);
            observer.next({ state: true, data: data.json() });
          } else {
            this.message.create(messageType.error, `${message.error}已经存在，请重新输入！`);
          }
        }, (error) => {
          observer.next({ state: false, data: error });
        });
    });
  }
  public put(fd: FormData, url: string, message: { success: string, error: string }): Observable<any> {
    return Observable.create((observer) => {
      this._http.put(`${this.config.uri}${url}`, fd, { headers: headers })
        .subscribe(data => {
          observer.next({ state: true, data: data.json() });
        }, (error) => {
          observer.next({ state: false, data: error });
        });
    });
  }
  public delete(url: string): Observable<any> {
    return Observable.create((observer) => {
      this._http.delete(`${this.config.uri}${url}`, { headers: headers })
        .subscribe(data => {
          observer.next({ state: true, data: data.json() });
        }, (error) => {
          observer.next({ state: false, data: error });
        });
    });
  }
  public showMessage(type, msg) {
    this.message.create(type, msg);
  }
  public modal(title: string, content: string, back): void {
    this.modalService.create({
      nzTitle: title,
      nzContent: content,
      nzClosable: false,
      nzOnOk: () => {
        back();
      }
    });
  }
}
