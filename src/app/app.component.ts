import {Component, OnInit} from '@angular/core';
import {IpfsService} from './ipfs.service';
import {LoomService} from './loom.service';
import {NotificationService} from './notification.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {


  constructor(private ipfsService: IpfsService, private loomService: LoomService, private notificationService: NotificationService) {
  }

  async ngOnInit() {
    await this.ipfsService.init();
    await this.loomService.init();
    await this.notificationService.init();
  }

}
