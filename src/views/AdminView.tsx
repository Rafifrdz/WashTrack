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
  Package, AlertTriangle, ArrowRight, Menu, X, Calculator, CreditCard, Receipt, Printer, QrCode
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
  const [activeView, setActiveView] = useState('Cashier');
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
  const [lastOrder, setLastOrder] = useState<LaundryOrder | null>(null);
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
      const now = new Date();
      const completion = new Date(Date.now() + 86400000); // 1 day default

      const newOrderData = {
        receipt_number: receipt,
        customer_name: cashierData.customer_name,
        phone_number: cashierData.phone_number,
        laundry_type: selectedService?.name || 'Laundry',
        weight: Number(cashierData.weight),
        status: 'washing' as OrderStatus,
        date_received: now,
        estimated_completion: completion,
      };

      const savedOrder = await api.createOrder(newOrderData);
      setLastOrder(savedOrder);
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
    revenue: orders.length * 15000 
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
  
  // URL for QR Code (Points to Customer View with receipt param)
  const currentDomain = window.location.origin;
  const qrUrl = lastOrder ? `${currentDomain}/?receipt=${lastOrder.receipt_number}` : '';

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
                <div className="bg-gray-900 text-white p-8 rounded-3xl sticky top-24 border-4 border-gray-800">
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
                          <span>Rp {((selectedService?.price || 0) * cashierData.weight).toLocaleString()}</span>
                       </div>
                       <div className="flex justify-between text-2xl pt-4 border-t border-white/10">
                          <span className="font-black text-xs uppercase tracking-widest text-white/40 self-end mb-1">Total</span>
                          <span className="font-black text-blue-400 leading-none">Rp {totalPrice.toLocaleString()}</span>
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

          {/* Other views... */}
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
        </main>
      </div>

      {/* Formal Formal Receipt Modal */}
      <AnimatePresence>
        {lastOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-2xl rounded-sm p-0 text-gray-900 border-[3px] border-gray-900 shadow-2xl my-8">
               {/* Print Header */}
               <div className="p-8 border-b-2 border-gray-900 text-center relative">
                  <button onClick={() => setLastOrder(null)} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full print:hidden"><X className="w-6 h-6" /></button>
                  <h1 className="text-4xl font-black tracking-[0.1em] uppercase mb-1">ALMIRA LAUNDRY</h1>
                  <p className="text-lg font-bold italic mb-4">Laundry & Dry Cleaning Service</p>
                  <div className="text-sm font-medium space-y-1">
                    <p>Jl. Sunan Kali Jaga No.60F RT.001/011</p>
                    <p>Telp : 0858 1403 1238</p>
                    <p className="text-blue-700 font-bold underline">{currentDomain.replace(/^https?:\/\//, '')}</p>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <div className="border-2 border-gray-900 px-6 py-2 font-black text-xl">
                      No. {lastOrder.receipt_number}
                    </div>
                  </div>
               </div>

               {/* Customer Info Section */}
               <div className="grid grid-cols-1 md:grid-cols-2 border-b-2 border-gray-900">
                  <div className="p-6 border-b-2 md:border-b-0 md:border-r-2 border-gray-900 space-y-2">
                    <div className="flex gap-4"><span className="w-20 font-black uppercase text-xs">Agen :</span><span className="flex-1 border-b border-dotted border-gray-400">WashTrack Admin</span></div>
                  </div>
                  <div className="p-6 space-y-3">
                    <div className="flex gap-4"><span className="w-20 font-black uppercase text-xs">Nama :</span><span className="flex-1 border-b border-dotted border-gray-400 font-bold">{lastOrder.customer_name}</span></div>
                    <div className="flex gap-4"><span className="w-20 font-black uppercase text-xs">Telp :</span><span className="flex-1 border-b border-dotted border-gray-400">{lastOrder.phone_number || '-'}</span></div>
                  </div>
               </div>

               {/* Dates Section */}
               <div className="grid grid-cols-2 border-b-2 border-gray-900 text-sm font-black uppercase">
                  <div className="p-4 border-r-2 border-gray-900 flex justify-between px-6">
                    <span>Terima Tgl.</span>
                    <span className="text-blue-700">{format(new Date(lastOrder.date_received), 'dd/MM/yyyy')}</span>
                  </div>
                  <div className="p-4 flex justify-between px-6 bg-gray-50">
                    <span>Selesai Tgl.</span>
                    <span className="text-blue-700">{format(new Date(lastOrder.estimated_completion), 'dd/MM/yyyy')}</span>
                  </div>
               </div>

               {/* Table Section */}
               <div className="p-0">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-gray-100 border-b-2 border-gray-900 font-black uppercase text-[10px] tracking-widest">
                        <th className="px-6 py-3 border-r-2 border-gray-900 text-left">Jasa / Layanan</th>
                        <th className="px-6 py-3 border-r-2 border-gray-900 text-center">Harga (Kg)</th>
                        <th className="px-6 py-3 border-r-2 border-gray-900 text-center">Berat (Kg)</th>
                        <th className="px-6 py-3 text-right">Sub Total</th>
                      </tr>
                    </thead>
                    <tbody className="font-bold">
                      <tr className="border-b-2 border-gray-900 h-16">
                        <td className="px-6 border-r-2 border-gray-900 uppercase">{lastOrder.laundry_type}</td>
                        <td className="px-6 border-r-2 border-gray-900 text-center">Rp {((SERVICES.find(s => s.name === lastOrder.laundry_type)?.price || 0)).toLocaleString()}</td>
                        <td className="px-6 border-r-2 border-gray-900 text-center">{lastOrder.weight}</td>
                        <td className="px-6 text-right">Rp {((SERVICES.find(s => s.name === lastOrder.laundry_type)?.price || 0) * (lastOrder.weight || 1)).toLocaleString()}</td>
                      </tr>
                      {/* Empty rows to mimic formal look */}
                      <tr className="border-b-2 border-gray-900 h-10"><td className="border-r-2 border-gray-900"></td><td className="border-r-2 border-gray-900"></td><td className="border-r-2 border-gray-900"></td><td></td></tr>
                      <tr className="border-b-2 border-gray-900 h-10"><td className="border-r-2 border-gray-900"></td><td className="border-r-2 border-gray-900"></td><td className="border-r-2 border-gray-900"></td><td></td></tr>
                      
                      <tr className="bg-gray-100">
                        <td colSpan={3} className="px-6 py-4 text-right border-r-2 border-gray-900 font-black uppercase">Total Harga</td>
                        <td className="px-6 py-4 text-right font-black text-xl">Rp {((SERVICES.find(s => s.name === lastOrder.laundry_type)?.price || 0) * (lastOrder.weight || 1)).toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
               </div>

               {/* Footer Section with QR */}
               <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8 border-t-2 border-gray-900">
                  <div className="md:col-span-2 text-[10px] space-y-2 uppercase font-bold text-gray-500">
                    <p className="text-gray-900 font-black">PERHATIAN :</p>
                    <p>1. Pengambilan barang harus disertai dengan bonnya dan dibayar tunai</p>
                    <p>2. Bon ini berlaku 40 hari dari tanggal selesainya</p>
                    <p>3. Kami tidak bertanggung jawab pada susut atau luntur karena sifat bahannya</p>
                    <p>4. Jika terjadi kehilangan/kerusakan, kami hanya mengganti 10x ongkos cucinya</p>
                    <p>5. Hak claim berlaku 12 jam setelah cucian diambil</p>
                  </div>
                  <div className="flex flex-col items-center justify-center gap-2">
                     <div className="p-2 border-2 border-gray-900 rounded-lg">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(qrUrl)}`} 
                          alt="QR Tracking" 
                          className="w-24 h-24"
                        />
                     </div>
                     <span className="text-[8px] font-black uppercase text-gray-400 tracking-tighter text-center">Scan untuk Cek Status<br/>Otomatis</span>
                  </div>
               </div>

               <div className="p-8 pt-0 flex justify-between items-end">
                  <div className="w-40 border-b-2 border-gray-900 text-center text-xs font-bold pb-1 text-gray-400">Tanda Terima</div>
                  <div className="text-center">
                    <p className="text-xs font-bold mb-12 uppercase">Hormat Kami,</p>
                    <div className="w-40 border-b-2 border-gray-900 text-center text-xs font-bold pb-1">( ________________ )</div>
                  </div>
               </div>

               <div className="p-6 bg-gray-900 text-white flex justify-between items-center print:hidden rounded-b-sm">
                  <button onClick={() => setLastOrder(null)} className="px-6 py-2 font-bold hover:text-gray-300">Tutup</button>
                  <button onClick={() => window.print()} className="bg-white text-gray-900 px-8 py-3 rounded-xl font-black flex items-center gap-3 hover:bg-gray-100 transition-all">
                    <Printer className="w-5 h-5" /> Cetak Nota
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
