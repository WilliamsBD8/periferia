import { App } from '../../../app';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, inject, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

declare const Menu: any;

@Component({
  standalone: true,
  selector: 'app-nav-vertical',
  imports: [
    CommonModule, 
    RouterModule
  ],
  templateUrl: './nav-vertical.html',
  styleUrl: './nav-vertical.css',
})
export class NavVertical implements AfterViewInit, OnDestroy {

  menu: any[] = [];

  protected readonly router = inject(Router);

  protected readonly title = inject(App).title.bind(this);

  ngOnInit() {
    this.menu  = [
      {
        name: 'Inicio',
        icon: 'ri-home-smile-line',
        url: '/dashboard',
        children: []
      },
      {
        name: 'Tareas',
        icon: 'ri-list-check',
        url: '/tasks',
        children: []
      }
    ]
  }
  
  ngAfterViewInit() {
    const el = document.querySelector('.menu');

    if (el) {
      new Menu(el, {
        orientation: 'vertical',
        animate: true
      });
    }
  }

  ngOnDestroy() {
    const el = document.querySelector('.menu');
    if (el) {
      el.remove();
    }
  }
}
