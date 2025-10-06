import { TestBed } from '@angular/core/testing';

import { CentrosCostosService } from './centros-costos.service';

describe('CentrosCostosService', () => {
  let service: CentrosCostosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CentrosCostosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
