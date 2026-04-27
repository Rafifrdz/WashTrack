import { useEffect, useState } from 'react';
import { CustomerView } from './views/CustomerView';
import { AdminView } from './views/AdminView';
import { LoginView } from './views/LoginView';

type Page = 'customer' | 'admin';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('customer');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const status = localStorage.getItem('isAdminLoggedIn') === 'true';
    setIsLoggedIn(status);
    setAuthReady(true);
  }, []);

  if (!authReady) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Page Content */}
      <main>
        {currentPage === 'customer' ? (
          <CustomerView onPageChange={setCurrentPage} />
        ) : (
          isLoggedIn ? (
            <AdminView onLogout={() => setIsLoggedIn(false)} onPageChange={setCurrentPage} />
          ) : (
            <LoginView onSuccess={() => setIsLoggedIn(true)} />
          )
        )}
      </main>
    </div>
  );
}
