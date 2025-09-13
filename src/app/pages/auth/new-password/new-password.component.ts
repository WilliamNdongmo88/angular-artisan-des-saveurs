import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { ResetPasswordRequest } from '../../../models/auth.models';
import { TranslatePipe } from "../../../services/translate.pipe";

@Component({
  selector: 'app-new-password',
  standalone: true,
  templateUrl:'./new-password.component.html',
  styleUrl: './new-password.component.scss',
  imports: [ReactiveFormsModule, CommonModule, RouterModule, TranslatePipe],
})
export class NewPasswordComponent implements OnInit {
  newpassForm!: FormGroup;
  isEmail = true;
  isPassword = false;
  loading = false;
  submitted = false;
  returnUrl!: string;
  token!: string;
  error!: string;
  showPassword = false;
  showConfirmPassword = false;

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
    this.newpassForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(40)]],
      confirmPassword: ['', Validators.required]
    });

    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      console.log('Token reçu:', token);
      this.token = token;
      } else {
        this.error = 'Aucun token fourni';
      }

    // Récupérer l'URL de retour depuis les paramètres de route ou par défaut '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/login';
  }

  // Getter pour un accès facile aux champs du formulaire
  get f() { return this.newpassForm.controls; }

  onSubmit() {
    this.submitted = true;

    // Arrêter ici si le formulaire est invalide
    if (this.newpassForm.invalid) {
      return;
    }

    this.loading = true;

      const data : ResetPasswordRequest = {
        token: this.token,
        newPassword: this.newpassForm.value.password
      };
      console.log('Data Reset PasswordRequest :: ', data); 
      this.authService.resetPassword(data).subscribe({
        next: (data) => {
          console.log('Réinitialisation du mot de passe réussie:', data);
          this.toastr.success(data.message, 'Succès');
          this.router.navigate([this.returnUrl]);
        },
        error: (error) => {
          console.error('Erreur lors de la réinitialisation du mot de passe:', error.error?.message);    
          this.toastr.error(error.error?.message || 'Erreur de connexion', 'Erreur');
          this.loading = false;
        }
      });
  }
}