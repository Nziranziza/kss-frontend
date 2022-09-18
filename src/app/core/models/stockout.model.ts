import {Input} from './input.model';
import {LocationWithNames} from './location.model';

export interface StockOut {
  _id: string;
  returnedQty: number
  distributedQty: number
  stockId: string
  inputId: Input
  totalQuantity: number
  location: LocationWithNames
  destination: Array<LocationWithNames>
  created_at: Date
  date: Date
}

