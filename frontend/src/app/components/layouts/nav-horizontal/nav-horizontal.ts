import { Component, ViewEncapsulation } from '@angular/core';
import { Auth as AuthService } from '../../../services/auth';
import { Notification as NotificationService } from '../../../services/notification';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AppEvent, EventBusService } from '../../../events/app.event';

@Component({
  standalone: true,
  selector: 'app-nav-horizontal',
  imports: [CommonModule, RouterModule],
  templateUrl: './nav-horizontal.html',
  styleUrl: './nav-horizontal.css',
  encapsulation: ViewEncapsulation.None,
})
export class NavHorizontal {
  user: any = null;
  notifications: any[] = [];
  newNotifications: number = 0;

  constructor(private authService: AuthService, private router: Router, private notificationService: NotificationService, private eventBus: EventBusService) {
    this.user = this.authService.getUserLocal();
    this.loadNotifications();
  }

  ngOnInit() {
    this.eventBus.events$.subscribe((event: AppEvent) => {
      if (event.type === 'NOTIFICATION_CREATED' || event.type === 'TASK_UPDATED') {
        this.loadNotifications();
      }
    });
  }

  loadNotifications() {
    this.notificationService.getNotifications(false, 1, 10).subscribe({
      next: (res) => {
        this.notifications = res.data.data;
        this.newNotifications = res.data.data.filter((notification: any) => !notification.isRead).length;
      }
    });
  }

  markAsRead(id: number) {
    const currentNotification = this.notifications.find((notification: any) => notification.id === id);
    if (!currentNotification || currentNotification.isRead) {
      return;
    }

    this.notificationService.markAsRead(id).subscribe({
      next: () => {
        currentNotification.isRead = true;
        this.newNotifications = Math.max(this.newNotifications - 1, 0);
      }
    });
  }

  markAllAsRead(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (this.newNotifications === 0) {
      return;
    }

    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications = this.notifications.map((notification: any) => ({
          ...notification,
          isRead: true
        }));
        this.newNotifications = 0;
      }
    });
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      }
    });
  }
}
