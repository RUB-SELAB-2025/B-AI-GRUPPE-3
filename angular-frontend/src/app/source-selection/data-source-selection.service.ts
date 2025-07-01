import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { type DataFormat, OmnAIScopeDataService } from '../omnai-datasource/omnai-scope-server/live-data.service';
import { Observable } from 'rxjs';
import { DummyDataService, DummyDataServicex2 } from '../omnai-datasource/random-data-server/random-data.service';
 import {CsvFileImportService} from '../omnai-datasource/csv-file-import/csv-file-import.service';

/** Dummy interface to match your expected shape */
export interface DataPoint {
    x: number;
    y: number;
}

/** Your expected DataSource interface */
export interface DataSource {
    connect(): unknown;
    data: Signal<Record<string, DataFormat[]>>
    clearData(): void;
    disconnect(): unknown;
}

export class DataInfo {
  constructor() {
    this.minValue = Number.POSITIVE_INFINITY;
    this.maxValue = Number.NEGATIVE_INFINITY;
    this.minTimestamp = Number.POSITIVE_INFINITY;
    this.maxTimestamp = Number.NEGATIVE_INFINITY;
  }
  static copy(copy: DataInfo) {
    const newInfo = new DataInfo();
    newInfo.minValue = copy.minValue;
    newInfo.maxValue = copy.maxValue;
    newInfo.minTimestamp = copy.minTimestamp;
    newInfo.maxTimestamp = copy.maxTimestamp;
    return newInfo;
  }

  static newFromData(data: Map<string, DataFormat[]>){
    const newInfo = new DataInfo();
    for (const values of data.values())
      newInfo.applyDataPoints(values)
    return newInfo;
  }

  applyDataPoints(dataPoints: DataFormat[]) {
    for (const value of dataPoints) {
      this.applyDataPoint(value);
    }
  }

  applyDataPoint(dataPoint: DataFormat) {
    if (dataPoint.value > this.maxValue) this.maxValue = dataPoint.value;
    if (dataPoint.value < this.minValue) this.minValue = dataPoint.value;
    if (dataPoint.timestamp > this.maxTimestamp) this.maxTimestamp = dataPoint.timestamp;
    if (dataPoint.timestamp < this.minTimestamp) this.minTimestamp = dataPoint.timestamp;
  }

  minValue: number;
  maxValue: number;
  minTimestamp: number;
  maxTimestamp: number;
}

export interface DataSourceInfo  extends DataSource{
    id: string;
    name: string;
    description?: string;
}

@Injectable({
    providedIn: 'root'
})
export class DataSourceSelectionService {
    private readonly liveDataService = inject(OmnAIScopeDataService);
    private readonly dummyDataService = inject(DummyDataService);
    private readonly dummyDataServicex2 = inject(DummyDataServicex2);
    private readonly csvDataService = inject(CsvFileImportService);
    private readonly _currentSource = signal<DataSourceInfo[]>([]);

    private readonly _availableSources = signal<DataSourceInfo[]>([
        {
            id: 'omnaiscope',
            name: 'OmnAIScope',
            description: 'Live data from connected OmnAIScope devices',
            connect: this.liveDataService.connect.bind(this.liveDataService),
            data: this.liveDataService.data,
            clearData: this.liveDataService.clearData.bind(this.liveDataService),
            disconnect: this.liveDataService.disconnect.bind(this.liveDataService),
        },
        {
            id: 'dummydata',
            name: 'Random Dummy Data',
            description: 'Random generated data points',
            connect: this.dummyDataService.connect.bind(this.dummyDataService),
            data: this.dummyDataService.data,
            clearData: this.dummyDataService.clearData.bind(this.dummyDataService),
            disconnect: this.dummyDataService.disconnect.bind(this.dummyDataService),
        },
        {
            id: 'dummydatax2',
            name: 'Random Dummy Data x2',
            description: 'Random generated data points',
            connect: this.dummyDataServicex2.connect.bind(this.dummyDataServicex2),
            data: this.dummyDataServicex2.data,
            clearData: this.dummyDataServicex2.clearData.bind(this.dummyDataServicex2),
            disconnect: this.dummyDataServicex2.disconnect.bind(this.dummyDataServicex2),
        },
        {
            id: 'csv-file',
            name: 'CSV Data',
            description: 'Import a CSV file',
            connect: this.csvDataService.connect.bind(this.csvDataService),
            data: this.csvDataService.data,
            clearData: this.csvDataService.clearData.bind(this.csvDataService),
            disconnect: this.csvDataService.disconnect.bind(this.csvDataService),
        }
    ]);
    readonly availableSources = this._availableSources.asReadonly();

    // selected source as readonly signal
    readonly currentSource = this._currentSource.asReadonly();

    // whether a source is selected
    readonly hasSelection = computed(() => this._currentSource().length !== 0);

    // selected source ID (null if none selected)
    readonly selectedSourceId = computed(() => this._currentSource().map(v=> v.id ?? null));

    isSelected(targetId: string): boolean {
      for (const id of this.selectedSourceId()) {
        if (id === targetId) return true;
      }
      return false;
    }
    // Adds source to _currentSource
    selectSource(source: DataSourceInfo): void {
        this._currentSource.update(currentSource => {
          return [...currentSource, source];
        });
    }

    clearSelection(): void {
        this._currentSource.set([]);
    }

    addSourceToAvailbleSources(source: DataSourceInfo) {
        this._availableSources.update((value) => [...value, source])
    }

    removeSelectedSource(source: DataSourceInfo): void {
        this._currentSource.update(currentSource => {
            const index = currentSource.indexOf(source);
            return [...currentSource.slice(0, index),...currentSource.slice(index + 1)];
        });
    }

    readonly data = computed(() => {
        const sources = this._currentSource();

        let data:Record<string, DataFormat[]> = {};
        // Concat all data sources into an array
        for (const source of sources) {
          let sourceData = source.data();
          for (const key of Object.keys(sourceData)) {
            data[source.id + " - " + key] = sourceData[key];
          }
        }

        return data;
    });
}
