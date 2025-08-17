import React, { useState, useEffect, useRef } from 'react';

// Supabase client configuration
// NOTE: We're using a script tag to load the Supabase library from a CDN
// and then accessing it from the window object. This is a robust way to handle
// the import in this specific environment and avoid bundling errors.
// This script will execute and make `window.supabase` available.
const supabseClientScript = `
  const supabaseUrl = 'https://your-project-url.supabase.co'; // REPLACE WITH YOUR SUPABASE URL
  const supabaseAnonKey = 'YOUR_ANON_KEY'; // REPLACE WITH YOUR ANON KEY
  window.supabaseClient = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
`;

// Interface for the client data structure
interface Client {
  id: number;
  name: string;
  type: 'فرد' | 'شركة';
  email: string;
  phone: string;
  tax_id: string;
  commercial_reg: string;
  responsible_person: string;
  created_at: string;
}

// Main App component
const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'list' | 'form'>('list');
  const [clients, setClients] = useState<Client[]>([]);
  const [isFormEditing, setIsFormEditing] = useState(false);
  const [currentClient, setCurrentClient] = useState<Partial<Client>>({});
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  // Ref to hold the Supabase client instance
  const supabaseRef = useRef<any>(null);

  // --- Helper Functions ---

  /**
   * Shows a temporary toast message.
   * @param message - The message to display.
   * @param type - The type of message ('success' or 'error').
   */
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const toast = document.getElementById('toast');
    if (toast) {
      toast.textContent = message;
      toast.className = `fixed bottom-4 right-4 z-50 p-4 rounded-md shadow-lg text-white font-bold ${type === 'success' ? 'bg-green-500' : 'bg-red-600'} transition-all duration-300 transform translate-y-0 opacity-100`;
      toast.classList.remove('hidden');
      setTimeout(() => {
        toast.classList.add('hidden');
      }, 3000);
    }
  };

  /**
   * Switches the active tab and resets the form state if needed.
   * @param tab - The tab to switch to ('list' or 'form').
   */
  const handleTabChange = (tab: 'list' | 'form') => {
    setActiveTab(tab);
    if (tab === 'list') {
      resetForm();
    }
  };

  /**
   * Resets the form to its initial state for adding a new client.
   */
  const resetForm = () => {
    setIsFormEditing(false);
    setCurrentClient({});
  };

  /**
   * Populates the form with a client's data for editing.
   * @param client - The client object to edit.
   */
  const populateFormForEdit = (client: Client) => {
    setIsFormEditing(true);
    setCurrentClient(client);
    handleTabChange('form');
  };

  // --- Supabase Operations ---

  /**
   * Fetches all clients from the Supabase database.
   */
  const fetchClients = async () => {
    if (!supabaseRef.current) return;
    setLoading(true);
    try {
      const { data, error } = await supabaseRef.current
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data);
    } catch (error: any) {
      console.error('Error fetching clients:', error);
      showToast(`حدث خطأ في جلب بيانات العملاء: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles form submission for adding or updating a client.
   * @param event - The form submission event.
   */
  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supabaseRef.current) return;

    setLoading(true);
    try {
      const clientData = {
        name: (event.target as any).clientName.value,
        type: (event.target as any).clientType.value,
        email: (event.target as any).clientEmail.value,
        phone: (event.target as any).clientPhone.value,
        tax_id: (event.target as any).clientTaxId.value,
        commercial_reg: (event.target as any).clientCommercialReg.value,
        responsible_person: (event.target as any).clientResponsiblePerson.value,
      };

      if (isFormEditing && currentClient.id) {
        const { error } = await supabaseRef.current
          .from('clients')
          .update(clientData)
          .eq('id', currentClient.id);
        if (error) throw error;
        showToast('تم تعديل العميل بنجاح!');
      } else {
        const { error } = await supabaseRef.current
          .from('clients')
          .insert([clientData]);
        if (error) throw error;
        showToast('تمت إضافة العميل بنجاح!');
      }
      handleTabChange('list');
      fetchClients();
    } catch (error: any) {
      console.error('Error saving client:', error);
      showToast(`حدث خطأ أثناء حفظ العميل: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles the client deletion process.
   */
  const handleDelete = async () => {
    if (!supabaseRef.current || !clientToDelete) return;
    setLoading(true);
    try {
      const { error } = await supabaseRef.current
        .from('clients')
        .delete()
        .eq('id', clientToDelete.id);
      
      if (error) throw error;
      showToast('تم حذف العميل بنجاح!');
      setShowDeleteModal(false);
      fetchClients();
    } catch (error: any) {
      console.error('Error deleting client:', error);
      showToast(`حدث خطأ أثناء حذف العميل: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles data export to a CSV file.
   */
  const handleExport = async () => {
    if (!supabaseRef.current) return;
    try {
      const { data, error } = await supabaseRef.current.from('clients').select('*');
      if (error) throw error;

      if (!data || data.length === 0) {
        showToast('لا توجد بيانات لتصديرها.', 'error');
        return;
      }
      const headers = Object.keys(data[0]); 
      const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => {
            const value = (row as any)[header] === null ? 'N/A' : (row as any)[header];
            return JSON.stringify(value);
        }).join(','))
      ].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      if (link.download !== undefined) {
          const url = URL.createObjectURL(blob);
          link.setAttribute('href', url);
          link.setAttribute('download', 'clients.csv');
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          showToast('تم تصدير البيانات بنجاح!');
      }
    } catch (error: any) {
      console.error('Error exporting data:', error);
      showToast(`حدث خطأ أثناء تصدير البيانات: ${error.message}`, 'error');
    }
  };

  /**
   * Handles data import from a CSV file.
   * @param event - The file input change event.
   */
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !supabaseRef.current) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim() !== '');
        if (lines.length < 2) {
          showToast('ملف CSV فارغ أو غير صالح.', 'error');
          return;
        }
        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        const importedData = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
          const entry: any = {};
          headers.forEach((header, i) => {
              let value = values[i] === 'N/A' ? null : values[i];
              entry[header] = value;
          });
          return entry;
        });
        
        // Map imported data to Supabase's snake_case column names
        const clientsToInsert = importedData.map(client => ({
            name: client.name,
            type: client.type,
            email: client.email,
            phone: client.phone,
            tax_id: client.tax_id,
            commercial_reg: client.commercial_reg,
            responsible_person: client.responsible_person,
        }));
        const { error } = await supabaseRef.current.from('clients').insert(clientsToInsert);
        if (error) throw error;
        
        showToast('تم استيراد البيانات بنجاح!');
        fetchClients();
      } catch (error: any) {
        console.error('Error importing data:', error);
        showToast(`حدث خطأ أثناء استيراد البيانات: ${error.message}`, 'error');
      }
    };
    reader.readAsText(file);
  };

  // --- Effects ---

  // Initialize Supabase client once
  useEffect(() => {
    // We access the globally available Supabase client instance
    supabaseRef.current = (window as any).supabaseClient;
    if (supabaseRef.current) {
      fetchClients();
    }
  }, []);

  // JSX for the component
  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-50 font-sans p-4">
      <script dangerouslySetInnerHTML={{ __html: supabseClientScript }} />
      <div id="app" className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">إدارة العملاء</h1>
          <button 
            id="new-client-btn" 
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 p-2 gap-2"
            onClick={() => handleTabChange('form')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            عميل جديد
          </button>
        </div>

        {/* Tabs */}
        <div id="tabs" className="inline-flex items-center justify-center rounded-md bg-gray-200 dark:bg-gray-700 p-1 text-gray-600 dark:text-gray-300 grid w-full grid-cols-2">
          <button 
            id="tab-list" 
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 ${activeTab === 'list' ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-50 shadow-sm' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            onClick={() => handleTabChange('list')}
          >
            قائمة العملاء
          </button>
          <button 
            id="tab-form" 
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 ${activeTab === 'form' ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-50 shadow-sm' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            onClick={() => handleTabChange('form')}
          >
            إضافة عميل جديد
          </button>
        </div>

        {/* Client List Section */}
        {activeTab === 'list' && (
          <div id="list-tab-content" className="mt-4">
            <div className="rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50 shadow-sm p-6">
              <div className="flex flex-col space-y-1.5">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-semibold leading-none tracking-tight">قائمة العملاء</h3>
                  <div className="flex gap-2">
                    <button 
                      id="export-btn" 
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 p-2 gap-2"
                      onClick={handleExport}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                      تصدير البيانات
                    </button>
                    <label className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 p-2 cursor-pointer gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                      استيراد البيانات
                      <input id="import-input" type="file" className="hidden" accept=".csv" onChange={handleImport} />
                    </label>
                  </div>
                </div>
              </div>
              <div className="p-0 pt-4">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-right">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 px-4 text-right">اسم العميل</th>
                        <th className="py-2 px-4 text-right">النوع</th>
                        <th className="py-2 px-4 text-right">البريد الإلكتروني</th>
                        <th className="py-2 px-4 text-right">رقم الهاتف</th>
                        <th className="py-2 px-4 text-right">الشخص المسؤول</th>
                        <th className="py-2 px-4 text-center">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                            جاري تحميل البيانات...
                          </td>
                        </tr>
                      ) : clients.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                            لا يوجد عملاء حاليًا.
                          </td>
                        </tr>
                      ) : (
                        clients.map(client => (
                          <tr key={client.id} className="border-b hover:bg-gray-100 dark:hover:bg-gray-800">
                            <td className="py-2 px-4 flex items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-blue-500"><path d="M18 21a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2Z"/><circle cx="12" cy="11" r="3"/><path d="M15 17a3 3 0 1 0-6 0h6Z"/></svg>
                              <span>{client.name}</span>
                            </td>
                            <td className="py-2 px-4">{client.type}</td>
                            <td className="py-2 px-4 dir-ltr">{client.email}</td>
                            <td className="py-2 px-4 dir-ltr">{client.phone}</td>
                            <td className="py-2 px-4">{client.responsible_person || ''}</td>
                            <td className="py-2 px-4 text-center">
                              <div className="flex justify-center gap-2">
                                <button 
                                  onClick={() => populateFormForEdit(client)}
                                  className="p-1 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                </button>
                                <button 
                                  onClick={() => { setClientToDelete(client); setShowDeleteModal(true); }}
                                  className="p-1 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 bg-red-600 text-white hover:bg-red-700"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Client Form Section */}
        {activeTab === 'form' && (
          <div id="form-tab-content" className="mt-4">
            <div className="rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50 shadow-sm p-6">
              <div className="flex flex-col space-y-1.5">
                <h3 id="form-title" className="text-2xl font-semibold leading-none tracking-tight">
                  {isFormEditing ? 'تعديل العميل' : 'إضافة عميل جديد'}
                </h3>
              </div>
              <div className="p-0 pt-4">
                <form id="client-form" className="space-y-4" onSubmit={handleFormSubmit}>
                  <input type="hidden" id="client-id" value={currentClient.id || ''} />
                  <div>
                    <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اسم العميل</label>
                    <input id="clientName" type="text" placeholder="أدخل الاسم" required defaultValue={currentClient.name || ''} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                  </div>
                  <div>
                    <label htmlFor="clientType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">النوع</label>
                    <select id="clientType" defaultValue={currentClient.type || 'فرد'} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                      <option value="فرد">فرد</option>
                      <option value="شركة">شركة</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="clientEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">البريد الإلكتروني</label>
                    <input id="clientEmail" type="email" placeholder="أدخل البريد الإلكتروني" required defaultValue={currentClient.email || ''} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                  </div>
                  <div>
                    <label htmlFor="clientPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">رقم الهاتف</label>
                    <input id="clientPhone" type="tel" placeholder="أدخل رقم الهاتف" defaultValue={currentClient.phone || ''} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                  </div>
                  <div>
                    <label htmlFor="clientTaxId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الرقم الضريبي</label>
                    <input id="clientTaxId" type="text" placeholder="أدخل الرقم الضريبي" defaultValue={currentClient.tax_id || ''} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                  </div>
                  <div>
                    <label htmlFor="clientCommercialReg" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">السجل التجاري</label>
                    <input id="clientCommercialReg" type="text" placeholder="أدخل رقم السجل التجاري" defaultValue={currentClient.commercial_reg || ''} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                  </div>
                  <div>
                    <label htmlFor="clientResponsiblePerson" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الشخص المسؤول</label>
                    <input id="clientResponsiblePerson" type="text" placeholder="أدخل اسم الشخص المسؤول" defaultValue={currentClient.responsible_person || ''} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                  </div>
                  <button type="submit" id="save-client-btn" className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 p-2">
                    <span id="save-btn-text">{isFormEditing ? 'حفظ التعديلات' : 'إضافة عميل'}</span>
                  </button>
                  {isFormEditing && (
                    <button type="button" id="cancel-edit-btn" className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 bg-gray-500 hover:bg-gray-600 text-white p-2" onClick={() => handleTabChange('list')}>
                      إلغاء
                    </button>
                  )}
                </form>
              </div>
            </div>
          </div>
        )}
        
        {/* Confirmation Dialog */}
        {showDeleteModal && (
          <div id="delete-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-sm">
              <h3 className="text-xl font-bold mb-4">تأكيد الحذف</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4" id="delete-modal-description">
                هل أنت متأكد أنك تريد حذف العميل <span className="font-semibold">{clientToDelete?.name}</span>؟ لا يمكن التراجع عن هذا الإجراء.
              </p>
              <div className="flex justify-end gap-2">
                <button 
                  id="cancel-delete-btn" 
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 p-2"
                  onClick={() => setShowDeleteModal(false)}
                >
                  إلغاء
                </button>
                <button 
                  id="confirm-delete-btn" 
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-red-600 hover:bg-red-700 text-white p-2"
                  onClick={handleDelete}
                >
                  حذف
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Message Box */}
        <div id="toast" className="fixed bottom-4 right-4 z-50 p-4 rounded-md shadow-lg bg-green-500 text-white font-bold hidden">
          {/* Toast message will be inserted here */}
        </div>
        
        <div className="mt-8 p-4 bg-yellow-100 rounded-lg text-yellow-800 border border-yellow-200">
            <p className="font-semibold">ملاحظة هامة:</p>
            <p>يتم تخزين بيانات العملاء الآن في قاعدة بيانات **Supabase**. ستحتاج إلى تحديث **`supabaseUrl`** و **`supabaseAnonKey`** في الكود للاتصال بقاعدة بياناتك.</p>
        </div>

      </div>
    </div>
  );
};

export default App;
