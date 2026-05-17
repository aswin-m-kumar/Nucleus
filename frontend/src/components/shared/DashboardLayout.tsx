import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-[var(--n-bg)]">
      <Navbar />
      <main className="animate-fade-in">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
