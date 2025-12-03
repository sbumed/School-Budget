
import { BudgetCategory, Department, ExpenseRequest, Project, RequestStatus, Role, User, FormType } from './types';

export const MOCK_USERS: User[] = [
  {
    id: 'admin_kru',
    name: 'Krutossaporn1988',
    role: Role.ADMIN,
    department: Department.GENERAL,
    avatar: 'https://i.postimg.cc/66M44jsf/d6b9ea01-c89f-4f8b-9d71-02e1c15c6f9a.jpg'
  },
  {
    id: 'u1',
    name: 'ครูวิชาการ รักเรียน',
    role: Role.TEACHER,
    department: Department.ACADEMIC,
    avatar: 'https://picsum.photos/200'
  },
  {
    id: 'u2',
    name: 'หัวหน้าสมรักษ์ (งบประมาณ)',
    role: Role.HEAD_DEPT,
    department: Department.BUDGET,
    avatar: 'https://picsum.photos/201'
  },
  {
    id: 'u3',
    name: 'ผอ. เกรียงไกร',
    role: Role.DIRECTOR,
    department: Department.GENERAL,
    avatar: 'https://picsum.photos/203'
  },
  {
    id: 'u4',
    name: 'ครูวินัย (ปกครอง)',
    role: Role.TEACHER,
    department: Department.STUDENT_AFFAIRS,
    avatar: 'https://picsum.photos/204'
  },
  {
    id: 'u5',
    name: 'ครูบุคคล สรรหา',
    role: Role.TEACHER,
    department: Department.PERSONNEL,
    avatar: 'https://picsum.photos/205'
  },
  {
    id: 'u6',
    name: 'เจ้าหน้าที่การเงิน',
    role: Role.FINANCE,
    department: Department.BUDGET,
    avatar: 'https://picsum.photos/206'
  }
];

export const INITIAL_PROJECTS: Project[] = [
  // 1. กลุ่มบริหารวิชาการ (Academic)
  {
    id: 'p1',
    name: 'โครงการยกระดับผลสัมฤทธิ์ทางการเรียน (O-NET/TGAT)',
    fiscal_year: '2568',
    department: Department.ACADEMIC,
    owner_id: 'u1',
    total_budget: 150000,
    used_budget: 45000,
    status: 'active',
    activity: 'ติวเข้มเติมเต็มความรู้',
    is_new_activity: false
  },
  {
    id: 'p2',
    name: 'โครงการพัฒนาหลักสูตรสถานศึกษาฐานสมรรถนะ',
    fiscal_year: '2568',
    department: Department.ACADEMIC,
    owner_id: 'u1',
    total_budget: 50000,
    used_budget: 0,
    status: 'active',
    is_new_activity: true
  },

  // 2. กลุ่มบริหารงบประมาณ (Budget)
  {
    id: 'p3',
    name: 'โครงการพัฒนาระบบบริหารจัดการพัสดุและสินทรัพย์',
    fiscal_year: '2568',
    department: Department.BUDGET,
    owner_id: 'u2',
    total_budget: 80000,
    used_budget: 65000,
    status: 'active',
    activity: 'จัดซื้อโปรแกรมและอบรมเจ้าหน้าที่',
    is_new_activity: true
  },

  // 3. กลุ่มบริหารทั่วไป (General)
  {
    id: 'p4',
    name: 'โครงการปรับปรุงภูมิทัศน์และแหล่งเรียนรู้ในโรงเรียน',
    fiscal_year: '2568',
    department: Department.GENERAL,
    owner_id: 'u3',
    total_budget: 200000,
    used_budget: 180000,
    status: 'active',
    activity: 'ทาสีอาคารและจัดสวนหย่อม',
    is_new_activity: false
  },

  // 4. กลุ่มบริหารกิจการนักเรียน (Student Affairs)
  {
    id: 'p5',
    name: 'โครงการส่งเสริมระเบียบวินัยและประชาธิปไตยในโรงเรียน',
    fiscal_year: '2568',
    department: Department.STUDENT_AFFAIRS,
    owner_id: 'u4',
    total_budget: 40000,
    used_budget: 12500,
    status: 'active',
    activity: 'ค่ายผู้นำนักเรียน',
    is_new_activity: false
  },

  // 5. กลุ่มบริหารงานบุคคล (Personnel)
  {
    id: 'p6',
    name: 'โครงการพัฒนาครูและบุคลากรทางการศึกษา (อบรม/สัมมนา)',
    fiscal_year: '2568',
    department: Department.PERSONNEL,
    owner_id: 'u5',
    total_budget: 100000,
    used_budget: 35000,
    status: 'active',
    activity: 'ศึกษาดูงานโรงเรียนต้นแบบ',
    is_new_activity: false
  }
];

export const INITIAL_REQUESTS: ExpenseRequest[] = [
  {
    id: 'r1',
    project_id: 'p1',
    requester_id: 'u1',
    requester_name: 'ครูวิชาการ รักเรียน',
    title: 'ค่าวิทยากรติว O-NET ภาษาอังกฤษ',
    category: BudgetCategory.OPERATING_REMUNERATION,
    amount: 12000,
    date: '2025-02-15',
    status: RequestStatus.APPROVED,
    form_type: FormType.NGOR_POR_06
  },
  {
    id: 'r2',
    project_id: 'p1',
    requester_id: 'u1',
    requester_name: 'ครูวิชาการ รักเรียน',
    title: 'ค่าถ่ายเอกสารประกอบการติว',
    category: BudgetCategory.OPERATING_MATERIAL,
    amount: 5000,
    date: '2025-02-18',
    status: RequestStatus.APPROVED,
    form_type: FormType.NGOR_POR_01
  },
  {
    id: 'r3',
    project_id: 'p4',
    requester_id: 'u3',
    requester_name: 'ผอ. เกรียงไกร',
    title: 'ซื้อสีทาอาคารเรียน 1',
    category: BudgetCategory.OPERATING_MATERIAL,
    amount: 45000,
    date: '2025-03-01',
    status: RequestStatus.COMPLETED,
    form_type: FormType.NGOR_POR_01
  },
  {
    id: 'r4',
    project_id: 'p5',
    requester_id: 'u4',
    requester_name: 'ครูวินัย (ปกครอง)',
    title: 'ค่าอาหารว่างกิจกรรมเลือกตั้งประธานนักเรียน',
    category: BudgetCategory.OPERATING_USE,
    amount: 3500,
    date: '2025-05-20',
    status: RequestStatus.PENDING_HEAD,
    form_type: FormType.NGOR_POR_01
  }
];
