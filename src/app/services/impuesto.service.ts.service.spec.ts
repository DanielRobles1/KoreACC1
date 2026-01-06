import { TestBed } from '@angular/core/testing';

import { ImpuestoServiceTsService } from './impuesto.service.ts.service';

describe('ImpuestoServiceTsService', () => {
  let service: ImpuestoServiceTsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImpuestoServiceTsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
