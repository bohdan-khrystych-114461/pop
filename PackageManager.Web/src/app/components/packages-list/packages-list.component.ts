import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Package } from '../../models/package.model';
import { PackageService } from '../../services/package.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-packages-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './packages-list.component.html',
  styleUrls: ['./packages-list.component.css']
})
export class PackagesListComponent implements OnInit {
  packages: Package[] = [];
  loading = false;

  constructor(
    private packageService: PackageService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadPackages();
  }

  loadPackages(): void {
    this.loading = true;
    this.packageService.getPackages().subscribe({
      next: (packages) => {
        this.packages = packages;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading packages:', error);
        this.snackBar.open('Error loading packages', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  createPackage(): void {
    this.router.navigate(['/package/new']);
  }

  editPackage(id: number): void {
    this.router.navigate(['/package', id]);
  }

  deletePackage(pkg: Package, event: Event): void {
    event.stopPropagation();
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Package',
        message: `Are you sure you want to delete "${pkg.name}"?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.packageService.deletePackage(pkg.id).subscribe({
          next: () => {
            this.snackBar.open('Package deleted', 'Close', { duration: 3000 });
            this.loadPackages();
          },
          error: (error) => {
            console.error('Error deleting package:', error);
            this.snackBar.open('Error deleting package', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  copyReport(pkg: Package, event: Event): void {
    event.stopPropagation();
    const report = this.packageService.generateReport(pkg);
    navigator.clipboard.writeText(report).then(() => {
      this.snackBar.open('Report copied to clipboard', 'Close', { duration: 2000 });
    }).catch(err => {
      console.error('Error copying to clipboard:', err);
      this.snackBar.open('Error copying to clipboard', 'Close', { duration: 3000 });
    });
  }

  getTotalItems(pkg: Package): number {
    return pkg.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  goToSettings(): void {
    this.router.navigate(['/settings']);
  }
}
