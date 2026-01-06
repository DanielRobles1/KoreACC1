import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

type ToastType = 'info' | 'success' | 'warning' | 'error';
type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

@Component({
  selector: 'app-toast-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-message-component.component.html',
  styleUrls: ['./toast-message-component.component.scss']
})
export class ToastMessageComponent implements OnChanges {
  @Input() open = false;
  @Input() title = '';                          // opcional
  @Input() message = '';                        // requerido
  @Input() type: ToastType = 'info';            // info|success|warning|error
  @Input() position: ToastPosition = 'top-right';
  @Input() autoCloseMs = 3500;                  // 0 = no autocierre
  @Input() showClose = true;

  @Output() closed = new EventEmitter<void>();

  private timer: any;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['open']) {
      this.clearTimer();
      if (this.open && this.autoCloseMs > 0) {
        this.timer = setTimeout(() => this.close(), this.autoCloseMs);
      }
    }
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    if (this.open) this.close();
  }

  close() {
    this.clearTimer();
    this.closed.emit();
  }

  private clearTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
