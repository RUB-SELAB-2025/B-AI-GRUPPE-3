import { Injectable, Signal, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AdvancedModeService {

    private readonly _enabled = signal<boolean>(false);
    readonly enabled = this._enabled.asReadonly();

    toggle(): void {
        this._enabled.update(v => !v);
    }
}
