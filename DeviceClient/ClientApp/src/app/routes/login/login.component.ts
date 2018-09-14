import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { Http } from '@angular/http';
import { loginFormData } from './form.data';
import { FormGroup } from '@angular/forms';
import { APIService } from '../../services/api.service';
import { FullMenuComponent } from '../../shared/full-menu/full-menu.component';
import { AuthorityService } from '../../services/authority.service';

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
  selectProject = {name: '没有选择项目', id: null };
  adminIsVisible = false;
  menuIsVisible = false;
  loginState = false;
  adminLoginState = false;
  userGroup = [];
  clickTimeId: any;

  constructor(
    private _http: Http,
    @Inject('BASE_CONFIG') private config,
    private _service: APIService,
    private _authority: AuthorityService,
  ) {
  }

  ngOnInit() {
    this._http.get(`${this.config.uri}/admin`).subscribe(
      (data) => {
        console.log('登陆', data.json()); // success path
        if (data.json() < 1) {
          this.adminIsVisible = true;
        } else {
          this.getProject();
        }
      },
      (error) => console.log('登陆链接错误', error) // error path
    );
    const form = loginFormData();
    this.formGroup = form.formGroup;
    this.formTypes = form.formTypes;
  }
  getProject() {
    this._service.get('/project').subscribe(p => {
      try {
        console.log('获取项目', p, localStorage.getItem('project') !== 'null', localStorage.getItem('project'));
        if (p.length > 0) {
          this.projectList = p;
          let project: any = localStorage.getItem('project');
          if (project !== 'null') {
            project = JSON.parse(project);
            const selectProject = p.filter(item => item.id === project.id);
            if (selectProject.length === 0) {
              localStorage.setItem('project', null);
            } else {
              this.onSelectProject(selectProject[0]);
            }
          }
        } else {
          this.projectList = null;
          localStorage.setItem('project', null);
        }
      } catch (error) {
      }
    });
  }
  onSelectProject(data = this.selectProject) {
    this.selectProject = data;
    this._service.get(`/Operator/${data.id}`).subscribe(p => {
      this.userGroup = p;
      console.log('获取用户', p);
    });
    localStorage.setItem('project', JSON.stringify(this.selectProject));
  }
  adminLogin() {
    console.log('111');
    // 取消上次延时未执行的方法
    clearTimeout(this.clickTimeId);
    this.post('/admin/login');
  }
  login(event) {
    console.log('222', event);
    // 取消上次延时未执行的方法
    clearTimeout(this.clickTimeId);
    // 执行延时
    this.clickTimeId = setTimeout(() => {
      // 此处为单击事件要执行的代码
      this.post(`/admin/user/login/${JSON.parse(localStorage.getItem('project')).id}`);
    }, 300);
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
              sessionStorage.setItem('user', JSON.stringify(data.data));
              this._service.showMessage('success', '登录成功');
              this._authority.menus();
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
