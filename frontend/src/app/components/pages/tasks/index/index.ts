import { Component, ViewEncapsulation } from '@angular/core';
declare const jKanban: any;
declare const $: any;
import Swal from 'sweetalert2';
import { Tasks as TasksService } from '../../../../services/tasks';
import { Users as UsersService } from '../../../../services/users';
import { Auth as AuthService } from '../../../../services/auth';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EventBusService } from '../../../../events/app.event';

@Component({
  standalone: true,
  selector: 'app-index',
  imports: [FormsModule, ReactiveFormsModule, RouterModule, CommonModule],
  templateUrl: './index.html',
  styleUrls: ['./index.css', '../../../../../assets/css/app-kanban.css', '../../../../../assets/vendor/jkanban/jkanban.css'],
  encapsulation: ViewEncapsulation.None,
})
export class Index {
  kanban: any;
  mode: 'create' | 'update' = 'create';
  editingId: string | null = null;
  user: any = null;

  protected readonly title = "Tareas";
  states: any[] = [];
  tasks: any[] = [];
  task: any = null;
  users: any[] = [];

  form: FormGroup;
  submitted = false;

  constructor(
    private tasksService: TasksService,
    private usersService: UsersService,
    private authService: AuthService,
    private fb: FormBuilder,
    private eventBus: EventBusService
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required]],
      description: [''],
      expirationDate: [''],
      assignedToUserId: [''],
      status: ['PENDING', [Validators.required]],
    });
  }

  ngOnInit() {
    this.tasksService.getStates().subscribe((states: any) => {
      this.states = states;
    });
    this.usersService.getUsers(true, 1, 10).subscribe((users: any) => {
      this.users = users.data.data;
      this.form.get('assignedToUserId')?.setValue(String(this.user?.id) || null);
    });
    this.tasksService.getTasks(true, 1, 10).subscribe((tasks: any) => {
      this.tasks = tasks.data.data;
    });
    this.user = this.authService.getUserLocal();
    this.form.valueChanges.subscribe(() => {
      this.submitted = false;
    });
  }

  ngAfterViewInit() {
    const script = document.createElement('script');
    script.src = 'assets/vendor/libs/jkanban/jkanban.js';
    script.onload = () => {
      setTimeout(() => {
        this.initKanban();
      }, 100);
    };
    document.body.appendChild(script);
  }

  initKanban() {
    if (this.kanban) {
      document.querySelector('.kanban-wrapper')!.innerHTML = '';
    }
    this.kanban = new jKanban({
      element: '.kanban-wrapper',
      gutter: '12px',
      widthBoard: '250px',
      height: '100%',
      boards: this.states.map(s => ({
        id: s.id,
        title: s.title,
        class: 'kanban-board-dynamic',
        item: this.tasks
          .filter(t => t.status === s.id)
          .sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .map(t => ({
            id: t.id,
            title: t.title
          }))
      })),
      click: (el: any) => {
        this.openModal(String($(el).attr('data-eid')), 'modalToggle');
        return false;
      },
      dragBoards: true,
      dragItems: true,
      dropEl: (el: any, target: any, source: any, sibling: any) => {
        const itemId = el.dataset.eid; // ID del item que fue movido
        const sourceBoard = source.parentElement.dataset.id; // ID de la columna origen
        const targetBoard = target.parentElement.dataset.id; // ID de la columna destino

        if (sourceBoard === targetBoard) {
          return false;
        }

        this.tasksService.updateStateTask(itemId, { status: targetBoard }).subscribe({
          next: (res: any) => {
            this.tasks = this.tasks.map((t: any) => String(t.id) === String(itemId) ? res.data : t);
            this.initKanban();
          }
        });
        return false;
      },
    });
  
    this.states.forEach(s => {
      let color_font = s.color_background.split(" ");
      color_font = `text-${color_font.join("")}`;
      $(`.kanban-board[data-id='${s.id}']`).find(".kanban-drag").addClass(`bg-${s.color_background}-subtle p-3`);
      $(`.kanban-board[data-id='${s.id}']`).find(".kanban-board-header").addClass(`bg-${s.color_background}-subtle ${color_font} w-100 mb-2 p-2 text-center border-radius`);
      $(`.kanban-board[data-id='${s.id}']`).find(".kanban-title-board").addClass(`w-100 text-center`);
    });
    this.tasks.forEach((t: any) => {
      this.templateKanban(t, String(t.id));
    });
  }

  onSubmit() {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }
    if (this.mode === 'create') {
      this.tasksService.createTask(this.form.value).subscribe({
        next: (res) => {
          this.tasks.unshift(res.data);
          this.initKanban();
          this.form.reset();
          this.form.get('assignedToUserId')?.setValue(String(this.user?.id) || "");
          this.form.get('expirationDate')?.setValue("");
          this.form.get('description')?.setValue('');
          this.form.get('title')?.setValue('');
          this.form.get('status')?.setValue('PENDING');
          this.mode = 'create';
          this.editingId = null;
          this.closeCanvas();
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
    } else {
      this.tasksService.updateTask(this.editingId!, this.form.value).subscribe({
        next: (res) => {
          this.tasks = this.tasks.map(t => String(t.id) === String(this.editingId) ? res.data : t);
          this.form.reset();
          this.mode = 'create';
          this.form.get('assignedToUserId')?.setValue(String(this.user?.id) || "");
          this.form.get('expirationDate')?.setValue("");
          this.form.get('description')?.setValue('');
          this.form.get('title')?.setValue('');
          this.form.get('status')?.setValue('PENDING');
          this.editingId = null;
          this.initKanban();
          this.closeCanvas();
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

  onEdit(id: string) {
    this.mode = 'update';
    this.editingId = id;
    const task = this.tasks.find(t => String(t.id) === String(id))!;
    this.form.patchValue({
      title: task.title,
      description: task.description,
      expirationDate: task.expirationDate ? new Date(task.expirationDate).toISOString().split('T')[0] : '',
      assignedToUserId: String(task.assignedToUserId),
      status: task.status || 'PENDING'
    });
    this.openCanvas();
  }

  onDelete(id: string) {
    this.closeModal('modalToggle');
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.tasksService.deleteTask(id).subscribe({
          next: (res) => {
            this.tasks = this.tasks.filter(t => String(t.id) !== String(id));
            this.initKanban();
          }
        });
      }
    });
  }

  closeCanvas() {
    const offcanvasEl = document.getElementById('canvas-form');
    if (offcanvasEl) {
      // Bootstrap 5 offcanvas instance
      // @ts-ignore
      const bsOffcanvas = bootstrap.Offcanvas.getOrCreateInstance(offcanvasEl);
      bsOffcanvas.hide();
    }
  }

  openCanvas() {
    const offcanvasEl = document.getElementById('canvas-form');
    if (offcanvasEl) {
      // Bootstrap 5 offcanvas instance
      // @ts-ignore
      const bsOffcanvas = bootstrap.Offcanvas.getOrCreateInstance(offcanvasEl);
      bsOffcanvas.show();
    }
  }
  
  openModal(id: string, modal: string) {
    const modalEl = document.getElementById(modal);
    this.editingId = id;
    this.task = this.tasks.find(t => String(t.id) === String(id))!;
    if (modalEl) {
      // Bootstrap 5 modal instance
      // @ts-ignore
      const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
      bsModal.show();
    }
  }

  closeModal(modal: string) {
    const modalEl = document.getElementById(modal);
    if (modalEl) {
      // Bootstrap 5 modal instance
      // @ts-ignore
      const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
      bsModal.hide();
    }
  }


  templateKanban(kanban_item: any, kanban_id: string) {
    const div_kanban = $(`.kanban-item[data-eid="${kanban_item.id}"]`);
    const getFirstLetters = (phrase: string) => {
      const words = phrase.split(' '); // Dividir la frase en palabras
      let result = ''; // Inicializar la cadena resultante
      // Verificar si hay al menos dos palabras
      if (words.length > 0) {
          result += words[0].charAt(0).toUpperCase(); // Tomar la primera letra de la primera palabra y ponerla en mayúsculas
      }
      if (words.length > 1) {
          result += words[1].charAt(0).toUpperCase(); // Tomar la primera letra de la segunda palabra y ponerla en mayúsculas
      }
      return result;
    }

    const getDateExpiration = (date: string) => {
      return new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    const truncateText = (text: string, length: number = 28) => {
      return text.length > length ? text.substring(0, length) + '...' : text;
    }

    $(div_kanban).html(
      `
        <p class="text-primary text-center title mt-0 mb-1 border-bottom border-1 border-dark-subtle pb-1">Tarea #${kanban_id}</p>
        ${
            kanban_item.title ? `<p class="mt-1 mb-1"><b>${kanban_item.title}</b></p>` : ""
        }
        ${
            kanban_item.description ? `<p class="mt-1 mb-1">${truncateText(kanban_item.description, 50)}</p>` : ""
        }
        ${
          kanban_item.expirationDate != null && kanban_item.expirationDate != "" ? `
          <small class="text-muted mt-1 mb-1"><b>Vencimiento:</b> ${getDateExpiration(kanban_item.expirationDate)}</small>
          ` : ""
        }
        <div class="kanban-users d-flex justify-content-between align-items-center pt-1 border-top border-1 border-dark-subtle pb-1">
          <div class="avatar d-inline-flex position-relative">
            <span class="avatar-initial rounded-circle bg-info">
              ${kanban_item.user?.name ? getFirstLetters(kanban_item.user?.name) : "S/A"}
            </span>
          </div>
          <div class="avatar d-inline-flex position-relative">
            <span class="avatar-initial rounded-circle bg-${kanban_item.assignedToUser?.name ? "success" : "secondary"}">
              ${kanban_item.assignedToUser?.name ? getFirstLetters(kanban_item.assignedToUser?.name) : "S/A"}
            </span>        
          </div>
        </div>
    `
    );
  }

}
