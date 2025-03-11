import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-edit-product',
  templateUrl: './dialog-edit-product.component.html',
  styleUrls: ['./dialog-edit-product.component.scss']
})
export class DialogEditProductComponent {
  productId: string;

  constructor(
    public dialogRef: MatDialogRef<DialogEditProductComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { productId: string }
  ) {
    this.productId = data.productId;
  }

  onClose() {
    this.dialogRef.close(false);
  }

  onFormSubmitted(success: boolean) {
    if (success) {
      this.dialogRef.close(true);
    }
  }
}