import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-profile-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-profile-modal.component.html',
  styleUrls: ['./edit-profile-modal.component.scss']
})
export class EditProfileModalComponent implements OnChanges {
  @Input() open = false;
  @Input() user: any;

  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<any>();

  tempUser: any = {};

  ngOnChanges(changes: SimpleChanges) {
    if (changes['user'] && this.user) {
      this.tempUser = { ...this.user };
    }
  }

  save() {
  this.saved.emit(this.tempUser); 
}

  close() {
    this.closed.emit();
  }
}
