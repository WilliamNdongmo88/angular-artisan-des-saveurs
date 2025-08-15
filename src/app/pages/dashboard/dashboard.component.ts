import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { AuthUser } from '../../models/auth.models';
import { HeaderComponent } from "./header/header";


@Component({
  standalone: true,
  imports: [RouterModule, HeaderComponent],
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  currentUser: AuthUser | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.currentUserValue;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  gotosite() {
    this.router.navigate(['/']);
  }
}

