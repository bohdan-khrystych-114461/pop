import { Component, Inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { Item } from '../../models/item.model';

export interface EditItemDialogData {
  item: Item;
}

@Component({
  selector: 'app-edit-item-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>Edit Item</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Item Name</mat-label>
        <input matInput [(ngModel)]="itemName" placeholder="Enter item name">
      </mat-form-field>

      <div class="image-section">
        <label class="image-label">Item Image</label>
        <p class="hint">Upload an image or paste from clipboard (Ctrl+V)</p>
        <input type="file" accept="image/*" (change)="onFileSelected($event)" class="file-input">

        <div *ngIf="imageUrl" class="image-preview">
          <img [src]="imageUrl" alt="Preview">
          <button mat-icon-button (click)="imageUrl = ''" class="remove-image">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSave()">Save</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width {
      width: 100%;
    }

    .image-section {
      margin-top: 1rem;
    }

    .image-label {
      font-weight: 600;
      color: var(--text-primary);
      display: block;
      margin-bottom: 0.5rem;
    }

    .hint {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin-bottom: 0.5rem;
    }

    .file-input {
      display: block;
      margin-bottom: 1rem;
      padding: 0.5rem;
      border: 1px dashed var(--border-color);
      border-radius: 8px;
      width: 100%;
      cursor: pointer;
    }

    .image-preview {
      position: relative;
      display: inline-block;
      margin-top: 1rem;
    }

    .image-preview img {
      max-width: 200px;
      max-height: 200px;
      border-radius: 8px;
      object-fit: cover;
    }

    .remove-image {
      position: absolute;
      top: -10px;
      right: -10px;
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    mat-dialog-content {
      min-width: 400px;
    }
  `]
})
export class EditItemDialogComponent {
  itemName: string;
  imageUrl: string;

  constructor(
    public dialogRef: MatDialogRef<EditItemDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditItemDialogData
  ) {
    this.itemName = data.item.name;
    this.imageUrl = data.item.imageUrl || '';
  }

  @HostListener('window:paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          this.convertToBase64(blob);
        }
        break;
      }
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.convertToBase64(input.files[0]);
    }
  }

  private convertToBase64(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      this.imageUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    this.dialogRef.close({
      name: this.itemName,
      imageUrl: this.imageUrl
    });
  }
}
