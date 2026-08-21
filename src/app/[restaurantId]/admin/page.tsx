import React, { useEffect } from 'react';
import { useTasty } from '../../../context/TastyContext';
import { useStore } from '../../../store/useStore';
import { AdminLayout } from '../../../components/admin/AdminLayout';

interface AdminPageProps {
  params?: {
    restaurantId: string;
  };
}

/**
 * Next.js App Router Page: app/[restaurantId]/admin/page.tsx
 * Comprehensive Colombia Admin Dashboard (Sales, Inventory, Payroll, DIAN)
 */
export default function RestaurantAdminPage({ params }: AdminPageProps) {
  const { currentTenant, switchTenant } = useTasty();
  const { setRestaurantId } = useStore();

  const rId = params?.restaurantId || currentTenant.id;

  useEffect(() => {
    if (rId && rId !== currentTenant.id) {
      switchTenant(rId);
      setRestaurantId(rId);
    }
  }, [rId]);

  return <AdminLayout />;
}

export { RestaurantAdminPage };
