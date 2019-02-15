import {TestBed} from '@angular/core/testing';

import {LoomService} from './loom.service';

describe('LoomService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LoomService = TestBed.get(LoomService);
    expect(service).toBeTruthy();
  });
});
