import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { ProductService } from '../../services/product.service';
import * as ProductActions from '../actions/product.action';

@Injectable()
export class ProductEffects {
  constructor(
    private actions$: Actions,
    private productService: ProductService
  ) {}

  loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.loadProducts),
      switchMap(({ pageIndex, pageSize }) =>
        this.productService.getProducts(pageIndex, pageSize).pipe(
          map((data) => ProductActions.loadProductsSuccess({
            products: data.products,
            totalItems: data.totalItems,
          })),
          catchError((error) => of(ProductActions.loadProductsFailure({ error })))
        )
      )
    )
  );
}