import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProductState } from '../reducers/product.reducer';

export const selectProductState = createFeatureSelector<ProductState>('products');

export const selectAllProducts = createSelector(
  selectProductState,
  (state: ProductState) => state.products
);

export const selectProductTotalItems = createSelector(
  selectProductState,
  (state: ProductState) => state.totalItems
);

export const selectProductPageIndex = createSelector(
  selectProductState,
  (state: ProductState) => state.pageIndex
);

export const selectProductPageSize = createSelector(
  selectProductState,
  (state: ProductState) => state.pageSize
);

export const selectProductLoading = createSelector(
  selectProductState,
  (state: ProductState) => state.loading
);

export const selectProductError = createSelector(
  selectProductState,
  (state: ProductState) => state.error
);