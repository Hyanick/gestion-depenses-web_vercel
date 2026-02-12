import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoldeGlobalComponent } from './solde-global.component';

describe('SoldeGlobalComponent', () => {
  let component: SoldeGlobalComponent;
  let fixture: ComponentFixture<SoldeGlobalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SoldeGlobalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SoldeGlobalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
