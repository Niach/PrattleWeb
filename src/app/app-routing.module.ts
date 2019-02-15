import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {TimelineComponent} from './timeline/timeline.component';
import {PinsComponent} from './pins/pins.component';
import {PostComponent} from './post/post.component';
import {UserProfileComponent} from './user-profile/user-profile.component';
import {FollowingComponent} from './following/following.component';

const routes: Routes = [
  {path: '', redirectTo: '/discover', pathMatch: 'full'},
  {path: 'timeline/:user', component: TimelineComponent},
  {path: 'timeline', component: TimelineComponent},
  {path: 'pins', component: PinsComponent},
  {path: 'post/:address', component: PostComponent},
  {path: 'profile', component: UserProfileComponent},
  {path: 'following', component: FollowingComponent},
  {path: 'discover', component: TimelineComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
