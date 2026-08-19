import React, { useState } from 'react';
import { TastyProvider, useTasty } from './context/TastyContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { MobileNav } from './components/layout/MobileNav';
import { MenuExplorer } from './components/menu/MenuExplorer';
import { ReservationView } from './components/reservation/ReservationView';
import { OrderTrackerView } from './components/tracking/OrderTrackerView';
import { LocationsView } from './components/locations/LocationsView';
import { ReviewsView } from './components/reviews/ReviewsView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { CartDrawer } from './components/cart/CartDrawer';
import { ItemCustomizeModal } from './components/menu/ItemCustomizeModal';
import { CheckoutModal } from './components/checkout/CheckoutModal';
import { PwaInstallModal } from './components/pwa/PwaInstallModal';
import { PwaInstallBanner } from './components/pwa/PwaInstallBanner';
import { ToastContainer } from './components/ui/Toast';
import { motion, AnimatePresence } from 'motion/react';

const AppContent: React.FC = () => {
  const { currentView } = useTasty();
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 antialiased transition-colors duration-300 pb-20 md:pb-0">
      {/* Header */}
      <Header onOpenInstallModal={() => setIsInstallModalOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        
        {/* PWA Install Banner */}
        <PwaInstallBanner onOpenModal={() => setIsInstallModalOpen(true)} />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {currentView === 'menu' && <MenuExplorer />}
            {currentView === 'reservations' && <ReservationView />}
            {currentView === 'tracking' && <OrderTrackerView />}
            {currentView === 'locations' && <LocationsView />}
            {currentView === 'reviews' && <ReviewsView />}
            {currentView === 'admin' && <AdminDashboard />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile Bottom Navigation */}
      <MobileNav onOpenInstallModal={() => setIsInstallModalOpen(true)} />

      {/* Modals & Overlays */}
      <CartDrawer />
      <ItemCustomizeModal />
      <CheckoutModal />
      <PwaInstallModal 
        isOpen={isInstallModalOpen} 
        onClose={() => setIsInstallModalOpen(false)} 
      />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <TastyProvider>
      <AppContent />
    </TastyProvider>
  );
}
