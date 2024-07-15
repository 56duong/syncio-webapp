import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VoiceRecorderDialogComponent } from './voice-recorder-dialog.component';

describe('VoiceRecorderDialogComponent', () => {
  let component: VoiceRecorderDialogComponent;
  let fixture: ComponentFixture<VoiceRecorderDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VoiceRecorderDialogComponent]
    });
    fixture = TestBed.createComponent(VoiceRecorderDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
