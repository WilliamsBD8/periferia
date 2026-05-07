import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type AppEvent =
  | { type: 'TASK_UPDATED'; payload?: any }
  | { type: 'NOTIFICATION_CREATED'; payload?: any };

@Injectable({ providedIn: 'root' })
export class EventBusService {

  private eventSubject = new Subject<AppEvent>();
  events$ = this.eventSubject.asObservable();

  emit(event: AppEvent) {
    this.eventSubject.next(event);
  }
}