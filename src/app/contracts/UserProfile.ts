import Web3 from 'web3';
import {PrattleContract} from './PrattleContract';
import {Post} from './Post';
import {BehaviorSubject, Observable} from 'rxjs';
import {IpfsService} from '../ipfs.service';
import {CacheService} from '../cache.service';

const ABI = [
  {
    'constant': true,
    'inputs': [],
    'name': 'username',
    'outputs': [
      {
        'name': '',
        'type': 'string'
      }
    ],
    'payable': false,
    'stateMutability': 'view',
    'type': 'function'
  },
  {
    'constant': true,
    'inputs': [],
    'name': 'description',
    'outputs': [
      {
        'name': '',
        'type': 'string'
      }
    ],
    'payable': false,
    'stateMutability': 'view',
    'type': 'function'
  },
  {
    'constant': true,
    'inputs': [],
    'name': 'numberOfLikes',
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
    'inputs': [],
    'name': 'picture',
    'outputs': [
      {
        'name': '',
        'type': 'string'
      }
    ],
    'payable': false,
    'stateMutability': 'view',
    'type': 'function'
  },
  {
    'constant': true,
    'inputs': [],
    'name': 'owner',
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
    'constant': true,
    'inputs': [],
    'name': 'pictureType',
    'outputs': [
      {
        'name': '',
        'type': 'string'
      }
    ],
    'payable': false,
    'stateMutability': 'view',
    'type': 'function'
  },
  {
    'constant': true,
    'inputs': [],
    'name': 'numberOfPosts',
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
    'constant': false,
    'inputs': [
      {
        'name': 'newOwner',
        'type': 'address'
      }
    ],
    'name': 'transferOwnership',
    'outputs': [],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function'
  },
  {
    'inputs': [
      {
        'name': 'name',
        'type': 'string'
      },
      {
        'name': 'users',
        'type': 'address'
      }
    ],
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
        'name': 'picture',
        'type': 'string'
      },
      {
        'indexed': false,
        'name': 'pictureType',
        'type': 'string'
      }
    ],
    'name': 'PictureChanged',
    'type': 'event'
  },
  {
    'anonymous': false,
    'inputs': [
      {
        'indexed': false,
        'name': 'description',
        'type': 'string'
      }
    ],
    'name': 'DescriptionChanged',
    'type': 'event'
  },
  {
    'anonymous': false,
    'inputs': [
      {
        'indexed': false,
        'name': 'name',
        'type': 'string'
      }
    ],
    'name': 'NameChanged',
    'type': 'event'
  },
  {
    'anonymous': false,
    'inputs': [
      {
        'indexed': false,
        'name': 'newOwner',
        'type': 'address'
      }
    ],
    'name': 'TransferredOwnership',
    'type': 'event'
  },
  {
    'constant': false,
    'inputs': [
      {
        'name': 'ipfsHash',
        'type': 'string'
      },
      {
        'name': 'ipfsType',
        'type': 'string'
      }
    ],
    'name': 'setPicture',
    'outputs': [],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function'
  },
  {
    'constant': false,
    'inputs': [
      {
        'name': 'newDescription',
        'type': 'string'
      }
    ],
    'name': 'setDescription',
    'outputs': [],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function'
  },
  {
    'constant': false,
    'inputs': [
      {
        'name': 'newName',
        'type': 'string'
      }
    ],
    'name': 'setName',
    'outputs': [],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function'
  },
  {
    'constant': false,
    'inputs': [
      {
        'name': 'text',
        'type': 'string'
      },
      {
        'name': 'ipfs',
        'type': 'string'
      },
      {
        'name': 'ipfsType',
        'type': 'string'
      }
    ],
    'name': 'post',
    'outputs': [
      {
        'name': '',
        'type': 'address'
      }
    ],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function'
  }
];


export class UserProfile extends PrattleContract {
  static DEFAULT_PICTURE = 'data:image/png;base64,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';


  owner: string;
  userName: string;
  picture: string;
  pictureType: string;
  description: string;

  numberOfPosts: number;

  posts: BehaviorSubject<Post[]> = new BehaviorSubject<Post[]>([]);

  private cachedPostAddresses: string[] = [];


