import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SharedService {
  private signalSource = new Subject<boolean>();
  signal$ = this.signalSource.asObservable();

  private signalSourceAvatar = new Subject<string>();
  signalAvatar$ = this.signalSourceAvatar.asObservable();

  private signalSourceReq = new Subject<string>();
  signalReq$ = this.signalSourceReq.asObservable();

  private signalSourceResp = new Subject<number>();
  signalResp$ = this.signalSourceResp.asObservable();

  sendSignal(bool: boolean) {
    this.signalSource.next(bool);
  }

  sendAvatar(avatar: string){//From Profil to Header
    this.signalSourceAvatar.next(avatar);
  }

  sendReq(req: string){//From cart to product-details
    this.signalSourceReq.next(req);
  }

  sendResp(resp: number){
    this.signalSourceResp.next(resp);
  }
}
