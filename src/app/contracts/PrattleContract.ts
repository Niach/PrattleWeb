import Web3 from 'web3';
import Contract from 'web3/eth/contract';
import {IpfsService} from '../ipfs.service';
import {CacheService} from '../cache.service';

export abstract class PrattleContract {
  protected contract: Contract;
  protected web3: Web3;
  protected userAddress: string;
  protected ipfs: IpfsService;
  protected cache: CacheService;

  protected constructor(abi, contractAddress: string, web3: Web3, userAddress: string, ipfsService: IpfsService, cache: CacheService) {
    this.contract = new web3.eth.Contract(abi, contractAddress, {from: userAddress});
    this.web3 = web3;
    this.userAddress = userAddress;
    this.ipfs = ipfsService;
    this.cache = cache;
  }

  abstract async init(caching?: boolean);
}
