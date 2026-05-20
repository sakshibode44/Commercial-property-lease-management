const express = require("express");
const authRoute = require("./auth.routes");
const propertyRoute = require("./property.routes");
const tenantRoute = require("./tenant.routes");
const leaseRoute = require("./lease.routes");
const paymentRoute = require("./payment.routes");
const maintenanceRoute = require("./maintenance.routes");
const utilityRoute = require("./utility.routes");
const dashboardRoute = require("./dashboard.routes");

const router = express.Router();

const defaultRoutes = [
  { path: "/auth", route: authRoute },
  { path: "/properties", route: propertyRoute },
  { path: "/tenants", route: tenantRoute },
  { path: "/leases", route: leaseRoute },
  { path: "/payments", route: paymentRoute },
  { path: "/maintenance", route: maintenanceRoute },
  { path: "/utilities", route: utilityRoute },
  { path: "/dashboard", route: dashboardRoute },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
