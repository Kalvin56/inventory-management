import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Store } from '@ngrx/store';
import { AppState } from '../../store';
import { selectAllProducts, selectProductPageIndex, selectProductPageSize, selectProductTotalItems } from 'src/app/store/selectors/product.selector';
import { loadProducts as loadProductsAction } from 'src/app/store/actions/product.action';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit, AfterViewInit, OnDestroy {
  displayedColumns: string[] = ['name', 'description', 'price', 'quantity'];
  dataSource = new MatTableDataSource<any>();
  subscriptions: Subscription[] = [];
  pageSize = 5;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private store: Store<AppState>) {}

  ngOnInit() {
    this.loadProducts();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
  
  ngAfterViewInit() {
    this.observeChanges();
  }

  loadProducts(pageIndex: number = 1, pageSize: number = this.pageSize) {
    this.store.dispatch(loadProductsAction({ pageIndex, pageSize }));
  }

  onPageChange(event: PageEvent) {
    const pageIndex = event.pageIndex + 1;
    const pageSize = event.pageSize;
    this.loadProducts(pageIndex, pageSize);
  }

  observeChanges() {
    const selectProductTotalItemsSubscription = this.store.select(selectProductTotalItems).subscribe(totalItems => {
      Promise.resolve().then(() => {
        if (this.paginator) {
          this.paginator.length = totalItems;
        }
      });
    })
    this.subscriptions.push(selectProductTotalItemsSubscription);

    const selectProductPageIndexSubscription = this.store.select(selectProductPageIndex).subscribe(pageIndex => {
      Promise.resolve().then(() => {
        if (this.paginator) {
          this.paginator.pageIndex = pageIndex -1;
        }
      });
    })
    this.subscriptions.push(selectProductPageIndexSubscription);


    const selectProductPageSizeSubscription = this.store.select(selectProductPageSize).subscribe(pageSize => {
      Promise.resolve().then(() => {
        if (this.paginator) {
          this.pageSize = pageSize;
          this.paginator.pageSize = pageSize;
        }
      });
    })
    this.subscriptions.push(selectProductPageSizeSubscription);


    const selectAllProductsSubscription = this.store.select(selectAllProducts).subscribe(products => {
      Promise.resolve().then(() => {
        this.dataSource.data = products;
      });
    });
    this.subscriptions.push(selectAllProductsSubscription);

  }
}