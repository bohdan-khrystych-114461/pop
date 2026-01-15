import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Package, CreatePackageRequest, UpdateWeightRequest, AddItemToPackageRequest } from '../models/package.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PackageService {
  private apiUrl = `${environment.apiUrl}/api/packages`;

  constructor(private http: HttpClient) {}

  getPackages(): Observable<Package[]> {
    return this.http.get<Package[]>(this.apiUrl);
  }

  getPackage(id: number): Observable<Package> {
    return this.http.get<Package>(`${this.apiUrl}/${id}`);
  }

  createPackage(request: CreatePackageRequest): Observable<Package> {
    return this.http.post<Package>(this.apiUrl, request);
  }

  addItemToPackage(packageId: number, request: AddItemToPackageRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${packageId}/items`, request);
  }

  removeItemFromPackage(packageId: number, itemId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${packageId}/items/${itemId}`);
  }

  updateWeight(packageId: number, request: UpdateWeightRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${packageId}/weight`, request);
  }

  updateBoxSize(packageId: number, boxSize: string | undefined): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${packageId}/boxsize`, { boxSize });
  }

  completePackage(packageId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${packageId}/complete`, {});
  }

  uncompletePackage(packageId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${packageId}/uncomplete`, {});
  }

  deletePackage(packageId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${packageId}`);
  }

  generateReport(pkg: Package): string {
    let report = `Package: ${pkg.name}\n`;
    report += `Box Size: ${pkg.boxSize || 'N/A'}\n`;
    report += `Total Weight: ${pkg.totalWeight ? pkg.totalWeight + ' lb' : 'N/A'}\n`;
    report += `Status: ${pkg.isCompleted ? 'Completed' : 'In Progress'}\n`;
    report += `Created: ${new Date(pkg.createdDate).toLocaleDateString()}\n\n`;
    report += `Items:\n`;

    pkg.items.forEach(item => {
      report += `- ${item.itemName} x${item.quantity}\n`;
    });

    const totalItems = pkg.items.reduce((sum, item) => sum + item.quantity, 0);
    report += `\nTotal Items: ${totalItems}`;

    return report;
  }
}
