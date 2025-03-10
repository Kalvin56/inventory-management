import { ActionReducer, ActionReducerMap, MetaReducer } from '@ngrx/store';
import { localStorageSync } from 'ngrx-store-localstorage';
import { authReducer, AuthState } from './reducers/auth.reducer';
import { productReducer, ProductState } from './reducers/product.reducer';

export interface AppState {
  auth: AuthState;
  products: ProductState;
}

export const appReducer: ActionReducerMap<AppState> = {
  auth: authReducer,
  products: productReducer,
};

export function localStorageSyncReducer(reducer: ActionReducer<any>): ActionReducer<any> {
  return localStorageSync({ keys: ['auth', 'products'], rehydrate: true })(reducer);
}

export const metaReducers: MetaReducer<AppState>[] = [localStorageSyncReducer];