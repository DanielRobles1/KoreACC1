import { TestBed } from '@angular/core/testing';

import { KoreService } from './kore.service';

describe('KoreService', () => {
  let service: KoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
