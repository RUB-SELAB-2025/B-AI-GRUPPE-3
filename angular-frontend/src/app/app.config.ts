import { ApplicationConfig, provideAppInitializer, provideZoneChangeDetection, inject } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { provideHttpClient, withFetch } from '@angular/common/http';
import { BackendPortService } from './omnai-datasource/omnai-scope-server/backend-port.service';


export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideClientHydration(withEventReplay()), provideHttpClient(withFetch()), 
    provideAppInitializer(
      async() => {
        const portService = inject(BackendPortService); 
        await portService.init(); // receive port of OmnAI-Backend, does not change at runtime and is needed before the first user interaction 
    })]                        
};
