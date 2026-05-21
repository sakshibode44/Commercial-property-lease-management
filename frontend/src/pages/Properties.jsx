import { useState, useEffect } from 'react';
import axios from 'axios';
import './Properties.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000/api/v1' : '/api/v1');

const Properties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    type: 'office',
    totalArea: '',
    totalUnits: '',
    amenities: ''
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/properties`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProperties(response.data.data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const data = {
        ...formData,
        totalArea: parseFloat(formData.totalArea),
        totalUnits: parseInt(formData.totalUnits),
        amenities: formData.amenities.split(',').map(a => a.trim())
      };

      await axios.post(`${API_BASE_URL}/properties`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setShowForm(false);
      setFormData({
        name: '',
        address: '',
        type: 'office',
        totalArea: '',
        totalUnits: '',
        amenities: ''
      });
      fetchProperties();
    } catch (error) {
      console.error('Error creating property:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return <div className="loading">Loading properties...</div>;
  }

  return (
    <div className="properties">
      <div className="header">
        <h1>Properties</h1>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          Add Property
        </button>
      </div>

      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <h2>Add New Property</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select name="type" value={formData.type} onChange={handleChange}>
                  <option value="office">Office</option>
                  <option value="retail">Retail</option>
                  <option value="warehouse">Warehouse</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>
              <div className="form-group">
                <label>Total Area (sq ft)</label>
                <input
                  type="number"
                  name="totalArea"
                  value={formData.totalArea}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Total Units</label>
                <input
                  type="number"
                  name="totalUnits"
                  value={formData.totalUnits}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Amenities (comma separated)</label>
                <input
                  type="text"
                  name="amenities"
                  value={formData.amenities}
                  onChange={handleChange}
                  placeholder="Parking, Gym, Conference Room"
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">Save</button>
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="properties-grid">
        {properties.map(property => (
          <div key={property.id} className="property-card">
            <h3>{property.name}</h3>
            <p><strong>Address:</strong> {property.address}</p>
            <p><strong>Type:</strong> {property.type}</p>
            <p><strong>Area:</strong> {property.totalArea} sq ft</p>
            <p><strong>Units:</strong> {property.totalUnits}</p>
            <p><strong>Status:</strong> {property.status}</p>
            {property.amenities && property.amenities.length > 0 && (
              <p><strong>Amenities:</strong> {property.amenities.join(', ')}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Properties;