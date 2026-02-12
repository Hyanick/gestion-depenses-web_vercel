import { CommonModule } from '@angular/common';
import { Component, computed, input, OnInit } from '@angular/core';
import { Transaction } from '../../data-access/transactions.models';

@Component({
  selector: 'app-solde-global',
  templateUrl: './solde-global.component.html',
  styleUrls: ['./solde-global.component.scss'],
  imports: [CommonModule]
})
export class SoldeGlobalComponent implements OnInit {
  transactions = input<Transaction[]>([]);



  revenus = computed(() => this.transactions().filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount || 0), 0))


  depenses = computed(() => this.transactions().filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount || 0), 0))

  solde = computed(() => Number(this.revenus()) - Number(this.depenses()))

  ngOnInit(): void {
    console.log('this.revenus()', this.revenus());
    console.log('this.depenses()', this.depenses());
    console.log('this.solde()', this.solde());

    console.log('transactions', this.transactions());

  }


}
