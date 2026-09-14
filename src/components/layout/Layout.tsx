import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  PlayCircle,
  Receipt,
  Package,
  CreditCard,
  ClipboardList,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import '../../style/Layout.css';

const menuItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Customers', path: '/customers', icon: Users },
  { name: 'Active Sessions', path: '/sessions', icon: PlayCircle },
  { name: 'Billing', path: '/billing', icon: Receipt },
  { name: 'Products', path: '/products', icon: Package },
  { name: 'Udhaar', path: '/udhaar', icon: CreditCard },
  { name: 'Sale Record', path: '/sale-record', icon: ClipboardList },
];

function Layout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  // close the drawer automatically whenever the route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const activeItem = menuItems.find((item) =>
    location.pathname.startsWith(item.path)
  );

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="app-layout">
      {/* Mobile top bar */}
      <header className="mobile-topbar">
        <button
          type="button"
          className="menu-toggle"
          onClick={() => setIsMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
        <span className="mobile-topbar-title">
          {activeItem ? activeItem.name : 'Club POS'}
        </span>
      </header>

      {/* Backdrop for mobile drawer */}
      {isMobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside className={`sidebar ${isMobileOpen ? 'is-open' : ''}`}>
        <div className="logo">
          {/* Spinning 8-ball — pure CSS, no image asset needed */}
          <div className="logo-mark" aria-hidden="true">
            <span className="logo-mark-number">8</span>
          </div>
          <div className="logo-text">
            <h2>STONE CUE CLUB</h2>
            <span>Management System</span>
          </div>
          <button
            type="button"
            className="close-toggle"
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav>
          {menuItems.map((item, index) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                style={{ animationDelay: `${index * 0.05}s` }}
                className={({ isActive }) =>
                  isActive ? 'nav-link active' : 'nav-link'
                }
              >
                <Icon size={19} strokeWidth={2} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          {user && <span className="sidebar-user">{user.name}</span>}
          <button
            type="button"
            className="nav-link logout-btn"
            onClick={handleLogout}
          >
            <LogOut size={19} strokeWidth={2} />
            <span>Logout</span>
          </button>
          <span>v1.0 &middot; Club POS</span>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;