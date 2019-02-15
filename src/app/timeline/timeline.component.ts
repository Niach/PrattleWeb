import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {LoomService} from '../loom.service';
import {BehaviorSubject, merge} from 'rxjs';
import {Post, Rating} from '../contracts/Post';
import {UserProfile} from '../contracts/UserProfile';
import {isNullOrUndefined} from 'util';
import {Prattle} from '../contracts/Prattle';
import {IpfsService} from '../ipfs.service';
import {ReadMode} from 'ngx-file-helpers';
import {ActivatedRoute, Router} from '@angular/router';
import {PostSet} from '../util/PostSet';
import {NgxMasonryComponent} from 'ngx-masonry';
import {SharingSheetComponent, SheetResult} from '../sharing-sheet/sharing-sheet.component';
import {MatBottomSheet, MatSnackBar} from '@angular/material';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css']
})
export class TimelineComponent implements OnInit, OnDestroy {
  readmode = ReadMode;

  @ViewChild('masonry') masonry: NgxMasonryComponent;

  // posts: BehaviorSubject<Post[]> = new BehaviorSubject<Post[]>([]);
  postSet: PostSet<Post> = new PostSet<Post>();
  profiles = {};
  profilePictures = {};

  profile: BehaviorSubject<UserProfile> = new BehaviorSubject<UserProfile>(null);
  pickedFileUrl = '';
  following: UserProfile[];
  commentOpen: { [id: string]: boolean; };
  commentInputValues: { [id: string]: string; };
  loadAllComments: boolean[];
  noPostsFound = false;
  private currentlyPickedFile = '';
  private currentlyPickedFileType = '';
  private userSubscription;

  constructor(private loomService: LoomService, private ipfsService: IpfsService, private route: ActivatedRoute,
              private router: Router, private bottomSheet: MatBottomSheet, private snackBar: MatSnackBar) {
  }

  async ngOnInit() {

    this.loomService.getUserProfile().subscribe(profile => {
      this.profile.next(profile);
    });

    this.userSubscription = this.route.params.subscribe(async params => {
      if (this.router.url === '/discover') {
        await this.loadPublicPosts();
      } else if (params.user === undefined || params.user.length < 1) {
        /*this.loomService.getUserProfile().subscribe(async profile => {
          await this.loadPostsFrom(profile);
        });*/

        this.following = await this.loomService.getFollowingList();
        await this.loadPostsFromFollowing(this.following);


      } else {
        const prattle = await this.loomService.getPrattle();
        const profile = await prattle.users.getProfile(params.user);
        await this.loadPostsFrom(profile);
      }
      if (this.postSet.length < 1) {
        this.noPostsFound = true;
      }
    });

    this.commentInputValues = {};
    this.commentOpen = {};
    this.loadAllComments = [];
    /*
    this.posts.subscribe(posts => {
      console.log('new posts!');
      console.dir(posts);
    });
    */

  }

  async loadPostsFromFollowing(following: UserProfile[]) {
    console.log('FOOOOOOOLLOOOOOOWW');
    console.dir(following);
    const posts = await Promise.all(following.map(async profile => {
      await profile.loadPosts(true);
      return profile.getPosts();
    }));

    this.profile.asObservable().subscribe(async ownProfile => {
      if (!ownProfile) {
        return;
      }
      await ownProfile.loadPosts(true);
      posts.push(ownProfile.getPosts());
      console.log('own profile');
      console.dir(ownProfile);
      console.dir(posts);

      const merges = merge(...posts);

      merges.subscribe(async mergedPosts => {
        console.log('merged');
        console.dir(mergedPosts);
        const prattle = await this.loomService.getPrattle();
        for (const p of mergedPosts) {
          console.log('load');
          await this.loadProfile(p.owner, prattle);
          console.log('loaded: ' + p.owner);
          console.log('loading comments');
          if (p.parent) {
            await this.loadProfile(p.parent.owner, prattle);
          }
          await p.loadComments(prattle);
          console.log('loaded comments');

        }
        mergedPosts.forEach(post => {
          this.postSet.pushUnique(post);
        });
        this.updateLayout();
      });
    });

  }

