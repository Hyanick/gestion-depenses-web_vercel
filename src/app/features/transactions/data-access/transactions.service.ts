import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Transaction } from './transactions.models';
import { delay, Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TransactionsService {
  private readonly http = inject(HttpClient);
  //private apiUrl = 'http://localhost:3000/transactions'; // à adapter selon ton backend
  private apiUrl = 'https://gestion-depenses-api-1.onrender.com/transactions'; // à adapter selon ton backend
/*
  private transactions: Transaction[] = [
    {
      id: 1,
      category: 'Salaire',
      icon: '💼',
      description: 'Salaire Annie',
      date: '2026-10-01',
      amount: 3775,
      type: 'income'
    },
    {
      id: 2,
      category: 'Salaire',
      icon: '💼',
      description: 'Salaire Yanick',
      date: '2026-10-01',
      amount: 3700,
      type: 'income'
    },
    {
      id: 3,
      category: 'CAF',
      icon: '👶',
      description: 'CAF enfants',
      date: '2026-10-01',
      amount: 150,
      type: 'income'
    },

    {
      id: 4,
      category: 'Logement',
      icon: '🏠',
      description: 'Appartement (traites+charges+charges compro+taxes foncières)',
      date: '2026-10-01',
      amount: 1270,
      type: 'expense'
    },
    {
      id: 5,
      category: 'Maison',
      icon: '🏡',
      description: 'Maison (traites+charges+imprévus)',
      date: '2026-10-01',
      amount: 2440,
      type: 'expense'
    },
    {
      id: 6,
      category: 'Éducation',
      icon: '🎒',
      description: 'Écoles enfants',
      date: '2026-10-01',
      amount: 800,
      type: 'expense'
    },
    {
      id: 7,
      category: 'Alimentation',
      icon: '🍽️',
      description: 'Ration',
      date: '2026-10-01',
      amount: 350,
      type: 'expense'
    },
    {
      id: 8,
      category: 'Dettes',
      icon: '💳',
      description: 'Dettes Annie + travaux',
      date: '2026-10-01',
      amount: 607,
      type: 'expense'
    },
    {
      id: 9,
      category: 'Voiture',
      icon: '🚗',
      description: 'Voiture (Assurance et autres)',
      date: '2026-10-01',
      amount: 350,
      type: 'expense'
    },
    {
      id: 10,
      category: 'Transport',
      icon: '🚌',
      description: 'Transport Yanick + poche',
      date: '2026-10-01',
      amount: 700,
      type: 'expense'
    },
    {
      id: 11,
      category: 'Transport',
      icon: '🚌',
      description: 'Transport Annie + poche',
      date: '2026-10-01',
      amount: 560,
      type: 'expense'
    },
    {
      id: 12,
      category: 'Carburant',
      icon: '⛽',
      description: 'Carburant voitures',
      date: '2026-10-01',
      amount: 150,
      type: 'expense'
    },
    {
      id: 13,
      category: 'Épargne',
      icon: '💰',
      description: 'Épargne Enfants + CAF',
      date: '2026-10-01',
      amount: 500,
      type: 'expense'
    },
    {
      id: 14,
      category: 'Njangui',
      icon: '🤝',
      description: 'Njangui',
      date: '2026-10-01',
      amount: 500,
      type: 'expense'
    },
    {
      id: 15,
      category: 'Impôts',
      icon: '💸',
      description: 'Impôts / Merveilles',
      date: '2026-10-01',
      amount: 230,
      type: 'expense'
    },
    {
      id: 16,
      category: 'Vacances',
      icon: '🏖️',
      description: 'Budget Vacances',
      date: '2026-10-01',
      amount: 150,
      type: 'expense'
    },
    {
      id: 17,
      category: 'Imprévus',
      icon: '❗',
      description: 'Imprévus',
      date: '2026-10-01',
      amount: 200,
      type: 'expense'
    }




  ]
  */
  /*
    getAll(): Observable<Transaction[]> {
       return this.http.get<Transaction[]>(this.apiUrl);
      // of(...) crée un Observable à partir du tableau, delay(300) simule la latence réseau
      //return of(this.transactions).pipe(delay(300));
    }
  */

  getAll(filters?: { month?: string; categoryId?: number | null }): Observable<Transaction[]> {
    let params = new HttpParams();
    if (filters?.month) params = params.set('month', filters.month);
    if (filters?.categoryId != null) params = params.set('categoryId', filters.categoryId.toString());
    return this.http.get<Transaction[]>(this.apiUrl, { params });
  }
  add(transaction: Transaction): Observable<Transaction> {


    return this.http.post<Transaction>(this.apiUrl, transaction);
    // On crée un nouvel objet avec un id unique (Date.now())
    const newTransaction = { ...transaction, id: Date.now() };
    // On l'ajoute au tableau local
    //this.transactions.push(newTransaction);
    //this.transactions = [...this.transactions, newTransaction];
    // On retourne la nouvelle transaction, avec un délai pour simuler l'API
    console.log('Service add called');
    //return of(newTransaction).pipe(delay(300));
  }

  update(transaction: Transaction): Observable<Transaction> {
        console.log('transaction---> Avant----', transaction);
        const { _inline, ...cleanedObject } = transaction;

         console.log('transaction--->Après----', cleanedObject);
    return this.http.put<Transaction>(`${this.apiUrl}/${transaction.id}`, cleanedObject);

    // On remplace la transaction ayant le même id par la nouvelle version
    //this.transactions = this.transactions.map(t => t.id === transaction.id ? { ...transaction } : t);
    // On retourne la transaction mise à jour, avec un délai
    // return of(transaction).pipe(delay(300));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
    // On filtre le tableau pour retirer la transaction à supprimer
    //this.transactions = this.transactions.filter(t => t.id !== id);
    // On retourne un Observable "vide" (undefined), avec un délai
    //return of(undefined).pipe(delay(300));
  }
}
