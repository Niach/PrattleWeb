export interface CachedPost {
  address: string;
  owner: string;
  text: string;
  ipfsFile: string;
  ipfsType: string;
  timestamp: number;
  likes: number;
  dislikes: number;
  comments: number;
  shares: number;
  myRating: number;
  parent: string;
  isSharing: boolean;
}
