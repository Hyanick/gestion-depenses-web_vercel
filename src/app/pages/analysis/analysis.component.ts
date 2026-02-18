import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

type Category = {
  name: string;
  amount: number;
  percent: number; // 0..100
  color: string;
  icon: string;
};

@Component({
  selector: 'app-analysis',
  standalone: true,
  templateUrl: './analysis.component.html',
  styleUrls: ['./analysis.component.scss'],
  imports: [CommonModule, MatIconModule, MatButtonModule],
})
export class AnalysisComponent {
  monthLabel = 'février 2026';

  // Mock KPI
  totalExpenses = 8807;
  totalIncome = 8725;
  net = this.totalIncome - this.totalExpenses;

  // Mock categories (percent must total ~100)
  categories: Category[] = [
    { name: 'Logement', amount: 1270, percent: 32, color: '#3aa0d8', icon: 'home' },
    { name: 'Alimentation', amount: 820, percent: 21, color: '#22c55e', icon: 'restaurant' },
    { name: 'Transport', amount: 410, percent: 10, color: '#f59e0b', icon: 'directions_car' },
    { name: 'Loisirs', amount: 360, percent: 9, color: '#a855f7', icon: 'sports_esports' },
    { name: 'Santé', amount: 280, percent: 7, color: '#ef4444', icon: 'favorite' },
    { name: 'Autres', amount: 860, percent: 21, color: '#64748b', icon: 'category' },
  ];

  // Mock trend (last 6 months)
  trend = [
    { label: 'Sep', expenses: 7200 },
    { label: 'Oct', expenses: 8050 },
    { label: 'Nov', expenses: 7600 },
    { label: 'Déc', expenses: 9100 },
    { label: 'Jan', expenses: 8450 },
    { label: 'Fév', expenses: 8807 },
  ];

  get maxTrend(): number {
    return Math.max(...this.trend.map(t => t.expenses));
  }

  // Donut chart in CSS conic-gradient
  get donutStyle(): string {
    let start = 0;
    const parts = this.categories.map(c => {
      const end = start + c.percent;
      const seg = `${c.color} ${start}% ${end}%`;
      start = end;
      return seg;
    });
    return `background: conic-gradient(${parts.join(',')});`;
  }

  prevMonth() {
    // mock only
  }

  nextMonth() {
    // mock only
  }
}
