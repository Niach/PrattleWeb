import {Component, OnInit, ViewChild} from '@angular/core';
import {IpfsService} from '../ipfs.service';
import {NgxMasonryComponent} from 'ngx-masonry';

@Component({
  selector: 'app-pins',
  templateUrl: './pins.component.html',
  styleUrls: ['./pins.component.css']
})
export class PinsComponent implements OnInit {
  pins;
  pinContentUrls: { [hash: string]: string };
  @ViewChild('masonry') masonry: NgxMasonryComponent;


  constructor(private ipfsService: IpfsService) {
  }

  async ngOnInit() {
    const pins: [{ hash: string, type: string }] = await this.ipfsService.getPins();
    console.dir(pins);
    this.pinContentUrls = {};
    const recursivePins = pins.filter(pin => pin.type === 'recursive');
    await Promise.all(recursivePins.map(async pin => {
      this.pinContentUrls[pin.hash] = await this.ipfsService.downloadImage(pin.hash, 'image/png');
    }));
    console.dir(this.pinContentUrls);
    this.pins = recursivePins;
    this.masonry.reloadItems();
    this.masonry.layout();
  }

  async removePin(pin: { hash: string, type: string }) {
    await this.ipfsService.removePin(pin.hash);
    const index = this.pins.findIndex(p => {
      return pin.hash === p.hash;
    });
    if (index > -1) {
      this.pins.splice(index, 1);
    }
    delete this.pinContentUrls[pin.hash];
  }

}
