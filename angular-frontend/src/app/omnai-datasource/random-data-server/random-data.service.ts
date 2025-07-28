/*
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { Injectable, signal } from '@angular/core';
import { interval } from 'rxjs';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataSource } from '../../source-selection/data-source-selection.service';
import { DataFormat } from '../omnai-scope-server/live-data.service';


@Injectable({ providedIn: 'root' })
export class DummyDataService implements DataSource {
    private readonly _data = signal<Record<string, DataFormat[]>>({});
    private subscripion:Subscription | null = null;

    readonly data = this._data.asReadonly();
    connect(): void {
        this.disconnect();
        this.subscripion = interval(1000)
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
    clearData() {
      this._data.set({})
    }
    disconnect(){
      this.subscripion?.unsubscribe();
    }
}

/*
*   Copy of DummyDataService to be able to show different Graphs, since i couldn't find out how to use class providers in components
*/
@Injectable({ providedIn: 'root' })
export class DummyDataServicex2 implements DataSource {
    private readonly _data = signal<Record<string, DataFormat[]>>({});
    private subscripion:Subscription | null = null;
    readonly data = this._data.asReadonly();
    connect(): void {
        this.disconnect();
        this.subscripion = interval(1000)
        .pipe(
            map(() => ([{
                timestamp: Date.now(),
                value: Math.random() * 100,
                color: {r:255,g:0,b:255}
            }, {
                timestamp: Date.now(),
                value: Math.random() * 100,
                color: {r:255,g:255,b:0}
            }, {
                timestamp: Date.now(),
                value: Math.random() * 100,
                color: {r:255,g:128,b:0}
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
    clearData() {
      this._data.set({})
    }
    disconnect(){
      this.subscripion?.unsubscribe();
    }
}
