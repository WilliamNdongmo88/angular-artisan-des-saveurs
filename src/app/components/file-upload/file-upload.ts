import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface FileDTO {
  name: string;
  temp: string;
  content: string; // URL publique Nginx
}

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.html',
  styleUrls: ['./file-upload.scss']
})
export class FileUploadComponent {

  uploadedFile?: FileDTO;
  isUploading = false;

  constructor(private http: HttpClient) {}

  // méthode d'upload
  uploadFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    this.isUploading = true;

    this.http.post<FileDTO>("https://artisan-des-saveurs-production.up.railway.app/api/products/files-upload", formData)
      .subscribe({
        next: (res) => {
          this.uploadedFile = res;
          this.isUploading = false;
          console.log("Fichier uploadé:", res);
        },
        error: (err) => {
          console.error("Erreur upload:", err);
          this.isUploading = false;
        }
      });
  }

  // méthode déclenchée par l'input
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.uploadFile(file);
    }
  }
}
