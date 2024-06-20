import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageItemContentComponent } from './message-item-content.component';

describe('MessageItemContentComponent', () => {
  let component: MessageItemContentComponent;
  let fixture: ComponentFixture<MessageItemContentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MessageItemContentComponent]
    });
    fixture = TestBed.createComponent(MessageItemContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
