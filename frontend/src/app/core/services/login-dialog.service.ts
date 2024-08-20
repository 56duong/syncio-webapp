import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class LoginDialogService {
  private visibleSubject = new BehaviorSubject<boolean>(false);
  public visible$ = this.visibleSubject.asObservable();


  show() {
    this.visibleSubject.next(true);
  }
  

  hide() {
    this.visibleSubject.next(false);
  }
}
