import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userProfile: string | null = null;

  constructor(private router: Router) {}

  // Obtener el perfil de usuario
  getUserProfile(): string | null {
    return this.userProfile;
  }

  // Verificar si el usuario está autenticado y tiene el perfil requerido
  checkUserAuthentication(requiredProfile: string): boolean {
    const idToken = sessionStorage.getItem('id_token');
    if (idToken && this.userProfile === requiredProfile) {
      return true;
    } else {
      this.router.navigate(['/unauthorized']);
      return false;
    }
  }

  // GetAuthToken
  getAuthToken(): Observable<boolean>{
    return of(false);
  }
}
