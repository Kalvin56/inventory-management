import { Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { CATEGORIES } from 'src/app/const';
import { ProductService } from 'src/app/services/product.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { AppState } from 'src/app/store';
import { loadProducts as loadProductsAction } from 'src/app/store/actions/product.action';
import { selectProductPageSize } from 'src/app/store/selectors/product.selector';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnDestroy {
  @Output() formSubmitted = new EventEmitter<boolean>();
  productForm: FormGroup;
  subscriptions: Subscription[] = [];
  pageSize = 10;
  categories = CATEGORIES;

  constructor(
    private store: Store<AppState>,
    private fb: FormBuilder,
    private productService: ProductService,
    private snackbarService: SnackbarService,
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required]],
      price: ['', [Validators.required, Validators.min(0)]],
      category: ['', [Validators.required]],
      quantity: [0, [Validators.required, Validators.min(0)]],
      description: ['']
    });

    const selectProductPageSizeSubscription = this.store.select(selectProductPageSize).subscribe(pageSize => {
      Promise.resolve().then(() => {
        this.pageSize = pageSize;
      });
    })
    this.subscriptions.push(selectProductPageSizeSubscription);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  loadProducts(pageIndex: number = 1, pageSize: number = 10) {
    this.store.dispatch(loadProductsAction({ pageIndex, pageSize }));
  }

  onSubmit() {
    if (this.productForm.valid) {
      const product = this.productForm.value;
      this.productService.createProduct(product).subscribe({
        next: () => {
          this.snackbarService.showMessage('Product created successfully', 'success');
          this.loadProducts(1, this.pageSize);
          this.formSubmitted.emit(true);
        },
        error: (error) => {
          this.snackbarService.showMessage(error.error?.message ?? 'An error occured', 'error');
          console.error(error);
        }
      });
    }
  }
}