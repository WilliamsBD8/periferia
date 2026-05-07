import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of, tap, throwError } from 'rxjs';

import Swal from 'sweetalert2';
import { EventBusService } from '../events/app.event';

@Injectable({
  providedIn: 'root',
})
export class Tasks {
  private readonly apiUrl = `${environment.apiUrl}/${environment.version}/tasks`;
  constructor(private http: HttpClient, private eventBus: EventBusService) {}

  getTasks(all: boolean = false, page: number = 1, limit: number = 10): Observable<any> {
    return this.http.get(`${this.apiUrl}?page=${page}&limit=${limit}&all=${all}`);
  }

  createTask(data: any): Observable<any> {
    Swal.fire({
      title: 'Creando tarea...',
      showConfirmButton: false,
      allowOutsideClick: false,
      customClass: {},
      willOpen: function () {
          Swal.showLoading();
      }
    });
    return this.http.post<any>(`${this.apiUrl}`, data).pipe(
      tap((res: any) => {
        Swal.fire({
          icon: 'success',
          title: res.message,
          showConfirmButton: true,
          timer: 3000
        });
        this.eventBus.emit({ type: 'NOTIFICATION_CREATED', payload: res.data });
      }),
      catchError(err => {
        Swal.close();
        return throwError(() => err);
      })
    );
  }

  updateTask(id: string, data: any): Observable<any> {
    Swal.fire({
      title: 'Actualizando tarea...',
      showConfirmButton: false,
      allowOutsideClick: false,
      customClass: {},
      text: 'La tarea se actualizará en unos segundos...',
      willOpen: function () {
        Swal.showLoading();
      }
    });
    return this.http.put<any>(`${this.apiUrl}/${id}`, data).pipe(
      tap((res: any) => {
        Swal.fire({
          icon: 'success',
          title: res.message,
          showConfirmButton: true,
          timer: 3000
        });
        this.eventBus.emit({ type: 'TASK_UPDATED', payload: res.data });
      }),
      catchError(err => {
        Swal.close();
        return throwError(() => err);
      })
    );
  }

  updateStateTask(id: string, data: any): Observable<any> {
    Swal.fire({
      title: 'Actualizando estado de tarea...',
      showConfirmButton: false,
      allowOutsideClick: false,
      customClass: {},
      willOpen: function () {
          Swal.showLoading();
      }
    });
    return this.http.put<any>(`${this.apiUrl}/${id}/state`, data).pipe(
      tap((res: any) => {
        Swal.fire({
          icon: 'success',
          title: res.message,
          showConfirmButton: true,
          timer: 3000
        });
        this.eventBus.emit({ type: 'TASK_UPDATED', payload: res.data });
      }),
      catchError(err => {
        Swal.close();
        return throwError(() => err);
      })
    );
  }

  deleteTask(id: string): Observable<any> {
    Swal.fire({
      title: 'Eliminando tarea...',
      showConfirmButton: false,
      allowOutsideClick: false,
      customClass: {},
      willOpen: function () {
          Swal.showLoading();
      }
    });
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      tap((res: any) => Swal.fire({
        icon: 'success',
        title: res.message,
        timer: 3000,
        showConfirmButton: true
      })),
      catchError(err => {
        Swal.close();
        return throwError(() => err);
      })
    );
  }

  getStates(): Observable<any> {
    return of([
      {
        id: "PENDING",
        title: 'Pendiente',
        color_background: 'primary'
      },
      {
        id: "IN_PROGRESS",
        title: 'En progreso',
        color_background: 'warning'
      },
      {
        id: "COMPLETED",
        title: 'Completado',
        color_background: 'success'
      },
      {
        id: "CANCELLED",
        title: 'Cancelado',
        color_background: 'danger'
      }
    
    ])
  }
}
