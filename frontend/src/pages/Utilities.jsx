import { useState, useEffect } from 'react';
import axios from 'axios';
import './Utilities.css';

const API_BASE_URL = 'http://localhost:5000/api/v1';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const Utilities = () => {
  const [utilities, setUtilities] = useState([]);
  const [properties, setProperties] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    propertyId: '',
    tenantId: '',
    utilityType: 'electricity',
    billingPeriod: '',
    amount: '',
    dueDate: '',
    status: 'pending',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const load = async () => {
      await Promise.all([fetchUtilities(), fetchProperties(), fetchTenants()]);
      setLoading(false);
    };
    load();
  }, []);

  const fetchUtilities = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/utilities`, { headers: getAuthHeaders() });
      setUtilities(response.data.data);
    } catch (err) {
      console.error('Error loading utilities:', err);
      setError('Unable to load utility bills.');
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

    if (!formData.propertyId) {
      setError('Please choose a property for the utility bill.');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/utilities`, {
        ...formData,
        amount: parseFloat(formData.amount),
      }, { headers: getAuthHeaders() });
      setUtilities((prev) => [...prev, response.data.data]);
      setSuccess('Utility bill created successfully.');
      setShowForm(false);
      setFormData({
        propertyId: '',
        tenantId: '',
        utilityType: 'electricity',
        billingPeriod: '',
        amount: '',
        dueDate: '',
        status: 'pending',
      });
    } catch (err) {
      console.error('Error creating utility bill:', err);
      setError(err.response?.data?.message || 'Unable to create utility bill.');
    }
  };

  const markPaid = async (utilityId) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/utilities/${utilityId}/pay`,
        { paidDate: new Date() },
        { headers: getAuthHeaders() }
      );
      setUtilities((prev) => prev.map((item) => (item.id === utilityId ? response.data.data : item)));
      setSuccess('Utility bill marked as paid.');
    } catch (err) {
      console.error('Error marking paid:', err);
      setError('Unable to mark utility as paid.');
    }
  };

  if (loading) {
    return <div className="loading">Loading utility bills...</div>;
  }

  return (
    <div className="utilities">
      <div className="header">
        <h1>Utilities</h1>
        <button className="btn-primary" onClick={() => setShowForm((prev) => !prev)}>
          {showForm ? 'Cancel' : 'New Utility Bill'}
        </button>
      </div>

      {showForm && (
        <form className="utility-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>
              Property
              <select name="propertyId" value={formData.propertyId} onChange={handleChange} required>
                <option value="">Select property</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>{property.name}</option>
                ))}
              </select>
            </label>
            <label>
              Tenant
              <select name="tenantId" value={formData.tenantId} onChange={handleChange}>
                <option value="">Select tenant</option>
                {tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>{tenant.companyName}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-row">
            <label>
              Type
              <select name="utilityType" value={formData.utilityType} onChange={handleChange}>
                <option value="electricity">Electricity</option>
                <option value="water">Water</option>
                <option value="gas">Gas</option>
                <option value="internet">Internet</option>
              </select>
            </label>
            <label>
              Billing Period
              <input type="text" name="billingPeriod" value={formData.billingPeriod} onChange={handleChange} placeholder="March 2026" />
            </label>
          </div>

          <div className="form-row">
            <label>
              Amount
              <input type="number" name="amount" value={formData.amount} onChange={handleChange} required />
            </label>
            <label>
              Due Date
              <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} required />
            </label>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          <button type="submit" className="btn-primary">Save Utility Bill</button>
        </form>
      )}

      <div className="utilities-grid">
        {utilities.length === 0 ? (
          <p>No utility bills available.</p>
        ) : (
          utilities.map((utility) => (
            <div key={utility.id} className="utility-card">
              <div className="utility-card-header">
                <h3>{utility.utilityType}</h3>
                <span className={`status ${utility.status}`}>{utility.status}</span>
              </div>
              <p><strong>Property:</strong> {utility.propertyDetails?.name || utility.propertyId}</p>
              {utility.tenantDetails && <p><strong>Tenant:</strong> {utility.tenantDetails.companyName}</p>}
              <p><strong>Amount:</strong> ${utility.amount}</p>
              <p><strong>Billing Period:</strong> {utility.billingPeriod}</p>
              <p><strong>Due Date:</strong> {utility.dueDate ? new Date(utility.dueDate).toLocaleDateString() : 'N/A'}</p>
              {utility.paidDate && <p><strong>Paid Date:</strong> {new Date(utility.paidDate).toLocaleDateString()}</p>}
              {utility.status !== 'paid' && (
                <button className="btn-primary" onClick={() => markPaid(utility.id)}>
                  Mark Paid
                </button>
              )}
            </div>
          )))
        }
      </div>
    </div>
  );
};

export default Utilities;
