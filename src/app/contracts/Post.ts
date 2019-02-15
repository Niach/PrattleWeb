import Web3 from 'web3';
import {PrattleContract} from './PrattleContract';
import {IpfsService} from '../ipfs.service';
import {BehaviorSubject} from 'rxjs';
import {UserProfile} from './UserProfile';
import {Prattle} from './Prattle';
import {CacheService} from '../cache.service';

const ABI = [
  {
    'constant': true,
    'inputs': [],
    'name': 'shares',
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
    'name': 'text',
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
    'name': 'comments',
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
    'name': 'isSharing',
    'outputs': [
      {
        'name': '',
        'type': 'bool'
      }
    ],
    'payable': false,
    'stateMutability': 'view',
    'type': 'function'
  },
  {
    'constant': true,
    'inputs': [],
    'name': 'parent',
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
    'inputs': [
      {
        'name': '',
        'type': 'address'
      }
    ],
    'name': 'ratings',
    'outputs': [
      {
        'name': '',
        'type': 'int256'
      }
    ],
    'payable': false,
    'stateMutability': 'view',
    'type': 'function'
  },
  {
    'constant': true,
    'inputs': [],
    'name': 'ipfsFile',
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
    'name': 'timestamp',
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
    'name': 'likes',
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
    'name': 'dislikes',
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
    'name': 'ipfsFileType',
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
        'name': 'message',
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
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'constructor'
  },
  {
    'anonymous': false,
    'inputs': [
      {
        'indexed': false,
        'name': 'sharedBy',
        'type': 'address'
      },
      {
        'indexed': false,
        'name': 'timestamp',
        'type': 'uint256'
      }
    ],
    'name': 'Shared',
    'type': 'event'
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
    'name': 'CommentPosted',
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
        'name': 'rating',
        'type': 'int256'
      }
    ],
    'name': 'Rated',
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
        'name': 'newRating',
        'type': 'int256'
      }
    ],
    'name': 'rate',
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
      }
    ],
    'name': 'comment',
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
      }
    ],
    'name': 'share',
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
      }
    ],
    'name': 'setParent',
    'outputs': [],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function'
  },
  {
    'constant': false,
    'inputs': [
      {
        'name': 'shared',
        'type': 'bool'
      }
    ],
    'name': 'setSharing',
    'outputs': [],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function'
  }
];

export enum Rating {
  NEUTRAL = 0, LIKE = 1, DISLIKE = -1
}

export class Post extends PrattleContract {
  owner: string;
  ownerProfile: UserProfile;
  text: string;
  ipfsFile: string;
  ipfsType: string;
  timestamp: number;
  likes: number;
  dislikes: number;
  comments: number;
  shares: number;

  myRating: number;
  postAddress: string;

  postedComments: BehaviorSubject<Post[]> = new BehaviorSubject<Post[]>([]);

  parentAddress: string;
  parent: Post;
  isSharing: boolean;

  ipfsContentUrl = '';

  constructor(contractAddress: string, web3: Web3, userAddress: string, ipfsService: IpfsService, cache: CacheService) {
    super(ABI, contractAddress, web3, userAddress, ipfsService, cache);
    this.postAddress = contractAddress;
  }

  async init(caching?: boolean) {
    console.log('LOAD POST: ' + this.contract.options.address);
    const start = Date.now();

    if (caching) {
      const cachedPost = await this.cache.getPost(this.contract.options.address);
      console.log('Cached Post:');
      console.dir(cachedPost);
      this.owner = cachedPost.owner;
      this.text = cachedPost.text;
      this.ipfsFile = cachedPost.ipfsFile;
      this.ipfsType = cachedPost.ipfsType;
      this.timestamp = cachedPost.timestamp;
      this.likes = cachedPost.likes;
      this.dislikes = cachedPost.dislikes;
      this.comments = cachedPost.comments;
      this.myRating = cachedPost.myRating;
      this.isSharing = cachedPost.isSharing;
      if (cachedPost.parent && cachedPost.parent !== '') {
        this.parent = new Post(cachedPost.parent, this.web3, this.userAddress, this.ipfs, this.cache);
        await this.parent.init(true);
        await this.parent.loadIpfsContent();
      }

      setTimeout(async () => {
        await this.updateValues();
        console.log('updated later values for: ' + this.postAddress);
        await this.cache.updatePost(this);
      });


    } else {

      await this.updateValues();

    }

    // TODO: update cache
    // refresh likes on rating changed
    this.contract.events.Rated().on('data', async event => {
      this.likes = await this.contract.methods.likes().call();
      this.myRating = await this.contract.methods.ratings(this.userAddress).call();
    });
    this.contract.events.CommentPosted().on('data', async event => {
      this.comments = await this.contract.methods.comments().call();
    });
    this.contract.events.Shared().on('data', async event => {
      this.shares = await this.contract.methods.shares().call();
    });

    const end = Date.now();
    console.log('FINISHED POST: ' + this.contract.options.address + ' , ' + (end - start));
  }

