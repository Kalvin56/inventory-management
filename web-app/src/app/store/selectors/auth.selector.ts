import { createSelector, createFeatureSelector } from '@ngrx/store';
import { AuthState } from '../reducers/auth.reducer';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const isLoggedIn = createSelector(
  selectAuthState,
  (authState: AuthState) => !!authState.user
);

export const selectUser = createSelector(
  selectAuthState,
  (authState: AuthState) => authState.user
);