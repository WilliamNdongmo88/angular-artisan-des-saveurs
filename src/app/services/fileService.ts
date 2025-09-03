import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

interface FileDTO {
  fileName: string;
  temp: string;
  filePath: string; // URL publique Nginx
}

@Injectable({
  providedIn: 'root'
})
export class FileService {

  //private baseUrl = 'https://artisan-des-saveurs-production.up.railway.app/api/products';
  private baseUrl = environment.apiUrl+'/products'

  constructor(private http: HttpClient) {}

  uploadFile(file: File): Observable<FileDTO> {
    const formData = new FormData();
    formData.append('file', file);  // doit matcher @RequestParam("file") côté backend

    return this.http.post<FileDTO>(`${this.baseUrl}/files-upload`, formData);
  }
}
function Injectable(arg0: { providedIn: string; }): (target: typeof FileService) => void | typeof FileService {
  throw new Error('Function not implemented.');
}

