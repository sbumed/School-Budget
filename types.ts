
export enum Role {
  ADMIN = 'ผู้ดูแลระบบ',
  TEACHER = 'ครูผู้สอน',
  HEAD_DEPT = 'หัวหน้ากลุ่มสาระฯ/ฝ่าย',
  FINANCE = 'เจ้าหน้าที่การเงิน',
  DIRECTOR = 'ผู้อำนวยการ'
}

export enum Department {
  ACADEMIC = 'กลุ่มบริหารวิชาการ',
  BUDGET = 'กลุ่มบริหารงบประมาณ',
  PERSONNEL = 'กลุ่มบริหารงานบุคคล',
  GENERAL = 'กลุ่มบริหารทั่วไป',
  STUDENT_AFFAIRS = 'กลุ่มบริหารกิจการนักเรียน'
}

// Classification based on School Budget Manual
export enum BudgetCategory {
  PERSONNEL = 'งบบุคลากร',
  OPERATING_REMUNERATION = 'ค่าตอบแทน', 
  OPERATING_USE = 'ค่าใช้สอย',
  OPERATING_MATERIAL = 'ค่าวัสดุ',
  OPERATING_UTILITY = 'ค่าสาธารณูปโภค',
  INVESTMENT_DURABLE = 'ค่าครุภัณฑ์',
  INVESTMENT_CONSTRUCTION = 'ค่าที่ดินและสิ่งก่อสร้าง',
  SUBSIDY = 'งบเงินอุดหนุน',
  OTHER = 'งบรายจ่ายอื่น'
}

// New: Form Types based on Ngor Por documents
export enum FormType {
  NGOR_POR_01 = 'งป.01 - ขออนุมัติงบประมาณ (ดำเนินกิจกรรม)',
  NGOR_POR_02 = 'งป.02 - ขออนุมัติเบิกเงิน',
  NGOR_POR_03 = 'งป.03 - สัญญายืมเงินราชการ',
  NGOR_POR_06 = 'งป.06 - ขออนุมัติค่าตอบแทนวิทยากร',
  NGOR_POR_08 = 'งป.08 - ใบสำคัญรับเงิน'
}

export enum RequestStatus {
  DRAFT = 'ร่าง',
  PENDING_HEAD = 'รอหัวหน้าอนุมัติ',
  PENDING_FINANCE = 'รอการเงินตรวจสอบ',
  PENDING_DIRECTOR = 'รอ ผอ. อนุมัติ',
  APPROVED = 'อนุมัติแล้ว',
  REJECTED = 'ไม่อนุมัติ',
  COMPLETED = 'เบิกจ่ายเสร็จสิ้น'
}

export interface User {
  id: string;
  name: string;
  role: Role;
  department: Department;
  avatar: string;
}

export interface AccessRequest {
  id: string;
  name: string;
  department: Department;
  role: Role;
  requestDate: string;
}

export interface Project {
  id: string;
  name: string;
  fiscal_year: string; 
  department: Department;
  owner_id: string;
  proposer_name?: string;
  total_budget: number;
  used_budget: number; 
  status: 'active' | 'closed';
  
  activity?: string; 
  strategy?: string; 
  is_new_activity?: boolean; 
  start_date?: string;
  end_date?: string;
  rationale?: string; 
  objectives?: string[]; 
  goal_quantitative?: string; 
  goal_qualitative?: string; 
  procedures?: string; 
  evaluation?: string; 
  expected_outcomes?: string; 
}

export interface ExpenseRequest {
  id: string;
  project_id: string;
  requester_id: string;
  requester_name: string;
  title: string;
  description?: string; // รายละเอียดเพิ่มเติม
  category: BudgetCategory;
  amount: number;
  date: string;
  status: RequestStatus;
  note?: string; 
  proof_file?: string;

  // New Fields for Official Forms
  form_type: FormType;
  
  // For Ngor Por 01 & 03 (Location/Time)
  location?: string;
  activity_start_date?: string;
  activity_end_date?: string;
  
  // For Ngor Por 03 (Loan)
  loan_contract_no?: string; // เลขที่สัญญา (Run auto later)
  
  // For Ngor Por 08 (Payee)
  payee_name?: string;
  payee_address?: string;
  payee_id_card?: string;
}