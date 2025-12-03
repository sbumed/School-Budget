
import React, { useState } from 'react';
import { User, Role, Department, AccessRequest } from '../types';
import { LogIn, Lock, User as UserIcon, UserPlus, AlertCircle, X, CheckCircle } from 'lucide-react';

interface LoginPageProps {
  users: User[];
  onLogin: (user: User) => void;
  onRequestAccess: (request: Omit<AccessRequest, 'id' | 'requestDate'>) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ users, onLogin, onRequestAccess }) => {
  const [selectedUserId, setSelectedUserId] = useState<string>(users.length > 0 ? users[0].id : '');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [reqName, setReqName] = useState('');
  const [reqDept, setReqDept] = useState<Department>(Department.ACADEMIC);
  const [reqRole, setReqRole] = useState<Role>(Role.TEACHER);
  const [isRequestSent, setIsRequestSent] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setTimeout(() => {
      const user = users.find(u => u.id === selectedUserId);
      if (user) {
        if (user.id === 'admin_kru' && password !== '0629264551') {
             setError('รหัสผ่านไม่ถูกต้อง'); setIsLoading(false); return;
        }
        onLogin(user);
      } else { setError('ไม่พบผู้ใช้งาน'); }
      setIsLoading(false);
    }, 800);
  };

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRequestAccess({ name: reqName, department: reqDept, role: reqRole });
    setIsRequestSent(true);
    setTimeout(() => { setShowRequestModal(false); setIsRequestSent(false); setReqName(''); }, 2000);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f8fafc] relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-slate-50">
         <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-sky-500/10 to-pink-500/10 skew-y-[-6deg] transform -translate-y-24"></div>
         <div className="absolute bottom-0 right-0 w-96 h-96 bg-sky-400/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 bg-white p-8 md:p-10 rounded-[2rem] shadow-2xl shadow-slate-200 w-full max-w-md border border-slate-100">
        <div className="text-center mb-10">
          <div className="w-24 h-24 mx-auto mb-6 rounded-[1.5rem] bg-gradient-to-br from-sky-500 to-pink-500 p-1 shadow-lg shadow-pink-200">
             <img src="https://i.postimg.cc/Rh4cr0nW/769191.jpg" alt="Logo" className="w-full h-full rounded-[1.3rem] object-cover bg-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1 tracking-tight">SchoolBudget</h1>
          <p className="text-sm text-slate-500 font-medium">ระบบบริหารงบประมาณโรงเรียน</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Select Account</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><UserIcon size={18} className="text-slate-400" /></div>
              <select 
                value={selectedUserId}
                onChange={(e) => { setSelectedUserId(e.target.value); setPassword(''); setError(null); }}
                className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border-transparent focus:bg-white border focus:border-sky-500 rounded-2xl focus:ring-4 focus:ring-sky-500/10 outline-none transition-all text-slate-700 font-medium appearance-none"
              >
                {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Lock size={18} className="text-slate-400" /></div>
              <input 
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className={`block w-full pl-11 pr-4 py-3.5 bg-slate-50 border-transparent focus:bg-white border rounded-2xl focus:ring-4 outline-none transition-all font-medium ${error ? 'border-pink-500 focus:ring-pink-500/10' : 'focus:border-sky-500 focus:ring-sky-500/10'}`}
                placeholder={selectedUserId === 'admin_kru' ? 'Enter Admin Password' : '••••••••'}
                required={selectedUserId === 'admin_kru'}
              />
            </div>
            {error && <div className="flex items-center gap-1.5 text-pink-600 text-xs mt-3 font-medium bg-pink-50 p-2 rounded-lg"><AlertCircle size={14} /> {error}</div>}
          </div>

          <button
            type="submit" disabled={isLoading}
            className="w-full py-4 rounded-2xl shadow-lg shadow-sky-500/20 text-sm font-bold text-white bg-gradient-to-r from-sky-500 to-pink-500 hover:shadow-pink-300/50 active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
          >
             {isLoading ? <span className="animate-pulse">Authenticating...</span> : <><span>Sign In</span><LogIn size={18}/></>}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100">
          <button onClick={() => setShowRequestModal(true)} className="w-full py-3 rounded-xl text-sm font-bold text-sky-600 bg-sky-50 hover:bg-sky-100 transition-colors flex items-center justify-center gap-2">
            <UserPlus size={18} /> ลงทะเบียนขอสิทธิ์ใหม่
          </button>
        </div>
      </div>

      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            {isRequestSent ? (
              <div className="p-10 text-center">
                 <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle size={40} /></div>
                 <h3 className="text-xl font-bold text-slate-800">ส่งคำขอสำเร็จ!</h3>
                 <p className="text-slate-500 mt-2">กรุณารอการอนุมัติจากผู้ดูแลระบบ</p>
              </div>
            ) : (
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-xl text-slate-800">ลงทะเบียน</h3>
                  <button onClick={() => setShowRequestModal(false)} className="bg-slate-100 p-2 rounded-full hover:bg-slate-200"><X size={20}/></button>
                </div>
                <form onSubmit={handleRequestSubmit} className="space-y-4">
                   <input required type="text" value={reqName} onChange={e => setReqName(e.target.value)} placeholder="ชื่อ-นามสกุล" className="w-full p-3.5 bg-slate-50 border-transparent focus:bg-white border focus:border-sky-500 rounded-xl outline-none transition-all"/>
                   <select value={reqDept} onChange={e => setReqDept(e.target.value as Department)} className="w-full p-3.5 bg-slate-50 border-transparent focus:bg-white border focus:border-sky-500 rounded-xl outline-none transition-all">{Object.values(Department).map(d => <option key={d} value={d}>{d}</option>)}</select>
                   <select value={reqRole} onChange={e => setReqRole(e.target.value as Role)} className="w-full p-3.5 bg-slate-50 border-transparent focus:bg-white border focus:border-sky-500 rounded-xl outline-none transition-all"><option value={Role.TEACHER}>ครูผู้สอน</option><option value={Role.HEAD_DEPT}>หัวหน้ากลุ่มสาระฯ</option><option value={Role.FINANCE}>เจ้าหน้าที่การเงิน</option></select>
                   <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-lg transition-all mt-2">ส่งคำขอสิทธิ์</button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