  constructor(contractAddress: string, web3: Web3, userAddress: string, ipfsService: IpfsService, cache: CacheService) {
    super(ABI, contractAddress, web3, userAddress, ipfsService, cache);
  }

  async init(caching?: boolean, loadPosts?: boolean) {

    if (caching) {
      const cachedProfile = await this.cache.getProfile(this.contract.options.address, loadPosts);
      console.log('Cached Profile:');
      console.dir(cachedProfile);
      this.owner = cachedProfile.owner;
      this.userName = cachedProfile.userName;
      this.picture = cachedProfile.picture;
      this.pictureType = cachedProfile.pictureType;
      this.numberOfPosts = cachedProfile.numberOfPosts;
      this.cachedPostAddresses = cachedProfile.posts;
      this.description = cachedProfile.description;

      setTimeout(async () => {
        await this.updateValues();

      });

    } else {
      await this.updateValues();
    }


  }

  async updateValues() {
    this.owner = await this.contract.methods.owner().call();
    this.userName = await this.contract.methods.username().call();
    this.picture = await this.contract.methods.picture().call();
    this.pictureType = await this.contract.methods.pictureType().call();
    this.description = await this.contract.methods.description().call();
    this.numberOfPosts = await this.contract.methods.numberOfPosts().call();
    // await this.loadPosts();
  }

  async post(text: string, ipfsHash: string, ipfsType: string): Promise<Post> {
    const result = await this.contract.methods.post(text, ipfsHash, ipfsType).send();
    console.log('new post');
    console.dir(result);
    const postAddress = result.events.Posted[0].returnValues.post;
    const post = new Post(postAddress, this.web3, this.userAddress, this.ipfs, this.cache);
    await post.init();
    return post;
  }


  async loadPosts(caching?: boolean) {
    console.log('LOAD POSTS: ' + this.contract.options.address);
    const start = Date.now();

    const postAddresses: string[] = caching ? this.cachedPostAddresses : await this.updatePostAddressEvents();
    await this.loadPostContracts(postAddresses, caching);


    if (caching) {
      // refresh data later
      setTimeout(async () => {
        const addresses = await this.updatePostAddressEvents();
        await this.loadPostContracts(addresses, caching);
        await this.cache.updateProfile(this);

      });

    }

    this.contract.events.Posted().on('data', async event => {
      const post = new Post(event.returnValues.post, this.web3, this.userAddress, this.ipfs, this.cache);
      await post.init(true);
      await post.loadIpfsContent();
      this.posts.next(this.posts.getValue().concat([post]));
      this.numberOfPosts++;
      if (caching) {
        await this.cache.updateProfile(this);
      }
    });

    const end = Date.now();
    console.log('FINISHED ' + postAddresses.length + ' POSTS: ' + this.contract.options.address + ' , ' + (end - start));
  }

  getPostAddresses() {
    return this.posts.getValue().map(post => {
      return post.postAddress;
    });
  }

  async setPicture(ipfsHash: string, ipfsType: string) {
    const result = await this.contract.methods.setPicture(ipfsHash, ipfsType).send();
    this.picture = result.events.PictureChanged.returnValues.picture;
    this.pictureType = result.events.PictureChanged.returnValues.pictureType;
  }

  async setUserName(name: string) {
    const result = await this.contract.methods.setName(name).send();
    this.userName = result.events.NameChanged.returnValues.name;
  }

  async setDescription(description: string) {
    const result = await this.contract.methods.setDescription(description).send();
    this.description = result.events.DescriptionChanged.returnValues.description;
  }

  getPosts(): Observable<Post[]> {
    return this.posts.asObservable();
  }

  getAddress(): string {
    return this.contract.options.address;
  }

  private async updatePostAddressEvents(): Promise<string[]> {
    const events = await this.contract.getPastEvents('Posted', {
      fromBlock: 0,
      toBlock: 'latest'
    });


    return events.map(event => {
      return event.returnValues.post;
    });
  }

  private async loadPostContracts(postAddresses: string[], caching?: boolean) {
    const posts = await Promise.all(postAddresses.map(async postAddress => {
      const post = new Post(postAddress, this.web3, this.userAddress, this.ipfs, this.cache);
      await post.init(caching);
      await post.loadIpfsContent();
      return post;
    }));
    console.dir(posts);
    this.posts.next(posts);
  }

}
