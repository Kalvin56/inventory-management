import { createReducer, on } from '@ngrx/store';
import * as AuthActions from '../actions/auth.action';
import { User } from 'src/app/models/user.model';

export interface AuthState {
  user: User | null;
}

export const initialState: AuthState = {
  user: null,
};

export const authReducer = createReducer(
  initialState,
  on(AuthActions.loginSuccess, (state, { user }) => ({ ...state, user })),
  on(AuthActions.registerSuccess, (state, { user }) => ({ ...state, user })),
  on(AuthActions.logout, () => initialState)
);