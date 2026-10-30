import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DemoDataNotice } from './components/DemoDataNotice';
import { AicteCopilot } from './components/AicteCopilot';

// Import pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { MFAPage } from './pages/MFAPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { SuperAdminDashboard } from './pages/SuperAdminDashboard';
import { RegulationDashboard } from './pages/RegulationDashboard';
import { InstitutionDashboard } from './pages/InstitutionDashboard';
import { StudentDashboard } from './pages/StudentDashboard';
import { APAARVerifyPage } from './pages/APAARVerifyPage';
import { StudentRegistrationPage } from './pages/StudentRegistrationPage';
import { BulkUploadPage } from './pages/BulkUploadPage';
import { DuplicateDetectionPage } from './pages/DuplicateDetectionPage';
import { AdmissionCompliancePage } from './pages/AdmissionCompliancePage';
import { InstitutionManagementPage } from './pages/InstitutionManagementPage';
import { AnalyticsReportsPage } from './pages/AnalyticsReportsPage';
import { AuditLogPage } from './pages/AuditLogPage';
import { SecurityMonitoringPage } from './pages/SecurityMonitoringPage';
import { PrivacyCommandCenter } from './pages/PrivacyCommandCenter';
import { ApiIntegrationPage } from './pages/ApiIntegrationPage';
import { OfflineCenterPage } from './pages/OfflineCenterPage';
import { SettingsProfilePage } from './pages/SettingsProfilePage';
import { AiCommandCenterPage } from './pages/AiCommandCenterPage';
import { MultiAgentIntelligencePage } from './pages/MultiAgentIntelligencePage';
import { AcademicDigitalTwinPage } from './pages/AcademicDigitalTwinPage';
import { PredictiveAiPage } from './pages/PredictiveAiPage';

export const App: React.FC = () => {
  const { role } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>('landing');

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onNavigate={setCurrentPage} />;
      case 'login':
        return <LoginPage onNavigate={setCurrentPage} />;
      case 'mfa-verify':
        return <MFAPage onNavigate={setCurrentPage} />;
      case 'forgot-password':
        return <ForgotPasswordPage onNavigate={setCurrentPage} />;
      case 'super-admin':
        return <SuperAdminDashboard onNavigate={setCurrentPage} />;
      case 'ai-command-center':
        return <AiCommandCenterPage onNavigate={setCurrentPage} />;
      case 'multi-agent':
        return <MultiAgentIntelligencePage onNavigate={setCurrentPage} />;
      case 'digital-twin':
        return <AcademicDigitalTwinPage onNavigate={setCurrentPage} />;
      case 'predictive-ai':
        return <PredictiveAiPage onNavigate={setCurrentPage} />;
      case 'regulation-bureau':
        return <RegulationDashboard onNavigate={setCurrentPage} />;
      case 'institution-dashboard':
        return <InstitutionDashboard onNavigate={setCurrentPage} />;
      case 'student-dashboard':
        return <StudentDashboard onNavigate={setCurrentPage} />;
      case 'apaar-verify':
        return <APAARVerifyPage onNavigate={setCurrentPage} />;
      case 'student-registration':
        return <StudentRegistrationPage onNavigate={setCurrentPage} />;
      case 'bulk-upload':
        return <BulkUploadPage onNavigate={setCurrentPage} />;
      case 'duplicate-detection':
        return <DuplicateDetectionPage onNavigate={setCurrentPage} />;
      case 'admission-compliance':
        return <AdmissionCompliancePage onNavigate={setCurrentPage} />;
      case 'institution-management':
        return <InstitutionManagementPage onNavigate={setCurrentPage} />;
      case 'analytics-reports':
        return <AnalyticsReportsPage onNavigate={setCurrentPage} />;
      case 'audit-log':
        return <AuditLogPage onNavigate={setCurrentPage} />;
      case 'security-monitoring':
        return <SecurityMonitoringPage onNavigate={setCurrentPage} />;
      case 'privacy-command-center':
        return <PrivacyCommandCenter onNavigate={setCurrentPage} />;
      case 'api-integration':
        return <ApiIntegrationPage onNavigate={setCurrentPage} />;
      case 'offline-center':
        return <OfflineCenterPage onNavigate={setCurrentPage} />;
      case 'settings':
        return <SettingsProfilePage onNavigate={setCurrentPage} />;
      default:
        return <LandingPage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a192f] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      <DemoDataNotice />
      <Navbar onNavigate={setCurrentPage} currentPage={currentPage} />

      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Sidebar Navigation */}
        <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />

        {/* Main Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {renderPage()}
        </main>
      </div>

      {/* Floating Interactive AICTE Copilot Assistant */}
      <AicteCopilot onNavigate={setCurrentPage} />
    </div>
  );
};
export default App;
