import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StickerManagementComponent } from './sticker-management.component';

describe('StickerManagementComponent', () => {
  let component: StickerManagementComponent;
  let fixture: ComponentFixture<StickerManagementComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StickerManagementComponent]
    });
    fixture = TestBed.createComponent(StickerManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
