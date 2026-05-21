import { useState, useEffect } from 'react';
import axios from 'axios';
import './Leases.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000/api/v1' : '/api/v1');

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const Leases = () => {
  const [leases, setLeases] = useState([]);
  const [properties, setProperties] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    propertyId: '',
    tenantId: '',
    monthlyRent: '',
    securityDeposit: '',
    startDate: '',
    endDate: '',
    status: 'active',
    notes: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchLeases(), fetchProperties(), fetchTenants()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const fetchLeases = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/leases`, { headers: getAuthHeaders() });
      setLeases(response.data.data);
    } catch (err) {
      console.error('Error loading leases:', err);
      setError('Unable to load leases.');
    }
  };

  const fetchProperties = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/properties`, { headers: getAuthHeaders() });
      setProperties(response.data.data);
    } catch (err) {
      console.error('Error loading properties:', err);
    }
  };

  const fetchTenants = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tenants`, { headers: getAuthHeaders() });
      setTenants(response.data.data);
    } catch (err) {
      console.error('Error loading tenants:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.propertyId || !formData.tenantId) {
      setError('Select a property and tenant before saving.');
      return;
    }

    try {
      const data = {
        ...formData,
        monthlyRent: parseFloat(formData.monthlyRent),
        securityDeposit: parseFloat(formData.securityDeposit),
      };
      const response = await axios.post(`${API_BASE_URL}/leases`, data, { headers: getAuthHeaders() });
      setLeases((prev) => [...prev, response.data.data]);
      setSuccess('Lease created successfully.');
      setShowForm(false);
      setFormData({
        propertyId: '',
        tenantId: '',
        monthlyRent: '',
        securityDeposit: '',
        startDate: '',
        endDate: '',
        status: 'active',
        notes: '',
      });
    } catch (err) {
      console.error('Error creating lease:', err);
      setError(err.response?.data?.message || 'Unable to create lease.');
    }
  };

  const handleDelete = async (leaseId) => {
    try {
      await axios.delete(`${API_BASE_URL}/leases/${leaseId}`, { headers: getAuthHeaders() });
      setLeases((prev) => prev.filter((lease) => lease.id !== leaseId));
    } catch (err) {
      console.error('Error deleting lease:', err);
      setError('Unable to remove lease.');
    }
  };

  if (loading) {
    return <div className="loading">Loading leases...</div>;
  }

  return (
    <div className="leases">
      <div className="header">
        <h1>Leases</h1>
        <button className="btn-primary" onClick={() => setShowForm((prev) => !prev)}>
          {showForm ? 'Cancel' : 'New Lease'}
        </button>
      </div>

      {showForm && (
        <form className="lease-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>
              Property
              <select name="propertyId" value={formData.propertyId} onChange={handleChange} required>
                <option value="">Select property</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Tenant
              <select name="tenantId" value={formData.tenantId} onChange={handleChange} required>
                <option value="">Select tenant</option>
                {tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.companyName}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-row">
            <label>
              Monthly Rent
              <input type="number" name="monthlyRent" value={formData.monthlyRent} onChange={handleChange} required />
            </label>
            <label>
              Security Deposit
              <input type="number" name="securityDeposit" value={formData.securityDeposit} onChange={handleChange} />
            </label>
          </div>

          <div className="form-row">
            <label>
              Lease Start
              <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required />
            </label>
            <label>
              Lease End
              <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required />
            </label>
          </div>

          <div className="form-row">
            <label>
              Status
              <select name="status" value={formData.status} onChange={handleChange}>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="expired">Expired</option>
              </select>
            </label>
            <label>
              Notes
              <textarea name="notes" value={formData.notes} onChange={handleChange} />
            </label>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          <button type="submit" className="btn-primary">Save Lease</button>
        </form>
      )}

      <div className="lease-list">
        {leases.length === 0 ? (
          <p>No leases found yet. Create your first lease to begin.</p>
        ) : (
          leases.map((lease) => (
            <div key={lease.id} className="lease-card">
              <div className="lease-card-header">
                <h3>{lease.propertyDetails?.name || 'Property'}</h3>
                <button className="btn-secondary" onClick={() => handleDelete(lease.id)}>Delete</button>
              </div>
              <p><strong>Tenant:</strong> {lease.tenantDetails?.companyName || 'Unknown'}</p>
              <p><strong>Rent:</strong> ${lease.monthlyRent}</p>
              <p><strong>Deposit:</strong> ${lease.securityDeposit || 0}</p>
              <p><strong>Term:</strong> {new Date(lease.startDate).toLocaleDateString()} - {new Date(lease.endDate).toLocaleDateString()}</p>
              <p><strong>Status:</strong> {lease.status}</p>
              {lease.notes && <p><strong>Notes:</strong> {lease.notes}</p>}
            </div>
          )))
        }
      </div>
    </div>
  );
};

export default Leases;
