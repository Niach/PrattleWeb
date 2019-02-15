import {Component, OnDestroy, OnInit} from '@angular/core';
import {LoomService} from '../loom.service';
import {IpfsService} from '../ipfs.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Post, Rating} from '../contracts/Post';
import {UserProfile} from '../contracts/UserProfile';
import {MatBottomSheet, MatSnackBar} from '@angular/material';
import {SharingSheetComponent, SheetResult} from '../sharing-sheet/sharing-sheet.component';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit, OnDestroy {

  post: Post;
  postOwner: UserProfile;
  loaded = false;
  myProfile: UserProfile;
  commentOpen = false;
  subCommentOpen: boolean[];
  commentInputValues;
  private postSubscription;
  private profileSubscription;

  constructor(private loomService: LoomService, private ipfsService: IpfsService, private route: ActivatedRoute, private bottomSheet: MatBottomSheet,
              private snackBar: MatSnackBar, private router: Router) {
  }

  async ngOnInit() {
    this.profileSubscription = this.loomService.getUserProfile().subscribe(profile => {
      this.myProfile = profile;
    });
    this.postSubscription = this.route.params.subscribe(async params => {
      if (params.address === undefined || params.address.length < 1) {
        // TODO: post not found

      } else {
        this.commentInputValues = [];
        this.subCommentOpen = [];
        const prattle = await this.loomService.getPrattle();
        this.post = await prattle.getPost(params.address);
        this.postOwner = await prattle.users.getProfile(this.post.owner);
        await this.post.loadIpfsContent();
        await this.post.loadComments(prattle);
        this.loaded = true;
      }
    });
  }

  async like(comment?: Post) {
    if (!comment) {
      comment = this.post;
    }
    if (comment.myRating == 0) {
      await comment.rate(Rating.LIKE);
    } else if (comment.myRating == 1) {
      await comment.rate(Rating.NEUTRAL);
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
      const newPost = await this.myProfile.post(comment, '', '');
      await post.share(newPost);
      console.dir(newPost);
      console.dir(post);
      const snackRef = this.snackBar.open('Successfully shared post!', 'View');
      snackRef.onAction().subscribe(async () => {
        await this.router.navigateByUrl('/post/' + newPost.postAddress);
      });
    });

  }

  async clickComment(subCommentIndex?: number) {
    if (subCommentIndex !== undefined) {
      this.subCommentOpen[subCommentIndex] = !this.subCommentOpen[subCommentIndex];
    } else {
      this.commentOpen = !this.commentOpen;
    }
  }


  async postComment(text: string, comment?: Post) {
    const newPost = await this.myProfile.post(text, '', '');
    if (comment) {
      await comment.comment(newPost);
    } else {
      await this.post.comment(newPost);
    }
  }

  clearInput(commentIndex: number) {
    this.commentInputValues[commentIndex] = '';
  }


  ngOnDestroy(): void {
    this.postSubscription.unsubscribe();
    this.profileSubscription.unsubscribe();
  }

}
