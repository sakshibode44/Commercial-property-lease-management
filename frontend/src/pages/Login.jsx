import { useState } from 'react';
import axios from 'axios';
import './Login.css';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'admin'
  });
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isRegister ? '/api/v1/auth/register' : '/api/v1/auth/login';

      // Prepare data based on form type
      const submitData = isRegister
        ? {
            email: formData.email,
            password: formData.password,
            name: formData.name || '',
            role: formData.role || 'admin'
          }
        : {
            email: formData.email,
            password: formData.password
          };

      const response = await axios.post(`http://localhost:5000${endpoint}`, submitData);

      if (response.data.success) {
        onLogin(response.data.data.user, response.data.data.token);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>{isRegister ? 'Register' : 'Login'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {isRegister && (
            <>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="role">Role</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role || 'admin'}
                  onChange={handleChange}
                  required
                >
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
            </>
          )}

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading}>
            {loading ? 'Please wait...' : (isRegister ? 'Register' : 'Login')}
          </button>
        </form>

        <p className="toggle-form">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}
          <button
            type="button"
            className="link-btn"
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister ? 'Login' : 'Register'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;