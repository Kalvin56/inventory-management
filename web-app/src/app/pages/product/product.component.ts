import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogAddProductComponent } from 'src/app/components/dialog-add-product/dialog-add-product.component';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent {

  constructor(public dialog: MatDialog) {}

  openFormDialog() {
    const dialogRef = this.dialog.open(DialogAddProductComponent, {
      width: '400px',
    });
  }
}