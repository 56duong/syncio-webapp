import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FollowerDialogComponent } from './follower-dialog.component';

describe('FollowerDialogComponent', () => {
  let component: FollowerDialogComponent;
  let fixture: ComponentFixture<FollowerDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FollowerDialogComponent]
    });
    fixture = TestBed.createComponent(FollowerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
