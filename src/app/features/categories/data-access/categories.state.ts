import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { Category } from './categories.models';
import { CategoriesService } from './categories.service';
import { LoadCategories, AddCategory, UpdateCategory, DeleteCategory } from './categories.actions';
import { tap } from 'rxjs/operators';

export interface CategoriesStateModel {
  categories: Category[];
  loading: boolean;
}

@State<CategoriesStateModel>({
  name: 'categories',
  defaults: {
    categories: [],
    loading: false
  }
})
@Injectable()
export class CategoriesState {
  constructor(private service: CategoriesService) {}

  @Selector()
  static categories(state: CategoriesStateModel) {
    return state.categories;
  }

  @Selector()
  static loading(state: CategoriesStateModel) {
    return state.loading;
  }

  @Action(LoadCategories)
  load({ patchState }: StateContext<CategoriesStateModel>) {
    patchState({ loading: true });
    return this.service.getAll().pipe(
      tap(categories => patchState({ categories, loading: false }))
    );
  }

  @Action(AddCategory)
  add({ getState, patchState }: StateContext<CategoriesStateModel>, { payload }: AddCategory) {
    return this.service.add(payload).pipe(
      tap(newCategory => {
        patchState({
          categories: [...getState().categories, newCategory]
        });
      })
    );
  }

  @Action(UpdateCategory)
  update({ getState, patchState }: StateContext<CategoriesStateModel>, { payload }: UpdateCategory) {
    return this.service.update(payload).pipe(
      tap(updated => {
        patchState({
          categories: getState().categories.map(c => c.id === updated.id ? updated : c)
        });
      })
    );
  }

  @Action(DeleteCategory)
  delete({ getState, patchState }: StateContext<CategoriesStateModel>, { id }: DeleteCategory) {
    return this.service.delete(id).pipe(
      tap(() => {
        patchState({
          categories: getState().categories.filter(c => c.id !== id)
        });
      })
    );
  }
}