  async updateValues() {
    console.log('update values: ' + this.contract.options.address);
    const start = Date.now();
    [
      this.owner,
      this.text,
      this.ipfsFile,
      this.ipfsType,
      this.timestamp,
      this.likes,
      this.dislikes,
      this.comments,
      this.myRating,
      this.parentAddress,
      this.shares,
      this.isSharing
    ] = await Promise.all([
      this.contract.methods.owner().call(),
      this.contract.methods.text().call(),
      this.contract.methods.ipfsFile().call(),
      this.contract.methods.ipfsFileType().call(),
      this.contract.methods.timestamp().call(),
      this.contract.methods.likes().call(),
      this.contract.methods.dislikes().call(),
      this.contract.methods.comments().call(),
      this.contract.methods.ratings(this.userAddress).call(),
      this.contract.methods.parent().call(),
      this.contract.methods.shares().call(),
      this.contract.methods.isSharing().call()
    ]);
    if (this.parentAddress !== '0x0000000000000000000000000000000000000000') {
      this.parent = new Post(this.parentAddress, this.web3, this.userAddress, this.ipfs, this.cache);
      await this.parent.init(true);
      await this.parent.loadIpfsContent();
    }
    const end = Date.now();
    console.log('FINISHED update values: ' + this.contract.options.address + ' , ' + (end - start));
    console.dir(this);
  }

  async comment(post: Post) {
    await this.contract.methods.comment(post.contract.options.address).send();
  }

  async rate(rating: Rating) {
    await this.contract.methods.rate(rating).send();
  }

  async share(post: Post) {
    await this.contract.methods.share(post.contract.options.address).send();
  }

  async loadIpfsContent() {
    if (this.ipfsFile.length > 0 && this.ipfsType.startsWith('image/')) {
      this.ipfsContentUrl = await this.ipfs.downloadImage(this.ipfsFile, this.ipfsType);
    }
  }

  async loadComments(prattle: Prattle) {
    if (this.comments === 0) {
      return;
    }
    const commentEvents = await this.contract.getPastEvents('CommentPosted', {
      fromBlock: 0,
      toBlock: 'latest'
    });
    const commentAddresses = commentEvents.map(event => {
      return event.returnValues.post;
    });
    const comments = await Promise.all(commentAddresses.map(async postAddress => {
      const post = new Post(postAddress, this.web3, this.userAddress, this.ipfs, this.cache);
      await post.init();
      post.ownerProfile = await prattle.users.getProfile(post.owner);
      return post;
    }));
    this.postedComments.next(comments);


    this.contract.events.CommentPosted().on('data', async event => {
      const post = new Post(event.returnValues.post, this.web3, this.userAddress, this.ipfs, this.cache);
      await post.init();
      post.ownerProfile = await prattle.users.getProfile(post.owner);
      this.postedComments.next(this.postedComments.getValue().concat([post]));

      await this.cache.updatePost(this);

    });


  }

  equals(other: Post): boolean {
    return (other.text === this.text) && (other.ipfsFile === other.ipfsFile)
      && (other.owner === this.owner) && (other.timestamp === this.timestamp);
  }

  getTimeStampString() {
    return new Date(this.timestamp * 1000);
  }


}
