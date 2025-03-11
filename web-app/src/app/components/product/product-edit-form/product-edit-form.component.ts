import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
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
  selector: 'app-product-edit-form',
  templateUrl: './product-edit-form.component.html',
  styleUrls: ['./product-edit-form.component.scss']
})
export class ProductEditFormComponent implements OnInit, OnDestroy {
  @Output() formSubmitted = new EventEmitter<boolean>();
  @Input() productId: string = "";
  productForm: FormGroup;
  subscriptions: Subscription[] = [];
  pageSize = 10;
  categories = CATEGORIES;

  constructor(
    private store: Store<AppState>,
    private fb: FormBuilder,
    private productService: ProductService,
    private snackbarService: SnackbarService
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
    });
    this.subscriptions.push(selectProductPageSizeSubscription);
  }

  ngOnInit() {
    if (this.productId) {
      this.loadProduct(this.productId);
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  loadProduct(id: string) {
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        if(product.data?.product){
          this.productForm.patchValue(product.data.product);
        } else {
          this.snackbarService.showMessage('Product not found', 'error');
        }
      },
      error: (error) => {
        this.snackbarService.showMessage(error.error?.message ?? 'An error occurred', 'error');
        console.error(error);
      }
    });
  }

  loadProducts(pageIndex: number = 1, pageSize: number = 10) {
    this.store.dispatch(loadProductsAction({ pageIndex, pageSize }));
  }

  onSubmit() {
    if (this.productForm.valid) {
      const updatedProduct = this.productForm.value;
      this.productService.updateProduct({_id: this.productId, ...updatedProduct}).subscribe({
        next: () => {
          this.snackbarService.showMessage('Product updated successfully', 'success');
          this.loadProducts(1, this.pageSize);
          this.formSubmitted.emit(true);
        },
        error: (error) => {
          this.snackbarService.showMessage(error.error?.message ?? 'An error occurred', 'error');
          console.error(error);
        }
      });
    }
  }
}