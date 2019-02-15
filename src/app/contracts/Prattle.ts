import Web3 from 'web3';
import {Users} from './Users';
import {PrattleContract} from './PrattleContract';
import {IpfsService} from '../ipfs.service';
import {Post} from './Post';
import {CacheService} from '../cache.service';

const ABI = [
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
    'name': 'users',
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
        'name': 'newOwner',
        'type': 'address'
      }
    ],
    'name': 'TransferredOwnership',
    'type': 'event'
  }
];

export class Prattle extends PrattleContract {
  users: Users;

  constructor(contractAddress: string, web3: Web3, userAddress: string, ipfsService: IpfsService, cache: CacheService) {
    super(ABI, contractAddress, web3, userAddress, ipfsService, cache);
  }

  async init() {
    const usersContractAddress = await this.contract.methods.users().call();
    this.users = new Users(usersContractAddress, this.web3, this.userAddress, this.ipfs, this.cache);
    await this.users.init();
  }

  async getPost(address: string): Promise<Post> {
    const post = new Post(address, this.web3, this.userAddress, this.ipfs, this.cache);
    await post.init(true);
    return post;
  }

}
