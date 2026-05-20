const Property = require("../models/Property");
const Tenant = require("../models/Tenant");
const Lease = require("../models/Lease");
const Payment = require("../models/Payment");
const Maintenance = require("../models/Maintenance");
const ApiResponse = require("../utils/ApiResponse");

const getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Get all data
    const [properties, tenants, leases, payments, maintenance] = await Promise.all([
      Property.find(),
      Tenant.find(),
      Lease.find(),
      Payment.find(),
      Maintenance.find()
    ]);

    // Calculate stats
    const totalProperties = properties.length;
    const totalTenants = tenants.length;
    const activeLeases = leases.filter(lease => lease.status === "active").length;
    const expiringLeases = leases.filter(lease =>
      lease.status === "active" &&
      new Date(lease.endDate) >= today &&
      new Date(lease.endDate) <= thirtyDaysFromNow
    ).length;

    const totalRevenue = payments
      .filter(payment => payment.status === "paid")
      .reduce((sum, payment) => sum + (payment.amount || 0), 0);

    const monthRevenue = payments
      .filter(payment => payment.status === "paid" && payment.paidDate)
      .filter(payment => {
        const paidDate = new Date(payment.paidDate);
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
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 5);

    const revenueByMonth = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);

      const monthRevenue = payments
        .filter(payment =>
          payment.status === "paid" &&
          payment.paidDate &&
          new Date(payment.paidDate) >= monthStart &&
          new Date(payment.paidDate) <= monthEnd
        )
        .reduce((sum, payment) => sum + (payment.amount || 0), 0);

      revenueByMonth.push({
        month: monthStart.toLocaleString('default', { month: 'short' }),
        revenue: monthRevenue
      });
    }

    // Leases by status
    const leasesByStatus = [
      { status: "active", count: leases.filter(l => l.status === "active").length },
      { status: "expired", count: leases.filter(l => l.status === "expired").length },
      { status: "pending", count: leases.filter(l => l.status === "pending").length },
      { status: "terminated", count: leases.filter(l => l.status === "terminated").length }
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
