import { environment } from '@/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class Users {
  private readonly apiUrl = `${environment.apiUrl}/${environment.version}/users`;
  constructor(private http: HttpClient) {}

  getUsers(all: boolean = false, page: number = 1, limit: number = 10): Observable<any> {
    return this.http.get(`${this.apiUrl}?page=${page}&limit=${limit}&all=${all}`);
  }
}
