import { TestBed } from '@angular/core/testing';

import { DecimalWatcherService } from './decimal-watcher.service';

describe('DecimalWatcherService', () => {
  let service: DecimalWatcherService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DecimalWatcherService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
