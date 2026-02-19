import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';

import { TemplateProvider } from '../../core/template/template.provider';
import { TemplateState } from '../../core/template/template.state';
import { BudgetLine } from '../../core/budget/budget.models';

@Component({
  selector: 'app-template',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatMenuModule],
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.scss'],
  providers: [TemplateState, TemplateProvider],
})
export class TemplateComponent {
  vm = inject(TemplateProvider);
  editingId = signal<string | null>(null);

  constructor() {
    effect(() => {
      this.vm.load();
    });
  }

  startEdit(id: string) { this.editingId.set(id); }

  async stopEdit(lines: BudgetLine[]) {
    this.editingId.set(null);
    await this.vm.save(lines);
  }

  async addLine(type: 'income' | 'expense') {
    const line: BudgetLine = {
      id: crypto.randomUUID(), // côté API: tu peux accepter id client ou le remplacer serveur
      type,
      category: type === 'income' ? 'Revenu' : 'Dépense',
      label: type === 'income' ? 'Nouveau revenu' : 'Nouvelle dépense',
      amount: 0,
      icon: type === 'income' ? 'payments' : 'receipt_long',
      color: type === 'income' ? '#3aa0d8' : '#ef4444',
    };

    const next = type === 'income' ? [line, ...this.vm.lines()] : [...this.vm.lines(), line];
    await this.vm.save(next);
    this.editingId.set(line.id);
  }

  async removeLine(id: string) {
    const ok = confirm('Supprimer du modèle ?');
    if (!ok) return;
    const next = this.vm.lines().filter(x => x.id !== id);
    await this.vm.save(next);
  }
}
