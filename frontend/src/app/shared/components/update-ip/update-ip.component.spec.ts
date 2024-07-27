import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateIpComponent } from './update-ip.component';

describe('UpdateIpComponent', () => {
  let component: UpdateIpComponent;
  let fixture: ComponentFixture<UpdateIpComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UpdateIpComponent]
    });
    fixture = TestBed.createComponent(UpdateIpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
