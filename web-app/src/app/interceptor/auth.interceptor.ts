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
    // Check if the URL should be excluded
    if (this.excludedUrls.some(url => req.url.includes(url))) {
      return next.handle(req);
    }

    // Retrieve the JWT token from localStorage
    const token = this.authService.getToken();

    // Clone the request and add the authorization header if the token is present
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: token ? `Bearer ${token}` : ''
      }
    });

    // Pass the cloned request to the HTTP handler
    return next.handle(clonedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        // If a 401 error occurs: log out the user
        // todo: implement refresh token system
        if (error.status === 401) {
          this.authService.logout();
        }
        return throwError(() => error);
      })
    );
  }
}