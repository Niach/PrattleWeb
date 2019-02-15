import {Component, OnInit} from '@angular/core';
import {LoomService} from '../loom.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {UserProfile} from '../contracts/UserProfile';
import {saveAs} from 'file-saver';
import {ReadMode} from 'ngx-file-helpers';
import {Router} from '@angular/router';
import {IpfsService} from '../ipfs.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  readmode = ReadMode;

  profile: Observable<UserProfile>;
  profileRef: UserProfile;
  profilePictureUrl: BehaviorSubject<string> = new BehaviorSubject(UserProfile.DEFAULT_PICTURE);

  editingName = false;
  editingDescription = false;

  constructor(private loomService: LoomService, private ipfsService: IpfsService, private router: Router) {
  }

  ngOnInit() {
    this.profile = this.loomService.getUserProfile();
    this.profile.subscribe(async profile => {
      if (profile) {
        this.profileRef = profile;
        this.profilePictureUrl.next(await this.ipfsService.downloadImage(profile.picture, profile.pictureType));
      }
    });

  }

  async downloadProfile() {
    const json = await this.loomService.exportProfileJson();
    const blob = new Blob([json], {type: 'text/plain;charset=utf-8'});
    saveAs(blob, 'profile.json');
  }

  async importProfile(pickEvent) {
    console.dir(pickEvent);
    await this.loomService.importProfileJson(pickEvent.content);

  }

  async resetProfile() {
    await this.loomService.resetProfile();
    await this.router.navigateByUrl('/register');
  }

  async changeName(name: string) {
    await this.profileRef.setUserName(name);
  }

  async changeDescription(description: string) {
    await this.profileRef.setDescription(description);
  }

  async onFilePicked(file) {
    const ipfs = await this.ipfsService.upload(new Buffer(file.content), 'profile');
    const url = await this.ipfsService.downloadImage(ipfs.hash, file.type);
    this.profilePictureUrl.next(url);
    await this.profileRef.setPicture(ipfs.hash, file.type);
    console.log('pick done');
  }


}
