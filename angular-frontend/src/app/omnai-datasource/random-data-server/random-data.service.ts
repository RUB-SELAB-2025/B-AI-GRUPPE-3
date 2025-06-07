import { Injectable, signal } from '@angular/core';
import { interval } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataSource } from '../../source-selection/data-source-selection.service';
import { DataFormat } from '../omnai-scope-server/live-data.service';


@Injectable({ providedIn: 'root' })
export class DummyDataService implements DataSource {
    private readonly _data = signal<Record<string, DataFormat[]>>({});

    readonly data = this._data.asReadonly(); 
    connect(): void {
        interval(1000)
        .pipe(
            map(() => ([{
                timestamp: Date.now(),
                value: Math.random() * 100,
                color: {r:255,g:0,b:0}
            }, {
                timestamp: Date.now(),
                value: Math.random() * 100,
                color: {r:0,g:255,b:0}
            }, {
                timestamp: Date.now(),
                value: Math.random() * 100,
                color: {r:0,g:0,b:255}
            }]
        ))
        )
        .subscribe((point) => {
            this._data.update(current => ({
                ...current,
                "001": [...(current['001'] ?? []), point[0]],
                "002": [...(current['002'] ?? []), point[1]],
                "003": [...(current['003'] ?? []), point[2]]
            }));
        });
    }
}

/*
*   Copy of DummyDataService to be able to show different Graphs, since i couldn't find out how to use class providers in components
*/
@Injectable({ providedIn: 'root' })
export class DummyDataServicex2 implements DataSource {
    private readonly _data = signal<Record<string, DataFormat[]>>({});

    readonly data = this._data.asReadonly(); 
    connect(): void {
        interval(1000)
        .pipe(
            map(() => ([{
                timestamp: Date.now(),
                value: Math.random() * 100,
                color: {r:255,g:0,b:0}
            }, {
                timestamp: Date.now(),
                value: Math.random() * 100,
                color: {r:0,g:255,b:0}
            }, {
                timestamp: Date.now(),
                value: Math.random() * 100,
                color: {r:0,g:0,b:255}
            }]
        ))
        )
        .subscribe((point) => {
            this._data.update(current => ({
                ...current,
                "001": [...(current['001'] ?? []), point[0]],
                "002": [...(current['002'] ?? []), point[1]],
                "003": [...(current['003'] ?? []), point[2]]
            }));
        });
    }
}