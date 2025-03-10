import { createReducer, on } from '@ngrx/store';
import * as ProductActions from '../actions/product.action';
import { Product } from 'src/app/models/product.model';

export interface ProductState {
  products: Product[];
  totalItems: number;
  pageSize: number;
  pageIndex: number;
  loading: boolean;
  error: any;
}

export const initialState: ProductState = {
  products: [],
  totalItems: 0,
  pageSize: 10,
  pageIndex: 0,
  loading: false,
  error: null,
};

export const productReducer = createReducer(
  initialState,
  on(ProductActions.loadProducts, (state, { pageIndex, pageSize }) => ({
    ...state,
    loading: true,
    error: null,
    pageIndex,
    pageSize
  })),
  on(ProductActions.loadProductsSuccess, (state, { products, totalItems }) => ({
    ...state,
    products,
    totalItems,
    loading: false
  })),
  on(ProductActions.loadProductsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))
);