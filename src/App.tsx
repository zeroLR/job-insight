import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Result } from './pages/Result';
import { ReportList } from './pages/ReportList';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider, RequireAuth } from './contexts/AuthContext';
import { MasterPasswordProvider } from './contexts/MasterPasswordContext';
import { AnalysisTaskProvider } from './contexts/AnalysisTaskContext';
import { Login } from './pages/Login';
import { SetupKey } from './pages/SetupKey';

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <MasterPasswordProvider>
            <AnalysisTaskProvider>
              <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
                <Navbar />
                <main className="max-w-5xl mx-auto px-4 py-8">
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route
                      path="/setup-key"
                      element={
                        <RequireAuth>
                          <SetupKey />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/"
                      element={
                        <RequireAuth requireApiKey>
                          <Home />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/report-list"
                      element={
                        <RequireAuth requireApiKey>
                          <ReportList />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/result/:id"
                      element={
                        <RequireAuth requireApiKey>
                          <Result />
                        </RequireAuth>
                      }
                    />
                  </Routes>
                </main>
              </div>
            </AnalysisTaskProvider>
          </MasterPasswordProvider>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
