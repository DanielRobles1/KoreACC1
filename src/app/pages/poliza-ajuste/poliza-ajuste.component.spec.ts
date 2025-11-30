import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolizaAjusteComponent } from './poliza-ajuste.component';

describe('PolizaAjusteComponent', () => {
  let component: PolizaAjusteComponent;
  let fixture: ComponentFixture<PolizaAjusteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolizaAjusteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PolizaAjusteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
