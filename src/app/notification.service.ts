import {Injectable} from '@angular/core';

declare type PermissionStatus = 'denied' | 'granted' | 'default' | 'unsupported';


@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  status: PermissionStatus;


  constructor() {
  }

  async init() {
    if (!('Notification' in window)) {
      this.status = 'unsupported';
    } else {
      // TODO: await this.requestPermission();
    }
  }

  async createNotification(title: string) {
    console.log('permission: ' + this.status);
    if (this.status === 'granted') {
      const notification = new Notification(title);
      notification.onshow = ev => {
        console.dir(ev);
      };
    }
  }

  async requestPermission() {
    this.status = await Notification.requestPermission();
  }

}

