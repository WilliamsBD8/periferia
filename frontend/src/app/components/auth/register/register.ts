import { CommonModule } from '@angular/common';
import { Component, inject, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavigationStart, Router, RouterModule } from '@angular/router';

import { Auth as AuthService } from '../../../services/auth';
import Swal from 'sweetalert2';
import { App } from '../../../app';

@Component({
  selector: 'app-register',
  imports: [FormsModule, ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
  encapsulation: ViewEncapsulation.None
})
export class Register {

  form: FormGroup;
  submitted = false;
  
  protected readonly title = inject(App).title.bind(this);

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        Swal.close();
      }
    });
  }
  ngOnInit() {
    this.form.valueChanges.subscribe(() => {
      this.submitted = false;
    });
  }
  onSubmit() {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }
    this.authService.register({
      name: this.form.value.name,
      email: this.form.value.email,
      password: this.form.value.password
    }).subscribe({
      next: (res) => {
        Swal.fire({
          icon: 'success',
          title: res.message,
          text: 'Redirigiendo a la página de inicio...',
          showConfirmButton: false,
          allowOutsideClick: false,
        });
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1000);
      },
      error: (err) => {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: err.error.message
        });

      }
    });
  }
}
