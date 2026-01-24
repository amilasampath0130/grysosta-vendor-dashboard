export type VendorStatus = "NEW" | "PENDING" | "APPROVED";

export const getMockVendorStatus = (): VendorStatus => {
  // CHANGE THIS VALUE to test flows
  return "NEW";
};
