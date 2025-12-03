
import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Department, Project, Role, User } from '../types';
import { Sparkles, Loader2, Save, ArrowLeft, Calendar, Target, ListOrdered, Bot, FileSearch, AlertTriangle, CheckCircle2, FileDown } from 'lucide-react';
import { generateProjectPDF } from '../utils/pdfGenerator';

interface ProjectCreateFormProps {
  currentUser: User;
  onBack: () => void;
  onSubmit: (projectData: Partial<Project>) => void;
}

// Context extracted from the uploaded SAR PDF to guide the AI
const SAR_CONTEXT = `
บริบทโรงเรียนเตรียมอุดมศึกษาน้อมเกล้า สมุทรปราการ (SAR ปีการศึกษา 2568):
1. อัตลักษณ์: "มารยาทดี มีวินัย ใฝ่เรียนรู้"
2. เอกลักษณ์: "หลักสูตรเด่น เน้นกิจกรรม"
3. ค่าเป้าหมายมาตรฐานที่ 1 (คุณภาพผู้เรียน):
   - ผลสัมฤทธิ์ทางวิชาการ: คะแนนเฉลี่ยร้อยละ 70-80 ขึ้นไป (ระดับดีเลิศ/ยอดเยี่ยม)
   - คุณลักษณะที่พึงประสงค์: ร้อยละ 90 ขึ้นไป (ระดับยอดเยี่ยม)
   - การอ่าน คิดวิเคราะห์: ร้อยละ 80 ขึ้นไป
   - สุขภาวะร่างกาย: ร้อยละ 80 ขึ้นไป
4. มาตรฐานที่ 3 (การจัดการเรียนการสอน): เน้น Active Learning, การใช้สื่อเทคโนโลยี, และการวัดผลตามสภาพจริง
5. จุดเน้น: การพัฒนาครูสู่มืออาชีพ, การส่งเสริมทักษะศตวรรษที่ 21, ความเป็นเลิศทางวิชาการและคุณธรรม
`;

// Legal Context updated from "ระเบียบว่าด้วยการบริหารงบประมาณ พ.ศ. ๒๕๖๒" images
const LEGAL_CONTEXT = `
สาระสำคัญจาก "ระเบียบว่าด้วยการบริหารงบประมาณ พ.ศ. ๒๕๖๒" (ใช้สำหรับตรวจสอบโครงการ):

1. หมวด ๑ บททั่วไป (ข้อ ๘): หน่วยรับงบประมาณต้องจัดทำแผนการปฏิบัติงานและแผนการใช้จ่ายงบประมาณ เพื่อเป็นกรอบแนวทางในการใช้จ่ายหรือก่อหนี้ผูกพัน ต้องสอดคล้องกับยุทธศาสตร์ชาติและแผนแม่บท

2. หมวด ๓ เงินจัดสรร (ข้อ ๒๓): การปฏิบัติงานและแผนการใช้จ่ายงบประมาณ หน่วยรับงบประมาณต้องดำเนินการด้วยความโปร่งใส คุ้มค่า และประหยัด และคำนึงถึงประโยชน์ที่ได้รับ ผลสัมฤทธิ์ และประสิทธิภาพในการดำเนินงาน

3. ข้อ ๒๔ การกำหนดรายละเอียดคุณลักษณะเฉพาะครุภัณฑ์ (Spec):
   - ให้หัวหน้าหน่วยรับงบประมาณรับผิดชอบควบคุมดูแลให้การจัดหาเป็นไปตาม "ความจำเป็น เหมาะสม ประหยัด โปร่งใส และคุ้มค่า"
   - รวมทั้งเป็นไปตามกฎหมาย ระเบียบ ข้อบังคับ มติคณะรัฐมนตรีที่เกี่ยวข้อง และมาตรฐานของทางราชการอย่างเคร่งครัด

4. ข้อ ๒๕ การโอน/เปลี่ยนแปลงเงินจัดสรร:
   - ให้ดำเนินการเพื่อแก้ไขปัญหาการปฏิบัติงาน เพิ่มประสิทธิภาพการให้บริการ หรือเพื่อประโยชน์ต่อประชาชน
   - ต้องแสดงเหตุผลความจำเป็น ความสอดคล้องกับยุทธศาสตร์ และเป้าหมายการให้บริการกระทรวง
   - ต้องไม่ทำให้เป้าหมายผลผลิตของแผนงานลดลง (เว้นแต่จะมีกฎหมายบัญญัติไว้เป็นอย่างอื่น)
`;

