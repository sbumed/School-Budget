
import React, { useState, useMemo, useEffect } from 'react';
import { BudgetCategory, FormType, Project, Role, User } from '../types';
import { MapPin, FileText, User as UserIcon, FilePlus, Wallet, ChevronRight, ArrowRight } from 'lucide-react';

interface RequestFormProps {
  currentUser: User;
  projects: Project[];
  onSubmit: (data: any) => void;
}

const BUDGET_GROUPS = [
  { label: '1. งบบุคลากร (Personnel)', options: [BudgetCategory.PERSONNEL] },
  { label: '2. งบดำเนินงาน (Operating)', options: [BudgetCategory.OPERATING_REMUNERATION, BudgetCategory.OPERATING_USE, BudgetCategory.OPERATING_MATERIAL, BudgetCategory.OPERATING_UTILITY] },
  { label: '3. งบลงทุน (Investment)', options: [BudgetCategory.INVESTMENT_DURABLE, BudgetCategory.INVESTMENT_CONSTRUCTION] },
  { label: '4. งบเงินอุดหนุน (Subsidy)', options: [BudgetCategory.SUBSIDY] },
  { label: '5. งบรายจ่ายอื่น (Other)', options: [BudgetCategory.OTHER] }
];

const RequestForm: React.FC<RequestFormProps> = ({ currentUser, projects, onSubmit }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [formType, setFormType] = useState<FormType>(FormType.NGOR_POR_01);
  
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [category, setCategory] = useState<BudgetCategory>(BudgetCategory.OPERATING_MATERIAL);
  const [description, setDescription] = useState('');
  
  // Specific Fields
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [payeeName, setPayeeName] = useState('');
  const [payeeAddress, setPayeeAddress] = useState('');
  const [payeeIdCard, setPayeeIdCard] = useState('');

  const [file, setFile] = useState<File | null>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null);

  const availableProjects = useMemo(() => {
    return projects.filter(p => 
      (currentUser.role === Role.TEACHER && (p.owner_id === currentUser.id || p.department === currentUser.department)) ||
      (currentUser.role !== Role.TEACHER && p.status === 'active')
    );
  }, [projects, currentUser]);

  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const remaining = selectedProject ? selectedProject.total_budget - selectedProject.used_budget : 0;
  const isValidAmount = typeof amount === 'number' && amount > 0 && amount <= remaining;

  // Auto-fill suggestions
  useEffect(() => {
    if (!title) return;
    const timer = setTimeout(() => {
      const text = title.toLowerCase();
      let suggestedCat: BudgetCategory | null = null;
      if (text.includes('วัสดุ') || text.includes('กระดาษ')) suggestedCat = BudgetCategory.OPERATING_MATERIAL;
      else if (text.includes('เดินทาง') || text.includes('ค่าเช่า')) suggestedCat = BudgetCategory.OPERATING_USE;
      else if (text.includes('วิทยากร')) suggestedCat = BudgetCategory.OPERATING_REMUNERATION;
      
      if (suggestedCat && suggestedCat !== category) setSuggestion(suggestedCat);
      else setSuggestion(null);
    }, 800);
    return () => clearTimeout(timer);
  }, [title, category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidAmount || !selectedProjectId || !title) return;
    onSubmit({
      project_id: selectedProjectId,
      form_type: formType,
      title,
      description,
      amount: Number(amount),
      category,
      proof_file: file ? file.name : 'nofile',
      location,
      activity_start_date: startDate,
      activity_end_date: endDate,
      payee_name: payeeName,
      payee_address: payeeAddress,
      payee_id_card: payeeIdCard
    });
  };

  // Form Type Icons mapping
  const getFormIcon = (type: FormType) => {
      if (type.includes('01')) return <FileText size={24}/>;
      if (type.includes('02')) return <Wallet size={24}/>;
      if (type.includes('03')) return <FilePlus size={24}/>;
      return <FileText size={24}/>;
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in pb-12">
       <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">บันทึกขออนุมัติ (Create Request)</h2>
        <p className="text-slate-500">เลือกแบบฟอร์มและระบุรายละเอียดการเบิกจ่าย</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Form Type Selection */}
        <div className="lg:col-span-1 space-y-4">
            <label className="block text-sm font-bold text-slate-700 px-1">1. เลือกประเภทแบบฟอร์ม</label>
            <div className="space-y-3">
                {Object.values(FormType).map((type) => (
                    <button
                        key={type}
                        type="button"
                        onClick={() => setFormType(type)}
                        className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center gap-4 group ${
                            formType === type 
                            ? 'bg-sky-600 border-sky-600 text-white shadow-md transform scale-[1.02]' 
                            : 'bg-white border-slate-200 text-slate-600 hover:border-sky-300 hover:bg-sky-50'
                        }`}
                    >
                        <div className={`p-2 rounded-xl ${formType === type ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-white'}`}>
                             {getFormIcon(type)}
                        </div>
                        <div className="flex-1">
                             <span className="font-bold block text-sm">{type.split(' - ')[0]}</span>
                             <span className={`text-xs block ${formType === type ? 'text-sky-100' : 'text-slate-400'}`}>{type.split(' - ')[1]}</span>
                        </div>
                        {formType === type && <ArrowRight size={16} />}
                    </button>
                ))}
            </div>
        </div>

        {/* Right Column: Details Form */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                   <div className="bg-gradient-to-br from-sky-500 to-pink-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">2</div>
                   <h3 className="font-bold text-lg text-slate-800">รายละเอียดการเบิกจ่าย</h3>
                </div>

                <div className="space-y-6">
                    {/* Project Select */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">ตัดงบจากโครงการ</label>
                        <select 
                            required
                            value={selectedProjectId}
                            onChange={(e) => setSelectedProjectId(e.target.value)}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                        >
                            <option value="">-- เลือกโครงการ --</option>
                            {availableProjects.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                        {selectedProject && (
                            <div className="mt-2 flex justify-between text-xs bg-emerald-50 p-2 rounded-lg text-emerald-700 font-medium border border-emerald-100">
                                <span>งบประมาณคงเหลือในโครงการ</span>
                                <span>{remaining.toLocaleString()} บาท</span>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2 flex justify-between">
                                หมวดรายจ่าย
                                {suggestion && <span className="text-xs text-sky-600 bg-sky-50 px-2 py-0.5 rounded cursor-pointer hover:bg-sky-100" onClick={() => setCategory(suggestion as BudgetCategory)}>✨ AI แนะนำ: {suggestion}</span>}
                            </label>
                            <select 
                                value={category}
                                onChange={(e) => setCategory(e.target.value as BudgetCategory)}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                            >
                                {BUDGET_GROUPS.map((group) => (
                                    <optgroup key={group.label} label={group.label}>
                                    {group.options.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                    </optgroup>
                                ))}
                            </select>
                        </div>
                        <div>
                             <label className="block text-sm font-semibold text-slate-700 mb-2">จำนวนเงิน (บาท)</label>
                             <input 
                                type="number" required min="1" value={amount}
                                onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                                className={`w-full p-3 bg-white border-2 rounded-xl outline-none font-bold transition-colors ${!isValidAmount && amount !== '' ? 'border-pink-500 text-pink-600 focus:border-pink-600' : 'border-slate-200 focus:border-sky-500 text-slate-800'}`}
                                placeholder="0.00"
                             />
                             {!isValidAmount && amount !== '' && <p className="text-xs text-pink-500 mt-1 font-medium">ยอดเงินเกินงบประมาณคงเหลือ</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            {formType === FormType.NGOR_POR_03 ? 'วัตถุประสงค์การยืมเงิน' : 'รายการขอซื้อ / เรื่อง'}
                        </label>
                        <input 
                            type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                            placeholder="เช่น ค่าวัสดุสำนักงาน..."
                        />
                    </div>
                </div>
            </div>

            {/* Dynamic Sections */}
            {(formType === FormType.NGOR_POR_01 || formType === FormType.NGOR_POR_03 || formType === FormType.NGOR_POR_06) && (
                <div className="bg-blue-50 p-8 rounded-3xl border border-blue-100 shadow-sm">
                    <h4 className="font-bold text-blue-800 flex items-center gap-2 mb-6">
                        <div className="bg-blue-200 p-1.5 rounded-lg text-blue-700"><MapPin size={18}/></div>
                        ข้อมูลการเดินทาง / กิจกรรม
                    </h4>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-blue-700 mb-1 font-medium">สถานที่ดำเนินการ</label>
                            <input type="text" value={location} onChange={e => setLocation(e.target.value)} className="w-full p-3 rounded-xl border border-blue-200 focus:ring-2 focus:ring-blue-400 outline-none bg-white" placeholder="ระบุสถานที่..."/>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-blue-700 mb-1 font-medium">วันที่เริ่ม</label>
                                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-3 rounded-xl border border-blue-200 focus:ring-2 focus:ring-blue-400 outline-none bg-white"/>
                            </div>
                            <div>
                                <label className="block text-sm text-blue-700 mb-1 font-medium">วันที่สิ้นสุด</label>
                                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-3 rounded-xl border border-blue-200 focus:ring-2 focus:ring-blue-400 outline-none bg-white"/>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {formType === FormType.NGOR_POR_08 && (
                <div className="bg-orange-50 p-8 rounded-3xl border border-orange-100 shadow-sm">
                    <h4 className="font-bold text-orange-800 flex items-center gap-2 mb-6">
                        <div className="bg-orange-200 p-1.5 rounded-lg text-orange-700"><UserIcon size={18}/></div>
                        ข้อมูลผู้รับเงิน (สำหรับใบสำคัญรับเงิน)
                    </h4>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-orange-700 mb-1 font-medium">ชื่อ-นามสกุล ผู้รับเงิน</label>
                            <input type="text" value={payeeName} onChange={e => setPayeeName(e.target.value)} className="w-full p-3 rounded-xl border border-orange-200 focus:ring-2 focus:ring-orange-400 outline-none bg-white"/>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm text-orange-700 mb-1 font-medium">เลขบัตรประชาชน/ผู้เสียภาษี</label>
                                <input type="text" value={payeeIdCard} onChange={e => setPayeeIdCard(e.target.value)} className="w-full p-3 rounded-xl border border-orange-200 focus:ring-2 focus:ring-orange-400 outline-none bg-white"/>
                            </div>
                            <div>
                                <label className="block text-sm text-orange-700 mb-1 font-medium">ที่อยู่</label>
                                <input type="text" value={payeeAddress} onChange={e => setPayeeAddress(e.target.value)} className="w-full p-3 rounded-xl border border-orange-200 focus:ring-2 focus:ring-orange-400 outline-none bg-white"/>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <button 
             type="submit"
             disabled={!isValidAmount || !selectedProjectId}
             className={`w-full py-4 rounded-2xl font-bold text-lg shadow-xl transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 ${
                !isValidAmount || !selectedProjectId 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                : 'bg-gradient-to-r from-sky-500 to-pink-500 text-white hover:shadow-pink-200'
             }`}
           >
             สร้างเอกสาร ({formType.split(' - ')[0]}) <ChevronRight/>
           </button>
        </div>
      </form>
    </div>
  );
};

export default RequestForm;
