import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ICONS_LIST } from '../icons-list';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-icon-picker',
  templateUrl: './icon-picker.component.html',
  styleUrls: ['./icon-picker.component.scss'],
  imports: [CommonModule]
})
export class IconPickerComponent {
  @Input() selected: any; // L’icône actuellement sélectionnée
  @Output() select = new EventEmitter<string>(); // Événement émis lors de la sélection
  @Input() formControlName!: string;

  icons = ICONS_LIST;

  onSelect(icon: string) {
    this.select.emit(icon);
  }
}
