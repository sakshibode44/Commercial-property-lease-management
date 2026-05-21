import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './Dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const API_BASE_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000/api/v1' : '/api/v1');

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.data);
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  const revenueChartData = {
    labels: stats.revenueByMonth.map(item => item.month),
    datasets: [{
      label: 'Revenue',
      data: stats.revenueByMonth.map(item => item.revenue),
      borderColor: '#3498db',
      backgroundColor: 'rgba(52, 152, 219, 0.2)',
      tension: 0.1
    }]
  };

  const leaseStatusData = {
    labels: stats.leasesByStatus.map(item => item.status),
    datasets: [{
      data: stats.leasesByStatus.map(item => item.count),
      backgroundColor: ['#27ae60', '#e74c3c', '#f39c12', '#9b59b6']
    }]
  };

  const maintenancePriorityData = {
    labels: stats.maintenanceByPriority.map(item => item.priority),
    datasets: [{
      label: 'Maintenance Requests',
      data: stats.maintenanceByPriority.map(item => item.count),
      backgroundColor: ['#e74c3c', '#f39c12', '#f1c40f', '#27ae60']
    }]
  };

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Properties</h3>
          <div className="stat-value">{stats.totalProperties}</div>
        </div>
        <div className="stat-card">
          <h3>Total Tenants</h3>
          <div className="stat-value">{stats.totalTenants}</div>
        </div>
        <div className="stat-card">
          <h3>Active Leases</h3>
          <div className="stat-value">{stats.activeLeases}</div>
        </div>
        <div className="stat-card">
          <h3>Occupancy Rate</h3>
          <div className="stat-value">{stats.occupancyRate}%</div>
        </div>
        <div className="stat-card">
          <h3>Monthly Revenue</h3>
          <div className="stat-value">${(stats.monthlyRevenue || 0).toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <h3>Pending Payments</h3>
          <div className="stat-value">{stats.pendingPayments}</div>
        </div>
        <div className="stat-card">
          <h3>Overdue Payments</h3>
          <div className="stat-value overdue">{stats.overduePayments}</div>
        </div>
        <div className="stat-card">
          <h3>Open Maintenance</h3>
          <div className="stat-value">{stats.openMaintenance}</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Revenue Trend (Last 6 Months)</h3>
          <Line data={revenueChartData} />
        </div>

        <div className="chart-card">
          <h3>Lease Status Distribution</h3>
          <Pie data={leaseStatusData} />
        </div>

        <div className="chart-card">
          <h3>Maintenance by Priority</h3>
          <Bar data={maintenancePriorityData} />
        </div>
      </div>

      <div className="alerts-section">
        <h3>Alerts</h3>
        <div className="alerts-list">
          {stats.expiringLeases > 0 && (
            <div className="alert warning">
              <strong>{stats.expiringLeases}</strong> leases expiring in the next 30 days
            </div>
          )}
          {stats.overduePayments > 0 && (
            <div className="alert danger">
              <strong>{stats.overduePayments}</strong> payments are overdue
            </div>
          )}
          {stats.openMaintenance > 0 && (
            <div className="alert info">
              <strong>{stats.openMaintenance}</strong> maintenance requests pending
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;