import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolizasLayoutComponent } from './polizas-layout.component';

describe('PolizasLayoutComponent', () => {
  let component: PolizasLayoutComponent;
  let fixture: ComponentFixture<PolizasLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolizasLayoutComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PolizasLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
