import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabelsShopComponent } from './labels-shop.component';

describe('LabelsShopComponent', () => {
  let component: LabelsShopComponent;
  let fixture: ComponentFixture<LabelsShopComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LabelsShopComponent]
    });
    fixture = TestBed.createComponent(LabelsShopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
