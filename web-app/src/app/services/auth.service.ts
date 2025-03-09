import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Store } from '@ngrx/store';
import { AppState } from '../store';
import { logout } from '../store/actions/auth.action';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private store: Store<AppState>,
    private router: Router
  ) {}

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, credentials).pipe(
      tap((response: any) => {
        if (response.data.token) {
          localStorage.setItem('authToken', response.data.token);
        }
      })
    );
  }

  register(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register`, credentials).pipe(
      tap((response: any) => {
        if (response.data.token) {
          localStorage.setItem('authToken', response.data.token);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('authToken');
    this.store.dispatch(logout());
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }
}