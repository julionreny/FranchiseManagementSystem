# Franchise Management System - All Charts Brief

This document provides a comprehensive explanation of all charts in the system, including their data sources, business logic, equations, and visual settings.

---

## Table of Contents

1. [Manager Dashboard Charts](#1-manager-dashboard-charts)
   - [1.1 Sales Line Chart (Last 7 Days)](#11-sales-line-chart-last-7-days)
   - [1.2 Expense Donut Chart](#12-expense-donut-chart)
2. [Owner Dashboard Charts](#2-owner-dashboard-charts)
   - [2.1 Multi-Branch Performance Area Chart](#21-multi-branch-performance-area-chart)
3. [Branch Performance Page Charts](#3-branch-performance-page-charts)
   - [3.1 Profitability Matrix Bar Chart](#31-profitability-matrix-bar-chart)
   - [3.2 Growth Trajectory Area Chart](#32-growth-trajectory-area-chart)
4. [Summary](#summary)

---

## 1. Manager Dashboard Charts

### 1.1 Sales Line Chart (Last 7 Days)

**File:** `src/pages/dashboard/ManagerDashboard.jsx`

**Chart Title:** Sales Overview (Last 7 Days)

#### Where its data comes from

**Frontend:**
- `src/pages/dashboard/ManagerDashboard.jsx`

**Backend:**
- `backend/controllers/dashboardController.js`
- Function: `getSalesLast7Days`

#### Backend Query

```sql
SELECT
  TO_CHAR(d.date, 'Dy') AS day,
  COALESCE(SUM(s.amount), 0) AS sales
FROM generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day') AS d(date)
LEFT JOIN sales s ON s.sale_date = d.date AND s.branch_id = $1
GROUP BY d.date ORDER BY d.date
```

#### Logic Behind It

For the selected branch:

1. Generate a series of dates for the last 7 days (including today)
2. For each date, left join with the sales table to get sales for that branch
3. Sum the sales amounts for each day
4. Return each day as:
   - `day = day name (Mon, Tue, Wed, etc.)`
   - `sales = total sales amount for that day`

#### Core Equation

For each day:

```
Daily Sales = Σ (amounts from sales table for that date)
```

If no sales on a particular day, it returns 0.

#### Example

| Day   | Sales   |
|-------|---------|
| Mon   | 15000   |
| Tue   | 22000   |
| Wed   | 18000   |
| Thu   | 25000   |
| Fri   | 30000   |
| Sat   | 35000   |
| Sun   | 12000   |

#### Visual Settings

```jsx
<LineChart data={salesData}>
  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
  <XAxis dataKey="day" stroke="#94a3b8" />
  <YAxis stroke="#94a3b8" />
  <Tooltip formatter={(value) => `₹${Number(value).toLocaleString("en-IN")}`} />
  <Line
    type="monotone"
    dataKey="sales"
    stroke="#10b981"
    strokeWidth={3}
  />
</LineChart>
```

**Key Settings:**
- `type="monotone"` - Creates a smooth curve between points
- `stroke="#10b981"` - Green line color
- `strokeWidth={3}` - Line thickness

#### Tooltip Logic

Shows formatted currency when hovering:
- Example: `₹15,000`

#### Business Interpretation

This chart answers:
> "What were the daily sales performance for this branch over the last week?"

It shows:
- Daily sales trends
- Weekend vs weekday performance
- Revenue patterns

---

### 1.2 Expense Donut Chart

**File:** `src/pages/dashboard/ManagerDashboard.jsx`

**Chart Title:** Expense Breakdown

*This section was already provided by the user and is included for completeness.*

#### Backend Query

```sql
SELECT expense_type AS name, SUM(amount) AS value
FROM expenses
WHERE branch_id = $1
GROUP BY expense_type
```

#### Core Equation

```
Category Value = Σ (amounts in that expense type)
Total Expenses = Σ (all category values)
Slice Percentage = (Category Value / Total Expenses) × 100
Slice Angle = (Category Value / Total Expenses) × 360°
```

#### Visual Settings

```jsx
<Pie
  data={expenseData}
  cx="50%"
  cy="50%"
  innerRadius={70}
  outerRadius={110}
  paddingAngle={4}
  dataKey="value"
/>
```

- `innerRadius={70}` - Creates the donut hole
- `outerRadius={110}` - Full size of chart
- `paddingAngle={4}` - Spacing between slices

#### Colors

```jsx
const COLORS = ["#10b981", "#6366f1", "#f59e0b", "#ef4444", "#06b6d4"];
```

---

## 2. Owner Dashboard Charts

### 2.1 Multi-Branch Performance Area Chart

**File:** `src/pages/dashboard/OwnerDashboard.jsx`

**Chart Title:** Multi-Branch Performance (Last 30 Days)

#### Where its data comes from

**Frontend:**
- `src/pages/dashboard/OwnerDashboard.jsx`
- Service: `getOwnerBranchTrend`

**Backend:**
- `backend/controllers/dashboardController.js`
- Function: `getOwnerBranchTrend`

#### Backend Query

```sql
SELECT
  b.branch_id, b.branch_name, b.location,
  TO_CHAR(d.date, 'Mon DD') AS name,
  COALESCE(SUM(s.amount), 0) AS revenue
FROM generate_series(CURRENT_DATE - INTERVAL '29 days', CURRENT_DATE, '1 day') AS d(date)
CROSS JOIN branches b
LEFT JOIN sales s ON s.branch_id = b.branch_id AND DATE(s.sale_date) = d.date
WHERE b.franchise_id = $1
GROUP BY b.branch_id, b.branch_name, b.location, d.date
ORDER BY d.date
```

#### Logic Behind It

For the entire franchise (all branches):

1. Generate a series of dates for the last 30 days
2. Cross join with all branches in the franchise
3. Left join with sales for each branch on each date
4. Sum the revenue for each branch on each day
5. Return:
   - `name = date (e.g., "Jan 01")`
   - `branch_name = revenue for that branch on that date`

#### Data Transformation (Frontend)

The raw data is transformed for the AreaChart:

```js
const grouped = t.data.reduce((acc, curr) => {
  if (!acc[curr.name]) acc[curr.name] = { name: curr.name };
  acc[curr.name][curr.branch_name] = Number(curr.revenue);
  return acc;
}, {});
setAreaData(Object.values(grouped));
```

#### Example Transformed Data

```js
[
  { name: "Jan 01", "Delhi Branch": 15000, "Mumbai Branch": 22000, "Bangalore Branch": 18000 },
  { name: "Jan 02", "Delhi Branch": 18000, "Mumbai Branch": 25000, "Bangalore Branch": 20000 },
  // ... more days
]
```

#### Core Equation

For each branch on each day:

```
Daily Revenue = Σ (sales amounts for that branch on that date)
```

#### Visual Settings

```jsx
<AreaChart data={areaData}>
  <defs>
    <linearGradient id="colorMain" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
    </linearGradient>
  </defs>
  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={true} />
  <XAxis dataKey="name" stroke="#94a3b8" angle={-45} textAnchor="end" height={60} />
  <YAxis stroke="#94a3b8" />
  <Tooltip contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155" }} />
  <Legend verticalAlign="top" height={36} />
  {areaData.length > 0 && Object.keys(areaData[0]).filter(k => k !== 'name').map((branch, i) => (
    <Area 
      key={branch} 
      type="monotone" 
      dataKey={branch} 
      name={branch} 
      stroke={PIE_COLORS[i % PIE_COLORS.length]} 
      fillOpacity={0.2} 
      fill={PIE_COLORS[i % PIE_COLORS.length]} 
    />
  ))}
</AreaChart>
```

#### Key Settings

- `type="monotone"` - Smooth curved areas
- `fillOpacity={0.2}` - Semi-transparent fill
- `angle={-45}` - Rotated X-axis labels for better readability
- Multiple `<Area />` components - One for each branch

#### Colors

```js
const PIE_COLORS = ["#14532d", "#475569", "#ca8a04", "#7f1d1d", "#0f766e"];
```

Each branch gets a different color, cycling through the array.

#### Tooltip Logic

Shows all branches' revenue for the hovered date:
- Example: `Delhi Branch: ₹15,000`, `Mumbai Branch: ₹22,000`

#### Business Interpretation

This chart answers:
> "How is revenue distributed across all branches over the last 30 days?"

It shows:
- Comparison of performance across branches
- Daily revenue trends for each branch
- Identifying best/worst performing branches
- Seasonal patterns

#### Stat Cards

The Owner Dashboard also includes stat cards:

1. **Total System Revenue**
   - Sum of all sales across all branches

2. **Active Locations**
   - Shows: `{activeBranches}/{totalBranches} operating`
   - Circle progress shows percentage

3. **Operating Efficiency Score**
   - Calculated as: `Math.min(99, Math.round(((totalRevenue - totalExpenses) / totalRevenue) * 100 + 50))`

4. **Total Employees (System)**
   - Count of all employees across all branches

---

## 3. Branch Performance Page Charts

### 3.1 Profitability Matrix Bar Chart

**File:** `src/pages/owner/BranchPerformance.jsx`

**Chart Title:** Profitability Matrix

#### Where its data comes from

**Frontend:**
- `src/pages/owner/BranchPerformance.jsx`
- Service: `getOwnerBranchPerformance`

**Backend:**
- `backend/controllers/dashboardController.js`
- Function: `getOwnerBranchPerformance`

#### Backend Query

```sql
SELECT
  b.branch_id, b.branch_name, b.location, b.status, b.manager_email,
  COALESCE((SELECT SUM(amount) FROM sales WHERE branch_id = b.branch_id), 0) AS revenue,
  COALESCE((SELECT SUM(amount) FROM expenses WHERE branch_id = b.branch_id), 0) AS expenses,
  (SELECT COUNT(*) FROM employees WHERE branch_id = b.branch_id) AS employee_count
FROM branches b
WHERE b.franchise_id = $1
ORDER BY revenue DESC
```

#### Logic Behind It

For each branch in the franchise:

1. Get total revenue: Sum of all sales for that branch
2. Get total expenses: Sum of all expenses for that branch
3. Get employee count: Number of employees in that branch
4. Calculate profit: `revenue - expenses`
5. Calculate profit margin: `(profit / revenue) × 100`

#### Core Equations

```
Revenue = Σ (all sales amounts for the branch)
Expenses = Σ (all expense amounts for the branch)
Profit = Revenue - Expenses
Profit Margin = (Profit / Revenue) × 100
```

#### Example

| Branch      | Revenue  | Expenses | Profit  | Margin |
|-------------|----------|----------|---------|--------|
| Delhi       | 500,000  | 300,000  | 200,000 | 40%    |
| Mumbai      | 400,000  | 280,000  | 120,000 | 30%    |
| Bangalore   | 300,000  | 250,000  | 50,000  | 16.67% |

#### Visual Settings

```jsx
<BarChart data={branchData}>
  <defs>
    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
    </linearGradient>
    <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
    </linearGradient>
  </defs>
  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
  <XAxis dataKey="branch_name" stroke="#64748b" fontSize={12} />
  <YAxis stroke="#64748b" tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
  <Tooltip formatter={v => [`₹${Number(v).toLocaleString("en-IN")}`, ""]} />
  <Legend />
  <Bar dataKey="revenue" name="Revenue" fill="url(#colorRev)" radius={[6,6,0,0]} barSize={24} />
  <Bar dataKey="profit" name="Net Profit" fill="url(#colorProf)" radius={[6,6,0,0]} barSize={24} />
</BarChart>
```

#### Key Settings

- `barSize={24}` - Width of bars
- `radius={[6,6,0,0]}` - Rounded top corners
- `vertical={false}` - No vertical grid lines
- Two bars per branch: Revenue and Profit

#### Colors

- Revenue: Blue gradient (`#3b82f6`)
- Profit: Green gradient (`#10b981`)

#### Tooltip Logic

Shows formatted currency:
- Example: `₹5,00,000`

#### Business Interpretation

This chart answers:
> "What is the revenue and profit breakdown for each branch?"

It shows:
- Total revenue per branch
- Net profit per branch
- Comparison of profitability across branches
- Visual difference between revenue and profit

---

### 3.2 Growth Trajectory Area Chart

**File:** `src/pages/owner/BranchPerformance.jsx`

**Chart Title:** Growth Trajectory

#### Where its data comes from

**Frontend:**
- Same as Bar Chart - uses `getOwnerBranchTrend`

**Backend:**
- Same as Bar Chart - uses `getOwnerBranchTrend`

#### Backend Query

Same as the Multi-Branch Performance chart in OwnerDashboard:

```sql
SELECT
  b.branch_id, b.branch_name, b.location,
  TO_CHAR(d.date, 'Mon DD') AS name,
  COALESCE(SUM(s.amount), 0) AS revenue
FROM generate_series(CURRENT_DATE - INTERVAL '29 days', CURRENT_DATE, '1 day') AS d(date)
CROSS JOIN branches b
LEFT JOIN sales s ON s.branch_id = b.branch_id AND DATE(s.sale_date) = d.date
WHERE b.franchise_id = $1
GROUP BY b.branch_id, b.branch_name, b.location, d.date
ORDER BY d.date
```

#### Data Transformation (Frontend)

```js
const trendList = trend.data || [];
const grouped = trendList.reduce((acc, curr) => {
  if (!acc[curr.name]) acc[curr.name] = { month: curr.name };
  acc[curr.name][curr.branch_name] = Number(curr.revenue);
  return acc;
}, {});
setTrendData(Object.values(grouped));
```

#### Key Difference from OwnerDashboard

This chart shows **only the top 3 branches** (limited in rendering):

```jsx
{branchData.slice(0, 3).map((b, i) => (
  <Area 
    key={b.branch_name} 
    type="monotone" 
    dataKey={b.branch_name} 
    stroke={COLORS[i % COLORS.length]} 
    fillOpacity={1}
    fill={`url(#color-${i})`}
    strokeWidth={3}
    activeDot={{ r: 6, strokeWidth: 0 }}
  />
))}
```

#### Visual Settings

```jsx
<AreaChart data={trendData}>
  <defs>
    {branchData.slice(0, 3).map((b, i) => (
      <linearGradient key={`grad-${i}`} id={`color-${i}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.3}/>
        <stop offset="95%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0}/>
      </linearGradient>
    ))}
  </defs>
  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
  <YAxis stroke="#64748b" tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
  <Tooltip contentStyle={{ backgroundColor: "rgba(15, 23, 42, 0.9)" }} />
  <Legend />
  {branchData.slice(0, 3).map((b, i) => (
    <Area 
      key={b.branch_name} 
      type="monotone" 
      dataKey={b.branch_name} 
      stroke={COLORS[i % COLORS.length]} 
      fillOpacity={1}
      fill={`url(#color-${i})`}
      strokeWidth={3}
      activeDot={{ r: 6, strokeWidth: 0 }}
    />
  ))}
</AreaChart>
```

#### Colors

```js
const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#a855f7", "#ec4899"];
```

Top 3 branches get the first 3 colors.

#### Tooltip Logic

Shows revenue for all visible branches on hover.

#### Business Interpretation

This chart answers:
> "What is the 30-day revenue trend for the top 3 performing branches?"

It shows:
- Growth patterns over time
- Comparison between top performers
- Seasonal or weekly patterns
- Branch-by-branch trends

---

## 4. Summary

### Chart Overview Table

| Chart Name | Location | Type | Data Range | Purpose |
|------------|----------|------|------------|---------|
| Sales Overview | ManagerDashboard | Line | Last 7 days | Daily sales trends |
| Expense Breakdown | ManagerDashboard | Donut | All time | Expense distribution by category |
| Multi-Branch Performance | OwnerDashboard | Area | Last 30 days | All branches comparison |
| Profitability Matrix | BranchPerformance | Bar | All time | Revenue vs Profit by branch |
| Growth Trajectory | BranchPerformance | Area | Last 30 days | Top 3 branches trends |

### Key Equations Summary

1. **Total:** `Σ (values)`

2. **Percentage:** `(Part / Whole) × 100`

3. **Profit:** `Revenue - Expenses`

4. **Profit Margin:** `(Profit / Revenue) × 100`

5. **Efficiency Score:** `Math.min(99, ((Revenue - Expenses) / Revenue) × 100 + 50)`

### Visual Patterns

- **Line Chart:** Shows trends over time with connected points
- **Area Chart:** Shows trends with filled area below line (good for comparing multiple series)
- **Bar Chart:** Shows categorical comparisons (side-by-side bars)
- **Pie/Donut Chart:** Shows part-to-whole relationships (proportional slices)

### Files Involved

**Frontend:**
- `src/pages/dashboard/ManagerDashboard.jsx`
- `src/pages/dashboard/OwnerDashboard.jsx`
- `src/pages/owner/BranchPerformance.jsx`

**Backend:**
- `backend/controllers/dashboardController.js`

**Services:**
- `src/services/dashboardService.js`

---

*End of Charts Brief*

