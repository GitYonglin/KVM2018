import { Component, OnInit, ViewChild } from '@angular/core';
import { MSService } from '../../services/MS.service';
import { FullMenuComponent } from '../full-menu/full-menu.component';

@Component({
  selector: 'app-menu-button',
  templateUrl: './menu-button.component.html',
  styleUrls: ['./menu-button.component.less']
})
export class MenuButtonComponent implements OnInit {
  a1Visible = false;

  @ViewChild(FullMenuComponent)
    private FullMenu: FullMenuComponent;
  constructor(public _ms: MSService) { }

  ngOnInit() {
  }
  public showFullMenu() {
    this.FullMenu.showModal();
  }
}
