
import { ExpenseRequest, FormType, Project } from '../types';

// Helper for Thai Date
const formatDate = (dateString?: string) => {
  if (!dateString) return '........................................';
  const date = new Date(dateString);
  return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
};

// Helper for Thai Currency Text
const THBText = (amount: number | undefined): string => {
  if (amount === undefined) return '-';
  // Simplified version. In production, use a proper library like 'thai-baht-text'
  return `(${amount.toLocaleString()} บาทถ้วน)`; 
};

const GARUDA_URL = "https://i.postimg.cc/RF8dJtqJ/png-clipart-emblem-of-thailand-garuda-coat-of-arms-elephant-god-festival-miscellaneous-legendary-cre.png";

// Official Thai Government Document Styles (ระเบียบงานสารบรรณ)
// Font: TH Sarabun PSK / Sarabun
// Size: 16pt (Content), Bold (Headers)
// Margins: Top 2.5cm, Left 3cm, Right 2cm, Bottom 2cm
// Garuda: 3cm (approx)

const CSS_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;700&display=swap');
  
  @page { 
    size: A4; 
    margin-top: 2.5cm;
    margin-left: 3cm;
    margin-right: 2cm;
    margin-bottom: 2cm;
  }
  
  body { 
    font-family: 'TH Sarabun PSK', 'Sarabun', sans-serif; 
    font-size: 16pt; 
    font-weight: 400; /* ตัวบาง (Regular) */
    line-height: 1.3; 
    color: #000; 
  }
  
  strong, b {
    font-weight: 700; /* Bold */
  }

  .garuda { 
    text-align: center; 
    margin-bottom: 0px; /* ระยะห่างครุฑกับหัวข้อ */
    padding-top: 0px;
  }
  
  .garuda img { 
    width: 3cm; /* ขนาดครุฑมาตรฐานราชการ 3 ซม. */
    height: auto; 
  }
  
  .header { 
    text-align: center; 
    font-weight: bold; 
    font-size: 24pt; /* หัวข้อใหญ่ */
    margin-top: 10px;
    margin-bottom: 10px; 
  }
  
  .doc-num { 
    position: absolute; 
    top: 0; 
    right: 0; 
    font-size: 16pt; 
  }
  
  .memo-header { 
    font-weight: bold; 
    font-size: 29pt; /* บันทึกข้อความ */
    text-align: center;
    margin-bottom: 10px;
  }
  
  .row { 
    display: flex; 
    margin-bottom: 6px; 
    align-items: baseline;
  }
  
  .label { 
    font-weight: bold; 
    width: auto; 
    margin-right: 10px; 
    white-space: nowrap;
    font-size: 20pt; /* หัวข้อ ส่วนราชการ/ที่/เรื่อง (20pt) */
  }
  
  .value { 
    flex-grow: 1; 
    border-bottom: 1px dotted #000; 
    padding-left: 5px; 
  }
  
  .content { 
    margin-top: 20px; 
    text-indent: 2.5cm; /* ย่อหน้า 2.5 ซม. */
    text-align: justify; 
    font-size: 16pt;
  }
  
  .table-bordered { 
    width: 100%; 
    border-collapse: collapse; 
    margin-top: 15px; 
  }
  
  .table-bordered th, .table-bordered td { 
    border: 1px solid #000; 
    padding: 6px; 
    text-align: center; 
    font-size: 16pt; 
  }
  
  .table-bordered th {
    font-weight: bold;
  }
  
  .table-bordered td.left { 
    text-align: left; 
  }
  
  .signature-section { 
    margin-top: 50px; 
    display: flex; 
    justify-content: space-around; 
    flex-wrap: wrap; 
  }
  
  .signature-box { 
    width: 45%; 
    text-align: center; 
    margin-bottom: 30px; 
    page-break-inside: avoid;
  }
  
  .footer-note { 
    margin-top: 20px; 
    font-size: 12pt; 
    text-align: center; 
    border-top: 1px solid #ccc; 
    padding-top: 10px; 
  }
  
  .checkbox { 
    display: inline-block; 
    width: 16px; 
    height: 16px; 
    border: 1px solid #000; 
    margin-right: 5px; 
    vertical-align: middle; 
  }
  
  @media print { 
    body { -webkit-print-color-adjust: exact; } 
  }
