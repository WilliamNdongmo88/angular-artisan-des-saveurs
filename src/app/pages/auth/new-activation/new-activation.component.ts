import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  selector: 'app-new-activation',
  templateUrl: './new-activation.component.html',
  styleUrls: ['./new-activation.component.scss'],
})
export class NewActivatioComponent implements OnInit {
  emailForm!: FormGroup;
  loading = false;
  submitted = false;
  returnUrl!: string;

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
      username: ['', Validators.required]
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

    this.authService.resendActivation(this.emailForm.value)
      .subscribe({
        next: (data) => {
          this.toastr.success(data.message, 'Succès');
          this.router.navigate([this.returnUrl]);
        },
        error: (error) => {
          this.toastr.error(error.error?.message || 'Erreur de connexion', 'Erreur');
          this.loading = false;
        }
      });
  }
}

