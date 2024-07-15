import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AudioRecorderService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];

  constructor() {}

  async initRecorder(): Promise<void> {
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      throw new Error('Recording features are not supported in this browser.');
    }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.mediaRecorder = new MediaRecorder(stream);

    this.mediaRecorder.ondataavailable = (event) => {
      this.audioChunks.push(event.data);
    };
  }

  startRecording(): void {
    if (!this.mediaRecorder) {
      throw new Error('Recorder not initialized.');
    }
    this.audioChunks = []; // Clear previous recordings
    this.mediaRecorder.start();
  }

  stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('Recorder not initialized.'));
        return;
      }
      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        resolve(audioBlob);
      };
      this.mediaRecorder.stop();
    });
  }

  destroyRecorder(): void {
    if (this.mediaRecorder) {
      this.mediaRecorder.stream?.getTracks().forEach((track) => track.stop());
      this.mediaRecorder = null;
    }
  }
  
}