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

import { type NumberValue, timeFormat } from "d3";

export type xAxisMode = 'absolute' | 'relative';

export function makeXAxisTickFormatter(
  mode: xAxisMode,
  domainStart: NumberValue | Date
): (domainValue: NumberValue | Date, index: number) => string {
  const formatAbsolute = timeFormat('%H:%M:%S');
  const formatRelative = timeFormat('%M:%S');

  return (d, _index) => {
    if (mode === 'absolute') {
      if (d instanceof Date) return formatAbsolute(d);
      return formatAbsolute(new Date(Number(d)));
    } else {
      const t = d instanceof Date ? d.getTime() : Number(d);
      const t0 = domainStart instanceof Date ? domainStart.getTime() : Number(domainStart);
      const elapsed = Math.max(0, t - t0);
      return formatRelative(new Date(elapsed));
    }
  };
}
