import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './components/dashboard/DashboardPage';
import ModerationPage from './components/moderation/ModerationPage';
import PrivacyPage from './components/privacy/PrivacyPage';
import MainLayout from './components/layout/MainLayout';
import { initializeSync } from './utils/offline';

const App: React.FC = () => {
  useEffect(() => {
    initializeSync();
  }, []);

  return (
    <HashRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/moderation" element={<ModerationPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
        </Routes>
      </MainLayout>
    </HashRouter>
  );
};

export default App;