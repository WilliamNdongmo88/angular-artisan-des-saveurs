import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {console.log('[AuthGuard] 🔐 Guard instancié');}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    console.log('[AuthGuard] Appelé pour la route ::', state.url);
    const currentUser = this.authService.currentUserValue;
    console.log('[AuthGuard] currentUser :: ', currentUser);
    
    // S'il n'y a pas de rôles requis dans la route, autoriser l'accès (route publique)
    const requiredRoles = route.data['roles'];
    console.log("requiredRoles ::: ", route.data['roles'])
    if (!requiredRoles || requiredRoles.length === 0) {
      console.log('[AuthGuard] Route publique, accès autorisé');
      return true;
    }

    // Si l'utilisateur est connecté
    if (currentUser) {
      const hasRole = currentUser.roles.some((role: string) =>
        requiredRoles.includes(role)
      );

      console.log('[AuthGuard] currentUser has valid role ::', hasRole);

      if (hasRole) {
        return true; // accès autorisé
      } else {
        // Rôle invalide
        console.log('[AuthGuard] Rôle non autorisé, redirection');
        this.router.navigate(['/']);
        return false;
      }
    }

    // Pas connecté et route protégée
    console.log('[AuthGuard] Non connecté, redirection vers /login');
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}
