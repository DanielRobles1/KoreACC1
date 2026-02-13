import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolizasComponent } from './polizas.component';

describe('PolizasComponent', () => {
  let component: PolizasComponent;
  let fixture: ComponentFixture<PolizasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolizasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PolizasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
