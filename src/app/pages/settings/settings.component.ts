import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

type Currency = 'EUR' | 'USD' | 'GBP';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, RouterLink],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent {
  // Mock settings
  currency: Currency = 'EUR';
  firstDayOfMonth = 1; // 1..28
  compactMode = false;

  categories = [
    { name: 'Logement', color: '#3aa0d8', icon: 'home' },
    { name: 'Alimentation', color: '#22c55e', icon: 'restaurant' },
    { name: 'Transport', color: '#f59e0b', icon: 'directions_car' },
    { name: 'Loisirs', color: '#a855f7', icon: 'sports_esports' },
    { name: 'Santé', color: '#ef4444', icon: 'favorite' },
  ];

  addCategory() {
    const name = prompt('Nom de la catégorie ?');
    if (!name) return;
    this.categories = [
      ...this.categories,
      { name, color: '#64748b', icon: 'category' },
    ];
  }

  editCategory(i: number) {
    const current = this.categories[i];
    const name = prompt('Renommer la catégorie', current.name);
    if (!name) return;
    const updated = [...this.categories];
    updated[i] = { ...current, name };
    this.categories = updated;
  }

  deleteCategory(i: number) {
    const c = this.categories[i];
    const ok = confirm(`Supprimer la catégorie "${c.name}" ?`);
    if (!ok) return;
    this.categories = this.categories.filter((_, idx) => idx !== i);
  }

  exportCsv() {
    alert('Export CSV (à brancher plus tard)');
  }

  resetData() {
    const ok = confirm('Réinitialiser toutes les données ? (action irréversible)');
    if (!ok) return;
    alert('Reset (à brancher plus tard)');
  }
}
