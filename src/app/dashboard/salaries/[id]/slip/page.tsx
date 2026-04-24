"use client";

import { use, useEffect, useState } from "react";
import { 
  ArrowLeft, 
  Printer, 
  Download, 
  Building2, 
  User, 
  Calendar, 
  DollarSign, 
  CheckCircle2,
  ShieldCheck,
  Zap,
  Receipt
} from "lucide-react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { toast } from "sonner";

export default function SalarySlipPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [salary, setSalary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSalary();
  }, [id]);

  const fetchSalary = async () => {
    try {
      const res = await fetch(`/api/salaries?id=${id}`);
      const result = await res.json();
      if (result.success) {
        setSalary(result.data);
      } else {
        toast.error("Voucher decoding failure");
      }
    } catch (error) {
      toast.error("Network sync failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <LoadingSpinner label="Decoding Financial Voucher..." />;
  if (!salary) return <div className="p-20 text-center font-black uppercase text-[#64748b]/20">Voucher Node Not Found</div>;

  const totalPaid = salary.paymentHistory?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 printable-area">
      {/* ACTION BAR (Hidden on Print) */}
      <div className="no-print sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#d8dee6] px-8 py-4 flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#64748b] hover:text-[#263238]"
        >
          <ArrowLeft size={14} /> Back to Ledger
        </button>
        <div className="flex items-center gap-4">
           <button 
             onClick={handlePrint}
             className="flex items-center gap-3 px-6 py-3 bg-[#263238] text-white rounded-md font-black text-[10px] uppercase tracking-widest hover:bg-[#64748b] transition-all"
           >
             <Printer size={14} /> Print Slip
           </button>
           <button className="flex items-center gap-3 px-6 py-3 bg-[#f59e0b] text-[#263238] rounded-md font-black text-[10px] uppercase tracking-widest hover:bg-[#d97706] transition-all">
             <Download size={14} /> Export PDF
           </button>
        </div>
      </div>

      {/* SALARY SLIP DOCUMENT */}
      <div className="max-w-4xl mx-auto mt-12 bg-white shadow-2xl border border-[#d8dee6] p-12 md:p-20 space-y-16 relative overflow-hidden slip-container">
        {/* Watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none rotate-12">
           <Building2 size={600} />
        </div>

        {/* Header: Company Info */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 border-b-4 border-[#263238] pb-12">
           <div className="space-y-4">
              <div className="flex items-center gap-4">
                 <div className="h-16 w-16 bg-[#263238] rounded-lg flex items-center justify-center text-[#f59e0b]">
                    <Building2 size={32} />
                 </div>
                 <div>
                    <h1 className="text-3xl font-black uppercase italic tracking-tighter text-[#263238]">Falcon <span className="text-[#f59e0b]">Garage</span></h1>
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#64748b]">Automotive Excellence Hub</p>
                 </div>
              </div>
              <div className="text-[10px] font-medium text-[#64748b] uppercase tracking-widest leading-relaxed">
                 Plot 42, Industrial Sector 5 <br />
                 Doha, Qatar | +974 4455 6677
              </div>
           </div>
           <div className="text-right">
              <div className="inline-flex items-center gap-2 bg-[#263238] px-4 py-1.5 rounded-full text-[9px] font-black text-white uppercase tracking-widest mb-4">
                 <ShieldCheck size={10} className="text-[#f59e0b]" />
                 Verified Voucher
              </div>
              <h2 className="text-5xl font-black uppercase italic tracking-tighter text-[#263238]/10">PAY SLIP</h2>
              <p className="text-[11px] font-bold text-[#263238] mt-2">Voucher ID: {salary._id.slice(-8).toUpperCase()}</p>
           </div>
        </div>

        {/* Employee & Period Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 bg-[#f8fafc] p-8 rounded-xl border border-[#d8dee6]">
           <div className="space-y-2">
              <p className="text-[9px] font-black text-[#64748b] uppercase tracking-widest">Employee Name</p>
              <p className="text-sm font-black text-[#263238] uppercase">{salary.employeeId?.name}</p>
           </div>
           <div className="space-y-2">
              <p className="text-[9px] font-black text-[#64748b] uppercase tracking-widest">Personnel Role</p>
              <p className="text-sm font-black text-[#263238] uppercase">{salary.employeeId?.role}</p>
           </div>
           <div className="space-y-2">
              <p className="text-[9px] font-black text-[#64748b] uppercase tracking-widest">Billing Cycle</p>
              <p className="text-sm font-black text-[#263238] uppercase">{salary.month}</p>
           </div>
           <div className="space-y-2 text-right">
              <p className="text-[9px] font-black text-[#64748b] uppercase tracking-widest">Payment Date</p>
              <p className="text-sm font-black text-[#263238] uppercase">{new Date(salary.updatedAt).toLocaleDateString()}</p>
           </div>
        </div>

        {/* Financial Breakdown Table */}
        <div className="space-y-6">
           <table className="w-full border-collapse">
              <thead>
                 <tr className="border-b-2 border-[#263238] text-[11px] font-black uppercase tracking-widest text-[#263238]">
                    <th className="py-4 text-left">Description of Remuneration</th>
                    <th className="py-4 text-right">Earnings</th>
                    <th className="py-4 text-right">Deductions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-[#d8dee6]">
                 <tr className="text-sm font-bold">
                    <td className="py-6 text-[#263238]">Monthly Base Salary (Contracted)</td>
                    <td className="py-6 text-right">QAR {salary.baseSalary?.toLocaleString()}</td>
                    <td className="py-6 text-right text-[#64748b]/30">---</td>
                 </tr>
                 <tr className="text-sm font-bold">
                    <td className="py-6 text-[#263238]">Capital Advances (Cycle Adjustments)</td>
                    <td className="py-6 text-right text-[#64748b]/30">---</td>
                    <td className="py-6 text-right text-rose-500">QAR {salary.advanceTaken?.toLocaleString()}</td>
                 </tr>
                 {salary.deductions > 0 && (
                    <tr className="text-sm font-bold">
                       <td className="py-6 text-[#263238]">Miscellaneous Audit Deductions</td>
                       <td className="py-6 text-right text-[#64748b]/30">---</td>
                       <td className="py-6 text-right text-rose-500">QAR {salary.deductions?.toLocaleString()}</td>
                    </tr>
                 )}
              </tbody>
              <tfoot>
                 <tr className="bg-[#263238] text-white">
                    <td className="py-6 px-6 text-sm font-black uppercase italic tracking-tighter">Net Payable Remuneration</td>
                    <td colSpan={2} className="py-6 px-6 text-right text-2xl font-black italic text-[#f59e0b]">QAR {salary.netSalary?.toLocaleString()}</td>
                 </tr>
              </tfoot>
           </table>
        </div>

        {/* Payment Events */}
        <div className="space-y-6">
           <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#263238] border-b border-[#d8dee6] pb-4">Dispersal Audit Trace</h3>
           <div className="space-y-4">
              {salary.paymentHistory?.map((p: any, idx: number) => (
                 <div key={idx} className="flex items-center justify-between p-4 bg-[#f8fafc] border border-[#d8dee6] rounded-md">
                    <div className="flex items-center gap-4">
                       <div className="h-8 w-8 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-600">
                          <CheckCircle2 size={16} />
                       </div>
                       <div>
                          <p className="text-[11px] font-black text-[#263238] uppercase">Partial Dispersal via {p.mode}</p>
                          <p className="text-[9px] font-bold text-[#64748b] uppercase">{new Date(p.date).toLocaleString()}</p>
                       </div>
                    </div>
                    <p className="text-sm font-black text-[#263238]">QAR {p.amount.toLocaleString()}</p>
                 </div>
              ))}
              <div className="flex items-center justify-between p-6 bg-[#263238]/5 border-2 border-dashed border-[#d8dee6] rounded-md">
                 <p className="text-[10px] font-black text-[#263238] uppercase tracking-widest">Total Amount Dispersed</p>
                 <p className="text-xl font-black text-[#263238] italic">QAR {totalPaid.toLocaleString()}</p>
              </div>
           </div>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-20 pt-20">
           <div className="space-y-12">
              <div className="h-px bg-[#d8dee6]"></div>
              <div className="text-center">
                 <p className="text-[10px] font-black uppercase tracking-widest text-[#263238]">Personnel Signature</p>
                 <p className="text-[9px] font-bold text-[#64748b] mt-1 italic">I acknowledge receipt of the above amount</p>
              </div>
           </div>
           <div className="space-y-12">
              <div className="flex flex-col items-center">
                 <div className="h-16 w-16 opacity-10">
                    <ShieldCheck size={64} />
                 </div>
                 <div className="h-px w-full bg-[#d8dee6] mt-4"></div>
              </div>
              <div className="text-center">
                 <p className="text-[10px] font-black uppercase tracking-widest text-[#263238]">Authorized Signatory</p>
                 <p className="text-[9px] font-bold text-[#64748b] mt-1">Falcon Garage Finance Node</p>
              </div>
           </div>
        </div>

        {/* Footer Disclaimer */}
        <div className="pt-20 text-center space-y-4">
           <p className="text-[9px] font-medium text-[#64748b] uppercase tracking-widest leading-relaxed">
              This is a computer-generated financial document. <br />
              Generated via Falcon Garage ERP Intelligence Hub.
           </p>
           <div className="flex items-center justify-center gap-2 text-[#f59e0b]">
              <Zap size={14} />
              <p className="text-[10px] font-black uppercase tracking-[0.5em]">SYSTEM VERIFIED</p>
           </div>
        </div>
      </div>
      
      {/* GLOBAL CSS FOR PRINTING */}
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          .printable-area { background: white !important; padding: 0 !important; }
          .slip-container { 
            box-shadow: none !important; 
            border: none !important; 
            margin: 0 !important;
            padding: 0 !important;
            max-width: 100% !important;
          }
          body { background: white !important; }
        }
      `}</style>
    </div>
  );
}
