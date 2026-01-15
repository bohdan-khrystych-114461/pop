import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface ImageModalData {
  imageUrl: string;
}

@Component({
  selector: 'app-image-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <div class="image-container">
      <img [src]="data.imageUrl" alt="Item Image" class="modal-image">
    </div>
    <mat-dialog-actions align="end">
      <button mat-button (click)="close()">Close</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .image-container {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }
    .modal-image {
      max-width: 100%;
      max-height: 70vh;
      object-fit: contain;
    }
  `]
})
export class ImageModalComponent {
  constructor(
    public dialogRef: MatDialogRef<ImageModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ImageModalData
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}
