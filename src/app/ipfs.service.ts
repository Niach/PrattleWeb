import {Injectable} from '@angular/core';
import * as IPFS from 'ipfs';
import {Buffer} from 'buffer';
import {BehaviorSubject} from 'rxjs';

const BLACKLIST_KEY = 'blacklist';

@Injectable({
  providedIn: 'root'
})
export class IpfsService {

  ready: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private node: IPFS;

  constructor() {
  }

  init(): Promise<void> {
    this.node = new IPFS({
      Addresses: {
        Swarm: [],
        API: '',
        Gateway: ''
      },
      Discovery: {
        MDNS: {
          Enabled: false,
          Interval: 10
        },
        webRTCStar: {
          Enabled: true
        }
      },
      Bootstrap: [
        '/dns4/ams-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd',
        '/dns4/lon-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLMeWqB7YGVLJN3pNLQpmmEk35v6wYtsMGLzSr5QBU3',
        '/dns4/sfo-3.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLPppuBtQSGwKDZT2M73ULpjvfd3aZ6ha4oFGL1KrGM',
        '/dns4/sgp-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLSafTMBsPKadTEgaXctDQVcqN88CNLHXMkTNwMKPnu',
        '/dns4/nyc-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLueR4xBeUbY9WZ9xGUUxunbKWcrNFTDAadQJmocnWm',
        '/dns4/nyc-2.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64',
        '/dns4/node0.preload.ipfs.io/tcp/443/wss/ipfs/QmZMxNdpMkewiVZLMRxaNxUeZpDUb34pWjZ1kZvsd16Zic',
        '/dns4/node1.preload.ipfs.io/tcp/443/wss/ipfs/Qmbut9Ywz9YEDrz8ySBSgWyJk41Uvm2QJPhwDJzJyGFsD6'
      ]
    });
    return new Promise((resolve) => {
      this.node.on('ready', async () => {
        console.log('ipfs is ready');
        const version = await this.node.version();

        console.log('Version:', version.version);
        this.ready.next(true);
        resolve();
      });
    });
  }

  async uploadText(text: string, path: string): Promise<{ path: string, hash: string }> {
    const buffer = Buffer.from(text, 'utf-8');
    return await this.upload(buffer, path);
  }

  async downloadText(hash: string): Promise<string> {
    const fileBuffer = await this.node.cat(hash);
    return fileBuffer.toString();
  }

  async upload(data: Buffer, path: string): Promise<{ path: string, hash: string }> {
    const filesAdded = await this.node.add({
      path: path,
      content: data
    });

    console.log('Added file(s): ');
    console.dir(filesAdded);
    return filesAdded[0];
  }

  async downloadImage(hash: string, fileType: string): Promise<string> {
    await this.addPin(hash);

    console.log('ipfs: fetch ' + hash);
    const fileBuffer = await this.node.cat(hash);
    console.log('ipfs fetched');
    const base64 = this.arrayBufferToBase64(fileBuffer);
    const url = 'data:' + fileType + ';base64,' + base64;
    return url;
  }

  getPins(): Promise<[{ hash: string, type: string }]> {
    console.log('get pins');
    return new Promise<[{ hash: string, type: string }]>(resolve => {
      this.ready.subscribe(async (ready) => {
        if (ready) {
          const pins = await this.node.pin.ls();
          console.dir(pins);
          resolve(pins);
        }
      });
    });
  }

  async addPin(hash: string) {
    if (!this.isInBlackList(hash)) {
      await this.node.pin.add(hash);
    }
  }

  async removePin(hash: string) {
    await this.node.pin.rm(hash);
    this.addToBlackList(hash);
  }

  private addToBlackList(hash: string) {
    const blacklist: string[] = JSON.parse(localStorage.getItem(BLACKLIST_KEY));
    blacklist.push(hash);
    localStorage.setItem(BLACKLIST_KEY, JSON.stringify(blacklist));
  }

  private isInBlackList(hash: string): boolean {
    const blacklist: string[] = JSON.parse(localStorage.getItem(BLACKLIST_KEY));
    if (!blacklist) {
      localStorage.setItem(BLACKLIST_KEY, '[]');
      return false;
    }
    return blacklist.indexOf(hash) > -1;
  }

  private arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }


}
