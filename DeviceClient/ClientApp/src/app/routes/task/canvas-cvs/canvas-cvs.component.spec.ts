import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CanvasCvsComponent } from './canvas-cvs.component';

describe('CanvasCvsComponent', () => {
  let component: CanvasCvsComponent;
  let fixture: ComponentFixture<CanvasCvsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CanvasCvsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CanvasCvsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
