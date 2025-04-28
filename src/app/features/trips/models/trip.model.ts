export interface Trip {
  id: number;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  imageUrl1: string;
  imageUrl2: string;
  imageUrl3: string;
  duration: number;
  location: string;
  googleMapUrl: string;
  departureDate?: Date;
  returnDate?: Date;
}
