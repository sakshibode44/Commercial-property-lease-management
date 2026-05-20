import { useState, useEffect } from 'react';
import axios from 'axios';
import './Payments.css';

const API_BASE_URL = 'http://localhost:5000/api/v1';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentForm, setPaymentForm] = useState({ amount: '', method: 'credit_card' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/payments`, { headers: getAuthHeaders() });
      setPayments(response.data.data);
    } catch (err) {
      console.error('Error loading payments:', err);
      setError('Unable to load payments.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPayment = (payment) => {
    setSelectedPayment(payment);
    setSuccess('');
    setError('');
    setPaymentForm({ amount: payment.amount, method: payment.method || 'credit_card' });
  };

  const handleFormChange = (e) => {
    setPaymentForm({ ...paymentForm, [e.target.name]: e.target.value });
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!selectedPayment) return;

    try {
      const response = await axios.patch(
        `${API_BASE_URL}/payments/${selectedPayment.id}/record`,
        {
          amount: parseFloat(paymentForm.amount),
          method: paymentForm.method,
          paidDate: new Date(),
        },
        { headers: getAuthHeaders() }
      );
      setSuccess('Payment recorded successfully.');
      setSelectedPayment(response.data.data);
      fetchPayments();
    } catch (err) {
      console.error('Error recording payment:', err);
      setError(err.response?.data?.message || 'Unable to record payment.');
    }
  };

  if (loading) {
    return <div className="loading">Loading payments...</div>;
  }

  return (
    <div className="payments">
      <h1>Payments</h1>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="payments-grid">
        {payments.length === 0 ? (
          <p>No payments found.</p>
        ) : (
          payments.map((payment) => (
            <div key={payment.id} className="payment-card">
              <h3>Payment #{payment.receiptNumber || payment.id}</h3>
              <p><strong>Tenant:</strong> {payment.tenantDetails?.companyName || 'Unknown'}</p>
              <p><strong>Property:</strong> {payment.propertyDetails?.name || 'Unknown'}</p>
              <p><strong>Amount:</strong> ${payment.amount}</p>
              <p><strong>Due Date:</strong> {payment.dueDate ? new Date(payment.dueDate).toLocaleDateString() : 'N/A'}</p>
              <p><strong>Status:</strong> {payment.status}</p>
              <button className="btn-secondary" onClick={() => handleSelectPayment(payment)}>
                Record Payment
              </button>
            </div>
          )))
        }
      </div>

      {selectedPayment && (
        <div className="payment-form">
          <h2>Record Payment</h2>
          <form onSubmit={handleRecordPayment}>
            <div className="form-row">
              <label>
                Amount
                <input
                  type="number"
                  name="amount"
                  value={paymentForm.amount}
                  onChange={handleFormChange}
                  required
                />
              </label>
              <label>
                Method
                <select name="method" value={paymentForm.method} onChange={handleFormChange}>
                  <option value="credit_card">Credit Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cash">Cash</option>
                </select>
              </label>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">Record Payment</button>
              <button type="button" className="btn-secondary" onClick={() => setSelectedPayment(null)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Payments;
