import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';


interface Notification {
  type: 'success' | 'error';
  message: string;
}


@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  submitted = false;
  returnUrl!: string;
  notification: Notification | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private toastr: ToastrService
  ) {
    // Rediriger vers l'accueil si déjà connecté
    if (this.authService.currentUserValue) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    // Récupérer l'URL de retour depuis les paramètres de route ou par défaut '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  // Getter pour un accès facile aux champs du formulaire
  get f() { return this.loginForm.controls; }

  onSubmit() {
    this.submitted = true;

    // Arrêter ici si le formulaire est invalide
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    console.log('Tentative de connexion avec:', this.loginForm.value);
    this.authService.login(this.loginForm.value)
      .subscribe({
        next: (data) => {
          this.showNotification('success', 'Connexion réussie!');
          // this.toastr.success('Connexion réussie!', 'Succès');
          this.router.navigate([this.returnUrl]);
        },
        error: (error) => {
          this.showNotification('success', `${error.error?.message}` || "Erreur de connexion");
          // this.toastr.error(error.error?.message || 'Erreur de connexion', 'Erreur');
          this.loading = false;
        }
      });
  }

  // Gestion des notifications
  private showNotification(type: 'success' | 'error', message: string) {
    this.notification = { type, message };
    
    // Auto-fermeture après 5 secondes
    setTimeout(() => {
      this.closeNotification();
    }, 5000);
  }

  closeNotification() {
    this.notification = null;
  }
}

