import {Component, OnInit} from '@angular/core';
import {UserProfile} from '../contracts/UserProfile';
import {LoomService} from '../loom.service';

@Component({
  selector: 'app-following',
  templateUrl: './following.component.html',
  styleUrls: ['./following.component.css']
})
export class FollowingComponent implements OnInit {

  followingProfiles: UserProfile[] = [];

  constructor(private loomService: LoomService) {
  }

  async ngOnInit() {
    this.followingProfiles = await this.loomService.getFollowingList();
  }

}
