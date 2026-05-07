import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { forkJoin } from 'rxjs';
import { Notification as NotificationService } from '../../../services/notification';
import { Tasks as TasksService } from '../../../services/tasks';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  loading = true;
  errorMessage = '';

  taskSummary = {
    total: 0,
    completed: 0,
    pending: 0,
    inProgress: 0,
    cancelled: 0,
    overdue: 0,
    completionRate: 0,
  };

  notificationSummary = {
    total: 0,
    unread: 0,
    read: 0,
    readRate: 0,
  };

  statusDistribution: Array<{ key: string; label: string; count: number; percent: number; color: string; classColor: string }> = [];

  upcomingTasks: Array<{ id: number; title: string; expirationDate: string }> = [];

  constructor(
    private readonly tasksService: TasksService,
    private readonly notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadIndicators();
  }

  private loadIndicators() {
    this.loading = true;
    this.errorMessage = '';

    forkJoin({
      tasksResponse: this.tasksService.getTasks(true, 1, 100),
      notificationsResponse: this.notificationService.getNotifications(true, 1, 100),
    }).subscribe({
      next: ({ tasksResponse, notificationsResponse }) => {
        const tasks = tasksResponse?.data?.data ?? [];
        const notifications = notificationsResponse?.data?.data ?? [];
        const unread = notificationsResponse?.data?.unread ?? 0;

        this.computeTaskSummary(tasks);
        this.computeNotificationSummary(notifications.length, unread);
        this.computeUpcomingTasks(tasks);
        this.loading = false;
      },
      error: (error) => {
        console.error(error);
        this.errorMessage = 'No fue posible cargar los indicadores del dashboard.';
        this.loading = false;
      },
    });
  }

  private computeTaskSummary(tasks: any[]) {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.status === 'COMPLETED').length;
    const pending = tasks.filter((task) => task.status === 'PENDING').length;
    const inProgress = tasks.filter((task) => task.status === 'IN_PROGRESS').length;
    const cancelled = tasks.filter((task) => task.status === 'CANCELLED').length;

    const now = new Date();
    const overdue = tasks.filter((task) => {
      if (!task.expirationDate) {
        return false;
      }
      const taskDate = new Date(task.expirationDate);
      return taskDate < now && task.status !== 'COMPLETED' && task.status !== 'CANCELLED';
    }).length;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    this.taskSummary = {
      total,
      completed,
      pending,
      inProgress,
      cancelled,
      overdue,
      completionRate,
    };

    this.statusDistribution = [
      {
        key: 'PENDING',
        label: 'Pendientes',
        count: pending,
        percent: total ? Math.round((pending / total) * 100) : 0,
        color: '#696cff',
        classColor: 'primary',
      },
      {
        key: 'IN_PROGRESS',
        label: 'En progreso',
        count: inProgress,
        percent: total ? Math.round((inProgress / total) * 100) : 0,
        color: '#ffab00',
        classColor: 'warning',
      },
      {
        key: 'COMPLETED',
        label: 'Completadas',
        count: completed,
        percent: total ? Math.round((completed / total) * 100) : 0,
        color: '#71dd37',
        classColor: 'success',
      },
      {
        key: 'CANCELLED',
        label: 'Canceladas',
        count: cancelled,
        percent: total ? Math.round((cancelled / total) * 100) : 0,
        color: '#ff3e1d',
        classColor: 'danger',
      },
    ];
  }

  private computeNotificationSummary(total: number, unread: number) {
    const read = total - unread;
    const readRate = total > 0 ? Math.round((read / total) * 100) : 0;

    this.notificationSummary = {
      total,
      unread,
      read,
      readRate,
    };
  }

  private computeUpcomingTasks(tasks: any[]) {
    this.upcomingTasks = tasks
      .filter((task) => task.expirationDate && task.status !== 'COMPLETED' && task.status !== 'CANCELLED')
      .sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime())
      .slice(0, 5)
      .map((task) => ({
        id: task.id,
        title: task.title,
        expirationDate: task.expirationDate,
      }));
  }

  getDonutChartStyle() {
    if (!this.taskSummary.total) {
      return { background: '#ebeef0' };
    }

    const segments: string[] = [];
    let current = 0;

    this.statusDistribution.forEach((item) => {
      if (item.count === 0) {
        return;
      }
      const start = current;
      current += (item.count / this.taskSummary.total) * 100;
      segments.push(`${item.color} ${start}% ${current}%`);
    });

    return { background: `conic-gradient(${segments.join(', ')})` };
  }
}
