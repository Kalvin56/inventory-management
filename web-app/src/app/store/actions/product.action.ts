import { createAction, props } from '@ngrx/store';
import { Product } from 'src/app/models/product.model';

export const loadProducts = createAction(
  '[Product] Load Products',
  props<{ pageIndex: number, pageSize: number }>()
);

export const loadProductsSuccess = createAction(
  '[Product] Load Products Success',
  props<{ products: Product[], totalItems: number }>()
);

export const loadProductsFailure = createAction(
  '[Product] Load Products Failure',
  props<{ error: any }>()
);