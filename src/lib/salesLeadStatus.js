export const SALES_LEAD_STATUS_LABELS = {
  new: "Status Not Updated",
  contacted: "Contacted",
  qualified: "Qualified",
  converted: "Converted",
  lost: "Lost",
  followup: "Follow-up",
  proposal: "Proposal",
  not_interested: "Not interested",
  ringing: "Ringing",
  hotfollowup: "Hot follow-up",
};

export const SALES_LEAD_STATUS_OPTIONS = [
  { value: "new", label: SALES_LEAD_STATUS_LABELS.new },
  { value: "contacted", label: SALES_LEAD_STATUS_LABELS.contacted },
  { value: "qualified", label: SALES_LEAD_STATUS_LABELS.qualified },
  { value: "converted", label: SALES_LEAD_STATUS_LABELS.converted },
  { value: "lost", label: SALES_LEAD_STATUS_LABELS.lost },
  { value: "followup", label: SALES_LEAD_STATUS_LABELS.followup },
  { value: "proposal", label: SALES_LEAD_STATUS_LABELS.proposal },
  { value: "not_interested", label: SALES_LEAD_STATUS_LABELS.not_interested },
  { value: "ringing", label: SALES_LEAD_STATUS_LABELS.ringing },
  { value: "hotfollowup", label: SALES_LEAD_STATUS_LABELS.hotfollowup },
];

export function formatSalesLeadStatus(status) {
  return SALES_LEAD_STATUS_LABELS[status] || status || "—";
}
