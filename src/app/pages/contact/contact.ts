import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContactService } from '../../services/contact';
import { ContactForm } from '../../models/product';
import { ScrollToTopComponent } from "../../components/scroll-to-top-button/scroll-to-top.component";
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ScrollToTopComponent],
  templateUrl: './contact.html',
  styleUrl: './contact.scss'
})
export class ContactComponent implements OnInit {
  contactForm: FormGroup;
  isSubmitting = false;
  submitMessage = '';
  submitSuccess = false;
  isUserConnected = false; 
  user = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  };

  subjects = [
    { value: 'commande', label: 'Commande spéciale' },
    { value: 'information', label: 'Demande d\'information' },
    { value: 'livraison', label: 'Question sur la livraison' },
    { value: 'qualite', label: 'Question sur la qualité' },
    { value: 'autre', label: 'Autre' }
  ];

  constructor(
    private fb: FormBuilder,
    private contactService: ContactService,
    private authService: AuthService,
  ) {
    this.contactForm = this.createForm();
  }
  ngOnInit() {
    // Vérifier si l'utilisateur est connecté
    const data = JSON.parse(localStorage.getItem('currentUser') || '{}');
    console.log('[ContactComponent] data :: ', data);
    // Si l'utilisateur est connecté, pré-remplir le formulaire
    if (data && data.token) {
      this.isUserConnected = true;
      this.isSubmitting = true;
      this.authService.extractUserFromToken(data.token); // Recupère les informations de l'utilisateur depuis le token
      const userData = this.authService.getUser();
      console.log('[ContactComponent] userData :: ', userData);
      if (userData) {
          this.contactForm.patchValue({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          phone: userData.phone || ''
        });
      }
    } 
    console.log('Contact form initialized:', this.contactForm.value);
  }

  createForm(): FormGroup {
    return this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [
      Validators.required,
      Validators.pattern(/^\+[1-9][0-9]{7,14}$/)]],
      subject: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]],
      consent: [false, Validators.requiredTrue]
    });
  }

  onSubmit() {
    console.log('Form before submission:', this.contactForm.value);
    console.log('isSubmitting:', this.isSubmitting);
    console.log('Form valid:', this.contactForm.valid);
    if (this.contactForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.submitMessage = '';

      const formData: ContactForm = this.contactForm.value;

      const contactRequest = {
          subject: formData.subject,
          message: formData.message
      }
      const contactRequests = [];
      contactRequests.push(contactRequest)
      const formDatas = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          consent: formData.consent,
          contactRequests: contactRequests
      }

      this.contactService.sendContactForm(formDatas).subscribe({
        next: (response) => {
          this.submitSuccess = true;
          this.submitMessage = response.message;
          this.contactForm.reset();
          this.isSubmitting = false;
          window.scrollTo({ top: 0, behavior: 'smooth' });
          
          // Masquer le message après 5 secondes
          setTimeout(() => {
            this.submitMessage = '';
            this.submitSuccess = false;
          }, 5000);
        },
        error: (error) => {
          this.submitSuccess = false;
          this.submitMessage = 'Une erreur est survenue. Veuillez réessayer.';
          this.isSubmitting = false;
          window.scrollTo({ top: 0, behavior: 'smooth' });
          
          // Masquer le message après 5 secondes
          setTimeout(() => {
            this.submitMessage = '';
          }, 5000);
        }
      });
    } if (this.isUserConnected && this.isSubmitting) {
      this.isSubmitting = true;
      this.submitMessage = '';

      const formData: ContactForm = this.contactForm.value;

      const contactRequest = {
          subject: formData.subject,
          message: formData.message
      }
      const contactRequests = [];
      contactRequests.push(contactRequest)
      const formDatas = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          consent: formData.consent,
          contactRequests: contactRequests
      }

      this.contactService.sendContactForm(formDatas).subscribe({
        next: (response) => {
          this.submitSuccess = true;
          this.submitMessage = response.message;
          this.contactForm.reset();
          this.isSubmitting = false;
          window.scrollTo({ top: 0, behavior: 'smooth' });
          
          // Masquer le message après 5 secondes
          setTimeout(() => {
            this.submitMessage = '';
            this.submitSuccess = false;
          }, 5000);
        },
        error: (error) => {
          this.submitSuccess = false;
          this.submitMessage = 'Une erreur est survenue. Veuillez réessayer.';
          this.isSubmitting = false;
          window.scrollTo({ top: 0, behavior: 'smooth' });
          
          // Masquer le message après 5 secondes
          setTimeout(() => {
            this.submitMessage = '';
          }, 5000);
        }
      });
    }
    else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.contactForm.controls).forEach(key => {
        this.contactForm.get(key)?.markAsTouched();
      });
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.contactForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `Ce champ est requis`;
      }
      if (field.errors['email']) {
        return 'Veuillez entrer une adresse email valide';
      }
      if (field.errors['minlength']) {
        const requiredLength = field.errors['minlength'].requiredLength;
        return `Minimum ${requiredLength} caractères requis`;
      }
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.contactForm.get(fieldName);
    return !!(field?.invalid && field.touched);
  }
}
