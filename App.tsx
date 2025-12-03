
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ProjectList from './components/ProjectList';
import ProjectCreateForm from './components/ProjectCreateForm';
import RequestForm from './components/RequestForm';
import ApprovalCenter from './components/ApprovalCenter';
import LoginPage from './components/LoginPage';
import UserManagement from './components/UserManagement'; 
import ProjectDetailModal from './components/ProjectDetailModal'; // Import new modal
import { INITIAL_PROJECTS, INITIAL_REQUESTS, MOCK_USERS } from './constants';
import { AccessRequest, ExpenseRequest, Project, RequestStatus, Role, User } from './types';

const App: React.FC = () => {
  // State simulating the Database
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [requests, setRequests] = useState<ExpenseRequest[]>(INITIAL_REQUESTS);
  const [users, setUsers] = useState<User[]>(MOCK_USERS); 
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]); 
  
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0]); 
  const [currentView, setCurrentView] = useState('dashboard');

  // Modal State
  const [viewingProject, setViewingProject] = useState<Project | null>(null);

  // Effect to update project used budget when requests change
  useEffect(() => {
    const updatedProjects = projects.map(project => {
      const projectRequests = requests.filter(r => 
        r.project_id === project.id && 
        (r.status === RequestStatus.APPROVED || r.status === RequestStatus.COMPLETED)
      );
      const used = projectRequests.reduce((sum, r) => sum + r.amount, 0);
      return { ...project, used_budget: used };
    });
    if (JSON.stringify(updatedProjects) !== JSON.stringify(projects)) {
        setProjects(updatedProjects);
    }
  }, [requests]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handlers
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(MOCK_USERS[0]);
    setViewingProject(null);
  };

  // --- Request Access Logic ---
  const handleRequestAccess = (reqData: Omit<AccessRequest, 'id' | 'requestDate'>) => {
    const newRequest: AccessRequest = {
      id: `ar-${Date.now()}`,
      requestDate: new Date().toLocaleDateString('th-TH'),
      ...reqData
    };
    setAccessRequests([...accessRequests, newRequest]);
  };

  // --- User Management Logic (Admin) ---
  const handleApproveAccess = (req: AccessRequest) => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: req.name,
      department: req.department,
      role: req.role,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(req.name)}&background=random`
    };
    setUsers([...users, newUser]);
    setAccessRequests(accessRequests.filter(r => r.id !== req.id));
    alert(`อนุมัติคุณ ${req.name} เข้าสู่ระบบเรียบร้อย`);
  };

  const handleRejectAccess = (id: string) => {
    setAccessRequests(accessRequests.filter(r => r.id !== id));
  };

  const handleDeleteUser = (id: string) => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบผู้ใช้งานนี้?')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const handleAddUserDirectly = (userData: Omit<User, 'id' | 'avatar'>) => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: userData.name,
      department: userData.department,
      role: userData.role,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random`
    };
    setUsers([...users, newUser]);
    alert('เพิ่มผู้ใช้งานเรียบร้อย');
  };
  // ----------------------------

  const handleCreateRequest = (data: any) => {
    const newRequest: ExpenseRequest = {
      id: `r${Date.now()}`,
      project_id: data.project_id,
      requester_id: currentUser.id,
      requester_name: currentUser.name,
      title: data.title,
      amount: data.amount,
      category: data.category,
      date: new Date().toISOString().split('T')[0],
      status: RequestStatus.PENDING_HEAD, // Default flow starts at Head
      form_type: data.form_type,
      description: data.description,
      location: data.location,
      activity_start_date: data.activity_start_date,
      activity_end_date: data.activity_end_date,
      payee_name: data.payee_name,
      payee_address: data.payee_address,
      payee_id_card: data.payee_id_card,
      proof_file: data.proof_file
    };
    
    setRequests([newRequest, ...requests]);
    alert('บันทึกรายการขอซื้อเรียบร้อยแล้ว (สถานะ: รอหัวหน้าอนุมัติ)');
    setCurrentView('dashboard');
  };

  const handleCreateProject = (projectData: Partial<Project>) => {
    const newProject: Project = {
      id: `p${Date.now()}`,
      name: projectData.name || 'โครงการใหม่',
      fiscal_year: projectData.fiscal_year || '2568',
      department: currentUser.department,
      owner_id: currentUser.id,
      proposer_name: projectData.proposer_name || currentUser.name,
      total_budget: projectData.total_budget || 0,
      used_budget: 0,
      status: 'active',
      // Mapping all new fields from the form
      activity: projectData.activity,
      strategy: projectData.strategy,
      is_new_activity: projectData.is_new_activity,
      start_date: projectData.start_date,
      end_date: projectData.end_date,
      rationale: projectData.rationale,
      objectives: projectData.objectives,
      goal_quantitative: projectData.goal_quantitative,
      goal_qualitative: projectData.goal_qualitative,
      procedures: projectData.procedures,
      evaluation: projectData.evaluation,
      expected_outcomes: projectData.expected_outcomes
    };

    setProjects([newProject, ...projects]);
    alert('บันทึกโครงการเรียบร้อยแล้ว');
    setCurrentView('projects');
  };

  const handleApprove = (id: string) => {
    setRequests(requests.map(req => {
      if (req.id !== id) return req;
      
      // Simple State Machine Logic
      let nextStatus = req.status;
      if (currentUser.role === Role.HEAD_DEPT) nextStatus = RequestStatus.PENDING_FINANCE;
      else if (currentUser.role === Role.FINANCE) nextStatus = RequestStatus.PENDING_DIRECTOR; 
      else if (currentUser.role === Role.DIRECTOR) nextStatus = RequestStatus.APPROVED;

      // Shortcut for demo: Finance approves -> Approved (unless amount huge)
      if (currentUser.role === Role.FINANCE && req.amount < 50000) nextStatus = RequestStatus.APPROVED;

      return { ...req, status: nextStatus };
    }));
  };

  const handleReject = (id: string) => {
    setRequests(requests.map(req => 
      req.id === id ? { ...req, status: RequestStatus.REJECTED } : req
    ));
  };

  // Count pending for badge
  const pendingCount = requests.filter(r => {
    if (currentUser.role === Role.HEAD_DEPT) return r.status === RequestStatus.PENDING_HEAD;
    if (currentUser.role === Role.FINANCE) return r.status === RequestStatus.PENDING_FINANCE;
    if (currentUser.role === Role.DIRECTOR) return r.status === RequestStatus.PENDING_DIRECTOR;
    return false;
  }).length;

  if (!isLoggedIn) {
    return (
      <LoginPage 
        users={users} 
        onLogin={handleLogin} 
        onRequestAccess={handleRequestAccess}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar 
        currentUser={currentUser} 
        currentView={currentView} 
        onChangeView={setCurrentView}
        requestCount={pendingCount}
        pendingUserCount={accessRequests.length}
        onLogout={handleLogout}
      />
      
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen flex flex-col">
        
        <div className="flex-1">
            {/* Content Area */}
            {currentView === 'dashboard' && (
            <Dashboard 
                currentUser={currentUser} 
                projects={projects} 
                requests={requests} 
                onViewAllProjects={() => setCurrentView('projects')}
            />
            )}
            {currentView === 'projects' && (
            <ProjectList 
                projects={projects} 
                currentUser={currentUser} 
                onCreateClick={() => setCurrentView('create_project')}
                onViewDetails={(p) => setViewingProject(p)}
            />
            )}
            {currentView === 'create_project' && (
            <ProjectCreateForm 
                currentUser={currentUser} 
                onBack={() => setCurrentView('projects')}
                onSubmit={handleCreateProject}
            />
            )}
            {currentView === 'create_request' && (
            <RequestForm currentUser={currentUser} projects={projects} onSubmit={handleCreateRequest} />
            )}
            {currentView === 'approvals' && (
            <ApprovalCenter 
                requests={requests} 
                currentUser={currentUser} 
                onApprove={handleApprove} 
                onReject={handleReject}
            />
            )}
            {currentView === 'user_management' && (
            <UserManagement 
                users={users}
                accessRequests={accessRequests}
                onApproveRequest={handleApproveAccess}
                onRejectRequest={handleRejectAccess}
                onDeleteUser={handleDeleteUser}
                onAddUser={handleAddUserDirectly}
            />
            )}
            {currentView === 'reports' && (
                <div className="flex flex-col items-center justify-center h-96 text-slate-400">
                    <p className="text-xl mb-2">หน้ารายงานสรุป (Reports)</p>
                    <p className="text-sm">สามารถ Export PDF (แบบ บ.1) ได้ที่นี่ในเวอร์ชันเต็ม</p>
                </div>
            )}
        </div>

        {/* Developer Footer */}
        <div className="mt-12 pt-8 pb-4 border-t border-slate-200/60 flex flex-col items-center justify-center opacity-80 hover:opacity-100 transition-opacity">
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-md mb-3 transform hover:scale-105 transition-transform">
                <img src="https://i.postimg.cc/66M44jsf/d6b9ea01-c89f-4f8b-9d71-02e1c15c6f9a.jpg" alt="Developer" className="w-full h-full object-cover" />
            </div>
            <div className="text-center">
                <p className="text-xs font-bold text-sky-500 uppercase tracking-widest mb-1">DEVELOPER</p>
                <p className="text-base font-bold text-slate-700">นายทศพร สมวงศ์</p>
            </div>
        </div>

      </main>

      {/* Project Detail Modal */}
      {viewingProject && (
        <ProjectDetailModal 
          project={viewingProject} 
          requests={requests} 
          onClose={() => setViewingProject(null)} 
        />
      )}
    </div>
  );
};

export default App;
