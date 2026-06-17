import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import VisitorLayout from "@/components/VisitorLayout";
import AdminLayout from "@/components/AdminLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import MaintenanceAlertModal from "@/components/MaintenanceAlertModal";

import HomePage from "@/pages/visitor/HomePage";
import ExhibitionsPage from "@/pages/visitor/ExhibitionsPage";
import CollectionsPage from "@/pages/visitor/CollectionsPage";
import GuidePage from "@/pages/visitor/GuidePage";
import AboutPage from "@/pages/visitor/AboutPage";
import BookingPage from "@/pages/visitor/BookingPage";
import BookingConfirmPage from "@/pages/visitor/BookingConfirmPage";
import BookingSuccessPage from "@/pages/visitor/BookingSuccessPage";
import MyBookingsPage from "@/pages/visitor/MyBookingsPage";

import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/admin/DashboardPage";
import CollectionPage from "@/pages/admin/CollectionPage";
import SchedulePage from "@/pages/admin/SchedulePage";
import StatisticsPage from "@/pages/admin/StatisticsPage";
import SettingsPage from "@/pages/admin/SettingsPage";
import TasksPage from "@/pages/TasksPage";

import { useAuthStore } from "@/store/authStore";

export default function App() {
  const { checkAuth, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Router>
      {isAuthenticated && user?.role === 'admin' && <MaintenanceAlertModal />}
      <Routes>
        <Route path="/" element={<Navigate to="/visitor" replace />} />
        <Route path="/login" element={<LoginPage />} />

        <Route path="/visitor" element={<VisitorLayout />}>
          <Route index element={<HomePage />} />
          <Route path="exhibitions" element={<ExhibitionsPage />} />
          <Route path="collections" element={<CollectionsPage />} />
          <Route path="guide" element={<GuidePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="booking" element={<BookingPage />} />
          <Route path="booking/confirm" element={<BookingConfirmPage />} />
          <Route path="booking/success" element={<BookingSuccessPage />} />
          <Route path="my-bookings" element={<MyBookingsPage />} />
        </Route>

        <Route path="/" element={<ProtectedRoute roles={['admin', 'restorer', 'security']} />}>
          <Route path="tasks" element={<TasksPage />} />
        </Route>

        <Route path="/" element={<ProtectedRoute roles={['admin']} />}>
          <Route element={<AdminLayout />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="collection" element={<CollectionPage />} />
            <Route path="schedule" element={<SchedulePage />} />
            <Route path="statistics" element={<StatisticsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/visitor" replace />} />
      </Routes>
    </Router>
  );
}
