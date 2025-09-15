import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-recuperarcontr',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './recuperarcontr.component.html',
  styleUrls: ['./recuperarcontr.component.scss']
})
export class RecuperarcontrComponent {
  recoverForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  loading = false;
  success = false;
  message = '';

  constructor(private fb: FormBuilder) {}

  submit() {
    if (this.recoverForm.invalid) return;

    this.loading = true;
    const email = this.recoverForm.value.email;

    // Simulación de envío
    setTimeout(() => {
      this.loading = false;
      this.success = true;
      this.message = `Se han enviado instrucciones a ${email}`;
    }, 1500);

  }
  
}
