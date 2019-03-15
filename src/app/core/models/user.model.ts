export interface User {
  id: number;
  title: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  gender: string;
  organisationId: number;
  roles: string[];
  password: string;
  confirmPassword: string;
}
