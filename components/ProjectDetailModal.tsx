
import React, { useMemo } from 'react';
import { Project, ExpenseRequest, RequestStatus } from '../types';
import { X, PieChart as PieIcon, Wallet, TrendingUp, Clock, FileText, CheckCircle, AlertCircle, BarChart3 } from 'lucide-react';
import { generateProjectPDF } from '../utils/pdfGenerator';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface ProjectDetailModalProps {
  project: Project;
  requests: ExpenseRequest[];
  onClose: () => void;
}

const COLORS = ['#0ea5e9', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#64748b'];

const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({ project, requests, onClose }) => {
    // Filter requests for this project
    const projectRequests = requests.filter(r => r.project_id === project.id);
    
    // Calculate stats
    const total = project.total_budget;
    const used = project.used_budget;
    const remaining = total - used;
    const percent = total > 0 ? (used / total) * 100 : 0;

    // Group expenses by category for Chart
    const categoryData = useMemo(() => {
        const grouped = projectRequests.reduce((acc, curr) => {
            if (curr.status === RequestStatus.APPROVED || curr.status === RequestStatus.COMPLETED) {
                acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
            }
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(grouped).map(([name, value]) => ({ name, value }));
    }, [projectRequests]);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-up">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-gradient-to-r from-slate-50 to-white">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                             <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-600 uppercase tracking-wider">{project.department}</span>
                             <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${project.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>{project.status === 'active' ? 'กำลังดำเนินการ' : 'ปิดโครงการ'}</span>
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-slate-800 pr-8">{project.name}</h2>
                        <p className="text-sm text-slate-500 mt-1">ปีงบประมาณ {project.fiscal_year}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 bg-white">
                    
                    {/* Budget Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="p-5 rounded-2xl bg-sky-50 border border-sky-100 shadow-sm flex flex-col justify-between">
                             <div className="flex items-center gap-3 mb-2 text-sky-600">
                                <Wallet size={20}/>
                                <span className="font-bold text-sm">งบประมาณอนุมัติ</span>
                             </div>
                             <p className="text-2xl font-bold text-slate-800">{total.toLocaleString()} <span className="text-sm font-normal text-slate-500">บาท</span></p>
                        </div>
                        <div className="p-5 rounded-2xl bg-pink-50 border border-pink-100 shadow-sm flex flex-col justify-between">
                             <div className="flex items-center gap-3 mb-2 text-pink-600">
                                <TrendingUp size={20}/>
                                <span className="font-bold text-sm">ใช้ไปแล้ว</span>
                             </div>
                             <div>
                                <p className="text-2xl font-bold text-slate-800">{used.toLocaleString()} <span className="text-sm font-normal text-slate-500">บาท</span></p>
                                <div className="w-full bg-pink-200 h-1.5 rounded-full mt-2">
                                    <div className="bg-pink-500 h-1.5 rounded-full transition-all duration-500" style={{width: `${Math.min(percent, 100)}%`}}></div>
                                </div>
                                <p className="text-xs text-pink-600 mt-1 font-medium text-right">{percent.toFixed(2)}%</p>
                             </div>
                        </div>
                        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100 shadow-sm flex flex-col justify-between">
                             <div className="flex items-center gap-3 mb-2 text-emerald-600">
                                <PieIcon size={20}/>
                                <span className="font-bold text-sm">คงเหลือสุทธิ</span>
                             </div>
                             <p className="text-2xl font-bold text-emerald-700">{remaining.toLocaleString()} <span className="text-sm font-normal text-emerald-500">บาท</span></p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                        {/* Left: Text Details */}
                        <div className="lg:col-span-2 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                             <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><FileText size={18}/> รายละเอียดสังเขป</h3>
                             <div className="space-y-4 text-sm">
                                 <div>
                                     <strong className="text-slate-700 block mb-1">หลักการและเหตุผล:</strong>
                                     <p className="text-slate-600 leading-relaxed">{project.rationale ? (project.rationale.length > 300 ? project.rationale.substring(0, 300) + '...' : project.rationale) : '-'}</p>
                                 </div>
                                 <div>
                                     <strong className="text-slate-700 block mb-1">วัตถุประสงค์:</strong>
                                     {project.objectives && project.objectives.length > 0 && project.objectives[0] !== '' ? (
                                         <ul className="list-disc pl-5 text-slate-600 space-y-1">
                                            {project.objectives.slice(0,3).map((obj, i) => <li key={i}>{obj}</li>)}
                                         </ul>
                                     ) : (
                                         <p className="text-slate-500">-</p>
                                     )}
                                 </div>
                             </div>
                        </div>

                        {/* Right: Chart */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><BarChart3 size={18} className="text-purple-500"/> สัดส่วนการใช้จ่าย</h3>
                            {categoryData.length > 0 ? (
                                <div className="flex-1 min-h-[200px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={categoryData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {categoryData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip 
                                                formatter={(value: number) => `฿${value.toLocaleString()}`}
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                            />
                                            <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{fontSize: '10px', paddingTop: '10px'}}/>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-slate-400 text-sm flex-col gap-2">
                                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center"><PieIcon size={24} /></div>
                                    <span>ยังไม่มีการเบิกจ่าย</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Expense History Table */}
                    <div>
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Clock size={18}/> ประวัติการทำรายการ 
                            <span className="bg-slate-100 text-slate-500 text-xs px-2 py-0.5 rounded-full border border-slate-200">{projectRequests.length} รายการ</span>
                        </h3>
                        
                        {projectRequests.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 bg-slate-50/50">
                                <p>ยังไม่มีประวัติการเบิกจ่ายในโครงการนี้</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                                <table className="w-full text-left text-sm min-w-[600px]">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold text-slate-600 w-32">วันที่</th>
                                            <th className="px-4 py-3 font-semibold text-slate-600">รายการ</th>
                                            <th className="px-4 py-3 font-semibold text-slate-600 w-40">หมวดงบ</th>
                                            <th className="px-4 py-3 font-semibold text-slate-600 text-right w-32">จำนวนเงิน</th>
                                            <th className="px-4 py-3 font-semibold text-slate-600 text-center w-32">สถานะ</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {projectRequests.map(req => (
                                            <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{req.date}</td>
                                                <td className="px-4 py-3 text-slate-800 font-medium">
                                                    {req.title}
                                                    <span className="block text-xs text-slate-400 font-normal">{req.form_type.split(' - ')[0]} • {req.requester_name}</span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-500">
                                                    <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">{req.category}</span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-800 font-bold text-right">{req.amount.toLocaleString()}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold inline-flex items-center gap-1 justify-center w-full
                                                        ${req.status === RequestStatus.APPROVED || req.status === RequestStatus.COMPLETED ? 'bg-emerald-100 text-emerald-700' : 
                                                          req.status === RequestStatus.REJECTED ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                                                        {req.status === RequestStatus.APPROVED || req.status === RequestStatus.COMPLETED ? <CheckCircle size={10}/> : 
                                                         req.status === RequestStatus.REJECTED ? <AlertCircle size={10}/> : <Clock size={10}/>}
                                                        {req.status}
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

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                     <button onClick={() => generateProjectPDF(project)} className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-white hover:border-sky-300 hover:text-sky-600 font-medium text-sm flex items-center gap-2 transition-colors">
                        <FileText size={16} /> ดาวน์โหลด PDF
                     </button>
                     <button onClick={onClose} className="px-6 py-2 rounded-xl bg-slate-800 text-white hover:bg-slate-900 font-medium text-sm transition-colors shadow-sm">
                        ปิดหน้าต่าง
                     </button>
                </div>
            </div>
        </div>
    );
}

export default ProjectDetailModal;
