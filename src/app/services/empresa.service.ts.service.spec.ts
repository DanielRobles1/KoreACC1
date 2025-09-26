import { TestBed } from '@angular/core/testing';

import { EmpresaServiceTsService } from './empresa.service.ts.service';

describe('EmpresaServiceTsService', () => {
  let service: EmpresaServiceTsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmpresaServiceTsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
