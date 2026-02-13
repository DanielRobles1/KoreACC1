import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BalanceGralComponent } from './balance-gral.component';

describe('BalanceGralComponent', () => {
  let component: BalanceGralComponent;
  let fixture: ComponentFixture<BalanceGralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BalanceGralComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BalanceGralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
