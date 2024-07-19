import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AudioRecorderService } from 'src/app/core/services/audio-recorder.service';

@Component({
  selector: 'app-voice-recorder-dialog',
  templateUrl: './voice-recorder-dialog.component.html',
  styleUrls: ['./voice-recorder-dialog.component.scss']
})

export class VoiceRecorderDialogComponent {
  @Input() isVisibleRecorder: boolean = false; // Used to show/hide the recorder dialog
  @Output() submitAudioEvent = new EventEmitter<string>(); // Emits the audio URL when the user submits the audio
  @Output() closeRecorderEvent = new EventEmitter<void>(); // Emits when the user closes the recorder dialog
  audioUrl: string | null = null; // The URL of the recorded audio
  isRecording: boolean = false; // Indicates if the audio is currently being recorded
  isShowPlayer: boolean = true; // Indicates if the audio player should be shown, used to force re-rendering
  
  constructor(
    private audioRecorderService: AudioRecorderService
  ) {}
  

  /**
   * Starts recording audio.
   */
  async onRecordAudio() {
    this.isRecording = true;
    this.audioUrl = null;
    try {
      await this.audioRecorderService.initRecorder();
      this.audioRecorderService.startRecording();
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  }


  /**
   * Stops recording audio.
   */
  async stopRecording() {
    this.isRecording = false;
    try {
      const audioBlob = await this.audioRecorderService.stopRecording();
      this.audioUrl = URL.createObjectURL(audioBlob);
      this.isShowPlayer = false;
      setTimeout(() => {
        this.isShowPlayer = true;
      }, 0);
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  }

  
  /**
   * Submits the recorded audio and emits the audio URL.
   * @returns 
   */
  submitAudio() {
    if(!this.audioUrl) return;
    this.submitAudioEvent.emit(this.audioUrl);
    this.audioUrl = null;
    this.isVisibleRecorder = false;
    this.audioRecorderService.destroyRecorder();
  }

}
