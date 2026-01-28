# 🚀 Sales Management System - Setup Guide

## ✅ What's Created

### Models:
- `SalesAdmin` - Sales admin accounts
- `SalesEmployee` - Sales team employee accounts
- `SalesLead` - Leads with client info, status, remarks, assignments

### API Routes:
- `/api/sales/admin/login` - Admin login
- `/api/sales/team/login` - Employee login
- `/api/sales/admin/add-employee` - Add new employee (admin only)
- `/api/sales/admin/employees` - Get all employees (admin)
- `/api/sales/leads` - Get/Add leads
- `/api/sales/leads/[id]` - Update lead (assign, status, payment, remarks)
- `/api/sales/admin/assign-leads` - Bulk assign leads (admin)
- `/api/sales/admin/stats` - Dashboard stats (admin)
- `/api/sales/admin/daily-report?date=YYYY-MM-DD` - Daily report per employee (admin)
- `/api/sales/admin/leaderboard` - Best performers ranking (admin)
- `/api/sales/admin/setup` - **One-time setup** for first admin

### Pages:
- `/sales-admin-login` - Admin login page
- `/sales-team-login` - Employee login page
- `/sales-admin-dashboard` - Admin dashboard
- `/sales-team-dashboard` - Employee dashboard

---

## 🔧 Setup Steps

### Step 1: Create First Admin Account

**Option A: Using API (Recommended)**

```bash
# Run this once via Postman, curl, or browser console
POST /api/sales/admin/setup
{
  "fullname": "Admin Name",
  "email": "admin@example.com",
  "password": "securepassword123",
  "mobileNumber": "+919876543210"
}
```

**Option B: Using MongoDB directly**

```javascript
// In MongoDB shell or Compass
use your_database_name;
db.salesadmins.insertOne({
  fullname: "Admin Name",
  email: "admin@example.com",
  password: "$2a$10$hashedPasswordHere", // Use bcrypt to hash
  mobileNumber: "+919876543210",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});
```

**After creating admin, DELETE `/api/sales/admin/setup/route.js` for security!**

---

### Step 2: Login as Admin

1. Go to: `https://yourdomain.com/sales-admin-login`
2. Login with email and password
3. You'll be redirected to `/sales-admin-dashboard`

---

### Step 3: Add Sales Employees

1. In admin dashboard, click "Add Employee"
2. Fill in:
   - Full Name
   - Email
   - Password
   - Mobile (optional)
3. Employee can now login at `/sales-team-login`

---

## 📋 Features

### Sales Admin Can:
- ✅ View dashboard stats (total leads, by status, employee performance)
- ✅ Add sales employees
- ✅ View all leads
- ✅ Assign leads to employees (single or bulk); **assignedAt** / **assignedBy** tracked
- ✅ Update **payment status** (pending / paid / partial / N/A) per lead
- ✅ Add remarks to any lead
- ✅ View employee status and performance
- ✅ **Daily Report**: pick a date, see per-member metrics (assigned, assigned today, contacted, contacted today, paid, converted, lost) and expand to view client-level details (conversation, payment, status)
- ✅ **Best Performers**: leaderboard ranked by converted → paid → contacted
- ✅ Filter leads by **payment status**

### Sales Employee Can:
- ✅ Add new leads
- ✅ View their own leads
- ✅ Self-assign unassigned leads
- ✅ Update **payment status** per lead (pending / paid / partial / N/A)
- ✅ Add remarks to leads
- ✅ **My Summary**: assigned, contacted, paid, converted counts; filter by payment
- ✅ Update lead status

---

## 🔐 Security

- **Passwords:** Hashed with bcrypt (10 rounds)
- **Authentication:** JWT tokens (7 days expiry)
- **Authorization:** Role-based (sales-admin, sales-employee)
- **Token Storage:** localStorage (client-side)

---

## 📊 Lead Data Structure

Based on your Excel data:

```javascript
{
  clientName: "Rachna Priyadarshini",
  companyName: "Your Heritage Pvt Ltd",
  mobile: "93044 37379",
  email: "yourheritage2019@gmail.com",
  state: "Bihar Pincode : 800001",
  product: "madhubani painting",
  status: "new" | "contacted" | "qualified" | "converted" | "lost",
  assignedTo: ObjectId (SalesEmployee),
  createdBy: ObjectId (SalesEmployee),
  remarks: [
    {
      remark: "Called client, interested",
      addedBy: ObjectId,
      addedByType: "SalesEmployee" | "SalesAdmin",
      createdAt: Date
    }
  ]
}
```

---


## 🎯 Usage Flow

1. **Admin creates employees** → Employees get login credentials
2. **Employees login** → Add leads from clients
3. **Employees self-assign** → Work on leads, add remarks
4. **Admin monitors** → Views all leads, assigns to employees, tracks performance
5. **Bulk assignment** → Admin selects multiple leads, assigns to one employee

---

## ⚠️ Important Notes

1. **First Admin Setup:** Run `/api/sales/admin/setup` once, then delete the file
2. **JWT_SECRET:** Make sure `JWT_SECRET` is set in `.env`
3. **Database:** Models will auto-create collections on first use
4. **Token Expiry:** 7 days - users need to re-login after expiry

---

## 🐛 Troubleshooting

### "Unauthorized" errors:
- Check if token is in localStorage
- Verify JWT_SECRET in .env matches
- Token might be expired (7 days)

### "Admin already exists":
- Delete `/api/sales/admin/setup/route.js` - it's one-time only
- Use `/api/sales/admin/login` instead

### Leads not showing:
- Check if employee is assigned to leads
- Verify token in request headers
- Check API response in browser console

---

## ✅ Next Steps

1. Create first admin using setup API
2. Delete setup route file
3. Login as admin
4. Add employees
5. Start managing leads!

---

**System is ready to use! 🎉**
