import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    console.log('[AuthGuard] 🔐 Guard instancié');
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    console.log('[AuthGuard] Appelé pour la route ::', state.url);
    const currentUser = this.authService.currentUserValue;
    console.log('[AuthGuard] currentUser :: ', currentUser);

    const requiredRoles = route.data['roles'];
    console.log("requiredRoles ::: ", route.data['roles']);

    // Si aucune restriction de rôle → accès autorisé
    if (!requiredRoles || requiredRoles.length === 0) {
      console.log('[AuthGuard] Route publique, accès autorisé');
      return of(true);
    }

    if (currentUser) {
      // Vérification si token valide
      if (this.authService.isAuthenticated()) {
        console.log('### [AuthGuard] currentUser roles ::', currentUser.roles);
        // const hasRole = currentUser.roles.some((role: string) =>
        //   requiredRoles.includes(role)
        // );
        // console.log('[AuthGuard] currentUser has valid role ::', hasRole);

        if (currentUser.roles.includes('ROLE_USER') || currentUser.roles.includes('ROLE_ADMIN')) {
          return of(true); // accès autorisé
        } else {
          console.log('[AuthGuard] Rôle non autorisé, redirection');
          this.router.navigate(['/']);
          return of(false);
        }
      } else {
        // Token expiré → tentative de refresh
        console.log('[AuthGuard] Token expiré, tentative de refresh...');

        return this.authService.refreshToken().pipe(
          switchMap((success: boolean) => {
            if (success) {
              console.log('[AuthGuard] ✅ Refresh réussi, accès autorisé');
              return of(true);
            } else {
              console.log('[AuthGuard] ❌ Refresh échoué, redirection login');
              this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
              return of(false);
            }
          }),
          catchError((err) => {
            console.log('[AuthGuard] ⚠️ Erreur refresh, redirection login');
            this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
            return of(false);
          })
        );
      }
    }

    // Si pas de user → redirection login
    console.log('[AuthGuard] Non connecté, redirection vers /login');
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return of(false);
  }
}
