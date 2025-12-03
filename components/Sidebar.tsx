
import React from 'react';
import { LayoutDashboard, FolderOpen, FilePlus, CheckSquare, LogOut, PieChart, Users } from 'lucide-react';
import { Role, User } from '../types';

interface SidebarProps {
  currentUser: User;
  currentView: string;
  onChangeView: (view: string) => void;
  requestCount: number;
  pendingUserCount?: number;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentUser, currentView, onChangeView, requestCount, pendingUserCount = 0, onLogout }) => {
  
  const menuItems = [
    { id: 'dashboard', label: 'ภาพรวมระบบ', subLabel: 'Dashboard', icon: LayoutDashboard, roles: [Role.TEACHER, Role.HEAD_DEPT, Role.FINANCE, Role.DIRECTOR, Role.ADMIN] },
    { id: 'projects', label: 'โครงการ', subLabel: 'My Projects', icon: FolderOpen, roles: [Role.TEACHER, Role.HEAD_DEPT, Role.FINANCE, Role.DIRECTOR, Role.ADMIN] },
    { id: 'create_request', label: 'ขออนุมัติ/ซื้อจ้าง', subLabel: 'Create Request', icon: FilePlus, roles: [Role.TEACHER, Role.HEAD_DEPT, Role.ADMIN] },
    { id: 'approvals', label: 'รอการอนุมัติ', subLabel: 'Approvals', icon: CheckSquare, roles: [Role.HEAD_DEPT, Role.FINANCE, Role.DIRECTOR, Role.ADMIN], badge: requestCount },
    { id: 'reports', label: 'รายงาน', subLabel: 'Reports', icon: PieChart, roles: [Role.FINANCE, Role.DIRECTOR, Role.ADMIN] },
    { id: 'user_management', label: 'จัดการผู้ใช้', subLabel: 'Users', icon: Users, roles: [Role.ADMIN], badge: pendingUserCount },
  ];

  return (
    <aside className="w-72 bg-white border-r border-slate-200 h-screen fixed left-0 top-0 flex flex-col z-50 shadow-sm font-sans transition-all duration-300">
      {/* Header */}
      <div className="h-24 flex items-center px-6 border-b border-slate-100 bg-white">
        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-md shadow-slate-100 mr-3 shrink-0 overflow-hidden border border-slate-100">
            <img src="https://i.postimg.cc/Rh4cr0nW/769191.jpg" alt="Logo" className="w-full h-full object-cover" />
        </div>
        <div>
          <h1 className="font-bold text-slate-800 text-lg leading-tight">SchoolBudget</h1>
          <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Management System</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto custom-scrollbar">
        <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Menu</p>
        {menuItems.map((item) => {
          if (!item.roles.includes(currentUser.role)) return null;
          
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                isActive 
                  ? 'bg-sky-50 shadow-sm ring-1 ring-sky-100' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {isActive && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-sky-400 to-pink-500 rounded-r-full" />}
              <div className="flex items-center space-x-3 relative z-10">
                <item.icon size={20} className={`transition-colors ${isActive ? 'text-pink-500' : 'text-slate-400 group-hover:text-slate-600'}`} />
                <div className="text-left">
                  <p className={`text-sm font-semibold ${isActive ? 'text-slate-800' : 'text-slate-700'}`}>{item.label}</p>
                  <p className={`text-[10px] ${isActive ? 'text-sky-500' : 'text-slate-400 group-hover:text-slate-500'}`}>{item.subLabel}</p>
                </div>
              </div>
              {item.badge && item.badge > 0 && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm ${isActive ? 'bg-pink-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
         <div className="flex items-center p-3 rounded-xl bg-white border border-slate-200 shadow-sm mb-3">
            <img src={currentUser.avatar} alt="avatar" className="w-10 h-10 rounded-full border-2 border-sky-100" />
            <div className="ml-3 overflow-hidden flex-1">
               <p className="text-sm font-bold text-slate-800 truncate">{currentUser.name}</p>
               <p className="text-xs text-sky-600 truncate font-medium bg-sky-50 inline-block px-1.5 rounded">{currentUser.role}</p>
            </div>
         </div>
         <button 
           onClick={onLogout}
           className="w-full flex items-center justify-center space-x-2 text-slate-500 hover:text-pink-600 hover:bg-pink-50 rounded-xl text-sm py-2.5 transition-all font-medium"
         >
            <LogOut size={18} />
            <span>ออกจากระบบ</span>
         </button>
      </div>
    </aside>
  );
};

export default Sidebar;
