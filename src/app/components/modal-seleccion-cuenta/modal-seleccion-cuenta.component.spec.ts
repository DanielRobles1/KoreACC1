import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalSeleccionCuentaComponent } from './modal-seleccion-cuenta.component';

describe('ModalSeleccionCuentaComponent', () => {
  let component: ModalSeleccionCuentaComponent;
  let fixture: ComponentFixture<ModalSeleccionCuentaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalSeleccionCuentaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalSeleccionCuentaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
