import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { type DataFormat, OmnAIScopeDataService } from '../omnai-datasource/omnai-scope-server/live-data.service';
import { Observable } from 'rxjs';
import { DummyDataService } from '../omnai-datasource/random-data-server/random-data.service';
/** Dummy interface to match your expected shape */
export interface DataPoint {
    x: number;
    y: number;
}

/** Your expected DataSource interface */
export interface DataSource {
    connect(): unknown;
    data: Signal<Record<string, DataFormat[]>>
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
    private readonly _currentSource = signal<DataSourceInfo[]>([]);
    private readonly dummyDataService = inject(DummyDataService);

    private readonly _availableSources = signal<DataSourceInfo[]>([
        {
            id: 'omnaiscope',
            name: 'OmnAIScope',
            description: 'Live data from connected OmnAIScope devices',
            connect: this.liveDataService.connect.bind(this.liveDataService),
            data: this.liveDataService.data
        },
        {
            id: 'dummydata',
            name: 'Random Dummy Data',
            description: 'Random generated data points',
            connect: this.dummyDataService.connect.bind(this.dummyDataService),
            data: this.dummyDataService.data
        },
        {
            id: 'dummydatax2',
            name: 'Random Dummy Data x2',
            description: 'Random generated data points',
            connect: this.dummyDataService.connect.bind(this.dummyDataService),
            data: this.dummyDataService.data
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
    selectSource(source: DataSourceInfo): void {
        this._currentSource.update(currentSource => {
          return [...currentSource, source];
        });
        console.log("Select Source");
        for (const [key, value] of Object.entries(this._currentSource)) {
            console.log(key.toString() + " # " + value.toString());
        }
    }

    clearSelection(): void {
        this._currentSource.set([]);
    }

    addSourceToAvailbleSoruces(source: DataSourceInfo) {
        this._availableSources.update((value) => [...value, source])
    }
    readonly data = computed(() => {
        const sources = this._currentSource();
        let data:Record<string, DataFormat[]> = {};

        for (const source of sources) {
          let sourceData = source.data();
          for (const key of Object.keys(sourceData)) {
            data[source.id + " - " + key] = sourceData[key];
          }
        }

        return data;
    });
}
