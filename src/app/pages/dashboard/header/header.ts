import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthUser } from '../../../models/auth.models';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class HeaderComponent implements OnInit {
  currentUser: AuthUser | null = null;
  

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.currentUserValue;
  }

  goToDashboard() {
    this.router.navigate(['/dashboard/products']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  gotosite() {
    this.router.navigate(['/']);
  }

  navigaToProfil() {
    this.router.navigate(['/profil']);
  }

}

