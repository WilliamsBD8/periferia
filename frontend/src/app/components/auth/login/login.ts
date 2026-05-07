import { Component, inject, signal, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth as AuthService } from '../../../services/auth';
import { NavigationStart, Router, RouterModule } from '@angular/router';
import { App } from '../../../app';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [FormsModule, ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  encapsulation: ViewEncapsulation.None
})
export class Login {

  form: FormGroup;
  submitted = false;

  protected readonly title = inject(App).title.bind(this);

  constructor(private authService: AuthService, private router: Router, private fb: FormBuilder) {
    this.form = this.fb.group({
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
    this.authService.login({
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
        this.authService.saveToken(res.data.token);
        this.authService.saveUser(res.data.user);
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
