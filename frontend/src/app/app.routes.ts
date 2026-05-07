import { Routes } from '@angular/router';

import { Auth } from './components/auth/auth';
import { Login } from './components/auth/login/login';
import { Register } from './components/auth/register/register';

import { Layouts } from './components/layouts/layouts';
import { Index as TasksIndex } from './components/pages/tasks/index/index';
import { Dashboard } from './components/pages/dashboard/dashboard';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        component: Auth,
        children: [
            {
                path: 'login',
                component: Login
            },
            {
                path: 'register',
                component: Register
            },
        ]
    },
    
    {
        path: '',
        component: Layouts,
        canActivate: [authGuard],
        children: [
            {
                path: 'dashboard',
                component: Dashboard
            },
            {
                path: 'tasks',
                component: TasksIndex
            },
            {
                path: '**',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            }
        ]
    },
    
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: '**', redirectTo: 'login', pathMatch: 'full' },
];
