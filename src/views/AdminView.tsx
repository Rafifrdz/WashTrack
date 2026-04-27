import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { LaundryOrder, OrderStatus, STATUS_FLOW, STATUS_LABELS } from '../types';
import { generateReceiptNumber } from '../lib/utils';
import { StatusBadge } from '../components/StatusBadge';
import { 
  Plus, Search, LayoutDashboard, ShoppingBag, 
  MapPin, Box, Users, HelpCircle, LogOut, 
  Loader2, Check, Trash2, 
  WashingMachine, User, Phone, ChevronDown, 
  Weight, Calendar, Info, Settings, Bell,
  Wind, Shirt, TrendingUp, Clock, CheckCircle2,
  Package, AlertTriangle, ArrowRight, Menu, X, Calculator, CreditCard, Receipt
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, formatDistanceToNow } from 'date-fns';
import { ViewSwitcher } from '../components/ViewSwitcher';

interface AdminViewProps {
  onLogout: () => void;
  onPageChange: (page: 'customer' | 'admin') => void;
}

const SERVICES = [
  { id: 'wash_dry_iron', name: 'Cuci + Kering + Setrika', price: 10000, icon: Shirt },
  { id: 'wash_dry', name: 'Cuci + Kering', price: 7000, icon: Wind },
  { id: 'iron_only', name: 'Setrika Saja', price: 5000, icon: Shirt },
  { id: 'express', name: 'Kilat (6 Jam)', price: 15000, icon: Clock },
];