// Standard School Strategies
const SCHOOL_STRATEGIES = [
  "กลยุทธ์ที่ 1: พัฒนาคุณภาพผู้เรียนให้เป็นเลิศทางวิชาการและมีคุณธรรมจริยธรรม",
  "กลยุทธ์ที่ 2: พัฒนาศักยภาพครูและบุคลากรทางการศึกษา",
  "กลยุทธ์ที่ 3: พัฒนาระบบบริหารจัดการด้วยหลักธรรมาภิบาลและระบบคุณภาพ",
  "กลยุทธ์ที่ 4: พัฒนาแหล่งเรียนรู้ สื่อ เทคโนโลยี และสภาพแวดล้อม",
  "กลยุทธ์ที่ 5: ส่งเสริมการมีส่วนร่วมของภาคีเครือข่ายและชุมชน",
  "นโยบายเร่งด่วน สพฐ. (Quick Policy)"
];

const ProjectCreateForm: React.FC<ProjectCreateFormProps> = ({ currentUser, onBack, onSubmit }) => {
  // Header Info
  const [name, setName] = useState('');
  const [proposerName, setProposerName] = useState(currentUser.name);
  const [activity, setActivity] = useState('');
  const [strategy, setStrategy] = useState('');
  const [isNewActivity, setIsNewActivity] = useState(true);
  const [fiscalYear, setFiscalYear] = useState('2568');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // 1. Rationale
  const [rationale, setRationale] = useState('');
  // 2. Objectives
  const [objectives, setObjectives] = useState<string[]>(['']);
  // 3. Goals
  const [goalQuant, setGoalQuant] = useState('');
  const [goalQual, setGoalQual] = useState('');
  // 4. Procedures
  const [procedures, setProcedures] = useState('');
  // 5. Budget
  const [budget, setBudget] = useState<number | ''>('');
  // 6. Evaluation
  const [evaluation, setEvaluation] = useState('');
  // 7. Expected Outcomes
  const [expectedOutcomes, setExpectedOutcomes] = useState('');
  
  // AI States
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [loadingSection, setLoadingSection] = useState<string | null>(null); // 'rationale', 'objectives', 'goals', 'procedures', 'evaluation', 'outcomes'
  
  // Validation State
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    score: number;
    issues: string[];
    suggestions: string[];
  } | null>(null);

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Generate Specific Section
  const handleGenerateSection = async (section: string) => {
    if (!name) {
      alert('กรุณากรอกชื่อโครงการก่อนใช้ AI');
      return;
    }
    setLoadingSection(section);

    let prompt = "";
    let schemaProperties: any = { text: { type: Type.STRING } };

    const baseContext = `
      Project: "${name}"
      Activity: "${activity}"
      Strategy: "${strategy}"
      Department: "${currentUser.department}"
      Context (SAR): ${SAR_CONTEXT}
    `;

    switch (section) {
      case 'rationale':
        prompt = `เขียน "หลักการและเหตุผล" (Principles and Rationale) สำหรับโครงการโรงเรียนนี้
        ${baseContext}

        ข้อกำหนดสำคัญ (Critical Requirements):
        1. เนื้อหาต้องสอดคล้องกับเจตนารมณ์ของ "ระเบียบกระทรวงศึกษาธิการ ว่าด้วยการบริหารจัดการงบประมาณ พ.ศ. ๒๕๖๒" (Budget Administration Regulation B.E. 2562).
        2. ต้องระบุถึงความจำเป็น (Necessity) ความคุ้มค่า (Worthiness) ความประหยัด (Economy) และประโยชน์ที่จะเกิดขึ้นต่อผู้เรียน
        3. ต้องสะท้อนหลักธรรมาภิบาล: ความโปร่งใส (Transparency) และ ประสิทธิภาพ (Efficiency).
        4. เชื่อมโยงกับมาตรฐานการศึกษาและบริบท SAR ของโรงเรียน
        
        Style: ภาษาทางการราชการ (Formal Thai Government Document), โน้มน้าวใจและหนักแน่น (Persuasive and Solid).
        Length: 6-10 บรรทัด.`;
        break;
      
      case 'objectives':
        prompt = `Write 4 "Objectives" (วัตถุประสงค์) for this project.
        ${baseContext}
        Style: Start with "เพื่อ..." (To...). Aligned with Active Learning and Student Competencies.`;
        schemaProperties = { items: { type: Type.ARRAY, items: { type: Type.STRING } } };
        break;

      case 'goals':
        prompt = `Write "Goals" (เป้าหมาย) for this project.
        ${baseContext}
        1. Quantitative (เชิงปริมาณ): Specific % targets matching SAR (e.g., ร้อยละ 80).
        2. Qualitative (เชิงคุณภาพ): Quality levels (ดีเลิศ, ยอดเยี่ยม) or behavioral changes.`;
        schemaProperties = { quantitative: { type: Type.STRING }, qualitative: { type: Type.STRING } };
        break;

      case 'procedures':
        prompt = `Write "Operating Procedures" (ขั้นตอนการดำเนินงาน) using PDCA cycle (Plan, Do, Check, Act).
        ${baseContext}
        Format: Numbered list with clear steps.`;
        break;

      case 'evaluation':
        prompt = `Suggest "Evaluation Methods" (การวัดและประเมินผล).
        ${baseContext}
        Include: Indicators (KPIs), Tools (e.g., Survey, Test), and Methods.`;
        break;

      case 'outcomes':
        prompt = `Write "Expected Outcomes" (ผลที่คาดว่าจะได้รับ).
        ${baseContext}
        What will the students, teachers, or school gain after the project is completed?`;
        break;
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: schemaProperties
          }
        }
      });

      const result = JSON.parse(response.text || "{}");
      
      if (section === 'rationale' && result.text) setRationale(result.text);
      if (section === 'objectives' && result.items) setObjectives(result.items);
      if (section === 'goals') {
        if (result.quantitative) setGoalQuant(result.quantitative);
        if (result.qualitative) setGoalQual(result.qualitative);
      }
      if (section === 'procedures' && result.text) setProcedures(result.text);
      if (section === 'evaluation' && result.text) setEvaluation(result.text);
      if (section === 'outcomes' && result.text) setExpectedOutcomes(result.text);

    } catch (e) {
      console.error(e);
      alert('AI Error: Please try again.');
    } finally {
      setLoadingSection(null);
    }
  };

  // Generate ALL Content (Draft Whole Project)
  const handleAiDraft = async () => {
    if (!name) {
      alert('กรุณากรอกชื่อโครงการก่อนเรียกใช้งาน AI');
      return;
    }

    setIsAiLoading(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Act as an expert Thai school administrator planning a project.
        Project Name: "${name}"
        Activity: "${activity}"
        Strategy: "${strategy}"
        Department: ${currentUser.department}
        Context from SAR: ${SAR_CONTEXT}

        Task: Write a project proposal strictly following Thai government standards and Regulation B.E. 2562.
        1. Rationale: Must emphasize Necessity, Worthiness, Economy, Efficiency and Transparency (Principles of Reg. 2562). Use formal language.
        2. Objectives: 3-4 items, starting with "เพื่อ..." (To...).
        3. Quantitative Goals: Use specific percentages based on SAR targets (e.g., ร้อยละ 80).
        4. Qualitative Goals: Focus on skills, behaviors, or quality levels (ดีเลิศ, ยอดเยี่ยม).
        5. Procedures: PDCA steps.
        6. Evaluation: Methods and tools.
        7. Expected Outcomes: What will be achieved.
        
        Response must be in Thai (Formal Government Style).`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              rationale: { type: Type.STRING },
              objectives: { type: Type.ARRAY, items: { type: Type.STRING } },
              goal_quantitative: { type: Type.STRING },
              goal_qualitative: { type: Type.STRING },
              procedures: { type: Type.STRING },
              evaluation: { type: Type.STRING },
              expected_outcomes: { type: Type.STRING }
            }
          }
        }
      });

      const result = JSON.parse(response.text || "{}");
      
      if (result.rationale) setRationale(result.rationale);
      if (result.objectives && Array.isArray(result.objectives)) setObjectives(result.objectives);
      if (result.goal_quantitative) setGoalQuant(result.goal_quantitative);
      if (result.goal_qualitative) setGoalQual(result.goal_qualitative);
      if (result.procedures) setProcedures(result.procedures);
      if (result.evaluation) setEvaluation(result.evaluation);
      if (result.expected_outcomes) setExpectedOutcomes(result.expected_outcomes);

    } catch (error) {
      console.error("AI Error:", error);
      alert("ไม่สามารถเชื่อมต่อกับ AI ได้ในขณะนี้");
    } finally {
      setIsAiLoading(false);
    }
  };

  // Legal/Regulation Validation
  const handleLegalValidation = async () => {
    if (!name || !rationale || !budget) {
        alert('กรุณากรอกชื่อโครงการ หลักการเหตุผล และงบประมาณก่อนตรวจสอบ');
        return;
    }
    setIsValidating(true);
    setValidationResult(null);

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Act as a strict Government Budget Legal Officer (นิติกร).
            Validate this project proposal against "ระเบียบว่าด้วยการบริหารงบประมาณ พ.ศ. ๒๕๖๒" (Regulation on Budget Administration B.E. 2562).
            
            Specific Legal Context (Must Adhere to these clauses): ${LEGAL_CONTEXT}

            Project Data:
            - Name: ${name}
            - Rationale: ${rationale}
            - Objectives: ${objectives.join(', ')}
            - Budget: ${budget} THB
            - Goals: ${goalQuant} / ${goalQual}

            Check for:
            1. Necessity & Worthiness (Clause 23, 24): Is the budget "Necessary, Suitable, Economical, Transparent, Worthwhile"?
            2. Clause 8: Does it have a clear plan aligned with strategy?
            3. Completeness: Are key details missing?

            Output JSON:
            {
                "isValid": boolean (true if generally acceptable, false if critical issues),
                "score": number (0-100 confidence),
                "issues": string[] (List of potential violations of Clause 23/24 in Thai),
                "suggestions": string[] (How to fix them to comply with the regulation in Thai)
            }`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        isValid: { type: Type.BOOLEAN },
                        score: { type: Type.INTEGER },
                        issues: { type: Type.ARRAY, items: { type: Type.STRING } },
                        suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                }
            }
        });

        const result = JSON.parse(response.text || "{}");
        setValidationResult(result);

    } catch (e) {
        console.error(e);
        alert('เกิดข้อผิดพลาดในการตรวจสอบระเบียบ');
    } finally {
        setIsValidating(false);
    }
  };

  const handleDownloadPDF = () => {
    // Create a temporary project object from state
    const draftProject: Project = {
      id: 'draft',
      name: name || 'โครงการ (ร่าง)',
      fiscal_year: fiscalYear,
      department: currentUser.department,
      owner_id: currentUser.id,
      proposer_name: proposerName,
      total_budget: Number(budget) || 0,
      used_budget: 0,
      status: 'active',
      activity,
      strategy,
      is_new_activity: isNewActivity,
      start_date: startDate,
      end_date: endDate,
      rationale,
      objectives: objectives.filter(o => o.trim() !== ''),
      goal_quantitative: goalQuant,
      goal_qualitative: goalQual,
      procedures,
      evaluation,
      expected_outcomes: expectedOutcomes
    };
    generateProjectPDF(draftProject);
  };

  const handleObjectiveChange = (index: number, value: string) => {
    const newObjectives = [...objectives];
    newObjectives[index] = value;
    setObjectives(newObjectives);
  };

  const addObjective = () => setObjectives([...objectives, '']);
  const removeObjective = (index: number) => {
    const newObjectives = objectives.filter((_, i) => i !== index);
    setObjectives(newObjectives);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      proposer_name: proposerName,
      activity,
      strategy,
      is_new_activity: isNewActivity,
      fiscal_year: fiscalYear,
      start_date: startDate,
      end_date: endDate,
      total_budget: Number(budget),
      department: currentUser.department,
      owner_id: currentUser.id,
      rationale,
      objectives: objectives.filter(o => o.trim() !== ''),
      goal_quantitative: goalQuant,
      goal_qualitative: goalQual,
      procedures,
      evaluation,
      expected_outcomes: expectedOutcomes
    });
  };

  // Helper component for AI Button
  const AiButton = ({ section, label }: { section: string, label: string }) => (
    <button 
      type="button" 
      onClick={() => handleGenerateSection(section)}
      disabled={loadingSection !== null || !name}
      className="text-xs bg-sky-100 text-sky-700 px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-sky-200 transition-colors disabled:opacity-50"
    >
       {loadingSection === section ? <Loader2 size={12} className="animate-spin"/> : <Bot size={14}/>}
       {label}
    </button>
  );

  return (
    <div className="max-w-5xl mx-auto animate-fade-in pb-24">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="flex items-center text-slate-500 hover:text-slate-700 transition-colors">
            <ArrowLeft size={20} className="mr-1" /> กลับไปหน้าโครงการ
        </button>
        <div className="flex gap-3">
             <button 
                type="button"
                onClick={handleLegalValidation}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100 transition-all"
                disabled={isValidating}
            >
                {isValidating ? <Loader2 className="animate-spin" size={18} /> : <FileSearch size={18} />}
                ตรวจสอบระเบียบฯ (AI Check)
            </button>
            <button 
                type="button"
                onClick={handleAiDraft}
                disabled={isAiLoading || !name}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                isAiLoading 
                    ? 'bg-sky-100 text-sky-400 cursor-wait' 
                    : 'bg-gradient-to-r from-sky-500 to-pink-500 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                }`}
            >
                {isAiLoading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                {isAiLoading ? 'AI กำลังเขียนทั้งโครงการ...' : 'ให้ AI เขียนร่างโครงการทั้งหมด'}
            </button>
        </div>
      </div>

      <header className="mb-8 text-center border-b pb-4 border-slate-200">
        <h2 className="text-3xl font-bold text-slate-800 font-serif">แบบเสนอโครงการ</h2>
        <p className="text-slate-500 mt-2">ประจำปีงบประมาณ {fiscalYear}</p>
      </header>

      {/* Validation Result Box */}
      {validationResult && (
        <div className={`mb-8 p-6 rounded-xl border-2 ${validationResult.isValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} animate-fade-in`}>
            <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full ${validationResult.isValid ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {validationResult.isValid ? <CheckCircle2 size={32}/> : <AlertTriangle size={32}/>}
                </div>
                <div className="flex-1">
                    <h3 className={`text-lg font-bold ${validationResult.isValid ? 'text-green-800' : 'text-red-800'}`}>
                        ผลการตรวจสอบระเบียบฯ ๖๒: {validationResult.isValid ? 'ผ่านเกณฑ์เบื้องต้น' : 'ควรปรับปรุงแก้ไข'} 
                        <span className="ml-2 text-sm font-normal opacity-80">(คะแนนความสมบูรณ์: {validationResult.score}/100)</span>
                    </h3>
                    
                    {validationResult.issues.length > 0 && (
                        <div className="mt-3">
                            <p className="font-bold text-sm text-slate-700 mb-1">จุดที่ควรระวัง (Issues):</p>
                            <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                                {validationResult.issues.map((issue, i) => (
                                    <li key={i}>{issue}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    
                    {validationResult.suggestions.length > 0 && (
                        <div className="mt-3">
                             <p className="font-bold text-sm text-slate-700 mb-1">ข้อเสนอแนะ (Suggestions):</p>
                             <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                                {validationResult.suggestions.map((sugg, i) => (
                                    <li key={i}>{sugg}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* ส่วนนำ: ข้อมูลทั่วไป */}
        <section className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-sky-500 to-pink-500"></div>
           <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
             <span className="bg-sky-100 text-sky-700 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">0</span>
             ข้อมูลพื้นฐานโครงการ
           </h3>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-1">ชื่อโครงการ</label>
                <input 
                  type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                  placeholder="เช่น โครงการพัฒนาทักษะแห่งศตวรรษที่ 21"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">กิจกรรม</label>
                <input 
                  type="text" value={activity} onChange={(e) => setActivity(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                  placeholder="ระบุกิจกรรมหลัก"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">สนองกลยุทธ์</label>
                 <div className="relative">
                  <select 
                    value={strategy} 
                    onChange={(e) => setStrategy(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none appearance-none"
                  >
                    <option value="">-- เลือกกลยุทธ์ตามแผนปฏิบัติการ --</option>
                    {SCHOOL_STRATEGIES.map((s, i) => (
                      <option key={i} value={s}>{s}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-500">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                  </div>
                 </div>
              </div>
              
              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-2">ลักษณะกิจกรรม</label>
                 <div className="flex space-x-6">
                    <label className="flex items-center cursor-pointer">
                       <input type="radio" checked={isNewActivity} onChange={() => setIsNewActivity(true)} className="w-4 h-4 text-sky-600"/>
                       <span className="ml-2 text-slate-700">กิจกรรมใหม่</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                       <input type="radio" checked={!isNewActivity} onChange={() => setIsNewActivity(false)} className="w-4 h-4 text-sky-600"/>
                       <span className="ml-2 text-slate-700">กิจกรรมต่อเนื่อง</span>
                    </label>
                 </div>
              </div>
              
              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">ปีงบประมาณ</label>
                 <select value={fiscalYear} onChange={(e) => setFiscalYear(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none">
                    <option value="2568">2568</option>
                    <option value="2569">2569</option>
                 </select>
              </div>

              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">ผู้เสนอโครงการ (ผู้รับผิดชอบ)</label>
                 <input 
                    type="text" 
                    value={proposerName} 
                    onChange={(e) => setProposerName(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="ระบุชื่อผู้เสนอโครงการ"
                 />
              </div>

              <div className="md:col-span-2 grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">เริ่มต้น (ว/ด/ป)</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">สิ้นสุด (ว/ด/ป)</label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none" />
                 </div>
              </div>
           </div>
        </section>

        {/* 1. หลักการและเหตุผล */}
        <section className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
           <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">1. หลักการและเหตุผล</h3>
              <AiButton section="rationale" label="AI ช่วยร่างหลักการ (ตามระเบียบฯ 62)" />
           </div>
           <textarea 
              rows={6}
              required
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none resize-y"
              placeholder="อธิบายที่มาและความสำคัญของโครงการ..."
           />
        </section>

        {/* 2. วัตถุประสงค์ */}
        <section className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
           <div className="flex justify-between items-center mb-4">
               <h3 className="text-lg font-bold text-slate-800">2. วัตถุประสงค์</h3>
               <AiButton section="objectives" label="AI ช่วยคิดวัตถุประสงค์" />
           </div>
           <div className="space-y-3">
                {objectives.map((obj, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <span className="pt-3 text-slate-500 font-medium">{index + 1}.</span>
                    <input 
                      type="text"
                      value={obj}
                      onChange={(e) => handleObjectiveChange(index, e.target.value)}
                      className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-sky-500"
                      placeholder="ระบุวัตถุประสงค์..."
                    />
                    {objectives.length > 1 && (
                      <button type="button" onClick={() => removeObjective(index)} className="mt-2 text-slate-300 hover:text-pink-500">
                        &times;
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addObjective} className="ml-6 text-sm text-sky-600 font-medium hover:underline">
                  + เพิ่มข้อ
                </button>
           </div>
        </section>

        {/* 3. เป้าหมาย */}
        <section className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
           <div className="flex justify-between items-center mb-4">
               <h3 className="text-lg font-bold text-slate-800">3. เป้าหมาย</h3>
               <AiButton section="goals" label="AI ช่วยกำหนดเป้าหมาย (SAR)" />
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center">
                     <Target size={16} className="mr-1 text-sky-500"/> เชิงปริมาณ
                  </label>
                  <textarea 
                    rows={4}
                    value={goalQuant}
                    onChange={(e) => setGoalQuant(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-sky-500"
                    placeholder="เช่น นักเรียนร้อยละ 80 เข้าร่วมกิจกรรม..."
                  />
              </div>
              <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center">
                     <Sparkles size={16} className="mr-1 text-pink-500"/> เชิงคุณภาพ
                  </label>
                  <textarea 
                    rows={4}
                    value={goalQual}
                    onChange={(e) => setGoalQual(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-sky-500"
                    placeholder="เช่น นักเรียนมีทักษะในการ..."
                  />
              </div>
           </div>
        </section>

        {/* 4. ขั้นตอนการดำเนินงาน */}
        <section className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
           <div className="flex justify-between items-center mb-4">
               <h3 className="text-lg font-bold text-slate-800">4. ขั้นตอนการดำเนินงาน</h3>
               <AiButton section="procedures" label="AI เขียนขั้นตอน (PDCA)" />
           </div>
           <textarea 
              rows={5}
              value={procedures}
              onChange={(e) => setProcedures(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-lg outline-none resize-y"
              placeholder="1. ขั้นเตรียมการ (Plan)&#10;2. ขั้นดำเนินการ (Do)&#10;3. ขั้นติดตามประเมินผล (Check)&#10;4. ขั้นปรับปรุงแก้ไข (Act)"
           />
           <p className="text-xs text-slate-400 mt-2">* สามารถระบุเป็นข้อๆ หรือรายละเอียดตามวงจร PDCA</p>
        </section>

        {/* 5. งบประมาณ */}
        <section className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-sky-500">
           <h3 className="text-lg font-bold text-slate-800 mb-4">5. งบประมาณ</h3>
           <div className="flex items-center gap-4">
              <label className="text-slate-700 font-medium">วงเงินงบประมาณที่ขออนุมัติ:</label>
              <div className="relative flex-1 max-w-md">
                <input 
                  type="number" 
                  required
                  min="0"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full p-3 pl-4 pr-12 bg-white border-2 border-sky-100 rounded-lg outline-none focus:border-sky-500 text-lg font-bold text-sky-700"
                  placeholder="0"
                />
                <span className="absolute right-4 top-3.5 text-slate-400 font-medium">บาท</span>
              </div>
           </div>
           <p className="text-xs text-slate-400 mt-2">* ใส่เฉพาะยอดรวม สำหรับรายละเอียดให้แนบไฟล์ประมาณการค่าใช้จ่าย (ปร.4)</p>
        </section>

        {/* 6. การประเมินผล */}
        <section className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
           <div className="flex justify-between items-center mb-4">
               <h3 className="text-lg font-bold text-slate-800">6. การประเมินผล</h3>
               <AiButton section="evaluation" label="AI แนะนำวิธีประเมินผล" />
           </div>
           <textarea 
              rows={4}
              value={evaluation}
              onChange={(e) => setEvaluation(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-lg outline-none resize-y"
              placeholder="ระบุตัวชี้วัดความสำเร็จ วิธีการประเมิน และเครื่องมือที่ใช้..."
           />
        </section>

        {/* 7. ผลที่คาดว่าจะได้รับ */}
        <section className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
           <div className="flex justify-between items-center mb-4">
               <h3 className="text-lg font-bold text-slate-800">7. ผลที่คาดว่าจะได้รับ</h3>
               <AiButton section="outcomes" label="AI เขียนผลลัพธ์" />
           </div>
           <textarea 
              rows={4}
              value={expectedOutcomes}
              onChange={(e) => setExpectedOutcomes(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-lg outline-none resize-y"
              placeholder="ผลลัพธ์ที่จะเกิดขึ้นเมื่อโครงการเสร็จสิ้น..."
           />
        </section>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-40">
            <div className="max-w-5xl mx-auto flex justify-between items-center">
                <div className="text-sm text-slate-500">
                   <span className="hidden md:inline">สถานะ: </span> <span className="font-medium text-pink-600">ร่างเอกสาร (Draft)</span>
                </div>
                <div className="flex gap-3">
                    <button type="button" onClick={onBack} className="px-6 py-2.5 rounded-lg border border-slate-300 text-slate-600 font-medium hover:bg-slate-50">
                        ยกเลิก
                    </button>
                    <button 
                        type="button" 
                        onClick={handleDownloadPDF}
                        disabled={!name}
                        className="px-6 py-2.5 rounded-lg bg-slate-700 text-white font-medium hover:bg-slate-800 flex items-center gap-2 shadow-sm transition-colors"
                    >
                        <FileDown size={18} />
                        บันทึกเป็น PDF (Draft)
                    </button>
                    <button 
                        type="submit"
                        className="px-8 py-2.5 rounded-lg bg-gradient-to-r from-sky-500 to-pink-500 text-white font-bold shadow-lg hover:from-sky-600 hover:to-pink-600 transition-all flex items-center gap-2"
                    >
                        <Save size={18} />
                        บันทึกโครงการ
                    </button>
                </div>
            </div>
        </div>

      </form>
    </div>
  );
};

export default ProjectCreateForm;
