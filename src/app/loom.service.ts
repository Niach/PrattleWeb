import {Injectable} from '@angular/core';
import {Client, LocalAddress, LoomProvider} from 'loom-js/dist';
import * as CryptoUtils from '../../node_modules/loom-js/dist/crypto-utils';

import Web3 from 'web3';
import {isNullOrUndefined} from 'util';
import {BehaviorSubject, Observable} from 'rxjs';
import {Prattle} from './contracts/Prattle';
import {UserProfile} from './contracts/UserProfile';
import {IpfsService} from './ipfs.service';
import {CacheService} from './cache.service';

const LOCAL_KEY = 'private_key';
const FOLLOWING_KEY = 'following';


@Injectable({
  providedIn: 'root'
})
export class LoomService {

  private prattle: Prattle;
  private prattleAddress = '0x8d4e7de5156e53fd961010848851b748c7c206b8';
  private prattleReady: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private userAddress: BehaviorSubject<string> = new BehaviorSubject<string>('');
  private userProfile: BehaviorSubject<UserProfile> = new BehaviorSubject<UserProfile>(null);

  private followingProfiles: UserProfile[] = [];
  private followingCount: BehaviorSubject<number> = new BehaviorSubject<number>(0);


  private privateKey: Uint8Array;
  private publicKey: Uint8Array;

  private client: Client;
  private web3: Web3;

  constructor(private ipfsService: IpfsService, private cacheService: CacheService) {
  }

  async init(): Promise<void> {
    this.initKeys();

    // Create the client
    this.client = new Client(
      'default',
      'wss://chain.prattle.tk/websocket',
      'wss://chain.prattle.tk/queryws',
    );

    // Init Web3
    this.web3 = new Web3(new LoomProvider(this.client, this.privateKey));

    await this.initContracts();


    await this.cacheService.init(this, this.web3, this.ipfsService, this.userAddress.getValue());


    const profile = await this.prattle.users.getProfile(this.userAddress.getValue());
    this.userProfile.next(profile);

    await this.loadFollowingList();
    this.prattleReady.next(true);
  }

  getUserAddress(): Observable<string> {
    return this.userAddress.asObservable();
  }

  getUserProfile(): Observable<UserProfile> {
    return this.userProfile.asObservable();
  }

  setUserProfile(profile: UserProfile) {
    this.userProfile.next(profile);
  }

  async getPrattle(): Promise<Prattle> {
    return new Promise<Prattle>(
      (resolve => {
        this.prattleReady.asObservable().subscribe((ready) => {
          if (ready) {
            resolve(this.prattle);
          }
        });
      })
    );
  }

  public isFollowing(user: UserProfile) {
    let following = this.userProfile.value.owner === user.owner;

    this.followingProfiles.forEach(profile => {
      if (profile.owner === user.owner) {
        following = true;
      }
    });
    return following;
  }

  public async followUser(user: UserProfile) {
    if (!this.isFollowing(user)) {
      this.followingProfiles.push(user);
      await this.saveFollowingList();
    }
  }

  public async getFollowingList(): Promise<UserProfile[]> {
    return new Promise<UserProfile[]>(
      (resolve => {
        this.prattleReady.asObservable().subscribe((ready) => {
          if (ready) {
            resolve(this.followingProfiles);
          }
        });
      })
    );
  }

  public getFollowingCount(): Observable<number> {
    return this.followingCount.asObservable();
  }

  public async resetProfile() {
    await localStorage.clear();
    this.followingCount.next(0);
    await this.init();
  }

  public async exportProfileJson(): Promise<string> {
    const privateKeyString = JSON.stringify(Array.from(this.privateKey));
    console.log('export: ' + privateKeyString);
    return privateKeyString;
  }

  public async importProfileJson(json: string) {
    const privKey = Uint8Array.from(JSON.parse(json));
    console.dir(privKey);
    localStorage.setItem(LOCAL_KEY, json);
    await this.init();
  }

  private initKeys() {
    if (isNullOrUndefined(localStorage.getItem(LOCAL_KEY))) {
      this.privateKey = CryptoUtils.generatePrivateKey();

      localStorage.setItem(LOCAL_KEY, JSON.stringify(Array.from(this.privateKey)));
    } else {
      this.privateKey = Uint8Array.from(JSON.parse(localStorage.getItem(LOCAL_KEY)));
    }

    this.publicKey = CryptoUtils.publicKeyFromPrivateKey(this.privateKey);
    this.userAddress.next(LocalAddress.fromPublicKey(this.publicKey).toString());
  }

  private async initContracts() {
    this.prattle = new Prattle(this.prattleAddress, this.web3, this.userAddress.getValue(), this.ipfsService, this.cacheService);
    await this.prattle.init();
  }

  private async loadFollowingList() {
    if (!isNullOrUndefined(localStorage.getItem(FOLLOWING_KEY))) {
      const followers: string[] = JSON.parse(localStorage.getItem(FOLLOWING_KEY));

      console.dir(followers);
      const returnedProfiles = await Promise.all(followers.map(async userAdr => {
        return await this.prattle.users.getProfile(userAdr);
      }));

      this.followingProfiles = returnedProfiles;
      this.followingCount.next(this.followingProfiles.length);
      console.log('loaded Following:');
      console.dir(returnedProfiles);
    }
  }

  private async saveFollowingList() {
    const followingAddresses = this.followingProfiles.map(profile => {
      return profile.owner;
    });
    this.followingCount.next(this.followingProfiles.length);


    localStorage.setItem(FOLLOWING_KEY, JSON.stringify(followingAddresses));

    console.log('saved following');
    console.dir(localStorage.getItem(FOLLOWING_KEY));
  }


}
