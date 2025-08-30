import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

// Import des composants existants
import { HomeComponent } from './pages/home/home';
import { CatalogComponent } from './pages/catalog/catalog';
import { AboutComponent } from './pages/about/about';
import { ContactComponent } from './pages/contact/contact';
import { CartComponent } from './pages/cart/cart';
import { ProductDetailsComponent } from './pages/product-details/product-details';

// Import des nouveaux composants d'authentification
import { LoginComponent } from './pages/auth/login.component';
import { RegisterComponent } from './pages/auth/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProductListComponent } from './pages/dashboard/products/product-list.component';
import { ProductFormComponent } from './pages/dashboard/products/product-form.component';
import { NewPasswordComponent } from './pages/auth/new-password/new-password.component';
import { ActiveAccountComponent } from './pages/auth/active-account/active-account.component';
import { NewActivatioComponent } from './pages/auth/new-activation/new-activation.component';
import { EmailComponent } from './pages/auth/email-component/email.component';
import { DummyComponent } from './pages/dummy-component';
import { ProfilComponent } from './pages/profil/profil';
import { FileUploadComponent } from './components/file-upload/file-upload';
import { OrderListComponent } from './pages/dashboard/orders/order-list.component';
import { OrderDetailComponent } from './pages/dashboard/order-detail/order-detail.component';

export const routes: Routes = [
  // Routes d'authentification
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'activate', component: ActiveAccountComponent },
  { path: 'new-activation', component: NewActivatioComponent },
  { path: 'reset-password', component: NewPasswordComponent },
  { path: 'sent-email', component: EmailComponent },

  // Routes publiques
  { path: '', component: HomeComponent },
  { path: 'catalog', component: CatalogComponent },
  { path: 'about', component: AboutComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'cart', component: CartComponent },
  { path: 'profil', component: ProfilComponent },
  { path: 'file-upload', component: FileUploadComponent },
  { path: 'product/:id', component: ProductDetailsComponent},//, canActivate: [AuthGuard], data: { roles: [] } 
  { path: 'test-guard', component: DummyComponent, canActivate: [AuthGuard], data: { roles: [] } },
  
  // Routes protégées - Dashboard
  {
    path: 'products/view/:id',
    component: ProductDetailsComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_USER'] }
  },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_ADMIN'] }
  },
  { 
    path: 'dashboard/products', 
    component: ProductListComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_ADMIN'] }
  },
  { 
    path: 'dashboard/orders', 
    component: OrderListComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_ADMIN'] }
  },
  {
    path: '/dashboard/orders',
    component: OrderDetailComponent,
    // canActivate: [AuthGuard],
    // data: { roles: ['ROLE_ADMIN'] }
  },
  { 
    path: 'dashboard/products/create', 
    component: ProductFormComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_ADMIN'] }
  },
  { 
    path: 'dashboard/products/edit/:id', 
    component: ProductFormComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_ADMIN'] }
  },
  {
    path: 'dashboard/products/view/:id',
    component: ProductDetailsComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_ADMIN'] }
  },
  
  // Route par défaut
  { path: '**', redirectTo: '' }
];

