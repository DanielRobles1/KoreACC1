import { ChangeDetectionStrategy, Component, Input, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';

type Variant = 'fullscreen' | 'inline';

@Component({
  selector: 'app-saving-overlay',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './saving-overlay.component.html',
  styleUrls: ['./saving-overlay.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SavingOverlayComponent {
  @Input() open = false;

  @Input() total = 0;

  @Input() done = 0;

  @Input() text = 'Guardando…';

  @Input() variant: Variant = 'fullscreen';

  @HostBinding('class.fullscreen') get isFullscreen() { return this.variant === 'fullscreen'; }
  @HostBinding('class.inline')     get isInline() { return this.variant === 'inline'; }

  get percent(): number {
    if (this.total <= 0) return 20; 
    return Math.min(100, Math.round((this.done / this.total) * 100));
  }
}