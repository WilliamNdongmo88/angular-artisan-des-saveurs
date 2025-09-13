import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SharedService {
  private signalSource = new Subject<boolean>();
  signal$ = this.signalSource.asObservable();

  private signalSourceAvatar = new Subject<string>();
  signalAvatar$ = this.signalSourceAvatar.asObservable();

  sendSignal(bool: boolean) {
    this.signalSource.next(bool);
  }

  sendAvatar(avatar: string){
    this.signalSourceAvatar.next(avatar);
  }
}
