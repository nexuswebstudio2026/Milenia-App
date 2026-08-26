import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Database,
  Plus,
  Search,
  Trash2,
  Edit,
  Eye,
  RefreshCw,
  Download,
  Code,
  Table,
  Check,
  X,
  AlertTriangle,
  Folder,
  Calendar,
  Clock,
  CreditCard,
  ShoppingBag,
  UtensilsCrossed,
  Users,
  Building2,
  Receipt,
  Sliders,
  Briefcase,
  Calculator,
  Store,
  Copy,
  Layers,
  ChevronRight
} from 'lucide-react';
import {
  FIRESTORE_TABLES,
  FirestoreTableMeta,
  FirestoreDocumentRecord,
  getCollectionDocuments,
  createDocument,
  updateDocument,
  deleteDocument
} from '../../services/firestoreDatabaseService';

interface FirestoreDatabaseManagerProps {
  showToast: (title: string, message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

export const FirestoreDatabaseManager: React.FC<FirestoreDatabaseManagerProps> = ({ showToast }) => {
  // Collection Selection
  const [selectedTableId, setSelectedTableId] = useState<string>('aliados');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [customCollectionName, setCustomCollectionName] = useState<string>('');
  const [isCustomCollectionActive, setIsCustomCollectionActive] = useState<boolean>(false);

  // Documents State
  const [documents, setDocuments] = useState<FirestoreDocumentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [copiedDocId, setCopiedDocId] = useState<string | null>(null);

  // Table Document Counts Cache
  const [tableCounts, setTableCounts] = useState<Record<string, number>>({});

  // Modals State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Selected Document for Operations
  const [activeDoc, setActiveDoc] = useState<FirestoreDocumentRecord | null>(null);

  // Form State for Create / Edit
  const [formDocId, setFormDocId] = useState<string>('');
  const [formAutoId, setFormAutoId] = useState<boolean>(true);
  const [formFields, setFormFields] = useState<Array<{ key: string; value: string; type: 'string' | 'number' | 'boolean' | 'json' }>>([]);
  const [formJsonMode, setFormJsonMode] = useState<boolean>(false);
  const [formJsonString, setFormJsonString] = useState<string>('{}');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Current active collection name
  const currentCollectionName = isCustomCollectionActive 
    ? (customCollectionName.trim() || 'aliados')
    : selectedTableId;

  // Current table metadata
  const currentTableMeta: FirestoreTableMeta | undefined = useMemo(() => {
    return FIRESTORE_TABLES.find(t => t.id === currentCollectionName);
  }, [currentCollectionName]);

  // Load documents for active collection
  const loadDocuments = useCallback(async (colName: string) => {
    if (!colName) return;
    setLoading(true);
    try {
      const docs = await getCollectionDocuments(colName);
      setDocuments(docs);
      setTableCounts(prev => ({ ...prev, [colName]: docs.length }));
    } catch (err: any) {
      console.error('Error cargando documentos:', err);
      showToast(
        'Error al Cargar Datos',
        `No se pudieron leer los documentos de la colección "${colName}": ${err?.message || 'Error de conexión'}`,
        'error'
      );
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Initial load & when collection changes
  useEffect(() => {
    loadDocuments(currentCollectionName);
  }, [currentCollectionName, loadDocuments]);

  // Filtered tables by category
  const filteredTables = useMemo(() => {
    if (categoryFilter === 'all') return FIRESTORE_TABLES;
    return FIRESTORE_TABLES.filter(t => t.category === categoryFilter);
  }, [categoryFilter]);

  // Filtered documents by search query
  const filteredDocuments = useMemo(() => {
    if (!searchQuery.trim()) return documents;
    const queryLower = searchQuery.toLowerCase().trim();

    return documents.filter(docRecord => {
      if (docRecord.id.toLowerCase().includes(queryLower)) return true;
      const strData = JSON.stringify(docRecord.data).toLowerCase();
      return strData.includes(queryLower);
    });
  }, [documents, searchQuery]);

  // Dynamic Column Extraction for Table View
  const dynamicColumns = useMemo(() => {
    if (documents.length === 0) return ['id'];
    const keysSet = new Set<string>();
    
    // Scan up to 50 docs for common keys
    const sample = documents.slice(0, 50);
    sample.forEach(d => {
      Object.keys(d.data || {}).forEach(k => {
        if (!k.startsWith('_')) {
          keysSet.add(k);
        }
      });
    });

    const keysArray = Array.from(keysSet);
    // Prioritize high-value columns
    const priorityOrder = ['name', 'titulo', 'title', 'email', 'status', 'type', 'plan', 'ingresos', 'gastos', 'balanceNeto', 'totalCop', 'total', 'amountCop', 'price', 'city', 'phone', 'nit', 'orderNumber', 'invoiceNumber', 'restaurantId', 'role', 'date', 'createdAt', 'updatedAt'];
    
    keysArray.sort((a, b) => {
      const idxA = priorityOrder.indexOf(a);
      const idxB = priorityOrder.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });

    // Max 7 columns for UI layout cleanly
    return ['id', ...keysArray.slice(0, 7)];
  }, [documents]);

  // RENDER VALUE HELPER
  const renderCellValue = (val: any) => {
    if (val === null || val === undefined) {
      return <span className="text-slate-600 italic">null</span>;
    }
    if (typeof val === 'boolean') {
      return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
          val ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'
        }`}>
          {val ? 'TRUE' : 'FALSE'}
        </span>
      );
    }
    if (typeof val === 'number') {
      // Check if it looks like COP currency
      if (val >= 1000) {
        return <span className="font-mono text-emerald-400 font-bold">${val.toLocaleString('es-CO')}</span>;
      }
      return <span className="font-mono text-amber-300">{val}</span>;
    }
    if (typeof val === 'object') {
      if (Array.isArray(val)) {
        return <span className="font-mono text-cyan-400 text-[11px]">[{val.length} elementos]</span>;
      }
      return <span className="font-mono text-purple-400 text-[11px]">{'{ ... }'}</span>;
    }
    const strVal = String(val);
    if (strVal.length > 40) {
      return <span title={strVal} className="truncate max-w-[200px] inline-block">{strVal.slice(0, 40)}...</span>;
    }
    return <span>{strVal}</span>;
  };

  // ICON SELECTOR HELPER
  const getTableIcon = (iconName: string) => {
    switch (iconName) {
      case 'Building2': return <Building2 className="w-4 h-4" />;
      case 'Calculator': return <Calculator className="w-4 h-4" />;
      case 'Receipt': return <Receipt className="w-4 h-4" />;
      case 'Users': return <Users className="w-4 h-4" />;
      case 'UtensilsCrossed': return <UtensilsCrossed className="w-4 h-4" />;
      case 'ShoppingBag': return <ShoppingBag className="w-4 h-4" />;
      case 'CreditCard': return <CreditCard className="w-4 h-4" />;
      case 'Clock': return <Clock className="w-4 h-4" />;
      case 'Calendar': return <Calendar className="w-4 h-4" />;
      case 'Briefcase': return <Briefcase className="w-4 h-4" />;
      case 'Sliders': return <Sliders className="w-4 h-4" />;
      case 'Store': return <Store className="w-4 h-4" />;
      case 'Layers': return <Layers className="w-4 h-4" />;
      default: return <Folder className="w-4 h-4" />;
    }
  };

  // =========================================================================
  // CRUD ACTIONS
  // =========================================================================

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setFormAutoId(true);
    setFormDocId('');
    setJsonError(null);
    setFormJsonMode(false);

    // Initial fields from template
    const template = currentTableMeta?.defaultTemplate || {
      name: 'Nuevo Registro',
      createdAt: new Date().toISOString()
    };

    const initialFields = Object.entries(template).map(([k, v]) => {
      let type: 'string' | 'number' | 'boolean' | 'json' = 'string';
      if (typeof v === 'number') type = 'number';
      else if (typeof v === 'boolean') type = 'boolean';
      else if (typeof v === 'object') type = 'json';

      return {
        key: k,
        value: typeof v === 'object' ? JSON.stringify(v) : String(v),
        type
      };
    });

    setFormFields(initialFields);
    setFormJsonString(JSON.stringify(template, null, 2));
    setIsCreateModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (docRecord: FirestoreDocumentRecord) => {
    setActiveDoc(docRecord);
    setFormDocId(docRecord.id);
    setFormAutoId(false);
    setJsonError(null);
    setFormJsonMode(false);

    const fields = Object.entries(docRecord.data || {}).map(([k, v]) => {
      let type: 'string' | 'number' | 'boolean' | 'json' = 'string';
      if (typeof v === 'number') type = 'number';
      else if (typeof v === 'boolean') type = 'boolean';
      else if (typeof v === 'object') type = 'json';

      return {
        key: k,
        value: typeof v === 'object' ? JSON.stringify(v) : String(v),
        type
      };
    });

    setFormFields(fields);
    setFormJsonString(JSON.stringify(docRecord.data || {}, null, 2));
    setIsEditModalOpen(true);
  };

  // Open View Modal
  const handleOpenViewModal = (docRecord: FirestoreDocumentRecord) => {
    setActiveDoc(docRecord);
    setIsViewModalOpen(true);
  };

  // Open Delete Modal
  const handleOpenDeleteModal = (docRecord: FirestoreDocumentRecord) => {
    setActiveDoc(docRecord);
    setIsDeleteModalOpen(true);
  };

  // Build Payload from form fields
  const buildPayloadFromFields = (): Record<string, any> => {
    if (formJsonMode) {
      try {
        return JSON.parse(formJsonString);
      } catch (err: any) {
        throw new Error(`Sintaxis JSON inválida: ${err.message}`);
      }
    }

    const payload: Record<string, any> = {};
    for (const f of formFields) {
      if (!f.key.trim()) continue;
      const cleanKey = f.key.trim();

      if (f.type === 'number') {
        const num = Number(f.value);
        payload[cleanKey] = isNaN(num) ? 0 : num;
      } else if (f.type === 'boolean') {
        payload[cleanKey] = f.value === 'true' || f.value === '1';
      } else if (f.type === 'json') {
        try {
          payload[cleanKey] = JSON.parse(f.value);
        } catch (_) {
          payload[cleanKey] = f.value;
        }
      } else {
        payload[cleanKey] = f.value;
      }
    }
    return payload;
  };

  // Save Create Document
  const handleSaveCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setJsonError(null);

    try {
      const payload = buildPayloadFromFields();
      const customId = formAutoId ? undefined : formDocId.trim();

      const created = await createDocument(currentCollectionName, payload, customId);
      
      showToast(
        'Documento Creado',
        `Se creó el documento ID: "${created.id}" en la colección "${currentCollectionName}".`,
        'success'
      );
      
      setIsCreateModalOpen(false);
      await loadDocuments(currentCollectionName);
    } catch (err: any) {
      console.error('Error al crear documento:', err);
      setJsonError(err?.message || 'Error al crear documento en Firestore');
      showToast('Error al Crear', err?.message || 'No se pudo crear el documento.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Save Edit Document
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDoc) return;
    setSubmitting(true);
    setJsonError(null);

    try {
      const payload = buildPayloadFromFields();
      await updateDocument(currentCollectionName, activeDoc.id, payload);

      showToast(
        'Documento Actualizado',
        `Se guardaron los cambios en el documento ID: "${activeDoc.id}" de la tabla "${currentCollectionName}".`,
        'success'
      );

      setIsEditModalOpen(false);
      await loadDocuments(currentCollectionName);
    } catch (err: any) {
      console.error('Error al actualizar documento:', err);
      setJsonError(err?.message || 'Error al actualizar documento');
      showToast('Error al Guardar', err?.message || 'No se pudo actualizar el documento.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Confirm Delete Document
  const handleConfirmDelete = async () => {
    if (!activeDoc) return;
    setSubmitting(true);

    try {
      await deleteDocument(currentCollectionName, activeDoc.id);
      showToast(
        'Documento Eliminado',
        `Se borró permanentemente el documento ID: "${activeDoc.id}" de "${currentCollectionName}".`,
        'info'
      );
      setIsDeleteModalOpen(false);
      setActiveDoc(null);
      await loadDocuments(currentCollectionName);
    } catch (err: any) {
      console.error('Error al eliminar documento:', err);
      showToast('Error al Eliminar', err?.message || 'No se pudo eliminar el documento.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Add field to form
  const handleAddField = () => {
    setFormFields(prev => [...prev, { key: '', value: '', type: 'string' }]);
  };

  // Remove field from form
  const handleRemoveField = (index: number) => {
    setFormFields(prev => prev.filter((_, i) => i !== index));
  };

  // Update field in form
  const handleUpdateField = (index: number, updates: Partial<{ key: string; value: string; type: 'string' | 'number' | 'boolean' | 'json' }>) => {
    setFormFields(prev => prev.map((f, i) => i === index ? { ...f, ...updates } : f));
  };

  // Copy JSON to Clipboard
  const handleCopyJson = (data: any, id: string) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedDocId(id);
    setTimeout(() => setCopiedDocId(null), 2000);
    showToast('Copiado', `Datos del documento "${id}" copiados al portapapeles.`, 'info');
  };

  // Export Collection as JSON
  const handleExportCollection = () => {
    const exportData = documents.map(d => ({
      _id: d.id,
      ...d.data
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `firestore_${currentCollectionName}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Exportación Completa', `Se descargó la colección "${currentCollectionName}" (${documents.length} documentos).`, 'success');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Database Connection Status & Overview */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-300 text-xs font-mono font-bold">
              <Database className="w-3.5 h-3.5 text-amber-400" />
              <span>GESTOR DE BASE DE DATOS FIREBASE FIRESTORE</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span>Control de Tablas y CRUD Completo</span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Explora, lee, crea, actualiza y elimina datos directamente en las colecciones de Firestore. Acceso con sincronización en tiempo real.
            </p>
          </div>

          {/* Quick Actions & DB Metrics */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <div className="text-left">
                <span className="text-[10px] font-mono uppercase text-slate-500 block">Base de Datos</span>
                <span className="text-xs font-mono font-bold text-slate-200">ai-studio-tastyigniterrest</span>
              </div>
            </div>

            <button
              onClick={() => loadDocuments(currentCollectionName)}
              disabled={loading}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              title="Recargar datos de Firestore"
            >
              <RefreshCw className={`w-4 h-4 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Cargando...' : 'Recargar'}</span>
            </button>

            <button
              onClick={handleExportCollection}
              disabled={documents.length === 0}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer disabled:opacity-40"
              title="Exportar colección completa a JSON"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Exportar JSON</span>
            </button>

            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs rounded-2xl transition flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Crear Documento</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main Grid: Collections Sidebar (Left) & Document Explorer (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ========================================================================= */}
        {/* LEFT 4 COLS: COLECCIONES / TABLAS SELECTOR */}
        {/* ========================================================================= */}
        <div className="lg:col-span-4 space-y-4">
          
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-amber-400" />
                  <span>Colecciones Firestore</span>
                </h3>
                <p className="text-[11px] text-slate-400">Selecciona la tabla que deseas administrar</p>
              </div>
              <span className="px-2 py-0.5 bg-slate-800 rounded-full text-[10px] font-mono text-amber-400 font-bold border border-slate-700">
                {FIRESTORE_TABLES.length} Tablas
              </span>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                { id: 'all', label: 'Todas' },
                { id: 'saas', label: 'SaaS / Finanzas' },
                { id: 'operativo', label: 'Operaciones' },
                { id: 'core', label: 'Usuarios' },
                { id: 'sistema', label: 'Sistema' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-xl transition cursor-pointer ${
                    categoryFilter === cat.id
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Custom Collection Input */}
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">
                Explorar Colección Personalizada
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="ej. promociones, pagos, etc."
                  value={customCollectionName}
                  onChange={(e) => setCustomCollectionName(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono"
                />
                <button
                  onClick={() => {
                    if (customCollectionName.trim()) {
                      setIsCustomCollectionActive(true);
                      setSelectedTableId('');
                    }
                  }}
                  disabled={!customCollectionName.trim()}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold rounded-xl transition disabled:opacity-40 cursor-pointer"
                >
                  Abrir
                </button>
              </div>
            </div>

            {/* List of Predefined Collections */}
            <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
              {filteredTables.map(table => {
                const isSelected = !isCustomCollectionActive && selectedTableId === table.id;
                const count = tableCounts[table.id] ?? (isSelected ? documents.length : null);

                return (
                  <button
                    key={table.id}
                    onClick={() => {
                      setIsCustomCollectionActive(false);
                      setSelectedTableId(table.id);
                    }}
                    className={`w-full text-left p-3 rounded-2xl transition-all cursor-pointer flex items-center justify-between border ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/10 border-amber-500/40 text-amber-300 shadow-md'
                        : 'bg-slate-950/60 hover:bg-slate-800/60 border-slate-800/80 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {getTableIcon(table.icon)}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold truncate flex items-center gap-1.5">
                          <span>{table.name}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 block truncate">
                          /{table.id}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {count !== null && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          isSelected ? 'bg-amber-500/30 text-amber-200' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {count}
                        </span>
                      )}
                      <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-slate-600'}`} />
                    </div>
                  </button>
                );
              })}
            </div>

          </div>

        </div>

        {/* ========================================================================= */}
        {/* RIGHT 8 COLS: TABLA Y EXPLORADOR DE DOCUMENTOS */}
        {/* ========================================================================= */}
        <div className="lg:col-span-8 space-y-4">
          
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xl">
            
            {/* Header of Active Collection */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>{currentTableMeta?.name || currentCollectionName}</span>
                      <span className="px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-amber-400 text-[11px] font-mono">
                        /{currentCollectionName}
                      </span>
                    </h3>
                  </div>
                </div>
                <p className="text-xs text-slate-400">
                  {currentTableMeta?.description || `Colección personalizada de Firestore con ${documents.length} registros.`}
                </p>
              </div>

              {/* View Switcher & Document Counter */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-950 rounded-xl p-1 border border-slate-800">
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-1.5 rounded-lg transition cursor-pointer ${
                      viewMode === 'table' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                    title="Vista Tabla"
                  >
                    <Table className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`p-1.5 rounded-lg transition cursor-pointer ${
                      viewMode === 'cards' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                    title="Vista JSON / Tarjetas"
                  >
                    <Code className="w-4 h-4" />
                  </button>
                </div>

                <div className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono">
                  <span className="text-slate-400">Total: </span>
                  <span className="font-bold text-amber-400">{filteredDocuments.length}</span>
                  {filteredDocuments.length !== documents.length && (
                    <span className="text-slate-500"> / {documents.length}</span>
                  )}
                </div>
              </div>

            </div>

            {/* Search & Filter Controls */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={`Buscar en /${currentCollectionName} por ID o contenido...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-sans"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <button
                onClick={handleOpenCreateModal}
                className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 rounded-2xl text-xs font-black transition flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Nuevo Registro</span>
              </button>
            </div>

            {/* Document Content View */}
            {loading ? (
              <div className="py-20 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
                <p className="text-xs font-mono text-slate-400">Consultando Firestore en tiempo real...</p>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="py-16 text-center bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-3 px-4">
                <Database className="w-10 h-10 text-slate-600 mx-auto" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-200">
                    {documents.length === 0 
                      ? `La colección "/${currentCollectionName}" está vacía en Firestore` 
                      : 'No se encontraron documentos que coincidan con la búsqueda'}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    {documents.length === 0 
                      ? 'Puedes agregar el primer documento manualmente utilizando el botón "Nuevo Registro".' 
                      : 'Prueba con otros términos de búsqueda o borra el filtro actual.'}
                  </p>
                </div>
                {documents.length === 0 && (
                  <button
                    onClick={handleOpenCreateModal}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-slate-950 text-xs font-black rounded-xl hover:bg-amber-400 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Crear Primer Documento</span>
                  </button>
                )}
              </div>
            ) : viewMode === 'table' ? (
              
              /* ========================================================================= */
              /* TABLE VIEW */
              /* ========================================================================= */
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                    <tr>
                      {dynamicColumns.map(col => (
                        <th key={col} className="py-3 px-3.5 font-bold whitespace-nowrap">
                          {col === 'id' ? 'ID DOCUMENTO' : col}
                        </th>
                      ))}
                      <th className="py-3 px-3.5 font-bold text-right whitespace-nowrap">ACCIONES CRUD</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {filteredDocuments.map(docRecord => (
                      <tr key={docRecord.id} className="hover:bg-slate-900/50 transition">
                        
                        {/* ID Column */}
                        <td className="py-3 px-3.5 font-mono text-amber-400 font-bold whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span title={docRecord.id} className="max-w-[140px] truncate block">
                              {docRecord.id}
                            </span>
                            <button
                              onClick={() => handleCopyJson(docRecord.data, docRecord.id)}
                              className="text-slate-500 hover:text-amber-300 cursor-pointer"
                              title="Copiar ID"
                            >
                              {copiedDocId === docRecord.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </td>

                        {/* Dynamic Property Columns */}
                        {dynamicColumns.filter(c => c !== 'id').map(col => {
                          const cellVal = docRecord.data?.[col];
                          return (
                            <td key={col} className="py-3 px-3.5 text-slate-300 whitespace-nowrap">
                              {renderCellValue(cellVal)}
                            </td>
                          );
                        })}

                        {/* Actions Column (CRUD buttons) */}
                        <td className="py-3 px-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            
                            {/* View / Inspector */}
                            <button
                              onClick={() => handleOpenViewModal(docRecord)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                              title="Inspeccionar Documento"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => handleOpenEditModal(docRecord)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-400 transition cursor-pointer"
                              title="Editar Documento"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleOpenDeleteModal(docRecord)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                              title="Eliminar de Firestore"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                          </div>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            ) : (
              
              /* ========================================================================= */
              /* JSON / CARDS VIEW */
              /* ========================================================================= */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDocuments.map(docRecord => (
                  <div 
                    key={docRecord.id} 
                    className="p-4 bg-slate-950 rounded-2xl border border-slate-800 hover:border-slate-700 transition space-y-3 shadow-lg flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono uppercase text-slate-500">ID:</span>
                          <span className="text-xs font-mono font-bold text-amber-400 truncate max-w-[180px]" title={docRecord.id}>
                            {docRecord.id}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleCopyJson(docRecord.data, docRecord.id)}
                            className="p-1 text-slate-400 hover:text-white"
                            title="Copiar JSON"
                          >
                            {copiedDocId === docRecord.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(docRecord)}
                            className="p-1 text-slate-400 hover:text-amber-400"
                            title="Editar"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteModal(docRecord)}
                            className="p-1 text-slate-400 hover:text-rose-400"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Code Block Snippet */}
                      <pre className="text-[11px] font-mono text-emerald-400/90 bg-slate-900 p-3 rounded-xl overflow-x-auto max-h-48 scrollbar-thin">
                        {JSON.stringify(docRecord.data, null, 2)}
                      </pre>
                    </div>

                    <div className="pt-2 border-t border-slate-900 flex justify-between items-center text-[10px] font-mono text-slate-500">
                      <span>Colección: /{currentCollectionName}</span>
                      <button
                        onClick={() => handleOpenViewModal(docRecord)}
                        className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Ver Detalle</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            )}

          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL: CREAR DOCUMENTO (CREATE) */}
      {/* ========================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5 stroke-[3]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Crear Documento en Firestore
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Colección: <span className="text-amber-400 font-bold">/{currentCollectionName}</span>
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-500 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher & ID Setup */}
            <div className="space-y-3 shrink-0">
              
              {/* Document ID Configuration */}
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-400 font-mono uppercase text-[10px] font-bold">
                    Identificador del Documento (ID)
                  </label>
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                      <input
                        type="checkbox"
                        checked={formAutoId}
                        onChange={(e) => setFormAutoId(e.target.checked)}
                        className="rounded border-slate-700 text-amber-500 focus:ring-0"
                      />
                      <span>Autogenerado por Firestore</span>
                    </label>
                  </div>
                </div>

                {!formAutoId && (
                  <input
                    type="text"
                    required
                    placeholder="ej. mi_documento_123, rest_001, etc."
                    value={formDocId}
                    onChange={(e) => setFormDocId(e.target.value)}
                    className="w-full bg-slate-900 border border-amber-500/40 rounded-xl px-3 py-2 text-amber-300 font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                )}
              </div>

              {/* Editor Mode Tabs */}
              <div className="flex items-center justify-between">
                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      if (formJsonMode) {
                        try {
                          const parsed = JSON.parse(formJsonString);
                          const fields = Object.entries(parsed).map(([k, v]) => ({
                            key: k,
                            value: typeof v === 'object' ? JSON.stringify(v) : String(v),
                            type: (typeof v === 'number' ? 'number' : typeof v === 'boolean' ? 'boolean' : typeof v === 'object' ? 'json' : 'string') as any
                          }));
                          setFormFields(fields);
                          setJsonError(null);
                        } catch (err: any) {
                          setJsonError(`JSON inválido para convertir a campos: ${err.message}`);
                          return;
                        }
                      }
                      setFormJsonMode(false);
                    }}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                      !formJsonMode ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Formulario Dinámico
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        const payload = buildPayloadFromFields();
                        setFormJsonString(JSON.stringify(payload, null, 2));
                        setJsonError(null);
                      } catch (_) {}
                      setFormJsonMode(true);
                    }}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                      formJsonMode ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Editor JSON Directo
                  </button>
                </div>

                {!formJsonMode && (
                  <button
                    type="button"
                    onClick={handleAddField}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar Campo</span>
                  </button>
                )}
              </div>

            </div>

            {/* Error Message if any */}
            {jsonError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{jsonError}</span>
              </div>
            )}

            {/* Form Fields / JSON Editor Body */}
            <form id="createDocForm" onSubmit={handleSaveCreate} className="overflow-y-auto pr-1 flex-1 space-y-3">
              
              {formJsonMode ? (
                <div className="space-y-1">
                  <textarea
                    rows={12}
                    value={formJsonString}
                    onChange={(e) => {
                      setFormJsonString(e.target.value);
                      try {
                        JSON.parse(e.target.value);
                        setJsonError(null);
                      } catch (err: any) {
                        setJsonError(err.message);
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-emerald-400 focus:outline-none focus:border-amber-500 resize-none leading-relaxed"
                  />
                  <span className="text-[10px] font-mono text-slate-500 block">
                    Formato estándar JSON objeto válido.
                  </span>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {formFields.map((field, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2.5 bg-slate-950 rounded-2xl border border-slate-800">
                      
                      {/* Field Key */}
                      <input
                        type="text"
                        placeholder="Clave (key)"
                        value={field.key}
                        onChange={(e) => handleUpdateField(idx, { key: e.target.value })}
                        className="w-1/3 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-amber-300 font-mono focus:outline-none focus:border-amber-500"
                      />

                      {/* Type Selector */}
                      <select
                        value={field.type}
                        onChange={(e) => handleUpdateField(idx, { type: e.target.value as any })}
                        className="bg-slate-900 border border-slate-800 rounded-xl px-2 py-1.5 text-[11px] text-slate-300 font-mono focus:outline-none"
                      >
                        <option value="string">Texto (string)</option>
                        <option value="number">Número (number)</option>
                        <option value="boolean">Booleano (boolean)</option>
                        <option value="json">JSON (objeto/array)</option>
                      </select>

                      {/* Field Value */}
                      {field.type === 'boolean' ? (
                        <select
                          value={field.value}
                          onChange={(e) => handleUpdateField(idx, { value: e.target.value })}
                          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none"
                        >
                          <option value="true">true</option>
                          <option value="false">false</option>
                        </select>
                      ) : (
                        <input
                          type={field.type === 'number' ? 'number' : 'text'}
                          placeholder="Valor"
                          value={field.value}
                          onChange={(e) => handleUpdateField(idx, { value: e.target.value })}
                          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                        />
                      )}

                      {/* Remove Field Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveField(idx)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                        title="Quitar campo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                    </div>
                  ))}
                </div>
              )}

            </form>

            {/* Footer Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="createDocForm"
                disabled={submitting}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 text-xs font-black rounded-xl transition shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Guardando...' : 'Crear en Firestore'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDITAR DOCUMENTO (UPDATE) */}
      {/* ========================================================================= */}
      {isEditModalOpen && activeDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center font-bold">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Modificar Documento
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Colección: <span className="text-amber-400 font-bold">/{currentCollectionName}</span> &bull; ID: <span className="text-slate-200 font-bold">{activeDoc.id}</span>
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-500 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center justify-between shrink-0">
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    if (formJsonMode) {
                      try {
                        const parsed = JSON.parse(formJsonString);
                        const fields = Object.entries(parsed).map(([k, v]) => ({
                          key: k,
                          value: typeof v === 'object' ? JSON.stringify(v) : String(v),
                          type: (typeof v === 'number' ? 'number' : typeof v === 'boolean' ? 'boolean' : typeof v === 'object' ? 'json' : 'string') as any
                        }));
                        setFormFields(fields);
                        setJsonError(null);
                      } catch (err: any) {
                        setJsonError(`JSON inválido: ${err.message}`);
                        return;
                      }
                    }
                    setFormJsonMode(false);
                  }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                    !formJsonMode ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Formulario Dinámico
                </button>
                <button
                  type="button"
                  onClick={() => {
                    try {
                      const payload = buildPayloadFromFields();
                      setFormJsonString(JSON.stringify(payload, null, 2));
                      setJsonError(null);
                    } catch (_) {}
                    setFormJsonMode(true);
                  }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                    formJsonMode ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Editor JSON Directo
                </button>
              </div>

              {!formJsonMode && (
                <button
                  type="button"
                  onClick={handleAddField}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar Campo</span>
                </button>
              )}
            </div>

            {/* Error Message if any */}
            {jsonError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{jsonError}</span>
              </div>
            )}

            {/* Form Fields / JSON Editor Body */}
            <form id="editDocForm" onSubmit={handleSaveEdit} className="overflow-y-auto pr-1 flex-1 space-y-3">
              
              {formJsonMode ? (
                <div className="space-y-1">
                  <textarea
                    rows={12}
                    value={formJsonString}
                    onChange={(e) => {
                      setFormJsonString(e.target.value);
                      try {
                        JSON.parse(e.target.value);
                        setJsonError(null);
                      } catch (err: any) {
                        setJsonError(err.message);
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-emerald-400 focus:outline-none focus:border-amber-500 resize-none leading-relaxed"
                  />
                </div>
              ) : (
                <div className="space-y-2.5">
                  {formFields.map((field, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2.5 bg-slate-950 rounded-2xl border border-slate-800">
                      
                      {/* Field Key */}
                      <input
                        type="text"
                        placeholder="Clave (key)"
                        value={field.key}
                        onChange={(e) => handleUpdateField(idx, { key: e.target.value })}
                        className="w-1/3 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-amber-300 font-mono focus:outline-none focus:border-amber-500"
                      />

                      {/* Type Selector */}
                      <select
                        value={field.type}
                        onChange={(e) => handleUpdateField(idx, { type: e.target.value as any })}
                        className="bg-slate-900 border border-slate-800 rounded-xl px-2 py-1.5 text-[11px] text-slate-300 font-mono focus:outline-none"
                      >
                        <option value="string">Texto</option>
                        <option value="number">Número</option>
                        <option value="boolean">Booleano</option>
                        <option value="json">JSON</option>
                      </select>

                      {/* Field Value */}
                      {field.type === 'boolean' ? (
                        <select
                          value={field.value}
                          onChange={(e) => handleUpdateField(idx, { value: e.target.value })}
                          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none"
                        >
                          <option value="true">true</option>
                          <option value="false">false</option>
                        </select>
                      ) : (
                        <input
                          type={field.type === 'number' ? 'number' : 'text'}
                          placeholder="Valor"
                          value={field.value}
                          onChange={(e) => handleUpdateField(idx, { value: e.target.value })}
                          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                        />
                      )}

                      {/* Remove Field Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveField(idx)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                        title="Quitar campo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                    </div>
                  ))}
                </div>
              )}

            </form>

            {/* Footer Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="editDocForm"
                disabled={submitting}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 text-xs font-black rounded-xl transition shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: INSPECCIONAR DOCUMENTO (VIEW / READ) */}
      {/* ========================================================================= */}
      {isViewModalOpen && activeDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] flex flex-col">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-800 text-amber-400 flex items-center justify-center font-bold">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Detalle del Documento
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Colección: <span className="text-amber-400 font-bold">/{currentCollectionName}</span> &bull; ID: <span className="text-white font-bold">{activeDoc.id}</span>
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setIsViewModalOpen(false)}
                className="text-slate-500 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* JSON Code Viewer */}
            <div className="flex-1 overflow-y-auto space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                  Estructura JSON Completa
                </span>
                <button
                  onClick={() => handleCopyJson(activeDoc.data, activeDoc.id)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar JSON</span>
                </button>
              </div>

              <pre className="p-4 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto leading-relaxed scrollbar-thin">
                {JSON.stringify(
                  {
                    _id: activeDoc.id,
                    ...activeDoc.data
                  },
                  null,
                  2
                )}
              </pre>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between shrink-0">
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleOpenEditModal(activeDoc);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-amber-500/20 text-amber-400 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <Edit className="w-4 h-4" />
                <span>Modificar</span>
              </button>

              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ELIMINAR DOCUMENTO (DELETE) */}
      {/* ========================================================================= */}
      {isDeleteModalOpen && activeDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-base font-bold text-white">¿Eliminar Documento de Firestore?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Estás a punto de borrar permanentemente el documento <strong className="text-rose-400 font-mono">{activeDoc.id}</strong> de la tabla <strong className="text-amber-400 font-mono">/{currentCollectionName}</strong>.
              </p>
              <p className="text-[11px] text-slate-500">
                Esta acción es irreversible y afectará de inmediato las consultas en tiempo real.
              </p>
            </div>

            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-[11px] font-mono text-slate-400 truncate">
              ID: {activeDoc.id}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={submitting}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={submitting}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-lg shadow-rose-600/20 disabled:opacity-50"
              >
                {submitting ? 'Eliminando...' : 'Sí, Eliminar'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
