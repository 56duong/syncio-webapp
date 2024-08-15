import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageControlsComponent } from './message-controls.component';

describe('MessageControlsComponent', () => {
  let component: MessageControlsComponent;
  let fixture: ComponentFixture<MessageControlsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MessageControlsComponent]
    });
    fixture = TestBed.createComponent(MessageControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
