import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-confirm',
  templateUrl: './dialog-confirm.component.html',
  styleUrls: ['./dialog-confirm.component.scss']
})
export class DialogConfirmComponent {
  title: string;
  message: string;
  confirmFunction: () => void;

  constructor(
    public dialogRef: MatDialogRef<DialogConfirmComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.title = data.title;
    this.message = data.message;
    this.confirmFunction = data.confirmFunction;
  }
  
  onClose() {
    this.dialogRef.close(false);
  }

  confirm() {
    this.confirmFunction();
    this.onClose();
  }
}
