import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})

export class LabelUpdateService {
    private gifUrlSource = new BehaviorSubject('');
    currentGifUrl = this.gifUrlSource.asObservable();

    constructor() { }

    updateGifUrl(url: string) {
        this.gifUrlSource.next(url);
    }


}