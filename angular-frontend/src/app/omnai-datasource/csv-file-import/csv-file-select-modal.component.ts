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

import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import {CsvFileImportService} from './csv-file-import.service';

@Component({
    selector: 'csv-file-select-modal',
    standalone: true,
    imports: [MatButtonModule, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './csv-file-select-modal.component.html',
})
export class CsvFileSelectModalComponent {
    private readonly csvFileDialog = inject(CsvFileImportService);
    private readonly dialogRef = inject(MatDialogRef<CsvFileSelectModalComponent>);
    selected = computed(()=> this.csvFileDialog.files().length > 0);
    onFileSelected(fileList:FileList|null) {
      if (!fileList || fileList.length == 0) return;
      this.csvFileDialog.files.update(old => {
        return [ ...fileList];
      });
    }
}
