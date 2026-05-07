import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';


@Component({
  selector: 'app-auth',
  imports: [RouterModule],
  templateUrl: './auth.html',
  styleUrls: [
    './auth.css',
    '../../../assets/css/page-auth.css'
  ]
})
export class Auth {
  constructor(private router: Router) {}
}
