
import React, { useState } from 'react';
import { AccessRequest, Department, Role, User } from '../types';
import { UserPlus, UserCheck, Trash2, CheckCircle, XCircle, MoreHorizontal } from 'lucide-react';

interface UserManagementProps {
  users: User[];
  accessRequests: AccessRequest[];
  onApproveRequest: (request: AccessRequest) => void;
  onRejectRequest: (id: string) => void;
  onDeleteUser: (id: string) => void;
  onAddUser: (user: Omit<User, 'id' | 'avatar'>) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ 
  users, 
  accessRequests, 
  onApproveRequest, 
  onRejectRequest, 
  onDeleteUser,
  onAddUser
}) => {
  const [activeTab, setActiveTab] = useState<'requests' | 'users'>('requests');
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form State
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<Role>(Role.TEACHER);
  const [newDept, setNewDept] = useState<Department>(Department.ACADEMIC);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddUser({ name: newName, role: newRole, department: newDept });
    setNewName('');
    setShowAddForm(false);
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="flex justify-between items-end mb-8">
         <div>
            <h2 className="text-2xl font-bold text-slate-800">จัดการผู้ใช้งาน</h2>
            <p className="text-slate-500">ควบคุมสิทธิ์การเข้าถึงและจัดการบุคลากร</p>
         </div>
         <div className="flex bg-slate-100 p-1 rounded-xl">
             <button 
                onClick={() => setActiveTab('requests')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${activeTab === 'requests' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
                คำขอใหม่
                {accessRequests.length > 0 && <span className="bg-pink-500 text-white text-[10px] px-1.5 rounded-full">{accessRequests.length}</span>}
             </button>
             <button 
                onClick={() => setActiveTab('users')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'users' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
                ผู้ใช้งานทั้งหมด ({users.length})
             </button>
         </div>
      </div>

      {activeTab === 'requests' && (
        <div className="space-y-4">
          {accessRequests.length === 0 ? (
             <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <UserCheck size={32}/>
                </div>
                <p className="text-slate-500 font-medium">ไม่มีคำขอสิทธิ์ใหม่</p>
             </div>
          ) : (
            accessRequests.map(req => (
              <div key={req.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="w-12 h-12 rounded-full bg-sky-50 flex items-center justify-center text-sky-600 font-bold text-lg">
                     {req.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">{req.name}</h3>
                    <p className="text-sm text-slate-500">{req.department} • <span className="text-sky-600">{req.role}</span></p>
                    <p className="text-xs text-slate-400 mt-1">เมื่อ: {req.requestDate}</p>
                  </div>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                   <button onClick={() => onRejectRequest(req.id)} className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors text-sm font-medium">ปฏิเสธ</button>
                   <button onClick={() => onApproveRequest(req)} className="flex-1 px-6 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700 shadow-sm transition-colors text-sm font-medium">อนุมัติ</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <>
          <div className="flex justify-end mb-4">
             <button onClick={() => setShowAddForm(!showAddForm)} className="bg-gradient-to-r from-sky-500 to-pink-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-md hover:shadow-pink-200 transition-all">
                <UserPlus size={16}/> เพิ่มผู้ใช้
             </button>
          </div>

          {showAddForm && (
             <form onSubmit={handleAddSubmit} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-6 animate-slide-down">
                <h3 className="font-bold text-slate-700 mb-4">เพิ่มข้อมูลบุคลากร</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <input required type="text" placeholder="ชื่อ-นามสกุล" value={newName} onChange={e => setNewName(e.target.value)} className="p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-sky-500"/>
                   <select value={newDept} onChange={e => setNewDept(e.target.value as Department)} className="p-2.5 border rounded-xl outline-none"><option disabled>เลือกสังกัด</option>{Object.values(Department).map(d => <option key={d} value={d}>{d}</option>)}</select>
                   <select value={newRole} onChange={e => setNewRole(e.target.value as Role)} className="p-2.5 border rounded-xl outline-none"><option disabled>เลือกระดับสิทธิ์</option>{Object.values(Role).map(r => <option key={r} value={r}>{r}</option>)}</select>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                   <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 text-sm text-slate-500 hover:bg-slate-200 rounded-lg">ยกเลิก</button>
                   <button type="submit" className="px-6 py-2 text-sm bg-sky-600 text-white rounded-lg font-medium hover:bg-sky-700">บันทึก</button>
                </div>
             </form>
          )}

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
             <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                   <tr>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Name</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Role</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Department</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase">Action</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                         <td className="px-6 py-4 flex items-center gap-3">
                            <img src={u.avatar} className="w-8 h-8 rounded-full bg-slate-200" alt=""/>
                            <span className="font-medium text-slate-700">{u.name}</span>
                         </td>
                         <td className="px-6 py-4">
                            <span className={`text-xs font-bold px-2 py-1 rounded-md ${u.role === Role.ADMIN ? 'bg-purple-100 text-purple-700' : 'bg-sky-100 text-sky-700'}`}>
                               {u.role}
                            </span>
                         </td>
                         <td className="px-6 py-4 text-sm text-slate-500">{u.department}</td>
                         <td className="px-6 py-4 text-right">
                            {u.role !== Role.ADMIN && (
                               <button onClick={() => onDeleteUser(u.id)} className="text-slate-400 hover:text-red-500 transition-colors p-1 hover:bg-red-50 rounded">
                                  <Trash2 size={16}/>
                               </button>
                            )}
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
        </>
      )}
    </div>
  );
};

export default UserManagement;
