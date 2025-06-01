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
    private readonly dummyDataServicex2 = inject(DummyDataService);

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
            data: this.dummyDataServicex2.data
        }
    ]);
    readonly availableSources = this._availableSources.asReadonly();

    // selected source as readonly signal
    readonly currentSource = this._currentSource.asReadonly();

    // whether a source is selected
    readonly hasSelection = computed(() => this._currentSource() !== null);

    // selected source ID (null if none selected)
    readonly selectedSourceId = computed(() => this._currentSource()?.id ?? null);

    selectSource(source: DataSourceInfo): void {
        this._currentSource.update(source);
        console.log(this._currentSource);
    }

    clearSelection(): void {
        this._currentSource.set([]);
    }

    addSourceToAvailbleSources(source: DataSourceInfo): void {
        this._availableSources.update((value) => [...value, source]);
    }
    
    readonly data = computed(() => {
        const source = this._currentSource();
        if (source.length == 0) return signal([]);
        return ((source) => {
            for (const [key, value] of source
        });
    });
}