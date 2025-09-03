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
  // --- Routes publiques et d'authentification (inchangées) ---
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {path: 'sent-email', component: EmailComponent},
  {path: 'reset-password', component: NewPasswordComponent},
  {path: 'activate', component: ActiveAccountComponent},
  {path: 'new-activation', component: NewActivatioComponent},
  // ... autres routes publiques
  { path: '', component: HomeComponent },
  { path: 'catalog', component: CatalogComponent },
  { path: 'about', component: AboutComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'cart', component: CartComponent },
  { path: 'profil', component: ProfilComponent },
  { path: 'product/:id', component: ProductDetailsComponent},
  
  // --- Routes Protégées du Dashboard (RESTRUCTURÉES) ---
  { 
    path: 'dashboard', 
    component: DashboardComponent, // Le composant "coquille"
    canActivate: [AuthGuard],      // Le Guard est appliqué UNE SEULE FOIS ici
    data: { roles: ['ROLE_ADMIN'] },
    children: [
      // Redirection : quand on va sur /dashboard, on affiche la liste des produits par défaut
      // { path: '', redirectTo: 'products', pathMatch: 'full' }, 
      
      // Routes enfants du dashboard
      { 
        path: 'products', 
        component: ProductListComponent 
        // Plus besoin de Guard ici, il hérite du parent
      },
      { 
        path: 'products/create', 
        component: ProductFormComponent 
      },
      { 
        path: 'products/edit/:id', 
        component: ProductFormComponent 
      },
      {
        path: 'products/view/:id',
        component: ProductDetailsComponent
      },
      { 
        path: 'orders', // La liste des commandes
        component: OrderListComponent 
      },
      { 
        path: 'orders/:id', // La page de détail d'une commande
        component: OrderDetailComponent 
      },
      // Ajoutez ici d'autres futures routes du dashboard (stats, settings...)
    ]
  },

  // --- Autres routes protégées (si elles ne font pas partie du layout du dashboard) ---
  {
    path: 'products/view/:id', // Gardez celle-ci si elle est accessible hors du dashboard
    component: ProductDetailsComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_USER'] }
  },
  { path: 'test-guard', component: DummyComponent, canActivate: [AuthGuard], data: { roles: [] } },
  
  // --- Route par défaut (inchangée) ---
  { path: '**', redirectTo: '' }
];

