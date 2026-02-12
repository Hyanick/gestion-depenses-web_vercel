import { Category } from './categories.models';

export class LoadCategories {
  static readonly type = '[Categories] Load';
}

export class AddCategory {
  static readonly type = '[Categories] Add';
  constructor(public payload: Omit<Category, 'id'>) {}
}

export class UpdateCategory {
  static readonly type = '[Categories] Update';
  constructor(public payload: Category) {}
}

export class DeleteCategory {
  static readonly type = '[Categories] Delete';
  constructor(public id: number) {}
}
