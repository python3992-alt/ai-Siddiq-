
export interface Note {
  id: string;
  title: string;
  content: string;
  images?: string[]; // Base64 encoded images
  createdAt: string;
  updatedAt: string;
}
