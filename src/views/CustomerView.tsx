import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { LaundryOrder, STATUS_FLOW, STATUS_LABELS } from '../types';
import { Search, Loader2, WashingMachine, FileText, Headphones, Info, Check, Wind, Shirt, ShoppingBag, Calendar, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { ViewSwitcher } from '../components/ViewSwitcher';

interface CustomerViewProps {
  onPageChange: (page: 'customer' | 'admin') => void;
}

export function CustomerView({ onPageChange }: CustomerViewProps) {
  const [receiptNumber, setReceiptNumber] = useState('');
  const [order, setOrder] = useState<LaundryOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performSearch = async (code: string) => {
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const orderData = await api.getOrderByReceipt(code.trim());
      if (orderData) {
        setOrder(orderData);
      } else {
        setOrder(null);
        setError('Nomor resi tidak ditemukan. Mohon cek kembali.');
      }
    } catch (err) {
      setError('Gagal mengambil data. Cek koneksi internet kamu.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(receiptNumber);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const receiptFromUrl = params.get('receipt');
    if (receiptFromUrl) {
      const upperReceipt = receiptFromUrl.toUpperCase();
      setReceiptNumber(upperReceipt);
      performSearch(upperReceipt);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F1F5F9] font-sans text-gray-900 flex flex-col">
      {/* Responsive Header with Integrated Switcher */}
      <header className="bg-white border-b-2 border-gray-200 h-20 md:h-24 flex items-center px-6 md:px-24 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-700 rounded-lg md:rounded-xl flex items-center justify-center text-white">
            <WashingMachine className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div>
            <span className="font-black text-lg md:text-2xl text-gray-900 tracking-tighter block leading-none">WashTrack</span>
            <span className="text-[8px] md:text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em] mt-1 block">Customer Service</span>
          </div>
        </div>
        
        {/* Switcher moved here */}
        <div className="ml-auto">
          <ViewSwitcher currentPage="customer" onPageChange={onPageChange} />
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-24 py-12 md:py-20 flex flex-col items-center">
        {/* Bold Hero Section */}
        <div className="text-center mb-10 md:mb-16">
          <h1 className="text-4xl md:text-7xl font-black text-gray-900 mb-4 md:mb-6 tracking-tighter leading-[1.1] md:leading-[0.95]">
            Track Your <span className="text-blue-700 underline decoration-4 md:decoration-8 decoration-blue-100 underline-offset-4 md:underline-offset-8">Laundry</span>
          </h1>
          <p className="text-base md:text-xl text-gray-600 font-bold max-w-2xl mx-auto px-4">
            Real-time tracking for your garments. Enter your receipt below.
          </p>
        </div>

        {/* Search Card */}
        <div className="w-full max-w-3xl bg-white rounded-2xl p-6 md:p-12 border-2 border-gray-200 mb-12 md:mb-20">
          <form onSubmit={handleSearch} className="space-y-6 md:space-y-8">
            <div className="space-y-2 md:space-y-3 text-left">
              <label className="text-xs font-black text-gray-900 uppercase tracking-widest ml-1">Receipt Number</label>
              <div className="relative group">
                <div className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2">
                   <FileText className="w-5 h-5 md:w-7 md:h-7 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={receiptNumber}
                  onChange={(e) => setReceiptNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. WT-8829-XL"
                  className="w-full pl-12 md:pl-16 pr-6 md:pr-8 py-4 md:py-6 rounded-xl bg-gray-50 border-2 border-gray-200 focus:border-blue-700 focus:bg-white transition-all font-black text-lg md:text-2xl text-gray-900 placeholder:text-gray-300 outline-none"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#004D99] text-white rounded-xl py-4 md:py-6 font-black text-lg md:text-2xl hover:bg-blue-900 transition-all flex items-center justify-center gap-3 md:gap-4 disabled:opacity-50 active:translate-y-1"
            >
              {loading ? <Loader2 className="w-6 h-6 md:w-8 md:h-8 animate-spin" /> : <>Check Status <ArrowRight className="w-5 h-5 md:w-6 md:h-6" /></>}
            </button>
          </form>
        </div>

        {/* Results Area */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 md:p-8 bg-red-50 text-red-700 rounded-xl font-black border-2 border-red-200 max-w-3xl w-full text-center text-base md:text-lg">
              {error}
            </motion.div>
          )}

          {order && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-4xl space-y-6 md:space-y-10">
              <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden">
                <div className="p-6 md:p-12 border-b-2 border-gray-100 flex flex-col md:flex-row items-start justify-between gap-6 md:gap-8">
                  <div>
                    <p className="font-mono text-[10px] md:text-sm text-blue-700 font-black mb-1 md:mb-2 tracking-widest">{order.receipt_number}</p>
                    <h3 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter mb-2 md:mb-4">{order.customer_name}</h3>
                    <div className="flex items-center gap-2 md:gap-3 text-gray-500 font-bold">
                       <Calendar className="w-4 h-4 md:w-5 md:h-5" />
                       <span className="text-sm md:text-lg">Received: {format(new Date(order.date_received), 'MMM dd, yyyy')}</span>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-3 rounded-xl border-2 ${order.status === 'completed' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
                    <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${order.status === 'completed' ? 'bg-emerald-500' : 'bg-blue-500 animate-pulse'}`} />
                    <span className="text-[10px] md:text-sm font-black uppercase tracking-widest">{order.status === 'completed' ? 'Ready' : 'In Progress'}</span>
                  </div>
                </div>

                <div className="p-6 md:p-16 md:p-24 pb-20 md:pb-32 bg-gray-50/30 overflow-x-auto scrollbar-hide">
                   <div className="relative flex justify-between items-center min-w-[500px] md:min-w-0 md:max-w-3xl mx-auto px-4">
                      {/* Base Line */}
                      <div className="absolute left-0 right-0 h-[4px] md:h-[6px] bg-gray-200 top-1/2 -translate-y-1/2 z-0" />
                      
                      {/* Active Line Segment */}
                      <div className="absolute left-0 h-[4px] md:h-[6px] bg-blue-700 top-1/2 -translate-y-1/2 z-0 transition-all duration-1000" 
                           style={{ width: `${(STATUS_FLOW.indexOf(order.status) / (STATUS_FLOW.length - 1)) * 100}%` }} />

                      {STATUS_FLOW.map((step, idx) => {
                        const isDone = STATUS_FLOW.indexOf(order.status) > idx;
                        const isCurrent = order.status === step;
                        const isFuture = STATUS_FLOW.indexOf(order.status) < idx;

                        return (
                          <div key={step} className="relative z-10 flex flex-col items-center">
                             <div className={`w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-xl border-2 md:border-4 flex items-center justify-center transition-all duration-500 ${
                               isDone ? 'bg-blue-700 border-white' : 
                               isCurrent ? 'bg-white border-blue-700' : 
                               'bg-white border-gray-200'
                             }`}>
                                {isDone ? (
                                  <Check className="w-5 h-5 md:w-8 md:h-8 text-white stroke-[4]" />
                                ) : isCurrent ? (
                                  <div className="w-3 h-3 md:w-4 md:h-4 bg-blue-700 rounded-full" />
                                ) : (
                                  <div className="w-3 h-3 md:w-4 md:h-4 bg-gray-200 rounded-full" />
                                )}
                             </div>

                             <div className="absolute -bottom-10 md:-bottom-14 flex flex-col items-center">
                                <span className={`text-[8px] md:text-xs font-black uppercase tracking-widest ${isFuture ? 'text-gray-400' : 'text-blue-700'}`}>
                                   {STATUS_LABELS[step]}
                                </span>
                             </div>

                             <div className="absolute -bottom-6 md:-bottom-7">
                                {step === 'washing' && <WashingMachine className={`w-4 h-4 md:w-5 md:h-5 ${isFuture ? 'text-gray-200' : 'text-blue-700'}`} />}
                                {step === 'drying' && <Wind className={`w-4 h-4 md:w-5 md:h-5 ${isFuture ? 'text-gray-200' : 'text-blue-700'}`} />}
                                {step === 'ironing' && <Shirt className={`w-4 h-4 md:w-5 md:h-5 ${isFuture ? 'text-gray-200' : 'text-blue-700'}`} />}
                                {step === 'completed' && <Check className={`w-4 h-4 md:w-5 md:h-5 ${isFuture ? 'text-gray-200' : 'text-blue-700'}`} />}
                             </div>
                          </div>
                        )
                      })}
                   </div>
                </div>

                <div className="px-6 md:px-12 py-8 md:py-10 border-t-2 border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
                   <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
                      <div className="w-10 h-10 md:w-14 md:h-14 bg-gray-900 rounded-xl flex items-center justify-center text-white shrink-0">
                         <ShoppingBag className="w-5 h-5 md:w-7 md:h-7" />
                      </div>
                      <div>
                        <p className="text-base md:text-xl font-black text-gray-900 leading-none mb-1">{order.weight || '0'} Items</p>
                        <p className="text-[10px] md:text-sm font-bold text-gray-400 uppercase tracking-widest">{order.laundry_type}</p>
                      </div>
                   </div>
                   <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 w-full md:w-auto">
                      <div className="text-center md:text-right">
                        <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Estimated Completion</p>
                        <p className="text-sm md:text-lg font-black text-gray-900">{format(new Date(order.estimated_completion), 'dd MMM yyyy')}</p>
                      </div>
                      <button className="w-full md:w-auto px-8 py-3 md:py-4 border-2 border-gray-200 rounded-xl font-black text-sm md:text-base text-gray-900 hover:bg-gray-50 transition-all">View Details</button>
                   </div>
                </div>
              </div>

              <div className="text-center pt-4 md:pt-8">
                <p className="text-sm md:text-lg text-gray-500 font-bold">
                  Questions? <a href="#" className="text-blue-700 hover:underline inline-flex items-center gap-2 font-black ml-1 transition-all hover:gap-3"><Headphones className="w-5 h-5 md:w-6 md:h-6" /> Contact Hub</a>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="py-10 md:py-16 px-6 md:px-24 border-t-2 border-gray-200 bg-white flex flex-col md:flex-row items-center justify-between gap-6">
        <span className="font-black text-base md:text-xl text-gray-900 tracking-tighter">WashTrack © 2024</span>
        <div className="flex items-center gap-6 md:gap-10">
           {['Privacy', 'Terms', 'Support'].map(link => (
             <a key={link} href="#" className="text-[10px] md:text-xs font-black text-gray-400 hover:text-gray-900 uppercase tracking-widest">{link}</a>
           ))}
        </div>
      </footer>
    </div>
  );
}
