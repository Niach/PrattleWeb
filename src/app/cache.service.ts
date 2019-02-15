import {Injectable} from '@angular/core';
import {LoomService} from './loom.service';
import Web3 from 'web3';
import {Post} from './contracts/Post';
import {isNullOrUndefined} from 'util';
import {CachedPost} from './util/CachedPost';
import {IpfsService} from './ipfs.service';
import {CachedUserProfile} from './util/CachedUserProfile';
import {UserProfile} from './contracts/UserProfile';

@Injectable({
  providedIn: 'root'
})
export class CacheService {

  private loomService: LoomService;
  private web3: Web3;
  private ipfs: IpfsService;
  private userAddress: string;

  constructor() {
  }

  private static postToCache(post: Post): CachedPost {
    return {
      address: post.postAddress,
      comments: post.comments,
      dislikes: post.dislikes,
      isSharing: post.isSharing,
      ipfsFile: post.ipfsFile,
      ipfsType: post.ipfsType,
      likes: post.likes,
      myRating: post.myRating,
      owner: post.owner,
      parent: post.parent ? post.parent.postAddress : '',
      shares: post.shares,
      text: post.text,
      timestamp: post.timestamp
    };
  }

  private static profileToCache(profile: UserProfile): CachedUserProfile {
    return {
      address: profile.getAddress(),
      numberOfPosts: profile.numberOfPosts,
      owner: profile.owner,
      userName: profile.userName,
      description: profile.description,
      picture: profile.picture,
      pictureType: profile.pictureType,
      posts: profile.getPostAddresses()
    };
  }

  public async init(loomService: LoomService, web3: Web3, ipfs: IpfsService, userAddress: string) {
    this.loomService = loomService;
    this.web3 = web3;
    this.ipfs = ipfs;
    this.userAddress = userAddress;
  }

  public updatePost(post: Post) {
    const cachedPost = CacheService.postToCache(post);
    localStorage.setItem(post.postAddress, JSON.stringify(cachedPost));
    console.log('updatedCache: ' + post.postAddress);
  }

  public updateProfile(profile: UserProfile) {
    const cachedProfile = CacheService.profileToCache(profile);
    localStorage.setItem(profile.getAddress(), JSON.stringify(cachedProfile));
    console.log('updatedCacheProfile: ' + profile.getAddress());
    console.dir(cachedProfile);
  }

  public updatePublicPosts(posts: string[]) {
    localStorage.setItem('posts', JSON.stringify(posts));
  }

  public async getPublicPosts(): Promise<string[]> {
    const item = localStorage.getItem('posts');
    if (!isNullOrUndefined(item)) {
      console.log('public cache hit');
      return JSON.parse(item);
    }
    console.log('public cache miss');

    const prattle = await this.loomService.getPrattle();
    await prattle.users.loadPosts();
    const postAddresses = prattle.users.getPostsAddresses();
    localStorage.setItem('posts', JSON.stringify(postAddresses));
    return postAddresses;
  }

  public async getPost(address: string): Promise<CachedPost> {
    console.log('get cached post: ' + address);
    const item = localStorage.getItem(address);
    if (!isNullOrUndefined(item)) {
      console.log('cache hit');
      return JSON.parse(item);
    }

    console.log('cache miss, loading..');
    const post: Post = new Post(address, this.web3, this.userAddress, this.ipfs, this);
    await post.init();

    const cachedPost: CachedPost = CacheService.postToCache(post);
    localStorage.setItem(address, JSON.stringify(cachedPost));
    console.log('..loaded');
    return cachedPost;
  }

  public async getProfile(profile_address: string, loadPosts?: boolean): Promise<CachedUserProfile> {
    console.log('get cached profile of: ' + profile_address);
    const item = localStorage.getItem(profile_address);
    if (!isNullOrUndefined(item)) {
      console.log('cache hit');
      return JSON.parse(item);
    }

    console.log('cache miss, loading.. posts: ' + loadPosts);
    const profile = new UserProfile(profile_address, this.web3, this.userAddress, this.ipfs, this);
    await profile.init(false, loadPosts);
    if (loadPosts) {
      await profile.loadPosts();
    }

    const cachedProfile: CachedUserProfile = CacheService.profileToCache(profile);
    localStorage.setItem(profile_address, JSON.stringify(cachedProfile));
    console.log('..loaded');
    return cachedProfile;
  }


}
