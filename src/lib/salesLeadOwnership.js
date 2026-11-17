/** Current owner: assignee if set, otherwise the person who added it. */
export function employeeLeadMongoQuery(employeeId) {
  return {
    $or: [
      { assignedTo: employeeId },
      {
        createdBy: employeeId,
        $or: [{ assignedTo: null }, { assignedTo: { $exists: false } }],
      },
    ],
  };
}

export function employeeOwnsLead(lead, employeeId) {
  if (!lead || !employeeId) return false;
  const id = String(employeeId);
  const assigned = lead.assignedTo?._id || lead.assignedTo;
  if (assigned) return String(assigned) === id;
  const created = lead.createdBy?._id || lead.createdBy;
  return String(created || "") === id;
}
