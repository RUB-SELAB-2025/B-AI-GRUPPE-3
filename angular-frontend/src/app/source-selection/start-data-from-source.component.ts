import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DataSourceSelectionService } from './data-source-selection.service';
import { SourceSelectModalComponent } from './source-select-modal.component';

@Component({
    selector: 'app-start-data-button',
    standalone: true,
    imports: [CommonModule, MatDialogModule],
    template: `
    <button (click)="openModal()">Start Data</button>
  `
})
export class StartDataButtonComponent {
    private readonly dialog = inject(MatDialog);
    private readonly datasource = inject(DataSourceSelectionService);

    openModal() {
        const dialogRef = this.dialog.open(SourceSelectModalComponent, {
            width: '60vw'
        });

        dialogRef.afterClosed().subscribe(() => {
            for (const dataSource of this.datasource.currentSource())
              dataSource.connect();
        });
    }
}
