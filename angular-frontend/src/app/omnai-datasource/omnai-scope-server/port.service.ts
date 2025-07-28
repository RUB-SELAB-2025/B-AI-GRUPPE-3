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

import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class OmnAIScopePortService {
    async loadOmnAIScopeBackendPort(): Promise<number> {
        if (window.electronAPI) { // only works with angular combined with the correct electron app
            try {
                const backendPort = await window.electronAPI.getOmnAIScopeBackendPort();
                console.log("Current OmnAIScope Datatserver Backend Port (Angular):", backendPort);
                return backendPort;
            } catch (error) {
                console.error("Error: Trying to get local OmnAIScope Dataserver Backend Port from Angular app")
                throw error;
            }
        }
        else {
            const errorMsg = "electronAPI is not available. Do you run the app in an electron context ? ";
            console.error(errorMsg);
            throw new Error(errorMsg);
        }
    }
}
