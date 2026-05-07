import { Component } from '@angular/core';
import { NavHorizontal } from './nav-horizontal/nav-horizontal';
import { NavVertical } from './nav-vertical/nav-vertical';
import { RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-layouts',
  imports: [NavHorizontal, NavVertical, RouterOutlet],
  templateUrl: './layouts.html',
  styleUrl: './layouts.css',
})
export class Layouts {

}
