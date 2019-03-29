export interface Farmer {
  _id: string;
  userId: string;
  address: string;
  upiNumber: string;
  treesNumber: number;
  belongsToCooperative: boolean;
  ownsLand: boolean;
  userInfo: {};
}
