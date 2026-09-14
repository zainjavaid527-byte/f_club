import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import Layout from '../components/layout/Layout';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';

import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Customers from '../pages/Customers';
import CustomerDetails from '../pages/CustomerDetails';
import ActiveSessions from '../pages/ActiveSessions';
import Billing from '../pages/Billing';
import Products from '../pages/Products';
import Udhaar from '../pages/Udhaar';
import SaleRecord from '../pages/Salerecord';


function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* Public route — no auth needed */}
          <Route path="/login" element={<Login />} />

          {/* Everything under Layout requires a logged-in user */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/customers/:id" element={<CustomerDetails />} />
            <Route path="/sessions" element={<ActiveSessions />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/products" element={<Products />} />
            <Route path="/udhaar" element={<Udhaar />} />

            {/* ✅ ab ye yahan aayega, Layout ke andar */}
            <Route path="/sale-record" element={<SaleRecord />} />

          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default AppRoutes;