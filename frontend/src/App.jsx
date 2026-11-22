import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FavoriteProvider } from './context/FavoriteContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { AppRoutes } from './routes/AppRoutes';
import ScrollToTop from './components/common/ScrollToTop';
import { ErrorBoundary } from './components/common/ErrorBoundary';

export function App() {
  return (
    <Router>
      <AuthProvider>
        <FavoriteProvider>
          <ScrollToTop />
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <ErrorBoundary>
                <AppRoutes />
              </ErrorBoundary>
            </main>
            <Footer />
          </div>
        </FavoriteProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
