import Web3 from 'web3';
import {PrattleContract} from './PrattleContract';
import {UserProfile} from './UserProfile';
import {IpfsService} from '../ipfs.service';
import {CacheService} from '../cache.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {Post} from './Post';

const ABI = [
  {
    'constant': true,
    'inputs': [],
    'name': 'numberOfUsers',
    'outputs': [
      {
        'name': '',
        'type': 'uint256'
      }
    ],
    'payable': false,
    'stateMutability': 'view',
    'type': 'function'
  },
  {
    'constant': true,
    'inputs': [
      {
        'name': '',
        'type': 'address'
      }
    ],
    'name': 'userProfileOf',
    'outputs': [
      {
        'name': '',
        'type': 'address'
      }
    ],
    'payable': false,
    'stateMutability': 'view',
    'type': 'function'
  },
  {
    'inputs': [],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'constructor'
  },
  {
    'anonymous': false,
    'inputs': [
      {
        'indexed': false,
        'name': 'post',
        'type': 'address'
      },
      {
        'indexed': false,
        'name': 'timestamp',
        'type': 'uint256'
      }
    ],
    'name': 'Posted',
    'type': 'event'
  },
  {
    'anonymous': false,
    'inputs': [
      {
        'indexed': false,
        'name': 'user',
        'type': 'address'
      },
      {
        'indexed': false,
        'name': 'profile',
        'type': 'address'
      }
    ],
    'name': 'RegisterSuccess',
    'type': 'event'
  },
  {
    'constant': false,
    'inputs': [
      {
        'name': 'userName',
        'type': 'string'
      }
    ],
    'name': 'registerUser',
    'outputs': [],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function'
  },
  {
    'constant': false,
    'inputs': [
      {
        'name': 'post',
        'type': 'address'
      },
      {
        'name': 'timestamp',
        'type': 'uint256'
      }
    ],
    'name': 'postPublicly',
    'outputs': [],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function'
  }
];

export class Users extends PrattleContract {

  private posts: BehaviorSubject<Post[]> = new BehaviorSubject<Post[]>([]);
  private loaded = false;

  constructor(contractAddress: string, web3: Web3, userAddress: string, ipfsService: IpfsService, cache: CacheService) {
    super(ABI, contractAddress, web3, userAddress, ipfsService, cache);
  }

  async init() {

  }

  async loadPosts(caching?: boolean) {
    if (!this.loaded) {
      const postAddresses: string[] = caching ? await this.cache.getPublicPosts() : await this.updatePostAddressEvents();
      await this.loadPostContracts(postAddresses);

      if (caching) {
        // refresh data later
        setTimeout(async () => {
          console.log('load rest public later');
          const addresses = await this.updatePostAddressEvents();
          await this.loadPostContracts(addresses, caching);
          if (this.getPostsAddresses().length > 0) {
            this.cache.updatePublicPosts(this.getPostsAddresses());
          }

        });
      }

      this.contract.events.Posted().on('data', async event => {
        const post = new Post(event.returnValues.post, this.web3, this.userAddress, this.ipfs, this.cache);
        await post.init(caching);
        await post.loadIpfsContent();
        this.posts.next(this.posts.getValue().concat([post]));
        if (caching) {
          this.cache.updatePublicPosts(this.getPostsAddresses());
        }
      });


      this.loaded = true;
    }

  }

  getPosts(): Observable<Post[]> {
    return this.posts.asObservable();
  }

  getPostsAddresses(): string[] {
    return this.posts.getValue().map(post => {
      return post.postAddress;
    });
  }

  async getProfile(user: string): Promise<UserProfile> {
    console.log('get profile:' + user);
    const profileAddress = await this.contract.methods.userProfileOf(user).call();
    if (profileAddress === '0x0000000000000000000000000000000000000000') {
      return null;
    }
    const profile = new UserProfile(profileAddress, this.web3, this.userAddress, this.ipfs, this.cache);
    await profile.init(true, false);
    console.log('got profile: ');
    console.dir(profile);
    return profile;
  }

  async register(username: string): Promise<UserProfile> {
    const result = await this.contract.methods.registerUser(username).send();
    const profile = new UserProfile(result.events.RegisterSuccess.returnValues.profile, this.web3, this.userAddress, this.ipfs, this.cache);
    await profile.init(true, false);
    return profile;
  }

  private async loadPostContracts(postAddresses: string[], caching?: boolean) {

    const posts = await Promise.all(postAddresses.map(async postAddress => {
      const post = new Post(postAddress, this.web3, this.userAddress, this.ipfs, this.cache);
      await post.init(caching);
      //load content later
      await post.loadIpfsContent();
      return post;
    }));
    console.dir(posts);
    this.posts.next(posts);
  }

  private async updatePostAddressEvents(): Promise<string[]> {
    console.log('get past public events');
    const events = await this.contract.getPastEvents('Posted', {
      fromBlock: 0,
      toBlock: 'latest'
    });


    return events.map(event => {
      return event.returnValues.post;
    });
  }

}
