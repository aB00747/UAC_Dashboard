import { Routes, Route } from 'react-router-dom';
import AuthenticatedLayout from './layouts/AuthenticatedLayout';
import GuestLayout from './layouts/GuestLayout';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Index';
import Customers from './pages/Customers/Index';
import Inventory from './pages/Inventory/Index';
import Orders from './pages/Orders/Index';
import Pricing from './pages/Pricing/Index';
import Deliveries from './pages/Deliveries/Index';
import Messaging from './pages/Messaging/Index';
import Reports from './pages/Reports/Index';
import Documents from './pages/Documents/Index';
import SettingsPage from './pages/Settings/Index';
import UsersPage from './pages/Users/Index';
import Profile from './pages/Profile/Index';
import AIAssistant from './pages/AI/Index';

export default function App() {
  return (
    <Routes>
      <Route element={<GuestLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
      <Route element={<AuthenticatedLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/ai" element={<AIAssistant />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/deliveries" element={<Deliveries />} />
        <Route path="/messaging" element={<Messaging />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
    </Routes>
  );
}
