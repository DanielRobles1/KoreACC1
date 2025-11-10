import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavingOverlayComponent } from './saving-overlay.component';

describe('SavingOverlayComponent', () => {
  let component: SavingOverlayComponent;
  let fixture: ComponentFixture<SavingOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SavingOverlayComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SavingOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
