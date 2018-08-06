import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { Http } from '@angular/http';
import { loginFormData } from './form.data';
import { FormGroup } from '@angular/forms';
import { APIService } from '../../services/api.service';
import { FullMenuComponent } from '../../shared/full-menu/full-menu.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less']
})
export class LoginComponent implements OnInit {
  @ViewChild(FullMenuComponent)
    private fullMenu: FullMenuComponent;

  formGroup: FormGroup;
  formTypes: any;
  projectList: any;
  selectProject = {name: '没有选择项目' };
  adminIsVisible = false;
  menuIsVisible = false;
  loginState = false;
  adminLoginState = false;

  constructor(
    private _http: Http,
    @Inject('BASE_CONFIG') private config,
    private _service: APIService,
  ) {
  }

  ngOnInit() {
    this._http.get(`${this.config.uri}/admin`).subscribe(
      (data) => {
        console.log(data.json()); // success path
        if (data.json() < 1) {
          this.adminIsVisible = true;
        } else {
          this.getProject();
        }
      },
      (error) => console.log('链接错误', error) // error path
    );
    const form = loginFormData();
    this.formGroup = form.formGroup;
    this.formTypes = form.formTypes;
  }
  getProject() {
    this._service.get('/project').subscribe(p => {
      console.log('000000000', p);
      if (p) {
        this.projectList = p.length === 0 ? null : p;
        const project = JSON.parse(localStorage.getItem('project'));
        if (project) {
          this.selectProject = project;
        }
        // this.menuDataState = p ? true : false;
      } else {
        this.projectList = null;
      }
    });
  }
  onSelectProject(data) {
    this.selectProject = data;
    localStorage.setItem('project', JSON.stringify(this.selectProject));
  }
  adminLogin() {
    console.log('111');
    this.post('/admin/login');
  }
  login() {
    console.log('222');
    this.post(`/admin/user/login/${JSON.parse(localStorage.getItem('project')).id}`);
  }

  post(url) {
    // tslint:disable-next-line:forin
    for (const key in this.formGroup.controls) {
      this.formGroup.controls[ key ].markAsDirty();
      this.formGroup.controls[ key ].updateValueAndValidity();
    }
    if (this.formGroup.valid) {
      this.adminLoginState = true;
      const value = this.formGroup.value;
      const fd = new FormData();
      // tslint:disable-next-line:forin
      for (const key in value) {
        fd.append(key, value[key]);
      }
      this._service.login(fd, url).subscribe(
        data => {
          console.log(data.data);
          this.adminLoginState = false;
          if (data.state) {
            if (data.data) {
              // window['KVM'] = {project: this.selectProject, user: data.data};
              // sessionStorage.setItem('project', JSON.stringify(this.selectProject));
              sessionStorage.setItem('user', JSON.stringify(value));
              this._service.showMessage('success', '登录成功');
              this.fullMenu.showModal();
            } else {
              this._service.showMessage('error', '登录失败');
            }
          } else {
            this._service.showMessage('error', '服务器链接错误！！');
          }
        }
      );
    }
  }
}
