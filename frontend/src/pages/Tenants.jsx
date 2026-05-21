import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000/api/v1' : '/api/v1');

const Tenants = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    industry: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/tenants`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTenants(response.data.data);
    } catch (error) {
      console.error('Error fetching tenants:', error);
      setError('Unable to load tenants. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddTenant = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/tenants`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setTenants((prev) => [...prev, response.data.data]);
      setSuccess('Tenant added successfully.');
      setShowForm(false);
      setFormData({
        companyName: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        industry: ''
      });
    } catch (error) {
      console.error('Error creating tenant:', error);
      setError(error.response?.data?.message || 'Failed to add tenant.');
    }
  };

  if (loading) {
    return <div className="loading">Loading tenants...</div>;
  }

  return (
    <div className="tenants">
      <div className="header">
        <h1>Tenants</h1>
        <button className="btn-primary" onClick={() => setShowForm((prev) => !prev)}>
          {showForm ? 'Cancel' : 'Add Tenant'}
        </button>
      </div>

      {showForm && (
        <form className="tenant-form" onSubmit={handleAddTenant}>
          <div className="form-row">
            <label>
              Company Name
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Contact Person
              <input
                type="text"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              Email
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Phone
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              Address
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </label>
            <label>
              Industry
              <input
                type="text"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
              />
            </label>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          <button type="submit" className="btn-primary">Save Tenant</button>
        </form>
      )}

      <div className="tenants-list">
        {tenants.length === 0 ? (
          <p>No tenants found. Add your first tenant using the button above.</p>
        ) : (
          tenants.map((tenant) => (
            <div key={tenant.id} className="tenant-card">
              <h3>{tenant.companyName}</h3>
              <p><strong>Contact:</strong> {tenant.contactPerson}</p>
              <p><strong>Email:</strong> {tenant.email}</p>
              <p><strong>Phone:</strong> {tenant.phone}</p>
              {tenant.address && <p><strong>Address:</strong> {tenant.address}</p>}
              {tenant.industry && <p><strong>Industry:</strong> {tenant.industry}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Tenants;