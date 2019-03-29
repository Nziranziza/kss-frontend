export interface Farmer {
  _id: number;
  userId: number;
  address: string;
  upiNumber: string;
  treesNumber: number;
  belongsToCooperative: boolean;
  ownsLand: boolean;
  userInfo: {};
}
