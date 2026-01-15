import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Item } from '../../models/item.model';
import { ItemService } from '../../services/item.service';
import { ImageService } from '../../services/image.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { ImageModalComponent } from '../image-modal/image-modal.component';
import { EditItemDialogComponent } from '../edit-item-dialog/edit-item-dialog.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  items: Item[] = [];
  editingItem: Item | null = null;
  newItemName = '';
  newItemImageUrl = '';
  editItemName = '';
  editItemImageUrl = '';
  loading = false;
  showNewItemForm = false;

  constructor(
    private itemService: ItemService,
    private imageService: ImageService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadItems();
  }

  @HostListener('document:paste', ['$event'])
  async onPaste(event: ClipboardEvent): Promise<void> {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        event.preventDefault();
        const file = items[i].getAsFile();
        if (file) {
          await this.handleImageFile(file);
        }
        break;
      }
    }
  }

  async handleImageFile(file: File): Promise<void> {
    try {
      const dataUrl = await this.imageService.fileToDataUrl(file);
      const compressed = await this.imageService.compressImage(dataUrl);

      if (this.editingItem) {
        this.editItemImageUrl = compressed;
      } else if (this.showNewItemForm) {
        this.newItemImageUrl = compressed;
      }

      this.snackBar.open('Image pasted and compressed', 'Close', { duration: 2000 });
    } catch (error) {
      console.error('Error processing image:', error);
      this.snackBar.open('Error processing image', 'Close', { duration: 3000 });
    }
  }

  async onFileSelected(event: Event, isEdit: boolean): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      await this.handleImageFile(input.files[0]);
    }
  }

  loadItems(): void {
    this.loading = true;
    this.itemService.getItems().subscribe({
      next: (items) => {
        this.items = items;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading items:', error);
        this.snackBar.open('Error loading items', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  showNewForm(): void {
    this.showNewItemForm = true;
    this.newItemName = '';
    this.newItemImageUrl = '';
  }

  cancelNewItem(): void {
    this.showNewItemForm = false;
    this.newItemName = '';
    this.newItemImageUrl = '';
  }

  createItem(): void {
    if (!this.newItemName.trim()) {
      this.snackBar.open('Item name is required', 'Close', { duration: 3000 });
      return;
    }

    this.itemService.createItem({
      name: this.newItemName,
      imageUrl: this.newItemImageUrl || undefined
    }).subscribe({
      next: () => {
        this.snackBar.open('Item created', 'Close', { duration: 2000 });
        this.cancelNewItem();
        this.loadItems();
      },
      error: (error) => {
        console.error('Error creating item:', error);
        this.snackBar.open('Error creating item', 'Close', { duration: 3000 });
      }
    });
  }

  editItem(item: Item): void {
    const dialogRef = this.dialog.open(EditItemDialogComponent, {
      data: { item },
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.itemService.updateItem(item.id, {
          name: result.name,
          imageUrl: result.imageUrl || undefined
        }).subscribe({
          next: () => {
            this.snackBar.open('Item updated', 'Close', { duration: 2000 });
            this.loadItems();
          },
          error: (error) => {
            console.error('Error updating item:', error);
            this.snackBar.open('Error updating item', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  deleteItem(item: Item): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Item',
        message: `Are you sure you want to delete "${item.name}"? This will not affect existing packages.`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.itemService.deleteItem(item.id).subscribe({
          next: () => {
            this.snackBar.open('Item deleted', 'Close', { duration: 2000 });
            this.loadItems();
          },
          error: (error) => {
            console.error('Error deleting item:', error);
            this.snackBar.open('Error deleting item', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  showImage(imageUrl: string): void {
    this.dialog.open(ImageModalComponent, {
      data: { imageUrl },
      maxWidth: '90vw',
      maxHeight: '90vh'
    });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
