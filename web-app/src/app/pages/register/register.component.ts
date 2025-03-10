import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AppState } from '../../store';
import { register } from 'src/app/store/actions/auth.action';
import { Router } from '@angular/router';
import { Observable, Subscription, tap } from 'rxjs';
import { isLoggedIn } from 'src/app/store/selectors/auth.selector';
import * as AuthActions from 'src/app/store/actions/auth.action';
import { Actions, ofType } from '@ngrx/effects';
import { SnackbarService } from 'src/app/services/snackbar.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  isLoggedIn$: Observable<boolean>;
  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private store: Store<AppState>,
    private router: Router,
    private snackbarService: SnackbarService,
    private actions$: Actions
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(8)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.isLoggedIn$ = this.store.select(isLoggedIn);
  }

  ngOnInit() {
    const registerFailureSubscription =  this.actions$.pipe(
      ofType(AuthActions.registerFailure),
      tap(({ error }) => {
        console.log(error)
        this.snackbarService.showMessage(error.error?.message ?? 'Une erreur est survenue', 'error');
      })
    ).subscribe();

    this.subscriptions.push(registerFailureSubscription);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const credentials = this.registerForm.value;
      this.store.dispatch(register({ credentials }));
      
      const isLoggedInSubscription = this.isLoggedIn$.subscribe(isLoggedIn => {
        if (isLoggedIn) {
          this.router.navigate(['/products']);
        }
      });

      this.subscriptions.push(isLoggedInSubscription);
    }
  }
}