`;

// 1. Generate Project Proposal (Existing)
export const generateProjectPDF = (project: Project) => {
  const htmlContent = `
    <!DOCTYPE html><html lang="th"><head><meta charset="UTF-8"><title>${project.name}</title>
    <style>${CSS_STYLES}</style></head>
    <body>
      <div class="garuda"><img src="${GARUDA_URL}" alt="Garuda"></div>
      <div class="header">แบบเสนอโครงการ<br>ประจำปีงบประมาณ ${project.fiscal_year}</div>
      <div class="content" style="text-indent: 0;"><strong>1. ชื่อโครงการ:</strong> ${project.name}</div>
      <div class="content" style="text-indent: 0; margin-top: 5px;"><strong>2. หน่วยงาน:</strong> ${project.department}</div>
      <div class="content" style="text-indent: 0; margin-top: 5px;"><strong>3. หลักการและเหตุผล</strong><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${project.rationale || '-'}</div>
      <div class="content" style="text-indent: 0; margin-top: 5px;"><strong>4. วัตถุประสงค์</strong><ul>${project.objectives?.map(o => `<li>${o}</li>`).join('')}</ul></div>
      <div class="content" style="text-indent: 0; margin-top: 5px;"><strong>5. งบประมาณ:</strong> ${project.total_budget.toLocaleString()} บาท</div>
      <div class="signature-section">
        <div class="signature-box">ลงชื่อ..................................................<br>(${project.proposer_name || project.owner_id})<br>ผู้เสนอโครงการ</div>
        <div class="signature-box">ลงชื่อ..................................................<br>(..................................................)<br>ผู้อนุมัติโครงการ</div>
      </div>
      <script>window.onload=()=>{window.print();}</script>
    </body></html>
  `;
  openPrintWindow(htmlContent);
};

// 2. Generate Expense Request PDF based on Type
export const generateRequestPDF = (req: ExpenseRequest, project: Project) => {
  let content = '';
  
  switch (req.form_type) {
    case FormType.NGOR_POR_01:
      content = templateNgorPor01(req, project);
      break;
    case FormType.NGOR_POR_03:
      content = templateNgorPor03(req, project);
      break;
    case FormType.NGOR_POR_08:
      content = templateNgorPor08(req);
      break;
    default:
      content = templateNgorPor01(req, project); // Default to 01
      break;
  }

  const html = `
    <!DOCTYPE html><html lang="th"><head><meta charset="UTF-8">
    <title>${req.title}</title>
    <style>${CSS_STYLES}</style></head><body>${content}<script>window.onload=()=>{window.print();}</script></body></html>
  `;
  openPrintWindow(html);
};

// Template: งป.01 (Request for Approval)
const templateNgorPor01 = (req: ExpenseRequest, project: Project) => `
  <div class="doc-num">แบบ งป.01</div>
  <div class="garuda"><img src="${GARUDA_URL}"></div>
  <div class="memo-header">บันทึกข้อความ</div>
  <div class="row"><div class="label">ส่วนราชการ</div><div class="value">${project.department} โรงเรียนเตรียมอุดมศึกษาน้อมเกล้า สมุทรปราการ</div></div>
  <div class="row"><div class="label">ที่</div><div class="value">-</div><div class="label" style="width:auto; margin-left: 20px;">วันที่</div><div class="value">${formatDate(req.date)}</div></div>
  <div class="row"><div class="label">เรื่อง</div><div class="value">ขออนุมัติงบประมาณดำเนินกิจกรรม: ${req.title}</div></div>
  <hr style="margin: 10px 0; border: none; border-bottom: 1px solid #000;">
  <div style="margin-bottom:10px; font-size: 16pt;"><strong>เรียน</strong> ผู้อำนวยการโรงเรียนเตรียมอุดมศึกษาน้อมเกล้า สมุทรปราการ</div>
  <div class="content">
    ด้วยกลุ่มสาระ/งาน ${project.department} ได้รับอนุมัติให้ดำเนินการตามแผนปฏิบัติการประจำปีการศึกษา ${project.fiscal_year} 
    โครงการ ${project.name} 
    มีความประสงค์ขออนุมัติใช้งบประมาณ เพื่อใช้ในกิจกรรม <strong>"${req.title}"</strong>
    ระหว่างวันที่ ${formatDate(req.activity_start_date)} ถึง ${formatDate(req.activity_end_date)} ณ ${req.location || 'โรงเรียนเตรียมอุดมศึกษาน้อมเกล้า สมุทรปราการ'}
  </div>
  <div class="content">
    โดยมีรายละเอียดค่าใช้จ่ายดังนี้:
    <table class="table-bordered">
      <tr><th style="width:10%">ลำดับ</th><th>รายการ</th><th style="width:25%">จำนวนเงิน (บาท)</th></tr>
      <tr><td>1</td><td class="left">${req.category} - ${req.description || req.title}</td><td>${req.amount.toLocaleString()}</td></tr>
      <tr><td colspan="2" style="text-align:right; padding-right: 20px;"><strong>รวมเป็นเงินทั้งสิ้น</strong></td><td><strong>${req.amount.toLocaleString()}</strong></td></tr>
    </table>
    <div style="text-align:right; margin-top:5px">${THBText(req.amount)}</div>
  </div>
  <div class="content">จึงเรียนมาเพื่อโปรดพิจารณา</div>
  <div class="signature-section">
    <div class="signature-box">
      ลงชื่อ..................................................<br>(${req.requester_name})<br>ผู้ขออนุมัติ
    </div>
    <div class="signature-box">
      ลงชื่อ..................................................<br>(..................................................)<br>ผู้รับผิดชอบกิจกรรม
    </div>
  </div>
  <div style="border:1px solid #000; padding:15px; margin-top:20px; page-break-inside: avoid;">
    <div><strong>ความเห็นของผู้อำนวยการ</strong></div>
    <div style="margin:10px 0">
      <span class="checkbox"></span> อนุมัติ
      <span class="checkbox" style="margin-left:20px"></span> ไม่อนุมัติ เนื่องจาก................................
    </div>
    <div style="text-align:center; margin-top:30px">
      ลงชื่อ..................................................<br>(นายดำรง ศรพรม)<br>ผู้อำนวยการโรงเรียนเตรียมอุดมศึกษาน้อมเกล้า สมุทรปราการ
    </div>
  </div>
