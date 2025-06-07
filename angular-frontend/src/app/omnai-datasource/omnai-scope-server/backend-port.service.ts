import { Injectable, signal } from "@angular/core";

/**
 * @classdesc This class handles the logic to find and save the dynamically determined port of the OmnAI Backend 
 * It provides the currently determined port as a signal. The state can be updated by calling the init() function. 
 */
@Injectable({
    providedIn: 'root',
  })
export class BackendPortService {
  port = signal<number | null>(null); 
  /**
   * @description receiving of Backend Port via IPC from the electron app 
   * If no electron environment is used a warning is printed. 
   * @async 
   * @usage Init function should only be used once in the app initializer context (app.config.ts)
   */
  async init():Promise<void>{
      if (typeof window !== 'undefined' && window.electronAPI) {
          const port = await window.electronAPI.getOmnAIScopeBackendPort(); 
          this.port.set(port);
        } else {
          console.warn('Electron API not available (probably SSR)');
        }
  }
}
  