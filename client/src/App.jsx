import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import EmailVerificationPage from './pages/EmailVerificationPage';
import VerifyAccountPage from './pages/VerifyAccountPage';
import UserDashboardPage from './pages/UserDashboardPage';
import FindRidePage from './pages/FindRidePage';
import OfferRidePage from './pages/OfferRidePage';
import RideDetailPage from './pages/RideDetailPage';
import MyRidesPage from './pages/MyRidesPage';
import StudentVerificationPage from './pages/StudentVerificationPage';
import DriverVerificationPage from './pages/DriverVerificationPage';
import VehicleManagementPage from './pages/VehicleManagementPage';
import ProfilePage from './pages/ProfilePage';
import CommuteGroupsPage from './pages/CommuteGroupsPage';
import EnvironmentalImpactPage from './pages/EnvironmentalImpactPage';
import SafetyCenterPage from './pages/SafetyCenterPage';
import NotificationsPage from './pages/NotificationsPage';
import GoingNowPage from './pages/GoingNowPage';
import WalletPage from './pages/WalletPage';
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/verify-email" element={<EmailVerificationPage />} />
            <Route path="/verify-account" element={<VerifyAccountPage />} />
            <Route path="/dashboard" element={<UserDashboardPage />} />
            <Route path="/find-ride" element={<FindRidePage />} />
            <Route path="/offer-ride" element={<OfferRidePage />} />
            <Route path="/ride/:id" element={<RideDetailPage />} />
            <Route path="/my-rides" element={<MyRidesPage />} />
            <Route path="/verify-student" element={<StudentVerificationPage />} />
            <Route path="/verify-driver" element={<DriverVerificationPage />} />
            <Route path="/vehicles" element={<VehicleManagementPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/commute-groups" element={<CommuteGroupsPage />} />
            <Route path="/environmental-impact" element={<EnvironmentalImpactPage />} />
            <Route path="/safety" element={<SafetyCenterPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/going-now" element={<GoingNowPage />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
