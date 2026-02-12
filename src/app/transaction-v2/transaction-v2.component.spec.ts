import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionV2Component } from './transaction-v2.component';

describe('TransactionV2Component', () => {
  let component: TransactionV2Component;
  let fixture: ComponentFixture<TransactionV2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionV2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransactionV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
