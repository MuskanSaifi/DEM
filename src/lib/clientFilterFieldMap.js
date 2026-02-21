/**
 * Field mapping: same data, different keys across User, Buyer, SalesLead.
 * Use these when building queries or normalizing API responses so the form
 * can show data correctly from any model.
 *
 * | Concept        | User           | Buyer          | SalesLead   |
 * |----------------|----------------|----------------|-------------|
 * | Name           | fullname       | fullname       | clientName  |
 * | Email          | email          | email          | email       |
 * | Phone / Number | mobileNumber   | mobileNumber   | mobile      |
 * | Business/Co    | companyName    | companyName    | companyName |
 * | Product        | (N/A)          | productname    | product     |
 * | Payment status | paymentStatus  | paymentStatus  | paymentStatus |
 * | Status (lead)  | (N/A)          | (N/A)          | status      |
 * | Remark         | remark         | remark         | remarks[]   |
 *
 * Normalized keys used in API response and form:
 *   name, email, phone, businessName, product, status, paymentStatus
 */

export const USER_FIELDS = {
  name: "fullname",
  email: "email",
  phone: "mobileNumber",
  businessName: "companyName",
  paymentStatus: "paymentStatus",
};

export const BUYER_FIELDS = {
  name: "fullname",
  email: "email",
  phone: "mobileNumber",
  businessName: "companyName",
  product: "productname",
  paymentStatus: "paymentStatus",
};

export const SALESLEAD_FIELDS = {
  name: "clientName",
  email: "email",
  phone: "mobile",
  businessName: "companyName",
  product: "product",
  status: "status",
  paymentStatus: "paymentStatus",
};

/** Normalize paymentStatus: SalesLead uses pending/paid/partial/not_applicable → paid | unpaid */
export function normalizePaymentStatus(value, model = "user") {
  if (model === "salesLead") {
    return value === "paid" ? "paid" : "unpaid";
  }
  return value === "paid" ? "paid" : "unpaid";
}
