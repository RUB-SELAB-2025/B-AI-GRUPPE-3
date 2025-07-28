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

// src/app/components/device-list/device-list.component.ts

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { OmnAIScopeDataService } from './live-data.service';
import { MatFormFieldModule } from '@angular/material/form-field';


@Component({
    selector: 'app-device-list',
    templateUrl: './devicelist.component.html',
    imports: [MatFormFieldModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeviceListComponent {
    readonly #deviceHandler = inject(OmnAIScopeDataService);
    devices = this.#deviceHandler.devices

    getDevicesList = this.#deviceHandler.getDevices.bind(this.#deviceHandler)
}
