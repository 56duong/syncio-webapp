import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageContentListComponent } from './message-content-list.component';

describe('MessageContentListComponent', () => {
  let component: MessageContentListComponent;
  let fixture: ComponentFixture<MessageContentListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MessageContentListComponent]
    });
    fixture = TestBed.createComponent(MessageContentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
