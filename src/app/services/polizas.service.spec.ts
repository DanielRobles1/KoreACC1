import { TestBed } from '@angular/core/testing';

import { PolizasService } from './polizas.service';

describe('PolizasService', () => {
  let service: PolizasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PolizasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
