import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface FileDTO {
  name: string;
  temp: string;
  content: string; // URL publique Nginx
}

@Injectable({
  providedIn: 'root'
})
export class FileService {

  private baseUrl = 'https://artisan-des-saveurs-production.up.railway.app/api/products';

  constructor(private http: HttpClient) {}

  uploadFile(file: File): Observable<FileDTO> {
    const formData = new FormData();
    formData.append('file', file);  // doit matcher @RequestParam("file") côté backend

    return this.http.post<FileDTO>(`${this.baseUrl}/files-upload`, formData);
  }
}
