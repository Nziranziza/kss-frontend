export interface AuthUser {
  info: any;
  parameters: any;
  token: string;
  orgInfo: OrgInfo;
  siteDetails: any;
}

interface OrgInfo {
  distributionSites: any
  orgName: string
  services: any
  location: any,
  hasExtensionAccess: boolean
}
