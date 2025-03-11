import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Store } from '@ngrx/store';
import { AppState } from '../../../store';
import { selectAllProducts, selectProductPageIndex, selectProductPageSize, selectProductTotalItems } from 'src/app/store/selectors/product.selector';
import { loadProducts as loadProductsAction } from 'src/app/store/actions/product.action';
import { Subscription } from 'rxjs';
import { selectUser } from 'src/app/store/selectors/auth.selector';
import { MatDialog } from '@angular/material/dialog';
import { DialogConfirmComponent } from '../../dialog/dialog-confirm/dialog-confirm.component';
import { Product } from 'src/app/models/product.model';
import { ProductService } from 'src/app/services/product.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { CATEGORIES } from 'src/app/const';
import { DialogEditProductComponent } from '../../dialog/dialog-edit-product/dialog-edit-product.component';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit, AfterViewInit, OnDestroy {
  displayedColumns: string[] = ['action', 'name', 'category', 'description', 'price', 'quantity'];
  dataSource = new MatTableDataSource<any>();
  subscriptions: Subscription[] = [];
  pageSize = 5;

  isAdmin: boolean = false;

  categories = CATEGORIES;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    public dialog: MatDialog,
    private store: Store<AppState>,
    private productService: ProductService,
    private snackbarService: SnackbarService,
  ) {
    this.store.select(selectUser).subscribe(user => {
      this.isAdmin = user?.roles?.includes('admin') ?? false
    })
  }

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

  openEditDialog(product: Product) {
    const dialogRef = this.dialog.open(DialogEditProductComponent, {
      width: '400px',
      data: { productId: product._id }
    });
  }
  
  openDeleteDialog(product: Product) {
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      data: {
        title: 'Confirm Deletion',
        message: `Are you sure you want to delete the product "${product.name}"?`,
        confirmFunction: () => this.deleteProduct(product)
      }
    });
  }

  deleteProduct (product: Product){
    this.productService.deleteProduct(product).subscribe({
      next: () => {
        this.snackbarService.showMessage('Produit supprimé avec succès', 'success');
        this.loadProducts(1, this.pageSize)
      },
      error: (error) => {
        this.snackbarService.showMessage(error.error?.message ?? 'An error occured', 'error');
        console.error(error);
      }
    });
  }

  getCategoryIcon(categoryTitle: string): string {
    const category = CATEGORIES.find(c => c.title === categoryTitle);
    return category ? category.icon : 'label';
  }
}