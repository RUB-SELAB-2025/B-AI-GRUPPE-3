import {computed, effect, inject, Injectable, signal} from '@angular/core';
import {DataSource} from '../../source-selection/data-source-selection.service';
import {DataFormat} from '../omnai-scope-server/live-data.service';
import {MatDialog} from '@angular/material/dialog';
import {CsvFileSelectModalComponent} from './csv-file-select-modal.component';

/**
 * The different errors, that can be thrown during file parsing
 */
enum CsvFileImportErrorKind {
  FileEmpty = "The file is empty.",
  InvalidHeader = "The header of the File is malformed",
  InvalidSamplingSpeed = "The sampling speed could not be parsed.",
}

@Injectable({
  providedIn: 'root'
})
export class CsvFileImportService implements DataSource {
  private readonly dialog = inject(MatDialog);
  readonly files = signal<File[]>([]);
  connect() {
    this.dialog.open(CsvFileSelectModalComponent)
  }
  private readonly $data = signal<Record<string, DataFormat[]>>({});
  readonly data = this.$data.asReadonly();

  /**
   * Processes file content and transforms it into a record entry.
   * If parsing goes wrong a {@link CsvFileImportErrorKind} is thrown.
   *
   * @param file File to be parsed
   * @throws CsvFileImportErrorKind
   * @private
   */
  private async processFile(file: File):Promise<{name: string, out: DataFormat[]}> {
    //Ensure, that the file is not empty (contains no lines)
    let text = await file.text();
    let lines = text.split('\n');
    if (lines.length < 1) throw CsvFileImportErrorKind.FileEmpty;

    //The header of a file should be formed of 6 comma-seperated values:
    //name,vin,kilometers,manufacturer,id,sampleRate
    let info = lines[0].split(',');
    if (info.length != 6) throw CsvFileImportErrorKind.InvalidHeader;

    //sampleRate is the 5th index in the list above
    //name should be the id, which is the 4th index
    let name = info[4];
    let sampleRate = Number(info[5]);
    if (Number.isNaN(sampleRate) || !Number.isFinite(sampleRate))
      throw CsvFileImportErrorKind.InvalidSamplingSpeed;

    //Internally the Graph render converts everything to Date object.
    //The Date object constructor takes a number and interprets it as milliseconds since the Unix Epoch.
    //Therefore, the Date object cannot represent any timepoint, that doesn't lie exactly on one millisecond.
    //
    //This code calculates how many different millisecond values we can represent (length) and which items represent those milliseconds (keepEvery).
    let keepEvery = 1;
    let length = (lines.length-1);
    if (sampleRate > 1000) {
      keepEvery = sampleRate/1000;
      length = Math.ceil(length/sampleRate*1000);
    }

    //Pre-allocating the array, when you know the size is good practice.
    //It makes it, so that data doesn't need to be moved, whilst adding more data
    let out = new Array(length);
    let arrayIndex = 0;

    // keep only every 1 data-value of keepEvery
    // the first line is the header of the file, so we need to skip it
    for (let [index, sample] of lines.slice(1).entries()) {
      if (keepEvery !== 0 && index % keepEvery !== 0) continue;
      out[arrayIndex++] = {
        timestamp: index/sampleRate*1000,
        value: Number(sample),
      };
    }

    return {
      name,
      out,
    };
  }
  private readonly dataFileChanged = effect(async ()=>{
    let files = this.files();
    let data: Record<string, DataFormat[]> = {};
    for (let file of files) {
      try {
        let {name, out} = await this.processFile(file);
        data[name] = out;
      } catch (e) {
        console.error(`There was an error, whilst parsing the file '${file.name}'. The file will be ignored. Error: ${e}`);
      }
    }
    this.$data.set(data);
  });
}
