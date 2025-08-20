import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ProductAdminService } from '../../services/product-admin.service';
import { FileService } from '../../services/fileService';

interface FileDTO {
  name: string;
  temp: string;
  filePath: string; // URL publique Nginx
}

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.html',
  styleUrls: ['./file-upload.scss']
})
export class FileUploadComponent {

  uploadedFile?: FileDTO;  // stocke le fichier uploadé
  uploadError?: string;

  constructor(private fileService: FileService) {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.fileService.uploadFile(file).subscribe({
      next: (res: FileDTO) => {
        console.log("Fichier uploadé :", res);
        this.uploadedFile = res;
        this.uploadError = undefined;
      },
      error: (err) => {
        console.error("Erreur upload :", err);
        this.uploadError = err?.error?.message || 'Erreur lors de l\'upload';
      }
    });
  }
}

