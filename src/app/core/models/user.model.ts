export interface User {
  _id?: string;
  id?: string;
  foreName?: string;
  surname?: string;
  phone_number: string;
  email?: string;
  sex?: string;
  userType?: number;
  org_id?: string;
  userRoles?: [];
  status?: 0;
  lastModifiedBy?: LastModifiedBy;
}

export interface LastModifiedBy {
  _id: string;
  name: string
}
