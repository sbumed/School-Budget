
import React from 'react';
import { ExpenseRequest, RequestStatus, Role, User } from '../types';
import { CheckCircle, XCircle, Printer, Clock, Search, AlertCircle } from 'lucide-react';
import { generateRequestPDF } from '../utils/pdfGenerator';
import { INITIAL_PROJECTS } from '../constants';

interface ApprovalCenterProps {
  requests: ExpenseRequest[];
  currentUser: User;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const ApprovalCenter: React.FC<ApprovalCenterProps> = ({ requests, currentUser, onApprove, onReject }) => {

  const pendingRequests = requests.filter(r => {
    if (currentUser.role === Role.HEAD_DEPT) return r.status === RequestStatus.PENDING_HEAD; 
    if (currentUser.role === Role.FINANCE) return r.status === RequestStatus.PENDING_FINANCE;
    if (currentUser.role === Role.DIRECTOR || currentUser.role === Role.ADMIN) {
      return r.status === RequestStatus.PENDING_DIRECTOR || (currentUser.role === Role.ADMIN && r.status !== RequestStatus.APPROVED && r.status !== RequestStatus.REJECTED && r.status !== RequestStatus.COMPLETED);
    }
    return false;
  });

  const handlePrint = (req: ExpenseRequest) => {
    const project = INITIAL_PROJECTS.find(p => p.id === req.project_id) || INITIAL_PROJECTS[0];
    generateRequestPDF(req, project);
  };

  if (currentUser.role === Role.TEACHER) {
    return <div className="flex items-center justify-center h-96 text-slate-400">Access Denied</div>;
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in space-y-8">
      <div className="flex items-center justify-between">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">ศูนย์อนุมัติ (Approval Center)</h2>
            <p className="text-slate-500">พิจารณาคำขอและอนุมัติงบประมาณ</p>
        </div>
        <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex items-center text-slate-400">
            <Search size={20} className="ml-2"/>
            <input type="text" placeholder="ค้นหารายการ..." className="bg-transparent outline-none px-3 py-1 text-sm text-slate-700 w-48"/>
        </div>
      </div>

      {pendingRequests.length === 0 ? (
         <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-slate-200">
             <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500 animate-bounce-slow">
                 <CheckCircle size={48}/>
             </div>
             <h3 className="text-xl font-bold text-slate-800">ไม่มีรายการค้างพิจารณา</h3>
             <p className="text-slate-500 mt-2">คุณได้ดำเนินการอนุมัติรายการทั้งหมดแล้ว</p>
         </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
            {pendingRequests.map((req) => (
                <div key={req.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all group relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-sky-400 to-pink-500"></div>
                    
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 pl-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase">{req.form_type.split(' - ')[0]}</span>
                                <span className="text-xs text-slate-400 flex items-center gap-1"><Clock size={12}/> {req.date}</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-pink-600 transition-colors">{req.title}</h3>
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden">
                                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(req.requester_name)}&background=random`} alt="" />
                                </div>
                                <p className="text-sm text-slate-600">{req.requester_name}</p>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-4 min-w-[200px]">
                            <div className="text-right">
                                <span className="text-2xl font-bold text-slate-800">฿{req.amount.toLocaleString()}</span>
                                <button 
                                    onClick={() => handlePrint(req)}
                                    className="text-xs flex items-center justify-end text-sky-600 hover:underline mt-1 gap-1"
                                >
                                    <Printer size={12}/> ดูเอกสาร PDF
                                </button>
                            </div>
                            
                            <div className="flex gap-2 w-full md:w-auto">
                                <button 
                                    onClick={() => onReject(req.id)}
                                    className="flex-1 md:flex-none px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                                >
                                    ไม่อนุมัติ
                                </button>
                                <button 
                                    onClick={() => onApprove(req.id)}
                                    className="flex-1 md:flex-none px-6 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-pink-500 text-white text-sm font-bold hover:shadow-lg hover:shadow-pink-100 transition-all flex items-center justify-center gap-2"
                                >
                                    <CheckCircle size={16}/> อนุมัติ
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default ApprovalCenter;
