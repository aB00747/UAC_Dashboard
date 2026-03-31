import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import AuthenticatedLayout from './layouts/AuthenticatedLayout';
import GuestLayout from './layouts/GuestLayout';
import { PageSpinner } from './components/ui/Spinner';

const Login = lazy(() => import('./pages/Auth/Login'));
const Register = lazy(() => import('./pages/Auth/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard/Index'));
const Customers = lazy(() => import('./pages/Customers/Index'));
const Inventory = lazy(() => import('./pages/Inventory/Index'));
const Orders = lazy(() => import('./pages/Orders/Index'));
const Pricing = lazy(() => import('./pages/Pricing/Index'));
const Deliveries = lazy(() => import('./pages/Deliveries/Index'));
const Messaging = lazy(() => import('./pages/Messaging/Index'));
const Reports = lazy(() => import('./pages/Reports/Index'));
const Documents = lazy(() => import('./pages/Documents/Index'));
const SettingsPage = lazy(() => import('./pages/Settings/Index'));
const UsersPage = lazy(() => import('./pages/Users/Index'));
const Profile = lazy(() => import('./pages/Profile/Index'));
const AIAssistant = lazy(() => import('./pages/AI/Index'));

export default function App() {
  return (
    <Suspense fallback={<PageSpinner />}>
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
    </Suspense>
  );
}
