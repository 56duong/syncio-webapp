import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileTopMenuComponent } from './mobile-top-menu.component';

describe('MobileTopMenuComponent', () => {
  let component: MobileTopMenuComponent;
  let fixture: ComponentFixture<MobileTopMenuComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MobileTopMenuComponent]
    });
    fixture = TestBed.createComponent(MobileTopMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
