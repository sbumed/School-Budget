
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Wallet, TrendingUp, PieChart, Activity, ArrowUpRight, Clock } from 'lucide-react';
import { Project, ExpenseRequest, Role, User } from '../types';

interface DashboardProps {
  currentUser: User;
  projects: Project[];
  requests: ExpenseRequest[];
  onViewAllProjects: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ currentUser, projects, requests, onViewAllProjects }) => {
  
  const relevantProjects = useMemo(() => {
    if (currentUser.role === Role.TEACHER) {
      return projects.filter(p => p.owner_id === currentUser.id || p.department === currentUser.department);
    }
    if (currentUser.role === Role.HEAD_DEPT) {
      return projects.filter(p => p.department === currentUser.department);
    }
    return projects;
  }, [projects, currentUser]);

  const totalBudget = relevantProjects.reduce((acc, curr) => acc + curr.total_budget, 0);
  const usedBudget = relevantProjects.reduce((acc, curr) => acc + curr.used_budget, 0);
  const remainingBudget = totalBudget - usedBudget;
  const percentageUsed = totalBudget > 0 ? (usedBudget / totalBudget) * 100 : 0;

  const recentActivity = [...requests]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const budgetData = relevantProjects.map(p => ({
    name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
    total: p.total_budget,
    used: p.used_budget,
    remaining: p.total_budget - p.used_budget
  }));

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Welcome Banner - Blue-Pink Gradient */}
      <div className="bg-gradient-to-r from-sky-500 to-pink-500 rounded-3xl p-8 text-white shadow-xl shadow-pink-200/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-sky-300 opacity-20 rounded-full -ml-10 -mb-10 blur-2xl"></div>
        
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">สวัสดี, {currentUser.name} 👋</h2>
          <p className="text-white/90 text-lg">ยินดีต้อนรับสู่ระบบบริหารงบประมาณ ประจำปีการศึกษา 2568</p>
          <div className="mt-6 flex gap-4">
             <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
                <span className="text-xs text-white/80 block">ตำแหน่ง</span>
                <span className="font-semibold">{currentUser.role}</span>
             </div>
             <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
                <span className="text-xs text-white/80 block">สังกัด</span>
                <span className="font-semibold">{currentUser.department}</span>
             </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-sky-50 text-sky-600 rounded-xl group-hover:bg-sky-500 group-hover:text-white transition-colors">
              <Wallet size={24} />
            </div>
            <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">Budget</span>
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">งบประมาณทั้งหมด</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{totalBudget.toLocaleString()} <span className="text-sm font-normal text-slate-400">บาท</span></h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-pink-50 text-pink-600 rounded-xl group-hover:bg-pink-500 group-hover:text-white transition-colors">
              <TrendingUp size={24} />
            </div>
            <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">Used</span>
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">ใช้ไปแล้ว</p>
            <div className="flex items-baseline gap-2">
               <h3 className="text-2xl font-bold text-slate-800 mt-1">{usedBudget.toLocaleString()}</h3>
               <span className="text-xs text-pink-600 font-bold bg-pink-50 px-1.5 py-0.5 rounded">
                  {percentageUsed.toFixed(1)}%
               </span>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
             <div className="bg-gradient-to-r from-sky-400 to-pink-500 h-full rounded-full transition-all duration-1000" style={{width: `${percentageUsed}%`}}></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <PieChart size={24} />
            </div>
            <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">Remaining</span>
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">คงเหลือสุทธิ</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">{remainingBudget.toLocaleString()} <span className="text-sm font-normal text-slate-400">บาท</span></h3>
          </div>
        </div>
      </div>

      {/* Charts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Activity size={20} className="text-sky-500"/>
                สถานะงบประมาณรายโครงการ
             </h3>
             <button 
                onClick={onViewAllProjects}
                className="text-sm text-sky-600 hover:text-sky-700 font-medium flex items-center"
             >
                ดูรายละเอียด <ArrowUpRight size={16} className="ml-1"/>
             </button>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} tickFormatter={(val) => `฿${val/1000}k`} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="used" name="ใช้ไปแล้ว" radius={[4, 4, 0, 0]} barSize={40}>
                  {budgetData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#0ea5e9' : '#ec4899'} />
                  ))}
                </Bar>
                <Bar dataKey="remaining" name="คงเหลือ" fill="#e2e8f0" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
             <Clock size={20} className="text-pink-500"/>
             การเคลื่อนไหวล่าสุด
          </h3>
          <div className="space-y-6 relative before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
            {recentActivity.map((req, idx) => (
              <div key={req.id} className="relative pl-8">
                <div className={`absolute left-0 top-1.5 w-5 h-5 rounded-full border-4 border-white shadow-sm ${
                  req.status.includes('อนุมัติ') || req.status === 'เบิกจ่ายเสร็จสิ้น' ? 'bg-emerald-500' : 
                  req.status.includes('ไม่อนุมัติ') ? 'bg-red-500' : 'bg-sky-500'
                }`}></div>
                <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 hover:bg-white hover:shadow-md transition-all duration-200">
                   <p className="text-sm font-semibold text-slate-800 line-clamp-1">{req.title}</p>
                   <div className="flex justify-between items-end mt-2">
                      <div>
                         <p className="text-xs text-slate-500">{req.requester_name}</p>
                         <span className={`text-[10px] px-2 py-0.5 rounded-full mt-1 inline-block ${
                             req.status.includes('อนุมัติ') ? 'bg-emerald-100 text-emerald-700' :
                             req.status.includes('รอ') ? 'bg-orange-100 text-orange-700' :
                             'bg-slate-200 text-slate-600'
                         }`}>
                            {req.status}
                         </span>
                      </div>
                      <p className="text-sm font-bold text-slate-700">฿{req.amount.toLocaleString()}</p>
                   </div>
                </div>
              </div>
            ))}
            {recentActivity.length === 0 && <p className="text-center text-slate-400 pl-8">ไม่มีข้อมูล</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
