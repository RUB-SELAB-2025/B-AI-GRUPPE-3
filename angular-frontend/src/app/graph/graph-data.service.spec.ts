import { TestBed } from '@angular/core/testing';

import { DataSourceService } from './graph-data.service';
import {provideHttpClient} from '@angular/common/http';

describe('GraphDataService', () => {
  let service: DataSourceService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient()
      ]
    }).compileComponents();
    service = TestBed.inject(DataSourceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('should correctly scale axis based on data', () => {
    const mockData = {
      device1: [
        { timestamp: 1000, value: 10 },
        { timestamp: 2000, value: 20 },
      ],
      device2: [
        { timestamp: 1500, value: 15 },
      ],
    };

    // scaleAxisToData ist private -> Aufruf über cast
    (service as any).scaleAxisToData(mockData);

    const xDomain = service['$xDomain']();
    const yDomain = service['$yDomain']();

    // xDomain und yDomain sollten angepasst sein
    expect(xDomain[0].getTime()).toBeLessThanOrEqual(1000);
    expect(xDomain[1].getTime()).toBeGreaterThanOrEqual(2000);
    expect(yDomain[0]).toBeLessThanOrEqual(10);
    expect(yDomain[1]).toBeGreaterThanOrEqual(20);
  });
});
