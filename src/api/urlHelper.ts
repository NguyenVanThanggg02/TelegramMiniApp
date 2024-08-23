import { BASE_URL, DEFAULT_TENANT_ID } from "../constants";

// Create a tenant-specific URL
export const createTenantURL = (tenantId: string = DEFAULT_TENANT_ID): string => {
  const url = new URL(BASE_URL);
  url.hostname = `${tenantId}.${url.hostname}`;
  return url.toString();
};
