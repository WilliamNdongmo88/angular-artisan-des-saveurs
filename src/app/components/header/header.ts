import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { AuthUser } from '../../models/auth.models';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {
  isMenuOpen = false;
  cartItemCount = 0;
  currentUser: AuthUser | null = null;
  private cartSubscription?: Subscription;
  private authSubscription?: Subscription;

  constructor(
    private router: Router, 
    private cartService: CartService,
    private authService: AuthService
  ) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        window.scrollTo({ top: 0}); // Scroll en haut avec animation
      });
  }

  ngOnInit() {
    this.cartSubscription = this.cartService.getCartItemCount().subscribe(count => {
      this.cartItemCount = count;
    });

    this.authSubscription = this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnDestroy() {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    console.log('Dashboard cliqué');
    this.isMenuOpen = false;
    //window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toggleCart() {
    console.log('Panier cliqué');
    this.router.navigate(['/cart']);
  }

  login() {
    this.router.navigate(['/login']);
    this.closeMenu();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
    this.closeMenu();
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
    this.closeMenu();
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }
}