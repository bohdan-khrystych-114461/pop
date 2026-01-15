import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Package, PackageItem } from '../../models/package.model';
import { Item } from '../../models/item.model';
import { PackageService } from '../../services/package.service';
import { ItemService } from '../../services/item.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { ImageModalComponent } from '../image-modal/image-modal.component';

@Component({
  selector: 'app-package-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './package-editor.component.html',
  styleUrls: ['./package-editor.component.css']
})
export class PackageEditorComponent implements OnInit {
  package: Package | null = null;
  availableItems: Item[] = [];
  allItems: Item[] = [];
  packageName = '';
  boxSize = '';
  totalWeight = 0;
  isNew = true;
  loading = false;
  boxSizes = ['26x16x15', '24x20x20'];
  searchQuery = '';

  // Smart search aliases - maps keywords to search terms
  private searchAliases: { [key: string]: string[] } = {
    'mc': ['mac', 'macbook'],
    'laptop': ['macbook', 'mac'],
    'laptops': ['macbook', 'mac'],
    'watch': ['whoop', 'apple watch'],
    'watches': ['whoop', 'apple watch'],
    'console': ['playstation', 'ps5', 'ps4', 'xbox', 'nintendo', 'switch'],
    'consoles': ['playstation', 'ps5', 'ps4', 'xbox', 'nintendo', 'switch'],
    'gaming': ['playstation', 'ps5', 'xbox', 'nintendo', 'switch'],
    'vr': ['quest', 'meta', 'oculus'],
    'headset': ['quest', 'meta', 'oculus']
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private packageService: PackageService,
    private itemService: ItemService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isNew = false;
      this.loadPackage(+id);
    } else {
      this.createNewPackage();
    }
    this.loadAvailableItems();
  }

  createNewPackage(): void {
    const name = prompt('Enter package name:');
    if (!name) {
      this.router.navigate(['/']);
      return;
    }

    this.packageName = name;
    this.loading = true;
    this.packageService.createPackage({ name, boxSize: undefined }).subscribe({
      next: (pkg) => {
        this.package = pkg;
        this.boxSize = pkg.boxSize || '';
        this.totalWeight = pkg.totalWeight;
        this.loading = false;
        this.router.navigate(['/package', pkg.id], { replaceUrl: true });
      },
      error: (error) => {
        console.error('Error creating package:', error);
        this.snackBar.open('Error creating package', 'Close', { duration: 3000 });
        this.loading = false;
        this.router.navigate(['/']);
      }
    });
  }

  loadPackage(id: number): void {
    this.loading = true;
    this.packageService.getPackage(id).subscribe({
      next: (pkg) => {
        this.package = pkg;
        this.packageName = pkg.name;
        this.boxSize = pkg.boxSize || '';
        this.totalWeight = pkg.totalWeight;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading package:', error);
        this.snackBar.open('Error loading package', 'Close', { duration: 3000 });
        this.loading = false;
        this.router.navigate(['/']);
      }
    });
  }

  loadAvailableItems(): void {
    this.itemService.getItems().subscribe({
      next: (items) => {
        this.allItems = items;
        this.availableItems = items;
      },
      error: (error) => {
        console.error('Error loading items:', error);
        this.snackBar.open('Error loading items', 'Close', { duration: 3000 });
      }
    });
  }

  filterItems(): void {
    if (!this.searchQuery.trim()) {
      this.availableItems = this.allItems;
    } else {
      const query = this.searchQuery.toLowerCase().trim();

      // Get expanded search terms from aliases
      const searchTerms = this.getExpandedSearchTerms(query);

      this.availableItems = this.allItems.filter(item => {
        const itemName = item.name.toLowerCase();
        // Check if item matches any of the search terms
        return searchTerms.some(term => itemName.includes(term));
      });
    }
    // Scroll to top of items grid when filtering
    setTimeout(() => {
      const grid = document.querySelector('.items-grid');
      if (grid) grid.scrollTop = 0;
    }, 0);
  }

  private getExpandedSearchTerms(query: string): string[] {
    const terms = [query]; // Always include the original query

    // Check if query matches any alias keys
    for (const [alias, expandedTerms] of Object.entries(this.searchAliases)) {
      if (query.includes(alias) || alias.includes(query)) {
        terms.push(...expandedTerms);
      }
    }

    return [...new Set(terms)]; // Remove duplicates
  }

  addItem(item: Item): void {
    if (!this.package) return;

    this.packageService.addItemToPackage(this.package.id, { itemId: item.id }).subscribe({
      next: () => {
        // Update local state instead of reloading
        const existingItem = this.package!.items.find(pi => pi.itemId === item.id);
        if (existingItem) {
          existingItem.quantity++;
        } else {
          this.package!.items.push({
            id: 0, // Temporary ID
            itemId: item.id,
            itemName: item.name,
            itemImageUrl: item.imageUrl,
            quantity: 1
          });
        }
        this.snackBar.open('Item added', 'Close', { duration: 2000 });
      },
      error: (error) => {
        console.error('Error adding item:', error);
        this.snackBar.open('Error adding item', 'Close', { duration: 3000 });
      }
    });
  }

  increaseQuantity(packageItem: PackageItem): void {
    if (!this.package || !packageItem.itemId) return;

    this.packageService.addItemToPackage(this.package.id, { itemId: packageItem.itemId }).subscribe({
      next: () => {
        // Update local state
        packageItem.quantity++;
      },
      error: (error) => {
        console.error('Error increasing quantity:', error);
        this.snackBar.open('Error updating quantity', 'Close', { duration: 3000 });
      }
    });
  }

  decreaseQuantity(packageItem: PackageItem): void {
    if (!this.package || !packageItem.itemId) return;

    this.packageService.removeItemFromPackage(this.package.id, packageItem.itemId).subscribe({
      next: () => {
        // Update local state
        if (packageItem.quantity > 1) {
          packageItem.quantity--;
        } else {
          // Remove item from array
          const index = this.package!.items.indexOf(packageItem);
          if (index > -1) {
            this.package!.items.splice(index, 1);
          }
        }
      },
      error: (error) => {
        console.error('Error decreasing quantity:', error);
        this.snackBar.open('Error updating quantity', 'Close', { duration: 3000 });
      }
    });
  }

  updateBoxSize(): void {
    if (!this.package) return;

    // Only update if the value has changed
    if (this.boxSize === (this.package.boxSize || '')) return;

    this.packageService.updateBoxSize(this.package.id, this.boxSize || undefined).subscribe({
      next: () => {
        this.package!.boxSize = this.boxSize || undefined;
        this.snackBar.open('Box size updated', 'Close', { duration: 2000 });
      },
      error: (error) => {
        console.error('Error updating box size:', error);
        this.snackBar.open('Error updating box size', 'Close', { duration: 3000 });
      }
    });
  }

  updateWeight(): void {
    if (!this.package) return;

    // Only update if the value has changed
    if (this.totalWeight === this.package.totalWeight) return;

    this.packageService.updateWeight(this.package.id, { weight: this.totalWeight }).subscribe({
      next: () => {
        // Update local state
        this.package!.totalWeight = this.totalWeight;
        this.snackBar.open('Weight updated', 'Close', { duration: 2000 });
      },
      error: (error) => {
        console.error('Error updating weight:', error);
        this.snackBar.open('Error updating weight', 'Close', { duration: 3000 });
      }
    });
  }

  savePackage(): void {
    if (!this.package) return;

    // All changes are already saved via individual API calls
    // This just provides user feedback
    this.snackBar.open('Package saved successfully', 'Close', { duration: 2000 });
  }

  completePackage(): void {
    if (!this.package) return;

    const isCompleting = !this.package.isCompleted;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: isCompleting ? 'Complete Package' : 'Mark as Incomplete',
        message: isCompleting
          ? 'Are you sure you want to mark this package as complete?'
          : 'Are you sure you want to mark this package as incomplete?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.package) {
        if (isCompleting) {
          this.packageService.completePackage(this.package.id).subscribe({
            next: () => {
              this.snackBar.open('Package marked as complete', 'Close', { duration: 2000 });
              this.loadPackage(this.package!.id);
            },
            error: (error) => {
              console.error('Error completing package:', error);
              this.snackBar.open('Error completing package', 'Close', { duration: 3000 });
            }
          });
        } else {
          // Mark as incomplete by calling API
          this.packageService.uncompletePackage(this.package.id).subscribe({
            next: () => {
              this.snackBar.open('Package marked as incomplete', 'Close', { duration: 2000 });
              this.loadPackage(this.package!.id);
            },
            error: (error) => {
              console.error('Error marking package as incomplete:', error);
              this.snackBar.open('Error marking package as incomplete', 'Close', { duration: 3000 });
            }
          });
        }
      }
    });
  }

  copyReport(): void {
    if (!this.package) return;

    const report = this.packageService.generateReport(this.package);
    navigator.clipboard.writeText(report).then(() => {
      this.snackBar.open('Report copied to clipboard', 'Close', { duration: 2000 });
    }).catch(err => {
      console.error('Error copying to clipboard:', err);
      this.snackBar.open('Error copying to clipboard', 'Close', { duration: 3000 });
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
