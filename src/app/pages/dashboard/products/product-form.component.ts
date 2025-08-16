import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductAdminService } from '../../../services/product-admin.service';
import { MyFile, ProductRequest, ProductResponse } from '../../../models/product.models';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from "../header/header";

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent],
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit {
  productImageBase64: string | null = null;
  fileName: string= '';
  convertImageToBase64: string='';

  productForm!: FormGroup;
  loading = false;
  submitted = false;
  isEditMode = false;
  productId: number | null = null;
  categories: string[] = [];
  imageFile: File | null = null;
  imagePreview: string | null = null;
  myFile: MyFile = {
    id: 0,
    name: '',
    content: '',
    temp: ''
  };
  productToSend!: { productImage: MyFile; productRequest: ProductRequest; };

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductAdminService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.loadCategories();

    // Vérifier si nous sommes en mode édition
    console.log("productId :::Vérifier si nous sommes en mode édition");
    this.route.params.subscribe(params => {
      console.log("params['id'] :::", params['id']);
      if (params['id']) {
        this.isEditMode = true;
        this.productId = +params['id'];
        console.log("this.productId :::", this.productId);
        this.loadProduct(this.productId);
      }
    });
  }

  initializeForm() {
    this.productForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      origin: ['', [Validators.required, Validators.maxLength(100)]],//
      description: ['', [Validators.maxLength(1000)]],
      preparation: ['', [Validators.maxLength(1000)]],
      price: ['', [Validators.required, Validators.min(0.01)]],
      category: ['', [Validators.maxLength(50)]],
      imageUrl: [''], //[Validators.maxLength(500)]
      available: [true],
      stockQuantity: [0, [Validators.min(0)]],
      unit: ['', [Validators.maxLength(50)]]
    });
  }

  loadCategories() {
    this.productService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des catégories', error);
      }
    });
  }

  loadProduct(id: number) {
    this.loading = true;
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        console.log("product :::", product);
        this.myFile = {
          id: product.mainImage.id,
          name: product.mainImage.name,
          content: product.mainImage.content,
          temp: product.mainImage.temp
        };
        this.productForm.patchValue({
          name: product.name,
          origin: product.origin,
          description: product.description,
          preparation: product.preparation,
          price: product.price,
          category: product.category,
          imageUrl: product.mainImage.content.substring(0, 100),
          available: product.available,
          stockQuantity: product.stockQuantity,
          unit: product.unit
        });
        this.loading = false;
      },
      error: (error) => {
        this.toastr.error('Erreur lors du chargement du produit', 'Erreur');
        this.router.navigate(['/dashboard/products']);
        this.loading = false;
      }
    });
  }

  // Getter pour un accès facile aux champs du formulaire
  get f() { return this.productForm.controls; }

onSubmit() {
  this.submitted = true;
  if (this.productForm.invalid) return;

  this.loading = true;

  const productData: ProductRequest = this.productForm.value;
  console.log("productData :: ", productData);
  let productImageToSend: MyFile;
  console.log("this.imageFile :: ", this.imageFile);
  if (this.imageFile) {
    // Nouvelle image choisie
    console.log(":: Nouvelle image choisie");
    productImageToSend = {
      id: 0,
      name: this.fileName,
      content: this.convertImageToBase64,
      temp: ''
    };
    console.log("productImageToSend :: ", productImageToSend);
  } else {
    // Pas de nouvelle image → conserver l’ancienne
    console.log(":: Pas de nouvelle image → conserver l’ancienne");
    productImageToSend = {
      id: this.myFile.id,
      name: this.myFile.name,
      content: this.myFile.content,
      temp: this.myFile.temp
    };
    //console.log("productImageToSend :: ", productImageToSend);
  }

  this.productToSend = {
    productImage: productImageToSend,
    productRequest: productData
  };
  console.log("this.productToSend :: ", this.productToSend);
  if (this.isEditMode && this.productId) {
    this.productService.updateProduct(this.productId, this.productToSend).subscribe({
      next: () => {
        this.toastr.success('Produit modifié avec succès', 'Succès');
        this.router.navigate(['/dashboard/products']);
      },
      error: (error) => {
        this.toastr.error(error.error?.message || 'Erreur lors de la modification', 'Erreur');
        this.loading = false;
      }
    });
  } else {
    this.productService.createProduct(this.productToSend).subscribe({
      next: () => {
        this.toastr.success('Produit créé avec succès', 'Succès');
        this.router.navigate(['/dashboard/products']);
      },
      error: (error) => {
        this.toastr.error(error.error?.message || 'Erreur lors de la création', 'Erreur');
        this.loading = false;
      }
    });
  }
}


  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.style.display = 'none';
    }
  }

  onCancel() {
    this.isEditMode = false;
    this.router.navigate(['/dashboard/products']);
  }

  onProductImageSelected(event: Event): void {
    console.log("[ProductFormComponent] onProductImageSelected called");
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.imageFile = file;
      this.fileName = file.name;
      this.myFile.temp = '';
      const reader = new FileReader();
      console.log('file : ', file);
      console.log('this.fileName : ', this.fileName);
      reader.onload = () => {
        this.convertImageToBase64 = reader.result?.slice(22) as string
        this.productImageBase64 = reader.result as string;
        this.f['imageUrl'].setValue(`${this.productImageBase64}`);
        //console.log('Image principale encodée en Base64:', this.convertImageToBase64.substring(0, 100) + '...'); // Log partiel pour ne pas inonder
      };
      reader.onerror = (error) => {
        console.error('Erreur de lecture du fichier:', error);
        this.productImageBase64 = null;
      };
      //this.f['imageUrl'].setValue(`img/produits/${this.fileName}`);
      reader.readAsDataURL(file);
    } else {
      this.productImageBase64 = null;
    }

  }

  slugify(text: string): string {
  return text
    .normalize('NFD')                      // Sépare les accents des lettres
    .replace(/[\u0300-\u036f]/g, '')       // Supprime les accents
    .toLowerCase()                         // Met en minuscule
    .replace(/[^a-z0-9\s-]/g, '')          // Supprime les caractères spéciaux
    .trim()                                // Supprime les espaces au début/fin
    .replace(/\s+/g, '-')                  // Remplace les espaces par des tirets
    .replace(/-+/g, '-');                  // Supprime les tirets en double
}

}

