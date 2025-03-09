import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AppState } from '../../store';
import { register } from 'src/app/store/actions/auth.action';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { isLoggedIn } from 'src/app/store/selectors/auth.selector';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoggedIn$: Observable<boolean>;

  constructor(
    private fb: FormBuilder,
    private store: Store<AppState>,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(8)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.isLoggedIn$ = this.store.select(isLoggedIn);
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const credentials = this.registerForm.value;
      this.store.dispatch(register({ credentials }));
      
       this.isLoggedIn$.subscribe(isLoggedIn => {
        if (isLoggedIn) {
          this.router.navigate(['/products']);
        }
      });
    }
  }
}