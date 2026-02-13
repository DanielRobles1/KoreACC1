import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent {
  @Input() open = false;
  @Input() title = '';
  @Input() size: ModalSize = 'lg';
  @Input() showClose = true;
  @Input() closeOnBackdrop = true;

  @Output() closed = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<void>();
  @Output() canceled = new EventEmitter<void>();

  constructor(private el: ElementRef<HTMLElement>) {}

  // Cierra con ESC
  @HostListener('document:keydown.escape', ['$event'])
  onEsc(e: KeyboardEvent) {
    if (this.open) this.close();
  }

  onBackdropClick(e: MouseEvent) {
    if (!this.closeOnBackdrop) return;
    // si se hace click fuera del diálogo, cerramos
    const dialog = this.el.nativeElement.querySelector('.modal__dialog');
    if (dialog && !dialog.contains(e.target as Node)) this.close();
  }

  close() { this.closed.emit(); }
  cancel() { this.canceled.emit(); }
  confirm() { this.confirmed.emit(); }
  

}