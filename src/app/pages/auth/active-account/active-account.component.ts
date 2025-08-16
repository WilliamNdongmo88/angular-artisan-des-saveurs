import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { MessageResponse } from '../../../models/auth.models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-activation-code',
  standalone: true,
  templateUrl:'./active-account.component.html',
  styleUrl: './active-account.component.scss',
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
})
export class ActiveAccountComponent implements OnInit {
  message: string = "Un lien d'activation de votre compte vous a été envoyé par e-mail.";
  resendInProgress = false;
  error = '';
  isValid = false;
  loading = false;
  submitted = false;
  emailForm!: FormGroup;
  returnUrl!: string;
  email: string | undefined;
  ;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    console.log("token :: ", token);
    if (token) {
      this.isValid = true;
      this.authService.activateAccount(token).subscribe({
        next: (res: MessageResponse) => {
          this.message = res.message;
        },
        error: (err) => {
          this.error = err.error.message || 'Erreur lors de l’activation';
        },
      });
    } else {
      this.error = 'Aucun token fourni';
    }

    this.email = this.authService.currentUserValue?.email;
    console.log("Email de l'utilisateur :: ", this.authService.currentUserValue?.email);

    this.emailForm = this.formBuilder.group({
      email: ['', Validators.required],
    });
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
    // Envoyer la demande de réactivation
    console.log("Tentative d'envoie d'email :: ", this.emailForm.value);
    this.authService.resendActivation(this.emailForm.value).subscribe({
        next: (data) => {
          console.log("Email d'activation envoyé :: ", data);
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

  goToLogin() {
    this.router.navigate(['/login']);
  }
}