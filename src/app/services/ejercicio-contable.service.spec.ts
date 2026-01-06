import { TestBed } from '@angular/core/testing';

import { EjercicioContableService } from './ejercicio-contable.service';

describe('EjercicioContableService', () => {
  let service: EjercicioContableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EjercicioContableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