  async loadPostsFrom(profile: UserProfile) {
    if (profile === null) {
      console.error('profile null');
      return;
    }
    await profile.loadPosts(true);

    const prattle = await this.loomService.getPrattle();
    profile.getPosts().subscribe(async posts => {

      for (const post of posts) {
        console.log('load');
        await this.loadProfile(post.owner, prattle);
        if (post.parent) {
          await this.loadProfile(post.parent.owner, prattle);
        }
        console.log('loaded: ' + post.owner);
        console.log('loading comments');
        await post.loadComments(prattle);
        console.log('loaded comments');
      }
      // this.posts.next(posts);
      posts.forEach(post => {
        this.postSet.pushUnique(post);
      });
      this.updateLayout();
    });
  }

  async loadPublicPosts() {
    const prattle = await this.loomService.getPrattle();

    await prattle.users.loadPosts(true);
    prattle.users.getPosts().subscribe(async (posts: Post[]) => {
      console.log('load profiles');
      await Promise.all(posts.map(async post => {
        return await this.loadProfile(post.owner, prattle);
      }));
      posts.filter(post => {
        return !post.parent;
      }).forEach(post => {
        this.postSet.pushUnique(post);
      });
      this.updateLayout();
    });
  }

  async postMessage(text: string) {
    if (text === '' && this.currentlyPickedFile === '') {
      return;
    }
    const post = await this.profile.value.post(text, this.currentlyPickedFile, this.currentlyPickedFileType);
    this.currentlyPickedFile = this.currentlyPickedFileType = this.pickedFileUrl = '';
  }

  async onFilePicked(file) {
    console.dir(file);
    const randomString = Math.random().toString(36).substr(2, 5);
    const ipfs = await this.ipfsService.upload(new Buffer(file.content), randomString);
    console.dir(ipfs);
    this.currentlyPickedFile = ipfs.hash;
    this.currentlyPickedFileType = file.type;
    this.pickedFileUrl = await this.ipfsService.downloadImage(ipfs.hash, file.type);
  }

  async like(post: Post) {
    if (post.myRating == 0) {
      await post.rate(Rating.LIKE);
    } else if (post.myRating == 1) {
      await post.rate(Rating.NEUTRAL);
    }
  }

  async share(post: Post) {
    const sheetRef = this.bottomSheet.open(SharingSheetComponent);
    sheetRef.afterDismissed().subscribe(async (result: { type: SheetResult, value?: string }) => {
      let comment: string;
      if (result.type === SheetResult.SHARE) {
        comment = '';
      } else if (result.type === SheetResult.SHARE_AND_COMMENT) {
        comment = result.value;
      } else {
        return;
      }
      const newPost = await this.profile.getValue().post(comment, '', '');
      await post.share(newPost);
      console.dir(newPost);
      console.dir(post);
      await newPost.updateValues();
      const snackRef = this.snackBar.open('Successfully shared post!', 'View');
      snackRef.onAction().subscribe(async () => {
        await this.router.navigateByUrl('/post/' + newPost.postAddress);
      });
    });
  }

  async clickComment(commentAddress: string) {
    this.commentOpen[commentAddress] = !this.commentOpen[commentAddress];
  }

  async postComment(text: string, comment: Post) {
    console.dir(text);
    const newPost = await this.profile.getValue().post(text, '', '');
    await comment.comment(newPost);
  }

  clearInputs(commentAddress: string) {
    this.commentInputValues[commentAddress] = '';
    this.commentOpen[commentAddress] = false;
  }

  updateLayout() {
    this.masonry.reloadItems();
    this.masonry.layout();

  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }

  private async loadProfile(owner: string, prattle: Prattle) {
    if (!isNullOrUndefined(this.profiles[owner])) {
      return this.profiles[owner];
    }
    console.log('load2');

    this.profiles[owner] = await prattle.users.getProfile(owner);
    this.profilePictures[owner] = await this.ipfsService.downloadImage(this.profiles[owner].picture, this.profiles[owner].pictureType);
    return this.profiles[owner];
  }


}