`;

// Template: งป.03 (Loan Contract)
const templateNgorPor03 = (req: ExpenseRequest, project: Project) => `
  <div class="doc-num">แบบ งป.03</div>
  <div class="garuda"><img src="${GARUDA_URL}"></div>
  <div class="memo-header">บันทึกข้อความ</div>
  <div class="row"><div class="label">ส่วนราชการ</div><div class="value">${project.department}</div></div>
  <div class="row"><div class="label">ที่</div><div class="value">-</div><div class="label" style="width:auto; margin-left: 20px;">วันที่</div><div class="value">${formatDate(req.date)}</div></div>
  <div class="row"><div class="label">เรื่อง</div><div class="value">ขออนุมัติยืมเงินราชการ</div></div>
  <hr style="margin: 10px 0; border: none; border-bottom: 1px solid #000;">
  <div style="margin-bottom:10px; font-size: 16pt;"><strong>เรียน</strong> ผู้อำนวยการโรงเรียนเตรียมอุดมศึกษาน้อมเกล้า สมุทรปราการ</div>
  <div class="content">
    ข้าพเจ้า <strong>${req.requester_name}</strong> ตำแหน่ง ครูผู้สอน
    มีความประสงค์ขอยืมเงินอุดหนุน โครงการ <strong>${project.name}</strong>
    หมวดรายการ <strong>${req.category}</strong>
    เพื่อเป็นค่าใช้จ่ายในการ <strong>${req.title}</strong>
    ระหว่างวันที่ ${formatDate(req.activity_start_date)} ณ ${req.location || '-'}
  </div>
  <div class="content">
    รวมเป็นเงินทั้งสิ้น <strong>${req.amount.toLocaleString()} บาท</strong> ${THBText(req.amount)}
    <br>ข้าพเจ้าสัญญาว่าจะปฏิบัติตามระเบียบของทางราชการทุกประการ และจะนำใบสำคัญคู่จ่ายที่ถูกต้องมาส่งใช้ภายในกำหนด
  </div>
  <div class="signature-section">
    <div class="signature-box">
      ลงชื่อ..................................................ผู้ยืมเงิน<br>(${req.requester_name})
    </div>
    <div class="signature-box">
      ลงชื่อ..................................................หัวหน้างานการเงิน<br>(..................................................)
    </div>
  </div>
  <div style="text-align:center; margin-top:40px">
    <div><strong>คำอนุมัติ</strong></div>
    <div>อนุมัติให้ยืมเงินตามเงื่อนไขข้างต้นได้ เป็นจำนวนเงิน ${req.amount.toLocaleString()} บาท</div>
    <div style="margin-top:40px">
       ลงชื่อ..................................................<br>(นายดำรง ศรพรม)<br>ผู้อำนวยการโรงเรียน
    </div>
  </div>
