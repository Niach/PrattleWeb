import {Component, OnInit, ViewChild} from '@angular/core';
import {Observable} from 'rxjs';
import {BreakpointObserver} from '@angular/cdk/layout';
import {filter, map, withLatestFrom} from 'rxjs/operators';
import {LoomService} from '../loom.service';
import {UserProfile} from '../contracts/UserProfile';
import {ActivatedRoute, NavigationEnd, NavigationStart, Router} from '@angular/router';
import {Post} from '../contracts/Post';
import {MatSidenav} from '@angular/material';
import {ReadMode} from 'ngx-file-helpers';
import {IpfsService} from '../ipfs.service';


@Component({
  selector: 'app-main-nav',
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.css']
})
export class MainNavComponent implements OnInit {

  isHandset$: Observable<boolean> = this.breakpointObserver.observe([
    '(max-width: 599.99px) and (orientation: portrait)',
    '(max-width: 959.99px)',
  ])
    .pipe(
      map(result => result.matches)
    );
  @ViewChild('drawer') drawer: MatSidenav;

  readmode = ReadMode;


  navTitle = 'Discover';

  userProfile: UserProfile;
  userAddress: string;
  userPictureUrl: string;

  routerUserAddress: string;
  routerUserProfile: UserProfile;

  isFollowing = true;
  followingCount: Observable<number>;

  post: Post;

  // default register image
  pictureHash: string;
  pictureType: string;
  pictureUrl: string;

  constructor(private breakpointObserver: BreakpointObserver, private loomService: LoomService,
              private router: Router, private route: ActivatedRoute, private ipfsService: IpfsService) {
    this.resetRegisterForm();
  }

  async ngOnInit() {
    this.router.events.subscribe(async event => {

      this.routerUserProfile = null;
      this.routerUserAddress = null;
      this.post = null;
      if (event instanceof NavigationStart) {
        const url = event.url;
        if (url.startsWith('/timeline')) {
          this.navTitle = 'Timeline';
        }
        if (url.startsWith('/timeline/')) {
          const addr = url.split('/')[2];
          console.log(addr);
          this.routerUserAddress = addr;
          const prattle = await this.loomService.getPrattle();
          this.routerUserProfile = await prattle.users.getProfile(addr);
          this.isFollowing = await this.loomService.isFollowing(this.routerUserProfile);

        } else if (url.startsWith('/post/')) {
          this.navTitle = 'Post';
          const addr = url.split('/')[2];
          console.log(addr);
          const prattle = await this.loomService.getPrattle();
          this.post = await prattle.getPost(addr);
        } else if (url.startsWith('/pins')) {
          this.navTitle = 'Pinned Content';
        } else if (url.startsWith('/profile')) {
          this.navTitle = 'Profile';
        } else if (url.startsWith('/discover')) {
          this.navTitle = 'Discover';
        }
      }
    });

    // close sidenav on navigation
    this.router.events.pipe(
      withLatestFrom(this.isHandset$),
      filter(([a, b]) => b && a instanceof NavigationEnd)
    ).subscribe(() => this.drawer.close());

    this.loomService.getUserProfile().subscribe(async profile => {
      this.userProfile = profile;
      if (profile) {
        this.userPictureUrl = await this.ipfsService.downloadImage(this.userProfile.picture, 'image/png');
      }
    });
    this.loomService.getUserAddress().subscribe(async address => {
      this.userAddress = address;
    });

    this.followingCount = this.loomService.getFollowingCount();
  }


  async clickFollow() {
    console.log('follow user: ' + this.routerUserProfile.userName);
    await this.loomService.followUser(this.routerUserProfile);
    this.isFollowing = true;
  }

  async onFilePicked(file) {
    const ipfs = await this.ipfsService.upload(new Buffer(file.content), 'profile');
    this.pictureHash = ipfs.hash;
    this.pictureType = file.type;
    this.pictureUrl = await this.ipfsService.downloadImage(this.pictureHash, this.pictureType);
  }

  async clickRegister(name: string) {
    const prattle = await this.loomService.getPrattle();
    const profile = await prattle.users.register(name);
    console.log('registered');
    console.dir(profile);
    await profile.setPicture(this.pictureHash, this.pictureType);
    await this.router.navigateByUrl('/timeline');
    this.loomService.setUserProfile(profile);
    this.resetRegisterForm();
  }

  resetRegisterForm() {
    this.pictureHash = 'QmW4SMrWt4sAMKtwt6kSks2fLbMFVYo7tXGTyTNFrim5gt';
    this.pictureType = 'image/png';
    this.pictureUrl = UserProfile.DEFAULT_PICTURE;
  }


}
