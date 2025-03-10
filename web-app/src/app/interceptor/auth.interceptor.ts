import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private excludedUrls = ['/auth/login', '/auth/register'];

  constructor(private authService: AuthService, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Vérifie si l'URL doit être exclue
    if (this.excludedUrls.some(url => req.url.includes(url))) {
      return next.handle(req);
    }

    // Récupère le token JWT du localStorage
    const token = this.authService.getToken();

    // Clone la requête et ajoute l'en-tête d'autorisation si le token est présent
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: token ? `Bearer ${token}` : ''
      }
    });

    // Passe la requête clonée au gestionnaire HTTP
    return next.handle(clonedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        // Si une 401 : on déconnecte
        // todo : système de refresh token
        if (error.status === 401) {
          this.authService.logout();
        }
        return throwError(() => error);
      })
    );
  }
}