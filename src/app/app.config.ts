import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';

import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';

// Factory pour charger les fichiers i18n
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader();
}

// Initialisation de la langue par défaut
export function initializeTranslate(translate: TranslateService) {
  const browserLang = translate.getBrowserLang();
  translate.setDefaultLang('en');
  translate.use(browserLang?.match(/fr|en|es/) ? browserLang : 'fr');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    // {
    //   provide: HTTP_INTERCEPTORS,
    //   useClass: AuthInterceptor,
    //   multi: true
    // },
    importProvidersFrom(
      BrowserAnimationsModule,
      FormsModule,
      ReactiveFormsModule,
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
        },
      })
    ),
    provideToastr({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: false,
      closeButton: true, // Affiche le bouton de fermeture
    }),
  ]
};

