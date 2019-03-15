export interface AuthUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  title: string;
  organisationId: number;
  roles: string[];
  token: string;
}