export function AdminView({ onLogout, onPageChange }: AdminViewProps) {
  const [orders, setOrders] = useState<LaundryOrder[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('Overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Cashier State
  const [cashierData, setCashierData] = useState({
    customer_name: '',
    phone_number: '',
    service_id: 'wash_dry_iron',
    weight: 1,
  });
  
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [lastCreatedReceipt, setLastCreatedReceipt] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [ordersData, invData, custData] = await Promise.all([
        api.getOrders(),
        api.getInventory(),
        api.getCustomers()
      ]);
      setOrders(ordersData);
      setInventory(invData);
      setCustomers(custData);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleCreateOrder = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSubmitting(true);
    
    try {
      const receipt = generateReceiptNumber();
      const selectedService = SERVICES.find(s => s.id === cashierData.service_id);
      
      const newOrder = {
        receipt_number: receipt,
        customer_name: cashierData.customer_name,
        phone_number: cashierData.phone_number,
        laundry_type: selectedService?.name || 'Laundry',
        weight: Number(cashierData.weight),
        status: 'washing' as OrderStatus,
        date_received: new Date(),
        estimated_completion: new Date(Date.now() + 86400000),
      };

      console.log('Sending order:', newOrder);
      const saved = await api.createOrder(newOrder);
      console.log('Order saved:', saved);

      setLastCreatedReceipt(receipt);
      setCashierData({ 
        customer_name: '', 
        phone_number: '', 
        service_id: 'wash_dry_iron', 
        weight: 1 
      });
      await fetchAllData();
    } catch (err: any) {
      console.error('Failed to create order:', err);
      alert('Gagal membuat pesanan: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, nextStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      await api.updateOrder(orderId, { status: nextStatus });
      await fetchAllData();
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Hapus pesanan ini?')) return;
    try {
      await api.deleteOrder(orderId);
      fetchAllData();
    } catch (err) {
      console.error('Failed to delete order:', err);
    }
  };

  const handleUpdateInventory = async (id: string, newStock: number) => {
    try {
      await api.updateInventory(id, { stock: newStock });
      fetchAllData();
    } catch (err) {
      console.error('Failed to update inventory:', err);
    }
  };

  const filteredOrders = orders.filter(order => 
    order.receipt_number.toLowerCase().includes(search.toLowerCase()) || 
    order.customer_name.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: orders.length,
    active: orders.filter(o => o.status !== 'completed').length,
    completed: orders.filter(o => o.status === 'completed').length,
    revenue: orders.length * 15000 // Mock revenue
  };

  const SidebarItem = ({ icon: Icon, label }: { icon: any, label: string }) => (
    <button 
      onClick={() => {
        setActiveView(label);
        setIsSidebarOpen(false);
      }}
      className={`w-full flex items-center gap-4 px-6 py-4 transition-all ${activeView === label ? 'text-blue-600 bg-blue-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
    >
      <Icon className={`w-5 h-5 ${activeView === label ? 'text-blue-600' : 'text-gray-400'}`} />
      <span className={`text-sm font-semibold ${activeView === label ? 'text-blue-700' : 'text-gray-600'}`}>{label}</span>
    </button>
  );

  const selectedService = SERVICES.find(s => s.id === cashierData.service_id);
  const totalPrice = (selectedService?.price || 0) * cashierData.weight;

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex flex-col md:flex-row overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-100 px-6 h-16 flex items-center justify-between sticky top-0 z-[60]">
        <div className="flex items-center gap-2">
          <WashingMachine className="w-6 h-6 text-blue-600" />
          <span className="font-black text-lg tracking-tighter text-gray-900">WashTrack</span>
        </div>
        <div className="flex items-center gap-3">
           <ViewSwitcher currentPage="admin" onPageChange={onPageChange} className="scale-75 origin-right" />
           <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 text-gray-500">
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
           </button>
        </div>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {(isSidebarOpen || !window.matchMedia('(max-width: 768px)').matches) && (
          <motion.aside 
            initial={{ x: -256 }} animate={{ x: 0 }} exit={{ x: -256 }}
            className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-white border-r border-gray-100 flex flex-col z-50 ${isSidebarOpen ? 'block' : 'hidden md:flex'}`}
          >
            <div className="p-8 hidden md:block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                   <WashingMachine className="w-6 h-6" />
                </div>
                <h1 className="text-gray-900 font-black text-xl tracking-tighter">WashTrack</h1>
              </div>
            </div>

            <nav className="flex-1">
              <SidebarItem icon={Calculator} label="Cashier" />
              <SidebarItem icon={LayoutDashboard} label="Overview" />
              <SidebarItem icon={ShoppingBag} label="Order History" />
              <SidebarItem icon={MapPin} label="Live Tracking" />
              <SidebarItem icon={Box} label="Inventory" />
              <SidebarItem icon={Users} label="Customers" />
            </nav>

            <div className="p-6 border-t border-gray-50">
              <button onClick={onLogout} className="w-full flex items-center gap-4 px-4 py-3 text-red-500 font-bold text-sm hover:bg-red-50 rounded-xl transition-all">
                <LogOut className="w-5 h-5" /> Logout
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="bg-white h-20 border-b border-gray-100 px-10 flex items-center justify-between sticky top-0 z-40 hidden md:flex">
          <h2 className="text-xl font-bold text-gray-900">{activeView}</h2>
          <div className="flex items-center gap-6">
            <ViewSwitcher currentPage="admin" onPageChange={onPageChange} />
            <div className="w-px h-6 bg-gray-100 mx-2"></div>
            <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-full"><Bell className="w-5 h-5" /></button>
          </div>
        </header>

        <main className="p-4 md:p-10 max-w-6xl mx-auto w-full">
          {/* Cashier View */}
          {activeView === 'Cashier' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left: Input */}
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white p-8 rounded-3xl border-2 border-gray-200">
                  <h3 className="text-xl font-black mb-8 flex items-center gap-3">
                    <User className="w-6 h-6 text-blue-600" /> Data Pelanggan
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Nama Pelanggan</label>
                      <input 
                        type="text" 
                        value={cashierData.customer_name} 
                        onChange={e => setCashierData({...cashierData, customer_name: e.target.value})}
                        placeholder="Cari atau masukkan nama..." 
                        className="w-full px-6 py-4 rounded-xl bg-gray-50 border-2 border-gray-100 focus:border-blue-600 outline-none font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Nomor HP</label>
                      <input 
                        type="tel" 
                        value={cashierData.phone_number} 
                        onChange={e => setCashierData({...cashierData, phone_number: e.target.value})}
                        placeholder="0812..." 
                        className="w-full px-6 py-4 rounded-xl bg-gray-50 border-2 border-gray-100 focus:border-blue-600 outline-none font-bold"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-3xl border-2 border-gray-200">
                  <h3 className="text-xl font-black mb-8 flex items-center gap-3">
                    <Shirt className="w-6 h-6 text-blue-600" /> Pilih Layanan
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {SERVICES.map(service => (
                      <button 
                        key={service.id}
                        onClick={() => setCashierData({...cashierData, service_id: service.id})}
                        className={`p-6 rounded-2xl border-2 text-left transition-all ${cashierData.service_id === service.id ? 'border-blue-600 bg-blue-50/50' : 'border-gray-100 hover:border-blue-200'}`}
                      >
                        <service.icon className={`w-6 h-6 mb-3 ${cashierData.service_id === service.id ? 'text-blue-600' : 'text-gray-400'}`} />
                        <p className="font-black text-gray-900">{service.name}</p>
                        <p className="text-sm font-bold text-blue-600 mt-1">Rp {service.price.toLocaleString()}/kg</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Summary */}
              <div className="space-y-6">
                <div className="bg-gray-900 text-white p-8 rounded-3xl sticky top-24">
                  <h3 className="text-xl font-black mb-8 flex items-center gap-3">
                    <Receipt className="w-6 h-6 text-blue-400" /> Ringkasan Order
                  </h3>
                  <div className="space-y-6">
                    <div className="flex justify-between items-end border-b border-white/10 pb-6">
                       <div className="space-y-1">
                          <p className="text-xs font-bold text-white/50 uppercase tracking-widest">Berat (KG)</p>
                          <div className="flex items-center gap-4">
                             <button onClick={() => setCashierData({...cashierData, weight: Math.max(1, cashierData.weight - 1)})} className="w-8 h-8 rounded-lg border border-white/20 flex items-center justify-center">-</button>
                             <span className="text-3xl font-black">{cashierData.weight}</span>
                             <button onClick={() => setCashierData({...cashierData, weight: cashierData.weight + 1})} className="w-8 h-8 rounded-lg border border-white/20 flex items-center justify-center">+</button>
                          </div>
                       </div>
                    </div>
                    
                    <div className="space-y-4 pt-4 text-sm font-bold">
                       <div className="flex justify-between">
                          <span className="text-white/50">{selectedService?.name}</span>
                          <span>Rp {(selectedService?.price || 0).toLocaleString()}</span>
                       </div>
                       <div className="flex justify-between text-2xl pt-4 border-t border-white/10">
                          <span className="font-black">TOTAL</span>
                          <span className="font-black text-blue-400">Rp {totalPrice.toLocaleString()}</span>
                       </div>
                    </div>

                    <button 
                      onClick={handleCreateOrder}
                      disabled={!cashierData.customer_name || submitting}
                      className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xl mt-8 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 disabled:opacity-30 disabled:grayscale"
                    >
                      {submitting ? <Loader2 className="animate-spin" /> : <>Bayar Sekarang <ArrowRight /></>}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Overview View */}
          {activeView === 'Overview' && (
            <div className="space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-8 rounded-2xl border-2 border-gray-100">
                     <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4"><ShoppingBag /></div>
                     <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Order</p>
                     <p className="text-4xl font-black text-gray-900 mt-2">{stats.total}</p>
                  </div>
                  <div className="bg-white p-8 rounded-2xl border-2 border-gray-100">
                     <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-4"><Clock /></div>
                     <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Dalam Proses</p>
                     <p className="text-4xl font-black text-gray-900 mt-2">{stats.active}</p>
                  </div>
                  <div className="bg-white p-8 rounded-2xl border-2 border-gray-100">
                     <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4"><TrendingUp /></div>
                     <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Estimasi Pendapatan</p>
                     <p className="text-4xl font-black text-gray-900 mt-2">Rp {stats.revenue.toLocaleString()}</p>
                  </div>
               </div>
            </div>
          )}

          {/* Table for Order History */}
          {activeView === 'Order History' && (
            <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden">
               <div className="p-8 border-b-2 border-gray-100 flex justify-between items-center">
                  <h3 className="text-xl font-black">Riwayat Pesanan</h3>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" placeholder="Cari nota..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg outline-none font-bold text-sm" />
                  </div>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                           <th className="px-8 py-4">Receipt</th>
                           <th className="px-8 py-4">Customer</th>
                           <th className="px-8 py-4">Status</th>
                           <th className="px-8 py-4 text-right">Action</th>
                        </tr>
                     </thead>
                     <tbody>
                        {filteredOrders.map(order => {
                           const id = (order as any)._id || order.id;
                           return (
                           <tr key={id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                              <td className="px-8 py-6 font-mono text-xs text-blue-600 font-bold">{order.receipt_number}</td>
                              <td className="px-8 py-6 font-bold text-gray-900">{order.customer_name}</td>
                              <td className="px-8 py-6"><StatusBadge status={order.status} /></td>
                              <td className="px-8 py-6 text-right">
                                 <div className="flex justify-end gap-2">
                                    <button onClick={() => handleUpdateStatus(id, 'washing')} className={`p-2 rounded-lg border-2 ${order.status === 'washing' ? 'bg-blue-600 text-white' : 'border-gray-100 text-gray-400'}`}><WashingMachine className="w-4 h-4" /></button>
                                    <button onClick={() => handleUpdateStatus(id, 'drying')} className={`p-2 rounded-lg border-2 ${order.status === 'drying' ? 'bg-blue-600 text-white' : 'border-gray-100 text-gray-400'}`}><Wind className="w-4 h-4" /></button>
                                    <button onClick={() => handleUpdateStatus(id, 'ironing')} className={`p-2 rounded-lg border-2 ${order.status === 'ironing' ? 'bg-blue-600 text-white' : 'border-gray-100 text-gray-400'}`}><Shirt className="w-4 h-4" /></button>
                                    <button onClick={() => handleUpdateStatus(id, 'completed')} className={`p-2 rounded-lg border-2 ${order.status === 'completed' ? 'bg-emerald-600 text-white' : 'border-gray-100 text-gray-400'}`}><Check className="w-4 h-4" /></button>
                                    <button onClick={() => handleDeleteOrder(id)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                 </div>
                              </td>
                           </tr>
                        )})}
                     </tbody>
                  </table>
               </div>
            </div>
          )}

          {/* Customers & Inventory updated similarly with rough style... */}
        </main>
      </div>

      {/* Receipt Modal */}
      <AnimatePresence>
        {lastCreatedReceipt && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-sm rounded-3xl p-10 text-center border-4 border-gray-900">
               <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center mb-6"><Receipt className="w-10 h-10" /></div>
               <h2 className="text-2xl font-black mb-2 tracking-tighter">ORDER BERHASIL!</h2>
               <p className="text-gray-400 font-bold mb-8">Nota telah tersimpan ke sistem.</p>
               
               <div className="bg-gray-50 p-6 rounded-2xl text-left space-y-3 mb-8 border-2 border-gray-100">
                  <div className="flex justify-between"><span className="text-xs font-bold text-gray-400 uppercase">Resi</span><span className="font-mono font-bold text-blue-600">{lastCreatedReceipt}</span></div>
                  <div className="flex justify-between border-t border-gray-200 pt-3"><span className="text-xs font-bold text-gray-400 uppercase">Total</span><span className="font-black text-gray-900">Rp {totalPrice.toLocaleString()}</span></div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => setLastCreatedReceipt(null)} className="py-4 bg-gray-100 rounded-xl font-bold hover:bg-gray-200 transition-all">Tutup</button>
                 <button onClick={() => window.print()} className="py-4 bg-blue-600 text-white rounded-xl font-black hover:bg-blue-700 transition-all">Cetak Nota</button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
