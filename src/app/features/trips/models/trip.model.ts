export interface Trip {
  id: number;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  duration: number;
  location: string;
  rating: number;
  featured?: boolean;
  departureDate?: Date;
  returnDate?: Date;
  maxGroupSize?: number;
  category?: string;
}
