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

import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GraphComponent } from './graph.component';
import {BackendPortService} from '../omnai-datasource/omnai-scope-server/backend-port.service';
import {signal} from '@angular/core';

import {HarnessLoader} from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import {MatButtonHarness} from '@angular/material/button/testing';
import {MatCardHarness} from '@angular/material/card/testing';
import {MatTestDialogOpenerModule,MatDialogHarness} from '@angular/material/dialog/testing';

class MockBackendPortService{
  port = signal(8000);
  async init():Promise<void>{}
}

describe('GraphComponent', () => {
  let component: GraphComponent;
  let fixture: ComponentFixture<GraphComponent>;
  let loader: HarnessLoader;
  let mockBackendPortService: MockBackendPortService;

  beforeEach(async () => {
    mockBackendPortService = new MockBackendPortService();
    await TestBed.configureTestingModule({
      imports: [GraphComponent],
      providers: [provideHttpClient(),
            provideHttpClientTesting(),
            {provide: BackendPortService, useValue: mockBackendPortService},]
    })
      .compileComponents();

    fixture = TestBed.createComponent(GraphComponent);
    component = fixture.componentInstance;
    //fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('finds the Select Data button', async () => {
      const selectDataButtonExists: boolean = await loader.hasHarness(MatButtonHarness.with({text: 'Select Data'}));
      expect(selectDataButtonExists).withContext("Button exists with .hasHarness").toBe(true);
  });
  it('opens dialog', async () => {
    const selectDataButton: MatButtonHarness = await loader.getHarness(MatButtonHarness.with({text: 'Select Data'}));
    await selectDataButton.click();
    const dialogExists: boolean = await loader.hasHarness(MatDialogHarness);
    expect(dialogExists).withContext("The Dialog exists").toBe(true);
  });
  it('closes dialog', async () => {
    const selectDataButton: MatButtonHarness = await loader.getHarness(MatButtonHarness.with({text: 'Select Data'}));
    await selectDataButton.click();
    const dialog = await loader.getHarness(MatDialogHarness);
    await dialog.close();
    const noDialogs = await loader.hasHarness(MatDialogHarness);
    expect(noDialogs).withContext("Dialog doesn't exist").toBe(false);
  });
/*
  it('shows the modal dialog and the start button works', async () => {
      const dialogs = await loader.getAllHarnesses(MatDialogHarness);
      expect(dialogs.length).toBe(1);
      const dialog = await loader.getHarness(MatDialogHarness);
      expect(dialog.getTitleText).toBe("Select Data Source");

      const startButtons = await loader.getAllHarnesses(MatButtonHarness.with({text: 'Start'}));
      expect(startButtons.length).toBe(1);
      const startButton: MatButtonHarness = await loader.getHarness(MatButtonHarness.with({text: 'Start'}));
      await startButton.click();
      expect(await startButton.getText()).toBe("Start");
      const noDialogs = await loader.hasHarness(MatDialogHarness);
      expect(noDialogs).toBe(false);
  });*/
});
/*
describe('StartDataButtonComponent', () => {

    let component: StartDataButtonComponent;
    let fixture: ComponentFixture<StartDataButtonComponent>;
    let loader: HarnessLoader;
    

    beforeEach(async () => {
        TestBed.configureTestingModule({ imports: [GraphComponent], declarations: [StartDataButtonComponent] });
        fixture = TestBed.createComponent(StartDataButtonComponent);
        component = fixture.componentInstance;
        loader = TestbedHarnessEnvironment.loader(fixture);
    });

    it('should create', async () => {
        expect(component).toBeDefined();
    });

    it('displays buttons correct', async () => {
        const cards = await loader.getAllHarnesses(MatCardHarness);
        const buttons = await loader.getAllHarnesses(MatButtonHarness); // length: depending on sources, >= 2

        const checkNumber: number = cards.length + 2;
        expect(buttons.length).toBe(checkNumber);

        if (cards.length > 0) {
            for (let card of cards) {
                let cardButtons = await card.getAllHarnesses(MatButtonHarness);
                expect(cardButtons.length).toBe(1);
                expect(await card.hasHarness(MatButtonHarness)).toBe(true);
                const button: MatButtonHarness = await card.getHarness(MatButtonHarness);
                expect(await button.getText()).toBe("Select");
                await button.click();
                cardButtons = await card.getAllHarnesses(MatButtonHarness);
                expect(cardButtons.length).toBe(1);
                expect(await button.getText()).toBe("Delete");
            }
        };
        
        const clearButtons = await loader.getAllHarnesses(MatButtonHarness.with({text: 'Clear Selection'}));
        expect(clearButtons.length).toBe(1);
        const clear: MatButtonHarness = await loader.getHarness(MatButtonHarness.with({text: 'Clear Selection'}));
        await clear.click();
        expect(await clear.getText()).toBe("Clear Selection");

        if (cards.length > 0) {
            for (let card of cards) {
                let cardButtons = await card.getAllHarnesses(MatButtonHarness);
                expect(cardButtons.length).toBe(1);
                expect(await card.hasHarness(MatButtonHarness)).toBe(true);
                const button: MatButtonHarness = await card.getHarness(MatButtonHarness);
                expect(await button.getText()).toBe("Select");
                await button.click();
                cardButtons = await card.getAllHarnesses(MatButtonHarness);
                expect(cardButtons.length).toBe(1);
                expect(await button.getText()).toBe("Delete");
            }
        };
    });

    it('shows the modal dialog and the start button works', async () => {
        const dialogs = await loader.getAllHarnesses(MatDialogHarness);
        expect(dialogs.length).toBe(1);
        const dialog = await loader.getHarness(MatDialogHarness);
        expect(dialog.getTitleText).toBe("Select Data Source");

        const startButtons = await loader.getAllHarnesses(MatButtonHarness.with({text: 'Start'}));
        expect(startButtons.length).toBe(1);
        const startButton: MatButtonHarness = await loader.getHarness(MatButtonHarness.with({text: 'Start'}));
        await startButton.click();
        expect(await startButton.getText()).toBe("Start");
        const noDialogs = await loader.hasHarness(MatDialogHarness);
        expect(noDialogs).toBe(false);
    })
});*/