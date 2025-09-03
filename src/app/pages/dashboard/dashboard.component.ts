import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { AuthUser } from '../../models/auth.models';
import { HeaderComponent } from "./header/header";
import { CommonModule } from '@angular/common';
import { SharedService } from '../../services/sharedService';


@Component({
  standalone: true,
  imports: [RouterModule, HeaderComponent, CommonModule],
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  currentUser: AuthUser | null = null;
  isDasboard: boolean = true; 

  constructor(
    private sharedService: SharedService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.currentUserValue;
    this.sharedService.signal$.subscribe(bool => {
      this.isDasboard = bool;
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  gotosite() {
    this.router.navigate(['/']);
  }

  navigateToProduct() {
    this.isDasboard = false;
    this.router.navigate(['/dashboard/products']);
  }

  navigateToOrders() {
    this.isDasboard = false;
    this.router.navigate(['/dashboard/orders']);
  } 
}

