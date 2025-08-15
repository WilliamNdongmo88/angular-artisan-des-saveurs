import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  //console.log('[Interceptor] Token actuel dans localStorage <<-- Important:', currentUser.token);

  // N'ajoute pas d'en-tête Authorization pour la requête de connexion
  if (currentUser.token) {
    //console.log('authInterceptor token :', currentUser.token);
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${currentUser.token.trim()}`,
        'Content-Type': 'application/json'
      }
    });
   //console.log('Intercepteur appliqué à :', authReq.url);
    //console.log('[Interceptor] Token ajouté:', currentUser.token);
    return next(authReq);
  }

  return next(req);
};