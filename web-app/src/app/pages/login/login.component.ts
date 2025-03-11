import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AppState } from '../../store';
import { Observable, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { login } from 'src/app/store/actions/auth.action';
import { isLoggedIn } from 'src/app/store/selectors/auth.selector';
import { Actions, ofType } from '@ngrx/effects';
import { tap } from 'rxjs/operators';
import * as AuthActions from 'src/app/store/actions/auth.action';
import { SnackbarService } from 'src/app/services/snackbar.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  isLoggedIn$: Observable<boolean>;
  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private store: Store<AppState>,
    private router: Router,
    private snackbarService: SnackbarService,
    private actions$: Actions
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });

    this.isLoggedIn$ = this.store.select(isLoggedIn);

    const isLoggedInSubscription = this.isLoggedIn$.subscribe(isLoggedIn => {
      if (isLoggedIn) {
        this.router.navigate(['/products']);
      }
    });

    this.subscriptions.push(isLoggedInSubscription);
  }

  ngOnInit() {
    const loginFailureSubscription = this.actions$.pipe(
      ofType(AuthActions.loginFailure),
      tap(({ error }) => {
        this.snackbarService.showMessage(error.error?.message ?? 'An error occured', 'error');
      })
    ).subscribe();

    this.subscriptions.push(loginFailureSubscription);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const credentials = this.loginForm.value;
      this.store.dispatch(login({ credentials }));
    }
  }
}