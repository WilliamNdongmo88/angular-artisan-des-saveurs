import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-email',
  standalone: true,
  templateUrl:'./email.component.html',
  styleUrl: './email.component.scss',
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
})
export class EmailComponent implements OnInit {
  emailForm!: FormGroup;
  isEmail = true;
  isPassword = false;
  loading = false;
  submitted = false;
  returnUrl!: string;
  resentActivationMail = false;

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
    this.emailForm = this.formBuilder.group({
      email: ['', Validators.required],
    });

    const data = JSON.parse(localStorage.getItem('tempData') || '{}');
    this.resentActivationMail = data.isResentEmail;
    console.log('Données du localStorage :', data);

    // Récupérer l'URL de retour depuis les paramètres de route ou par défaut '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/login';
  }

  // Getter pour un accès facile aux champs du formulaire
  get f() { return this.emailForm.controls; }

  onSubmit() {
    this.submitted = true;

    // Arrêter ici si le formulaire est invalide
    if (this.emailForm.invalid) {
      return;
    }

    this.loading = true;

    console.log("Tentative d'envoie d'email :: ", this.emailForm.value);
 
    this.authService.forgotPassword(this.emailForm.value).subscribe({
        next: (data) => {
          console.log('Email de Réinitialisation envoyé:', data);
          this.toastr.success(data.message, 'Succès');
          this.router.navigate([this.returnUrl]);
        },
        error: (error) => {
          console.error("Erreur lors de l'envoie de l'email :: ", error.error?.message);    
          this.toastr.error(error.error?.message || 'Erreur de connexion', 'Erreur');
          this.loading = false;
        }
      });
    }
}