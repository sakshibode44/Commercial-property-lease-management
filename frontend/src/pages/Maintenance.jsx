import { useState, useEffect } from 'react';
import axios from 'axios';
import './Maintenance.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000/api/v1' : '/api/v1');

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const Maintenance = () => {
  const [requests, setRequests] = useState([]);
  const [properties, setProperties] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    propertyId: '',
    tenantId: '',
    priority: 'medium',
    status: 'pending',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const initialize = async () => {
      await Promise.all([fetchRequests(), fetchProperties(), fetchTenants()]);
      setLoading(false);
    };
    initialize();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/maintenance`, { headers: getAuthHeaders() });
      setRequests(response.data.data);
    } catch (err) {
      console.error('Error loading requests:', err);
      setError('Unable to load maintenance requests.');
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

    try {
      const response = await axios.post(`${API_BASE_URL}/maintenance`, formData, { headers: getAuthHeaders() });
      setRequests((prev) => [...prev, response.data.data]);
      setSuccess('Maintenance request added successfully.');
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        propertyId: '',
        tenantId: '',
        priority: 'medium',
        status: 'pending',
      });
    } catch (err) {
      console.error('Error creating request:', err);
      setError(err.response?.data?.message || 'Unable to create request.');
    }
  };

  const updateStatus = async (requestId, status) => {
    try {
      await axios.patch(`${API_BASE_URL}/maintenance/${requestId}`, { status }, { headers: getAuthHeaders() });
      setRequests((prev) => prev.map((item) => (item.id === requestId ? { ...item, status } : item)));
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Unable to update request status.');
    }
  };

  const handleDelete = async (requestId) => {
    try {
      await axios.delete(`${API_BASE_URL}/maintenance/${requestId}`, { headers: getAuthHeaders() });
      setRequests((prev) => prev.filter((item) => item.id !== requestId));
    } catch (err) {
      console.error('Error deleting request:', err);
      setError('Unable to delete request.');
    }
  };

  if (loading) {
    return <div className="loading">Loading maintenance requests...</div>;
  }

  return (
    <div className="maintenance">
      <div className="header">
        <h1>Maintenance Requests</h1>
        <button className="btn-primary" onClick={() => setShowForm((prev) => !prev)}>
          {showForm ? 'Cancel' : 'New Request'}
        </button>
      </div>

      {showForm && (
        <form className="maintenance-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>
              Title
              <input type="text" name="title" value={formData.title} onChange={handleChange} required />
            </label>
            <label>
              Property
              <select name="propertyId" value={formData.propertyId} onChange={handleChange} required>
                <option value="">Select property</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>{property.name}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-row">
            <label>
              Tenant
              <select name="tenantId" value={formData.tenantId} onChange={handleChange}>
                <option value="">Select tenant</option>
                {tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>{tenant.companyName}</option>
                ))}
              </select>
            </label>
            <label>
              Priority
              <select name="priority" value={formData.priority} onChange={handleChange}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </label>
          </div>

          <div className="form-row">
            <label>
              Description
              <textarea name="description" value={formData.description} onChange={handleChange} required />
            </label>
            <label>
              Status
              <select name="status" value={formData.status} onChange={handleChange}>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </label>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          <button type="submit" className="btn-primary">Save Request</button>
        </form>
      )}

      <div className="requests-grid">
        {requests.length === 0 ? (
          <p>No maintenance requests yet.</p>
        ) : (
          requests.map((request) => (
            <div key={request.id} className="request-card">
              <div className="request-card-header">
                <h3>{request.title}</h3>
                <button className="btn-secondary" onClick={() => handleDelete(request.id)}>
                  Delete
                </button>
              </div>
              <p><strong>Property:</strong> {request.propertyDetails?.name || request.propertyId}</p>
              {request.tenantDetails && <p><strong>Tenant:</strong> {request.tenantDetails.companyName}</p>}
              <p><strong>Priority:</strong> {request.priority}</p>
              <p><strong>Status:</strong> {request.status}</p>
              <p>{request.description}</p>
              <div className="request-actions">
                {request.status !== 'completed' && (
                  <button className="btn-primary" onClick={() => updateStatus(request.id, 'completed')}>
                    Mark Completed
                  </button>
                )}
                {request.status !== 'in_progress' && request.status !== 'completed' && (
                  <button className="btn-secondary" onClick={() => updateStatus(request.id, 'in_progress')}>
                    Mark In Progress
                  </button>
                )}
              </div>
            </div>
          )))
        }
      </div>
    </div>
  );
};

export default Maintenance;
