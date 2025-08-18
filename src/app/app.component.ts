import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule, Router, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './components/header/header';
import { FooterComponent } from './components/footer/footer';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html', 
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  //isDashboard: boolean = false; // Set this based on your routing logic
  title = 'Artisan des Saveurs';

  private router = inject(Router);
  authService = inject(AuthService);
  readonly isDashboard = this.authService.isDashboard;

  // constructor() {
  //   this.router.events.subscribe(event => {
  //     if (event instanceof NavigationEnd) {
  //       const url = event.urlAfterRedirects;
  //       console.log('[AppComponent] URL changée :', url);
  //       if(url=="/"){
  //         this.router.navigate(['/']);
  //       }
  //       this.isDashboard.set(url.startsWith('/dashboard'));
  //     }
  //   });
  // }
  constructor() {
  this.router.events.subscribe(event => {
    if (event instanceof NavigationEnd) {
      const url = event.urlAfterRedirects;
      console.log('[AppComponent] URL changée :', url);

      // Vérifier l'authentification
      if (!this.authService.isAuthenticated()) {
        console.warn('[AppComponent] Utilisateur non authentifié, redirection vers /login');
        this.router.navigate(['/login']);
        return; // On sort pour éviter d'exécuter le reste
      }

      // Redirection inutile à la racine
      if (url === "/") {
        this.router.navigate(['/']);
      }

      // Mettre à jour l'état "dashboard"
      this.isDashboard.set(url.startsWith('/dashboard'));
    }
  });
}


  ngOnInit(): void {
    console.log('AppComponent initialized this.isDashboard() :: ', this.isDashboard());
    console.log('[AuthGuard] isAuthenticated ::', this.authService.isAuthenticated());
    if(this.authService.isAuthenticated() === false) {
      this.router.navigate(['/login']);
    }
    //this.isDashboard = window.location.pathname.includes('/dashboard');
  }
}

