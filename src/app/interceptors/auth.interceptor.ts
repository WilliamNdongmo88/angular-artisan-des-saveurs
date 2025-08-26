
// import { HttpInterceptorFn } from '@angular/common/http';

// export const authInterceptor: HttpInterceptorFn = (req, next) => {
//   const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
//   //console.log('[Interceptor] Token actuel dans localStorage <<-- Important:', currentUser.token);

//   // N'ajoute pas d'en-tête Authorization pour la requête de connexion
//   // if (req.url.includes('/login') || req.url.includes('/register')) {
//   //   console.log('req.url ::: ', req.url);
//   //   return next(req);
//   // }
//   if (currentUser.token) {
//     // 👉 Vérifie si c'est un FormData (upload fichier)
//     const isFormData = req.body instanceof FormData;
//     console.log('authInterceptor | isFormData : ', isFormData);
//     const headers: Record<string, string> = {
//       Authorization: `Bearer ${currentUser.token.trim()}`
//     };

//     if (!isFormData) {
//       // Seulement si ce n'est pas un upload
//       headers['Content-Type'] = 'application/json';
//     }

//     const authReq = req.clone({ setHeaders: headers });

//     //console.log('Intercepteur appliqué à :', authReq.url);
//     //console.log('[Interceptor] Token ajouté:', currentUser.token);
//     return next(authReq);
//   }

//   return next(req);
// };

import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, Observable, throwError, switchMap } from 'rxjs';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('[Interceptor] authInterceptor appelé pour :', req.url);
  const authService = inject(AuthService);
  const currentUser = authService.currentUserValue;

  // 🚨 Exclure refresh-token de l’interceptor
  if (req.url.includes('/auth/refresh-token')) {
    console.log('[Interceptor] Requête refresh-token → on laisse passer sans interception');
    return next(req);
  }

  let authReq = req;
  if (currentUser && currentUser.token) {
      // Si Token expiré ou non présent ou l'erreur est 401 (Unauthorized), tenter de rafraîchir le token
      if (authService.isAuthenticated() === false) {
        console.log('[Interceptor] Token expiré ou non présent, appel du refresh token');
        return handle401Error(authReq, next, authService);
      }else{
        console.log('[Interceptor] Token valide, pas besoin de rafraîchir');
        console.log('[Interceptor] Token trouvé, ajout de l\'en-tête Authorization');
        authReq = addTokenHeader(req, currentUser.token);
      }
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('[Interceptor] Erreur détectée dans la réponse HTTP:', error);
      // Si l'erreur est 401 (Unauthorized), tenter de rafraîchir le token
      if (error.status === 401 && !authReq.url.includes('signin') && !authReq.url.includes('refreshtoken')) {
        return handle401Error(authReq, next, authService);
      }
      return throwError(() => error);
    })
  );
};

function addTokenHeader(request: HttpRequest<unknown>, token: string) {
  const isFormData = request.body instanceof FormData;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token.trim()}`
  };

  if (!isFormData) {
    console.log('addTokenHeader | isFormData : ', isFormData);
    headers['Content-Type'] = 'application/json';
  }
  return request.clone({ setHeaders: headers });
}

function handle401Error(request: HttpRequest<unknown>, next: HttpHandlerFn, authService: AuthService): Observable<HttpEvent<unknown>> {
  if (!isRefreshing) {
    console.log('[Interceptor] Tentative de rafraîchissement du token');
    isRefreshing = true;
    return authService.refreshToken().pipe(
      switchMap((token: string) => {
        console.log('[Interceptor] Nouveau token obtenu après rafraîchissement:', token);
        isRefreshing = false;
        return next(addTokenHeader(request, token));
      }),
      catchError((error) => {
        console.error('[Interceptor] Échec du rafraîchissement du token:', error);
        isRefreshing = false;
        authService.logout();
        return throwError(() => error);
      })
    );
  } else {
    // Si une requête de rafraîchissement est déjà en cours, attendre qu'elle se termine
    // et rejouer la requête originale avec le nouveau token
    return new Observable(subscriber => {
      authService.currentUser.subscribe(user => {
        if (user && user.token) {
          //subscriber.next(next(addTokenHeader(request, user.token)));
          subscriber.complete();
        } else {
          subscriber.error('No user or token after refresh attempt');
        }
      });
    });
  }
}
