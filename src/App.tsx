/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import MainLayout from '@/components/MainLayout';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import Dashboard from '@/pages/Dashboard';
import Profile from '@/pages/Profile';
import Complaints from '@/pages/Complaints';
import Students from '@/pages/Students';
import Admins from '@/pages/Admins';
import Rooms from '@/pages/Rooms';
import Hostels from '@/pages/Hostels';
import Settings from '@/pages/Settings';
import Faculties from '@/pages/Faculties';
import Chapels from '@/pages/Chapels';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

export default function App() {
  return (
    <AuthProvider>
      <TooltipProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <MainLayout>
                  <Profile />
                </MainLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/complaints" element={
              <ProtectedRoute>
                <MainLayout>
                  <Complaints />
                </MainLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/students" element={
              <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                <MainLayout>
                  <Students />
                </MainLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/admins" element={
              <ProtectedRoute allowedRoles={['superadmin']}>
                <MainLayout>
                  <Admins />
                </MainLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/rooms" element={
              <ProtectedRoute>
                <MainLayout>
                  <Rooms />
                </MainLayout>
              </ProtectedRoute>
            } />

            <Route path="/hostels" element={
              <ProtectedRoute allowedRoles={['superadmin']}>
                <MainLayout>
                  <Hostels />
                </MainLayout>
              </ProtectedRoute>
            } />

            <Route path="/faculties" element={
              <ProtectedRoute allowedRoles={['superadmin']}>
                <MainLayout>
                  <Faculties />
                </MainLayout>
              </ProtectedRoute>
            } />

            <Route path="/chapels" element={
              <ProtectedRoute allowedRoles={['superadmin']}>
                <MainLayout>
                  <Chapels />
                </MainLayout>
              </ProtectedRoute>
            } />

            <Route path="/settings" element={
              <ProtectedRoute allowedRoles={['superadmin']}>
                <MainLayout>
                  <Settings />
                </MainLayout>
              </ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          <Toaster position="top-right" />
        </Router>
      </TooltipProvider>
    </AuthProvider>
  );
}
