import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {
  constructor(private snackBar: MatSnackBar) {}

  showMessage(message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      panelClass: [type],
      verticalPosition: 'top',
    });
  }
}