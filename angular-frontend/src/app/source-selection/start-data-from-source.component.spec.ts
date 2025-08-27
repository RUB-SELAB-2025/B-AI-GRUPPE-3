import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';

import { StartDataButtonComponent } from './start-data-from-source.component';

import {MatButtonHarness} from '@angular/material/button/testing';
import {MatCardHarness} from '@angular/material/card/testing';
import {MatTestDialogOpenerModule,MatDialogHarness} from '@angular/material/dialog/testing';

describe('StartDataButtonComponent', () => {

    let component: StartDataButtonComponent;
    let fixture: ComponentFixture<StartDataButtonComponent>;
    let loader: HarnessLoader;

    beforeEach(async () => {
        TestBed.configureTestingModule({ imports: [StartDataButtonComponent] });
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
});