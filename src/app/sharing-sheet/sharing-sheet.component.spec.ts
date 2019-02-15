import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {SharingSheetComponent} from './sharing-sheet.component';

describe('SharingSheetComponent', () => {
  let component: SharingSheetComponent;
  let fixture: ComponentFixture<SharingSheetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SharingSheetComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SharingSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
