import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly apiUrl = `${environment.apiUrl}/${environment.version}/auth`;
  constructor(private http: HttpClient) {}

  login(data: { email: string; password: string }): Observable<any> {
    Swal.fire({
      title: 'Iniciando sesión...',
      showConfirmButton: false,
      allowOutsideClick: false,
      customClass: {},
      willOpen: function () {
          Swal.showLoading();
      }
    });
    return this.http.post(`${this.apiUrl}/login`, data).pipe(
      tap(() => Swal.close()),
      catchError(err => {
        Swal.close();
        return throwError(() => err);
      })
    );
  }

  register(data: { name: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  getUser(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user`);
  }

  saveUser(user: any) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  getUserLocal() {
    return JSON.parse(localStorage.getItem('user') || '{}');
  }

  removeUser() {
    localStorage.removeItem('user');
  }

  removeToken() {
    localStorage.removeItem('token');
  }

  logout() {
    Swal.fire({
      title: 'Cerrando sesión...',
      showConfirmButton: false,
      allowOutsideClick: false,
      customClass: {},
      willOpen: function () {
          Swal.showLoading();
      }
    });
    return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => Swal.close()),
      catchError(err => {
        Swal.close();
        return throwError(() => err);
      })
    );
  }
}
