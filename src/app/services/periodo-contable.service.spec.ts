import { TestBed } from '@angular/core/testing';

import { PeriodoContableService } from './periodo-contable.service';

describe('PeriodoContableService', () => {
  let service: PeriodoContableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PeriodoContableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
