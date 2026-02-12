import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TransactionsComponent } from './features/transactions/ui/transactions/transactions.component';
import { CategoriesComponent } from './features/categories/ui/categories/categories.component';
import { BankinComponent } from './bankin/bankin.component';
import { TransactionV2Component } from './transaction-v2/transaction-v2.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TransactionsComponent, CategoriesComponent, BankinComponent, TransactionV2Component],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'gestion-depenses_web_V1';
}
