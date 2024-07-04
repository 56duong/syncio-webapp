import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageRoomDetailComponent } from './message-room-detail.component';

describe('MessageRoomDetailComponent', () => {
  let component: MessageRoomDetailComponent;
  let fixture: ComponentFixture<MessageRoomDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MessageRoomDetailComponent]
    });
    fixture = TestBed.createComponent(MessageRoomDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
