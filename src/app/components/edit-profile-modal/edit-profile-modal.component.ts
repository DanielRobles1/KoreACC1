import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface UserProfile {
  nombre: string;
  apellido_p: string; // paterno
  apellido_m: string; // materno
  correo: string;
  // ...otros campos
}

@Component({
  selector: 'app-edit-profile-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-profile-modal.component.html',
  styleUrls: ['./edit-profile-modal.component.scss']
})
export class EditProfileModalComponent implements OnChanges {
  @Input() open = false;

  private _user: any;
  @Input() set user(value: any) {
    this._user = value;
    if (value) this.copyFromInput(value); // clona aunque no cambie la referencia
  }
  get user(): any { return this._user; }

  @Output() closed = new EventEmitter<void>();
  @Output() saved  = new EventEmitter<UserProfile>();

  tempUser: UserProfile = { nombre: '', apellido_p: '', apellido_m: '', correo: '' };

  ngOnChanges(changes: SimpleChanges) {
    // Si abres el modal y ya hay user, asegúrate de clonar de nuevo
    if (changes['open']?.currentValue === true && this._user) {
      this.copyFromInput(this._user);
    }
  }

  private copyFromInput(u: any) {
    // Normaliza posibles nombres de llave que venga del backend / API / DB
    this.tempUser = {
      nombre: u.nombre ?? u.firstName ?? u.name ?? '',
      apellido_p: u.apellido_p ?? u.apellidoPaterno ?? u.apellido_paterno ?? u.lastName ?? '',
      apellido_m: u.apellido_m ?? u.apellidoMaterno ?? u.apellido_materno ?? u.secondLastName ?? '',
      correo: u.correo ?? u.email ?? ''
    };
  }

  save() {
    this.saved.emit({ ...this.tempUser });
  }

  close() {
    this.closed.emit();
  }
}
