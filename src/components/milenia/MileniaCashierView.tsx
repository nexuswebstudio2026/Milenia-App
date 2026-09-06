import React from 'react';
import { InvoiceRecord } from '../../types/milenia';
import { DollarSign, Receipt, CreditCard, Smartphone, CheckCheck, Printer, ArrowUpRight } from 'lucide-react';

interface MileniaCashierViewProps {
  invoices: InvoiceRecord[];
}

export const MileniaCashierView: React.FC<MileniaCashierViewProps> = ({ invoices }) => {
  const totalSales = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalTax = invoices.reduce((sum, inv) => sum + inv.tax, 0);
  const totalSubtotal = invoices.reduce((sum, inv) => sum + inv.subtotal, 0);

  const cashSales = invoices.filter(i => i.paymentMethod === 'Efectivo').reduce((sum, i) => sum + i.total, 0);
  const digitalSales = invoices.filter(i => i.paymentMethod === 'Nequi / Daviplata').reduce((sum, i) => sum + i.total, 0);
  const cardSales = invoices.filter(i => i.paymentMethod === 'Tarjeta / Datáfono').reduce((sum, i) => sum + i.total, 0);

  const handlePrintZReport = () => {
    alert(`📄 Reporte Z diario de Milenia generado para impresión fiscal.\nTotal Ventas: $${totalSales.toLocaleString('es-CO')}\nImpoconsumo 8%: $${totalTax.toLocaleString('es-CO')}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-amber-500" />
            <span>Caja & Facturación Electrónica DIAN</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Control de ingresos diarios, arqueo de caja y facturación con Impoconsumo 8%.
          </p>
        </div>

        <button
          onClick={handlePrintZReport}
          className="py-2 px-3 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Generar Reporte Z Diario</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Venta Total del Día</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
            ${totalSales.toLocaleString('es-CO')}
          </div>
          <div className="text-[11px] text-slate-400 font-medium">
            {invoices.length} facturas emitidas
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Impoconsumo (8% DIAN)</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 font-bold">Ley 2277</span>
          </div>
          <div className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400">
            ${totalTax.toLocaleString('es-CO')}
          </div>
          <div className="text-[11px] text-slate-400 font-medium">
            Base: ${totalSubtotal.toLocaleString('es-CO')}
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Efectivo en Caja</span>
            <DollarSign className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
            ${cashSales.toLocaleString('es-CO')}
          </div>
          <div className="text-[11px] text-slate-400 font-medium">
            Disponible para arqueo
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Billeteras & Tarjetas</span>
            <div className="flex gap-1">
              <Smartphone className="w-3.5 h-3.5 text-indigo-500" />
              <CreditCard className="w-3.5 h-3.5 text-blue-500" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-indigo-600 dark:text-indigo-400">
            ${(digitalSales + cardSales).toLocaleString('es-CO')}
          </div>
          <div className="text-[11px] text-slate-400 font-medium">
            Nequi: ${digitalSales.toLocaleString('es-CO')} | Datáfono: ${cardSales.toLocaleString('es-CO')}
          </div>
        </div>
      </div>

      {/* Invoice Records List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <span>Historial de Facturas del Turno</span>
          </h3>
          <span className="text-xs text-slate-500">{invoices.length} registros</span>
        </div>

        {invoices.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No se han registrado cobros en este turno todavía.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">N° Factura</th>
                  <th className="py-3 px-3">Mesa</th>
                  <th className="py-3 px-3">Hora</th>
                  <th className="py-3 px-3">Medio de Pago</th>
                  <th className="py-3 px-3 text-right">Impoconsumo 8%</th>
                  <th className="py-3 px-3 text-right">Total Cobrado</th>
                  <th className="py-3 px-3 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/50 transition">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                      {inv.id}
                    </td>
                    <td className="py-3 px-3 font-medium">
                      Mesa {inv.tableNumber}
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-mono">
                      {inv.timestamp}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-300">
                        {inv.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-500">
                      ${inv.tax.toLocaleString('es-CO')}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                      ${inv.total.toLocaleString('es-CO')}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCheck className="w-3.5 h-3.5" /> Pagada
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
