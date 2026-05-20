import { Link, useLocation } from 'react-router-dom';
import { Building, Users, FileText, CreditCard, Wrench, Zap, BarChart3, LogOut } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ user, onLogout }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: BarChart3 },
    { path: '/properties', label: 'Properties', icon: Building },
    { path: '/tenants', label: 'Tenants', icon: Users },
    { path: '/leases', label: 'Leases', icon: FileText },
    { path: '/payments', label: 'Payments', icon: CreditCard },
    { path: '/maintenance', label: 'Maintenance', icon: Wrench },
    { path: '/utilities', label: 'Utilities', icon: Zap },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-header">
        <h1>LeaseManager</h1>
        <span className="user-info">Welcome, {user?.name}</span>
      </div>

      <ul className="navbar-menu">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`navbar-link ${location.pathname === item.path ? 'active' : ''}`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="navbar-footer">
        <button className="logout-btn" onClick={onLogout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;