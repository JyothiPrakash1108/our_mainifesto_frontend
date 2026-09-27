import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CookieService } from './cookie.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient, private cookieService: CookieService) {}

  sendOtp(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/send-otp`, { email });
  }

  verifyOtp(email: string, otp: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/verify-otp`, { email, otp });
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.baseUrl}/auth/profile`);
  }

  saveToken(token: string, days: number = 7): void {
    this.cookieService.setCookie('auth_token', token, days);
  }

  getToken(): string | null {
    return this.cookieService.getCookie('auth_token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    this.cookieService.deleteCookie('auth_token');
  }
}
