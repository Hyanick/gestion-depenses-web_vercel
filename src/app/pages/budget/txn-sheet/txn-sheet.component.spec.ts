import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TxnSheetComponent } from './txn-sheet.component';

describe('TxnSheetComponent', () => {
  let component: TxnSheetComponent;
  let fixture: ComponentFixture<TxnSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TxnSheetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TxnSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