`;

// Template: งป.08 (Receipt)
const templateNgorPor08 = (req: ExpenseRequest) => `
  <div class="doc-num">แบบ งป.08</div>
  <div class="garuda"><img src="${GARUDA_URL}"></div>
  <div class="header" style="margin-top:10px">ใบสำคัญรับเงิน</div>
  <div style="text-align:right; font-size: 16pt;">
    ที่ โรงเรียนเตรียมอุดมศึกษาน้อมเกล้า สมุทรปราการ<br>
    วันที่ ${formatDate(new Date().toISOString())}
  </div>
  <div class="content" style="margin-top:30px">
    ข้าพเจ้า <strong>${req.payee_name || '............................................................'}</strong>
    <br>อยู่บ้านเลขที่ <strong>${req.payee_address || '..................................................................................................................'}</strong>
    <br>เลขประจำตัวผู้เสียภาษี/เลขบัตรประชาชน <strong>${req.payee_id_card || '.............................................'}</strong>
  </div>
  <div class="content">
    ได้รับเงินจาก โรงเรียนเตรียมอุดมศึกษาน้อมเกล้า สมุทรปราการ ดังรายการต่อไปนี้:
  </div>
  <table class="table-bordered" style="margin-top:20px">
    <tr>
      <th style="width:70%">รายการ</th>
      <th>จำนวนเงิน (บาท)</th>
    </tr>
    <tr>
      <td class="left" style="height:100px; vertical-align:top;">${req.title} <br> ${req.description || ''}</td>
      <td style="vertical-align:top;">${req.amount.toLocaleString()}</td>
    </tr>
    <tr>
      <td style="text-align:right; padding-right: 10px;"><strong>รวมเป็นเงินทั้งสิ้น</strong></td>
      <td><strong>${req.amount.toLocaleString()}</strong></td>
    </tr>
  </table>
  <div style="text-align:center; margin-top:10px">${THBText(req.amount)}</div>
  
  <div class="signature-section" style="margin-top:60px">
    <div class="signature-box">
      ลงชื่อ..................................................ผู้รับเงิน<br>(${req.payee_name || '..................................................'})
    </div>
    <div class="signature-box">
      ลงชื่อ..................................................ผู้จ่ายเงิน<br>(${req.requester_name})
    </div>
  </div>
`;

const openPrintWindow = (htmlContent: string) => {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  } else {
    alert('Please allow popups to download PDF');
  }
};
