import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Result } from './pages/Result';
import { ReportList } from './pages/ReportList';
import { ToastProvider } from './contexts/ToastContext';

function App() {
  return (
    <Router>
      <ToastProvider>
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
          <Navbar />
          <main className="max-w-5xl mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/report-list" element={<ReportList />} />
              <Route path="/result/:id" element={<Result />} />
            </Routes>
          </main>
        </div>
      </ToastProvider>
    </Router>
  );
}

export default App;
