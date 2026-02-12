import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BankinComponent } from './bankin.component';

describe('BankinComponent', () => {
  let component: BankinComponent;
  let fixture: ComponentFixture<BankinComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BankinComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BankinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
