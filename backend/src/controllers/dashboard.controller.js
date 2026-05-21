const { getSupabase } = require("../config/supabase");
const ApiResponse = require("../utils/ApiResponse");

const getDashboardStats = async (req, res, next) => {
  try {
    const supabase = getSupabase();
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    // Get all data
    const [
      { data: properties, error: propertiesError },
      { data: tenants, error: tenantsError },
      { data: leases, error: leasesError },
      { data: payments, error: paymentsError },
      { data: maintenance, error: maintenanceError }
    ] = await Promise.all([
      supabase.from("properties").select("*"),
      supabase.from("tenants").select("*"),
      supabase.from("leases").select("*"),
      supabase.from("payments").select("*"),
      supabase.from("maintenance").select("*")
    ]);

    if (propertiesError || tenantsError || leasesError || paymentsError || maintenanceError) {
      throw new Error("Failed to fetch dashboard data");
    }

    // Calculate stats
    const totalProperties = properties.length;
    const totalTenants = tenants.length;
    const activeLeases = leases.filter(lease => lease.lease_status === "active").length;
    
    const todayStr = today.toISOString().split('T')[0];
    const thirtyDaysStr = thirtyDaysFromNow.toISOString().split('T')[0];
    const expiringLeases = leases.filter(lease =>
      lease.lease_status === "active" &&
      lease.end_date >= todayStr &&
      lease.end_date <= thirtyDaysStr
    ).length;

    const totalRevenue = payments
      .filter(payment => payment.status === "completed")
      .reduce((sum, payment) => sum + (payment.amount || 0), 0);

    const monthRevenue = payments
      .filter(payment => payment.status === "completed" && payment.payment_date)
      .filter(payment => {
        const paidDate = new Date(payment.payment_date);
        return (
          paidDate.getFullYear() === today.getFullYear() &&
          paidDate.getMonth() === today.getMonth()
        );
      })
      .reduce((sum, payment) => sum + (payment.amount || 0), 0);

    const pendingPayments = payments.filter(payment => payment.status === "pending").length;
    const overduePayments = payments.filter(payment => payment.status === "overdue").length;
    const openMaintenance = maintenance.filter(m => ["open", "in-progress", "pending"].includes(m.status)).length;

    const occupancyRate = totalProperties > 0
      ? Math.round((activeLeases / totalProperties) * 100)
      : 0;

    // Revenue for last 6 months
    const revenueByMonth = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);

      const monthStartStr = monthStart.toISOString().split('T')[0];
      const monthEndStr = monthEnd.toISOString().split('T')[0];

      const monthRevenueAmount = payments
        .filter(payment =>
          payment.status === "completed" &&
          payment.payment_date &&
          payment.payment_date >= monthStartStr &&
          payment.payment_date <= monthEndStr
        )
        .reduce((sum, payment) => sum + (payment.amount || 0), 0);

      revenueByMonth.push({
        month: monthStart.toLocaleString('default', { month: 'short' }),
        revenue: monthRevenueAmount
      });
    }

    // Leases by status
    const leasesByStatus = [
      { status: "active", count: leases.filter(l => l.lease_status === "active").length },
      { status: "expired", count: leases.filter(l => l.lease_status === "expired").length },
      { status: "pending", count: leases.filter(l => l.lease_status === "pending").length },
      { status: "terminated", count: leases.filter(l => l.lease_status === "terminated").length }
    ];

    // Maintenance by priority
    const maintenanceByPriority = [
      { priority: "high", count: maintenance.filter(m => m.priority === "high").length },
      { priority: "medium", count: maintenance.filter(m => m.priority === "medium").length },
      { priority: "low", count: maintenance.filter(m => m.priority === "low").length }
    ];

    // Occupancy data (simplified)
    const occupancyData = [
      { month: "Jan", occupied: 85, vacant: 15 },
      { month: "Feb", occupied: 90, vacant: 10 },
      { month: "Mar", occupied: 88, vacant: 12 },
      { month: "Apr", occupied: 92, vacant: 8 },
      { month: "May", occupied: 87, vacant: 13 },
      { month: "Jun", occupied: 91, vacant: 9 }
    ];

    const stats = {
      totalProperties,
      totalTenants,
      activeLeases,
      expiringLeases,
      totalRevenue,
      monthlyRevenue: monthRevenue,
      pendingPayments,
      overduePayments,
      openMaintenance,
      occupancyRate,
      revenueByMonth,
      leasesByStatus,
      maintenanceByPriority,
      occupancyData,
    };

    res.status(200).json(new ApiResponse(200, stats, "Dashboard stats retrieved successfully"));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
};
