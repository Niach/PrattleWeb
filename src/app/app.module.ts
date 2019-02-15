import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatMenuModule} from '@angular/material/menu';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {AppRoutingModule} from './app-routing.module';
import {MainNavComponent} from './main-nav/main-nav.component';
import {MatButtonModule, MatFormFieldModule, MatInputModule} from '@angular/material';
import {MatCardModule} from '@angular/material/card';
import {MatStepperModule} from '@angular/material/stepper';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {UserProfileComponent} from './user-profile/user-profile.component';
import {TimelineComponent} from './timeline/timeline.component';
import {PinsComponent} from './pins/pins.component';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatDividerModule} from '@angular/material/divider';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {PostComponent} from './post/post.component';
import {MatGridListModule} from '@angular/material/grid-list';
import {NgxMasonryModule} from 'ngx-masonry';
import {TimeAgoPipe} from 'time-ago-pipe';
import {MatChipsModule} from '@angular/material/chips';
import {FollowingComponent} from './following/following.component';
import {MatBottomSheetModule} from '@angular/material/bottom-sheet';
import {SharingSheetComponent} from './sharing-sheet/sharing-sheet.component';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {FileHelpersModule} from 'ngx-file-helpers';
import {ServiceWorkerModule} from '@angular/service-worker';
import {environment} from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    MainNavComponent,
    UserProfileComponent,
    TimelineComponent,
    PinsComponent,
    PostComponent,
    TimeAgoPipe,
    FollowingComponent,
    SharingSheetComponent
  ],
  imports: [
    BrowserModule, BrowserAnimationsModule, AppRoutingModule, MatSidenavModule, MatMenuModule,
    MatToolbarModule, MatIconModule, MatListModule, MatButtonModule, MatInputModule, MatCardModule, MatStepperModule, MatFormFieldModule,
    ReactiveFormsModule, MatExpansionModule, MatDividerModule, MatProgressSpinnerModule, MatGridListModule, NgxMasonryModule, FormsModule,
    MatChipsModule, MatBottomSheetModule, MatSnackBarModule, FileHelpersModule, ServiceWorkerModule.register('ngsw-worker.js', {enabled: environment.production})
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [
    SharingSheetComponent
  ]
})
export class AppModule { }
