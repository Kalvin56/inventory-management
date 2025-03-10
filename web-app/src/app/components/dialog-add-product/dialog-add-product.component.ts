// dialog-add-product.component.ts
import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-add-product',
  templateUrl: './dialog-add-product.component.html',
  styleUrls: ['./dialog-add-product.component.scss']
})
export class DialogAddProductComponent {
  constructor(public dialogRef: MatDialogRef<DialogAddProductComponent>) {}

  onClose() {
    this.dialogRef.close(false);
  }

  onFormSubmitted(success: boolean) {
    if (success) {
      this.dialogRef.close(true);
    }
  }
}