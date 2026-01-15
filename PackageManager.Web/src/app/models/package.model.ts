export interface Package {
  id: number;
  name: string;
  boxSize?: string;
  totalWeight: number;
  isCompleted: boolean;
  createdDate: Date;
  items: PackageItem[];
}

export interface PackageItem {
  id: number;
  itemId?: number;
  itemName: string;
  itemImageUrl?: string;
  quantity: number;
}

export interface CreatePackageRequest {
  name: string;
  boxSize?: string;
}

export interface UpdateWeightRequest {
  weight: number;
}

export interface AddItemToPackageRequest {
  itemId: number;
}
