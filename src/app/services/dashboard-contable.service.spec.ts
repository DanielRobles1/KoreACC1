import { TestBed } from '@angular/core/testing';

import { DashboardContableService } from './dashboard-contable.service';

describe('DashboardContableService', () => {
  let service: DashboardContableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DashboardContableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
