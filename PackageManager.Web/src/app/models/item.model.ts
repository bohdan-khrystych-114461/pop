export interface Item {
  id: number;
  name: string;
  imageUrl?: string;
}

export interface CreateItemRequest {
  name: string;
  imageUrl?: string;
}

export interface UpdateItemRequest {
  name: string;
  imageUrl?: string;
}
