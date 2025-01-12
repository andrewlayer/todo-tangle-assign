import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import Todos from '@/pages/Todos';
import Status from '@/pages/Status';
import Settings from '@/pages/Settings';
import TopNav from '@/components/TopNav';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-background">
          <TopNav />
          <main className="container mx-auto">
            <Routes>
              <Route path="/" element={<Status />} />
              <Route path="/todos" element={<Todos />} />
              <Route path="/status" element={<Status />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;