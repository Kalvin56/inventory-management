import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { DialogAddProductComponent } from 'src/app/components/dialog/dialog-add-product/dialog-add-product.component';
import { selectUser } from 'src/app/store/selectors/auth.selector';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent {

  isAdmin: boolean = false;

  constructor(
    public dialog: MatDialog,
    private store: Store
  ) {
    this.store.select(selectUser).subscribe(user => {
      this.isAdmin = user?.roles?.includes('admin') ?? false
    })
  }

  openFormDialog() {
    const dialogRef = this.dialog.open(DialogAddProductComponent, {
      width: '400px',
    });
  }
}