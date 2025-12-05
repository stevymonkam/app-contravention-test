import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Contravention, AllegatoContravention } from '../models/contratto.model';

// Interface pour les métadonnées
interface FileMetadata {
  tipologia: string;
  numeroVerbale?: string;
  note?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContraventionService {
  //private apiUrl = 'http://192.168.3.49:8080/api/contraventions';
  private apiUrl = 'http://localhost:8080/api/contraventions';


  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem("token");
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Créer une nouvelle contravention
  createContravention(contravention: Contravention): Observable<Contravention> {
    console.log("je suis dans createContravention");
    console.log(contravention);
    
    return this.http.post<Contravention>(this.apiUrl, contravention, { headers: this.getHeaders() });
  }


  // Dans votre service Angular
getContraventionWithFiles(id: number): Observable<Contravention> {
  return this.http.get<Contravention>(`${this.apiUrl}/${id}/with-files`, { headers: this.getHeaders() });
}

getAllContraventionsWithFiles(): Observable<Contravention[]> {
  return this.http.get<Contravention[]>(`${this.apiUrl}/all-with-files`, { headers: this.getHeaders() });
}


  // Mettre à jour une contravention
  updateContravention(id: number, contravention: Contravention): Observable<Contravention> {
    return this.http.put<Contravention>(`${this.apiUrl}/${id}`, contravention, { headers: this.getHeaders() });
  }

  // Récupérer une contravention par ID
  getContravention(id: number): Observable<Contravention> {
    return this.http.get<Contravention>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // Récupérer toutes les contraventions
  getAllContraventions(): Observable<Contravention[]> {
    return this.http.get<Contravention[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  // Supprimer une contravention
  deleteContravention(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // Upload d'un fichier pour une contravention
  uploadFile(contraventionId: number, file: File, tipo: string, note?: string): Observable<HttpEvent<any>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tipo', tipo);
    if (note) {
      formData.append('note', note);
    }

    const token = localStorage.getItem("token");
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const req = new HttpRequest('POST', `${this.apiUrl}/${contraventionId}/upload`, formData, {
      reportProgress: true,
      responseType: 'json',
      headers: headers
    });

    return this.http.request(req);
  }

  // Supprimer un fichier
  deleteFile(contraventionId: number, fileId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${contraventionId}/files/${fileId}`, { headers: this.getHeaders() });
  }

  // Récupérer les fichiers d'une contravention
  getFiles(contraventionId: number): Observable<AllegatoContravention[]> {
    return this.http.get<AllegatoContravention[]>(`${this.apiUrl}/${contraventionId}/files`, { headers: this.getHeaders() });
  }

  // Envoyer une contravention avec tous ses fichiers

  

  submitContravention(
    contravention: Contravention, 
    files: File[], 
    filesMetadata: FileMetadata[]
  ): Observable<any> {
    const formData = new FormData();
    
    // Ajouter les données de la contravention
    formData.append('contravention', JSON.stringify(contravention));
    console.log("je suis dans submitContravention le neauveau 2222222");
    console.log(contravention);
    console.log(formData);
    console.log("je suis dans submitContravention le neauveau 2222222 filesMetadata");
    console.log(filesMetadata);
    console.log("je suis dans submitContravention le neauveau 2222222 files");
    console.log(files);

    // Ajouter les fichiers
    files.forEach((file) => {
      formData.append('files', file);
    });
    
    // Ajouter les métadonnées des fichiers
    formData.append('filesMetadata', JSON.stringify(filesMetadata));

    console.log("je suis dans submitContravention le neauveau 3333333");
    // TypeScript's FormData.entries() is not always recognized, so we use a workaround for logging
    // @ts-ignore
    if (typeof formData.forEach === 'function') {
      // forEach is available in modern browsers
      // @ts-ignore
      formData.forEach((value, key) => {
        console.log(`${key}:`, value);
      });
    } else {
      // fallback: try to use entries if available
      // @ts-ignore
      if (typeof formData.entries === 'function') {
        // @ts-ignore
        for (const pair of formData.entries()) {
          console.log(`${pair[0]}:`, pair[1]);
        }
      } else {
        console.log('Cannot iterate FormData entries in this environment.');
      }
    }

    const token = localStorage.getItem("token");
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  
    return this.http.post(`${this.apiUrl}/submit`, formData, { headers: headers });
  }
  
  
} 