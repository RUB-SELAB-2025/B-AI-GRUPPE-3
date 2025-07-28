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

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import {MatCardModule, MatCardHeader, MatCardContent, MatCardActions} from '@angular/material/card';
import { type DataSourceInfo, DataSourceSelectionService } from './data-source-selection.service';

@Component({
    selector: 'app-source-select-modal',
    standalone: true,
    imports: [MatButtonModule, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent, MatCardModule, MatCardHeader, MatCardContent, MatCardActions],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './source-select-modal.component.html',
})
export class SourceSelectModalComponent {
    private readonly datasourceService = inject(DataSourceSelectionService);

    readonly sources = this.datasourceService.availableSources;
    readonly selected = this.datasourceService.currentSource;


    private readonly dialogRef = inject(MatDialogRef<SourceSelectModalComponent>);

    select(source: DataSourceInfo) {
        this.datasourceService.selectSource(source);
    }

    removeSelected(source: DataSourceInfo) {
        this.datasourceService.removeSelectedSource(source);
    }

    isSelected(targetId: string): boolean {
      return this.datasourceService.isSelected(targetId);
    }

    clear() {
        this.datasourceService.clearSelection();
    }


}
