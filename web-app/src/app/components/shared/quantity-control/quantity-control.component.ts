import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-quantity-control',
  templateUrl: './quantity-control.component.html',
  styleUrls: ['./quantity-control.component.scss']
})
export class QuantityControlComponent {
  @Input() parentForm!: FormGroup;

  incrementQuantity() {
    const currentQuantity = this.parentForm.get('quantity')?.value;
    this.parentForm.get('quantity')?.setValue(currentQuantity + 1);
  }

  decrementQuantity() {
    const currentQuantity = this.parentForm.get('quantity')?.value;
    if (currentQuantity > 0) {
      this.parentForm.get('quantity')?.setValue(currentQuantity - 1);
    }
  }
}