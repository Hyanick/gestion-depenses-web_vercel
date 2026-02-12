import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { Category } from './categories.models';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
 // private apiUrl = 'http://localhost:3000/categories';
  private apiUrl = 'https://gestion-depenses-api-1.onrender.com/categories';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl);
  }

  add(category: Omit<Category, 'id'>): Observable<Category> {
    console.log('category ADDD', category);

    return this.http.post<Category>(this.apiUrl, category);
  }

  update(category: Category): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/${category.id}`, category);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
