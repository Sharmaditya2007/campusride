import React from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import CursorTrailEffect from '../components/common/CursorTrailEffect';
import LiveActivityTicker from '../components/common/LiveActivityTicker';
import ThemeGlowSwitcher from '../components/common/ThemeGlowSwitcher';

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#030712] text-slate-100 font-sans relative selection:bg-emerald-500 selection:text-white">
      <CursorTrailEffect />
      <LiveActivityTicker />
      <ThemeGlowSwitcher />
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
