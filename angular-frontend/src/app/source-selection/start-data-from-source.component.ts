
import { Component, inject } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DataSourceSelectionService } from './data-source-selection.service';
import { SourceSelectModalComponent } from './source-select-modal.component';
import {GraphComponent} from '../graph/graph.component';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-start-data-button',
    standalone: true,
    imports: [MatButtonModule, MatDialogModule],
    template: `
    <button mat-button (click)="openModal()" style="padding-left: 10px;">Select Data</button>
  `
})
export class StartDataButtonComponent {
    private readonly dialog = inject(MatDialog);
    private readonly datasource = inject(DataSourceSelectionService);
    private readonly graphComponent = inject(GraphComponent);

    openModal() {
        const dialogRef = this.dialog.open(SourceSelectModalComponent, {
            width: '60vw'
        });

        dialogRef.afterClosed().subscribe(() => {
            for (const dataSource of this.datasource.currentSource())
              if (!this.graphComponent.stopped) dataSource.connect();
        });
    }
}
