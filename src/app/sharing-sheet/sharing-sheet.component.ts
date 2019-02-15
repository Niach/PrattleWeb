import {Component, OnInit} from '@angular/core';
import {MatBottomSheetRef} from '@angular/material';

export enum SheetResult {
  SHARE, SHARE_AND_COMMENT
}

@Component({
  selector: 'app-sharing-sheet',
  templateUrl: './sharing-sheet.component.html',
  styleUrls: ['./sharing-sheet.component.css']
})
export class SharingSheetComponent implements OnInit {

  constructor(private bottomSheetRef: MatBottomSheetRef<SharingSheetComponent>) {
  }


  clickShare(event: MouseEvent) {
    this.bottomSheetRef.dismiss({type: SheetResult.SHARE});
    event.preventDefault();
  }

  clickShareWithComment(text: string) {
    this.bottomSheetRef.dismiss({type: SheetResult.SHARE_AND_COMMENT, value: text});
  }

  ngOnInit(): void {
  }

}
