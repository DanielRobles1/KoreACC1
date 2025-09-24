import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-acceso-restringido',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './acceso-restringido.component.html',
  styleUrls: ['./acceso-restringido.component.scss']
})
export class AccesoRestringidoComponent {
  reason: string = '';

  constructor(private router: Router) {
    // Toma el motivo desde el state si existe (navegación previa)
    this.reason = (history.state?.reason as string) || '';
  }

  goHome() {
    this.router.navigateByUrl('/home');
  }

  goLogin() {
    this.router.navigateByUrl('/login');
  }
}
