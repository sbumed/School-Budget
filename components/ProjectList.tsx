
import React from 'react';
import { Project, Role, User } from '../types';
import { Folder, CalendarDays, FileDown, Plus, ChevronRight, PieChart } from 'lucide-react';
import { generateProjectPDF } from '../utils/pdfGenerator';

interface ProjectListProps {
  projects: Project[];
  currentUser: User;
  onCreateClick: () => void;
  onViewDetails: (project: Project) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ projects, currentUser, onCreateClick, onViewDetails }) => {
  
  const visibleProjects = projects.filter(p => {
    if (currentUser.role === Role.DIRECTOR || currentUser.role === Role.FINANCE || currentUser.role === Role.ADMIN) return true;
    if (currentUser.role === Role.HEAD_DEPT) return p.department === currentUser.department;
    return p.owner_id === currentUser.id || p.department === currentUser.department;
  });

  const groupedProjects = visibleProjects.reduce((acc, project) => {
    const year = project.fiscal_year || 'ไม่ระบุปี';
    if (!acc[year]) acc[year] = [];
    acc[year].push(project);
    return acc;
  }, {} as Record<string, Project[]>);

  const sortedYears = Object.keys(groupedProjects).sort((a, b) => b.localeCompare(a));

  return (
    <div className="max-w-6xl mx-auto animate-fade-in space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">โครงการทั้งหมด</h2>
          <p className="text-slate-500 mt-1">จัดการและติดตามสถานะโครงการของคุณ</p>
        </div>
        <button 
          onClick={onCreateClick}
          className="bg-gradient-to-r from-sky-500 to-pink-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-pink-200 transition-all shadow-md flex items-center gap-2 transform hover:-translate-y-0.5"
        >
          <Plus size={18} /> เสนอโครงการใหม่
        </button>
      </div>

      {sortedYears.length === 0 && (
         <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
           <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
             <Folder size={40} />
           </div>
           <h3 className="text-lg font-bold text-slate-700">ยังไม่มีโครงการ</h3>
           <p className="text-slate-400">เริ่มต้นด้วยการเสนอโครงการใหม่สำหรับปีงบประมาณนี้</p>
         </div>
      )}

      {sortedYears.map(year => (
        <div key={year} className="space-y-5">
          <div className="flex items-center space-x-3">
             <span className="bg-gradient-to-r from-sky-100 to-pink-100 text-slate-700 border border-white px-3 py-1 rounded-lg text-sm font-bold font-mono shadow-sm">{year}</span>
             <h3 className="text-lg font-bold text-slate-700">ปีงบประมาณ {year}</h3>
             <div className="h-px bg-slate-200 flex-1"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {groupedProjects[year].map((project) => {
              const percent = project.total_budget > 0 ? (project.used_budget / project.total_budget) * 100 : 0;
              const isDanger = percent > 80;

              return (
                <div key={project.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-sky-100/50 transition-all duration-300 group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-sky-600 group-hover:border-sky-100 transition-colors">
                                <Folder size={24} />
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider bg-sky-50 px-2 py-0.5 rounded-full">{project.department}</span>
                                <h3 className="text-base font-bold text-slate-800 line-clamp-1 mt-0.5">{project.name}</h3>
                            </div>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${project.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-slate-300'}`}></div>
                    </div>

                    <div className="mb-6">
                        <div className="flex justify-between text-xs font-semibold text-slate-500 mb-2">
                            <span>งบประมาณใช้ไป</span>
                            <span className={isDanger ? 'text-pink-600' : 'text-sky-600'}>{percent.toFixed(1)}%</span>
                        </div>
                        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div 
                                className={`h-full rounded-full transition-all duration-700 ${isDanger ? 'bg-gradient-to-r from-pink-500 to-red-500' : 'bg-gradient-to-r from-sky-400 to-blue-500'}`} 
                                style={{ width: `${percent}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between mt-3 text-sm">
                             <div>
                                <p className="text-xs text-slate-400">ทั้งหมด</p>
                                <p className="font-bold text-slate-700">{project.total_budget.toLocaleString()}</p>
                             </div>
                             <div className="text-right">
                                <p className="text-xs text-slate-400">คงเหลือ</p>
                                <p className={`font-bold ${project.total_budget - project.used_budget < 0 ? 'text-pink-600' : 'text-emerald-600'}`}>
                                    {(project.total_budget - project.used_budget).toLocaleString()}
                                </p>
                             </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 pt-4 border-t border-slate-50">
                        <button 
                            onClick={() => generateProjectPDF(project)}
                            className="flex-1 py-2 rounded-lg bg-slate-50 text-slate-600 text-sm font-medium hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
                        >
                            <FileDown size={16} /> PDF
                        </button>
                        <button 
                            onClick={() => onViewDetails(project)}
                            className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:border-sky-200 hover:text-sky-600 transition-colors flex items-center justify-center gap-2"
                        >
                            รายละเอียด <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectList;
