import React, { useState } from 'react';
import { TastyProvider, useTasty } from './context/TastyContext';
import { AuthProvider } from './context/AuthContext';
import { MileniaHeader } from './components/saas/MileniaHeader';
import { MileniaLandingView } from './components/saas/MileniaLandingView';
import { MileniaAlliesView } from './components/saas/MileniaAlliesView';
import { MileniaLoginView } from './components/saas/MileniaLoginView';
import { MileniaRegisterAllyView } from './components/saas/MileniaRegisterAllyView';
import { MileniaContactView } from './components/saas/MileniaContactView';
import { RestaurantHeader } from './components/restaurant/RestaurantHeader';
import { RestaurantHomeView } from './components/restaurant/RestaurantHomeView';
import { RestaurantServicesView } from './components/restaurant/RestaurantServicesView';
import { MenuExplorer } from './components/menu/MenuExplorer';
import { ReservationView } from './components/reservation/ReservationView';
import { OrderTrackerView } from './components/tracking/OrderTrackerView';
import { LocationsView } from './components/locations/LocationsView';
import { ReviewsView } from './components/reviews/ReviewsView';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { SuperAdminDashboard } from './components/saas/SuperAdminDashboard';
import { MileniaOwnerDashboard } from './components/saas/MileniaOwnerDashboard';
import { AllyManagerAccessPanel } from './components/saas/AllyManagerAccessPanel';
import { EmployeeDashboard } from './components/employee/EmployeeDashboard';
import { Footer } from './components/layout/Footer';
import { MobileNav } from './components/layout/MobileNav';
import { CartDrawer } from './components/cart/CartDrawer';
import { ItemCustomizeModal } from './components/menu/ItemCustomizeModal';
import { UpsellModal } from './components/menu/UpsellModal';
import { MileniaRewardsModal } from './components/rewards/MileniaRewardsModal';
import { CheckoutModal } from './components/checkout/CheckoutModal';
import { PwaInstallModal } from './components/pwa/PwaInstallModal';
import { PwaInstallBanner } from './components/pwa/PwaInstallBanner';
import { ToastContainer } from './components/ui/Toast';
import { motion, AnimatePresence } from 'motion/react';
import { ensureSolicitudesAfiliadosTableInitialized } from './services/solicitudesService';

const AppContent: React.FC = () => {
  const { 
    mode, 
    mileniaView, 
    tenantView, 
    currentView, 
    currentRoute,
    currentTenant,
    currentEmployeeId,
    setIsCartOpen 
  } = useTasty();
  
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  React.useEffect(() => {
    ensureSolicitudesAfiliadosTableInitialized();
    const handleOpenModal = () => setIsInstallModalOpen(true);
    window.addEventListener('open-pwa-modal', handleOpenModal);
    return () => window.removeEventListener('open-pwa-modal', handleOpenModal);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 antialiased transition-colors duration-300 pb-20 md:pb-0 w-full max-w-full overflow-x-clip">
      
      {/* 1. Header Selection based on App Mode */}
      {mode === 'milenia' ? (
        <MileniaHeader />
      ) : (
        <RestaurantHeader onOpenCart={() => setIsCartOpen(true)} />
      )}

      {/* 2. Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 overflow-hidden">
        
        {/* PWA Banner when in restaurant mode */}
        {mode === 'restaurant' && tenantView !== 'restaurant-empleados' && currentRoute.routeType !== 'ally_panel' && (
          <PwaInstallBanner onOpenModal={() => setIsInstallModalOpen(true)} />
        )}

        <AnimatePresence mode="wait">
          {currentRoute.routeType === 'ally_panel' || tenantView === 'restaurant-panel-gerente' || mileniaView === 'panel_gerente' ? (
            <motion.div
              key={`ally-panel-${currentRoute.restaurantId}-${currentRoute.cargo}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <AllyManagerAccessPanel />
            </motion.div>
          ) : currentRoute.routeType === 'tenant_admin' || (mode === 'restaurant' && tenantView === 'restaurant-admin') ? (
            <motion.div
              key={`tenant-admin-${currentTenant.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <AdminLayout />
            </motion.div>
          ) : currentRoute.routeType === 'employee_dashboard' || (mode === 'restaurant' && tenantView === 'restaurant-empleados') ? (
            <motion.div
              key={`tenant-emp-${currentTenant.id}-${currentEmployeeId}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <EmployeeDashboard />
            </motion.div>
          ) : mode === 'milenia' ? (
            <motion.div
              key={`milenia-${mileniaView}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {mileniaView === 'inicio' && <MileniaLandingView />}
              {mileniaView === 'aliados' && <MileniaAlliesView />}
              {mileniaView === 'registrar_aliado' && <MileniaRegisterAllyView />}
              {mileniaView === 'login' && <MileniaLoginView />}
              {mileniaView === 'contactos' && <MileniaContactView />}
              {(mileniaView === 'propietario' || mileniaView === 'superadmin') && <MileniaOwnerDashboard />}
            </motion.div>
          ) : (
            <motion.div
              key={`tenant-${tenantView}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {currentView === 'superadmin' ? (
                <MileniaOwnerDashboard />
              ) : (
                <>
                  {tenantView === 'restaurant-inicio' && <RestaurantHomeView />}
                  {tenantView === 'restaurant-servicios' && <RestaurantServicesView />}
                  {tenantView === 'restaurant-platos' && <MenuExplorer />}
                  {tenantView === 'restaurant-reservas' && <ReservationView />}
                  {tenantView === 'restaurant-domicilios' && <OrderTrackerView />}
                  {tenantView === 'restaurant-empleados' && <EmployeeDashboard />}
                  {tenantView === 'restaurant-admin' && <AdminLayout />}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 3. Footer */}
      {(mode === 'milenia' || tenantView !== 'restaurant-empleados') && <Footer />}

      {/* 4. Mobile Bottom Navigation (Restaurant Mode) */}
      {mode === 'restaurant' && tenantView !== 'restaurant-empleados' && (
        <MobileNav onOpenInstallModal={() => setIsInstallModalOpen(true)} />
      )}

      {/* 5. Modals & Overlays */}
      <CartDrawer />
      <ItemCustomizeModal />
      <UpsellModal />
      <MileniaRewardsModal />
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
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </TastyProvider>
  );
}
