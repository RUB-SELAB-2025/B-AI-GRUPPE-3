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

import { isPlatformBrowser } from '@angular/common';
import {
    Directive,
    ElementRef,
    EventEmitter,
    Output,
    inject,
    AfterViewInit,
    DestroyRef,
    PLATFORM_ID,
} from '@angular/core';

@Directive({
    selector: '[appResizeObserver]',
    standalone: true,
})
export class ResizeObserverDirective implements AfterViewInit {
    @Output() resize = new EventEmitter<DOMRectReadOnly>();

    private readonly element = inject(ElementRef<HTMLElement>);
    private readonly destroyRef = inject(DestroyRef);
    private readonly platform = inject(PLATFORM_ID);

    isInBrowser = isPlatformBrowser(this.platform);

    ngAfterViewInit(): void {
        if (!this.isInBrowser) return;
        const observer = this.createResizeObserver();
        this.startObserving(observer);
        this.cleanupOnDestroy(observer);
    }

    /**
     * Creates and returns a ResizeObserver instance.
     * The observer emits the new size whenever the observed element's dimensions change.
     */
    private createResizeObserver(): ResizeObserver {
        return new ResizeObserver(entries => this.onResize(entries));
    }

    /**
     * Starts observing the target element for size changes.
     */
    private startObserving(observer: ResizeObserver): void {
        observer.observe(this.element.nativeElement);
    }

    /**
     * Ensures that the ResizeObserver is disconnected when the directive is destroyed,
     * preventing potential memory leaks.
     */
    private cleanupOnDestroy(observer: ResizeObserver): void {
        this.destroyRef.onDestroy(() => observer.disconnect());
    }

    /**
     * When resize is happening, emit the new size for each of the entries.
     * Function signature stems from resize observer
     */
    private onResize(entries: ResizeObserverEntry[]): void {
        for (const entry of entries) {
            this.resize.emit(entry.contentRect);
        }
    }
}
