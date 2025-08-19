import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService, Address } from '../../services/user.service';

@Component({
  selector: 'app-address-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './address.component.html',
  styleUrl: './address.component.scss'
})
export class AddressModalComponent implements OnInit, OnChanges {
  @Input() isVisible = false;
  @Input() address: Address | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() addressSaved = new EventEmitter<Address>();

  addressForm!: FormGroup;
  isLoading = false;
  isEditMode = false;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['address'] && this.address) {
      this.isEditMode = true;
      this.populateForm();
    } else if (changes['address'] && !this.address) {
      this.isEditMode = false;
      this.resetForm();
    }

    if (changes['isVisible'] && this.isVisible) {
      // Focus sur le premier champ quand le modal s'ouvre
      setTimeout(() => {
        const firstInput = document.querySelector('#label') as HTMLInputElement;
        if (firstInput) {
          firstInput.focus();
        }
      }, 100);
    }
  }

  private initializeForm() {
    this.addressForm = this.formBuilder.group({
      label: ['', [Validators.required, Validators.minLength(2)]],
      street: ['', [Validators.required, Validators.minLength(5)]],
      postalCode: ['', [Validators.required, Validators.pattern(/^[0-9]{5}$/)]],
      city: ['', [Validators.required, Validators.minLength(2)]],
      country: ['France', [Validators.required]],
      isDefault: [false]
    });
  }

  private populateForm() {
    if (this.address) {
      this.addressForm.patchValue({
        label: this.address.label,
        street: this.address.street,
        postalCode: this.address.postalCode,
        city: this.address.city,
        country: this.address.country,
        isDefault: this.address.isDefault
      });
    }
  }

  private resetForm() {
    this.addressForm.reset({
      label: '',
      street: '',
      postalCode: '',
      city: '',
      country: 'France',
      isDefault: false
    });
  }

  async onSubmit() {
    if (this.addressForm.valid && !this.isLoading) {
      this.isLoading = true;

      try {
        const formData = this.addressForm.value;
        let savedAddress: Address;

        if (this.isEditMode && this.address?.id) {
          // Modifier l'adresse existante
          savedAddress = await this.userService.updateAddress(this.address.id, formData);
        } else {
          // Ajouter une nouvelle adresse
          savedAddress = await this.userService.addAddress(formData);
        }

        this.addressSaved.emit(savedAddress);
        this.closeModal();
      } catch (error) {
        console.error('Erreur lors de la sauvegarde de l\'adresse:', error);
        // Ici, vous pourriez afficher un message d'erreur à l'utilisateur
      } finally {
        this.isLoading = false;
      }
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.addressForm.controls).forEach(key => {
      const control = this.addressForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  closeModal() {
    this.close.emit();
    this.resetForm();
    this.isEditMode = false;
  }

  onOverlayClick(event: MouseEvent) {
    // Fermer le modal si on clique sur l'overlay (pas sur le contenu)
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  // Validation personnalisée pour le code postal selon le pays
  private updatePostalCodeValidation() {
    const country = this.addressForm.get('country')?.value;
    const postalCodeControl = this.addressForm.get('postalCode');

    if (postalCodeControl) {
      switch (country) {
        case 'France':
          postalCodeControl.setValidators([
            Validators.required,
            Validators.pattern(/^[0-9]{5}$/)
          ]);
          break;
        case 'Belgique':
          postalCodeControl.setValidators([
            Validators.required,
            Validators.pattern(/^[0-9]{4}$/)
          ]);
          break;
        case 'Suisse':
          postalCodeControl.setValidators([
            Validators.required,
            Validators.pattern(/^[0-9]{4}$/)
          ]);
          break;
        case 'Canada':
          postalCodeControl.setValidators([
            Validators.required,
            Validators.pattern(/^[A-Za-z][0-9][A-Za-z] [0-9][A-Za-z][0-9]$/)
          ]);
          break;
        default:
          postalCodeControl.setValidators([
            Validators.required,
            Validators.minLength(3)
          ]);
      }
      postalCodeControl.updateValueAndValidity();
    }
  }

  onCountryChange() {
    this.updatePostalCodeValidation();
  }

  // Méthodes utilitaires pour la validation
  isFieldInvalid(fieldName: string): boolean {
    const field = this.addressForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.addressForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) {
        return this.getRequiredMessage(fieldName);
      }
      if (field.errors['minlength']) {
        return `Ce champ doit contenir au moins ${field.errors['minlength'].requiredLength} caractères`;
      }
      if (field.errors['pattern']) {
        return this.getPatternMessage(fieldName);
      }
    }
    return '';
  }

  private getRequiredMessage(fieldName: string): string {
    const messages: { [key: string]: string } = {
      label: 'Le nom de l\'adresse est requis',
      street: 'L\'adresse est requise',
      postalCode: 'Le code postal est requis',
      city: 'La ville est requise',
      country: 'Le pays est requis'
    };
    return messages[fieldName] || 'Ce champ est requis';
  }

  private getPatternMessage(fieldName: string): string {
    if (fieldName === 'postalCode') {
      const country = this.addressForm.get('country')?.value;
      switch (country) {
        case 'France':
          return 'Le code postal doit contenir 5 chiffres';
        case 'Belgique':
        case 'Suisse':
          return 'Le code postal doit contenir 4 chiffres';
        case 'Canada':
          return 'Le code postal doit être au format A1A 1A1';
        default:
          return 'Le code postal n\'est pas valide';
      }
    }
    return 'Le format n\'est pas valide';
  }

  // Gestion des raccourcis clavier
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.closeModal();
    } else if (event.key === 'Enter' && event.ctrlKey) {
      this.onSubmit();
    }
  }
}
