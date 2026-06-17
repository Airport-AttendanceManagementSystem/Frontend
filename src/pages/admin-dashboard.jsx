import { useState, useEffect, useCallback } from 'react';
import {
  Box, Flex, Text, Heading, Badge,
  Tooltip, IconButton, useDisclosure, useBreakpointValue, useToast,
} from '@chakra-ui/react';
import { ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

import Sidebar, { navItems, SIDEBAR_W, SIDEBAR_CW } from '../components/Sidebar/AdminSidebar';
import AttendanceReport from '../components/Attendance/AttendanceReport';
import UserSettings     from '../components/UserSettings/UserSettings';
import SectionAccess    from '../components/UserSettings/SectionAccess';
import ChangePassword   from '../components/ChangePassword/ChangePassword';

// ── Design Tokens ─────────────────────────────────────────────────────────────
const C = {
  navy:    '#001A4D',
  blue700: '#0052CC',
  blue600: '#0052CC',
  blue500: '#0745a3',
  blue400: '#0052CC',
  blue200: '#CCE5FF',
  blue100: '#E6F2FF',
  blue50:  '#F5FAFF',
  white:   '#FFFFFF',
  pageBg:  '#FFFFFF',
};

// ── TopHeader ─────────────────────────────────────────────────────────────────
function TopHeader({ activeTab, onMenuOpen, isMobile, collapsed, setCollapsed }) {
  let current = navItems.find(n => n.key === activeTab);
  if (!current) {
    for (const item of navItems) {
      if (item.subItems) {
        const sub = item.subItems.find(s => s.key === activeTab);
        if (sub) { current = sub; break; }
      }
    }
  }

  return (
    <Flex
      h="64px" align="center" justify="space-between"
      px={{ base: 4, md: 7 }}
      bg={C.white} borderBottom={`1px solid ${C.blue200}`}
      flexShrink={0} boxShadow="0 1px 3px rgba(10,46,82,0.06)"
    >
      <Flex align="center" gap={3}>
        {!isMobile && setCollapsed && (
          <Tooltip label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} placement="bottom">
            <IconButton
              icon={collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
              variant="ghost" color={C.blue500}
              _hover={{ bg: C.blue50 }} borderRadius="8px"
              aria-label="Toggle sidebar"
              onClick={() => setCollapsed(c => !c)}
            />
          </Tooltip>
        )}
        {isMobile && (
          <IconButton
            icon={<Menu size={18} />} variant="ghost" color={C.blue500}
            _hover={{ bg: C.blue50 }} borderRadius="8px"
            aria-label="Open menu" onClick={onMenuOpen}
          />
        )}
        <Box>
          <Heading size="sm" color={C.navy} fontWeight={700} letterSpacing="-0.01em">
            {current?.label}
          </Heading>
          <Text fontSize="11px" color={C.blue400} mt={0.5}>{current?.description}</Text>
        </Box>
      </Flex>

      {/* <Badge
        bg={C.blue100} color={C.blue700}
        border={`1px solid ${C.blue200}`}
        px={3} py={1} borderRadius="full"
        fontSize="11px" fontWeight={600} textTransform="none"
      >
        {new Date().toLocaleString('en-US', {
          weekday: 'short', month: 'short', day: 'numeric',
          hour: 'numeric', minute: '2-digit',
        })}
      </Badge> */}
    </Flex>
  );
}

// ── AdminDashboard ─────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user, apiUrl } = useAuth();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, lg: false });

  const [activeTab, setActiveTab] = useState('reports');
  const [collapsed, setCollapsed] = useState(false);

  const [users,        setUsers]        = useState([]);
  const [departments,  setDepartments]  = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [reportFilters, setReportFilters] = useState({
    startDate: '', startTime: '', endDate: '', endTime: '',
    deptId: '', username: '', epf: '', type: '',
  });
  const [reportData,    setReportData]    = useState([]);
  const [reportLoading, setReportLoading] = useState(false);

  const [newUser,    setNewUser]    = useState({ username: '', password: '', usertype: 'employee', deptid: '' });
  const [addingUser, setAddingUser] = useState(false);

  const [activateUser,       setActivateUser]       = useState('');
  const [activateStatus,     setActivateStatus]     = useState(false);
  const [updatingActivation, setUpdatingActivation] = useState(false);

  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedSections, setSelectedSections] = useState([]);
  const [loadingSections,  setLoadingSections]  = useState(false);
  const [savingSections,   setSavingSections]   = useState(false);

  const [passwords,        setPasswords]        = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [changingPassword, setChangingPassword] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await axios.get(`${apiUrl}/users`);
      setUsers(res.data);
    } catch {
      toast({ title: 'Failed to load users', status: 'error', duration: 3000, isClosable: true });
    } finally { setLoadingUsers(false); }
  }, [apiUrl, toast]);

  const fetchDepartments = useCallback(async () => {
    try {
      const res = await axios.get(`${apiUrl}/users/departments`);
      setDepartments(res.data);
    } catch {
      toast({ title: 'Failed to load departments', status: 'error', duration: 3000, isClosable: true });
    }
  }, [apiUrl, toast]);

  useEffect(() => { fetchUsers(); fetchDepartments(); }, [fetchUsers, fetchDepartments]);

  const handleGenerateReport = async () => {
    setReportLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(reportFilters).forEach(([k, v]) => { if (v) params.append(k, v); });
      const res = await axios.get(`${apiUrl}/attendance/report?${params.toString()}`);
      setReportData(res.data);
      if (!res.data.length)
        toast({ title: 'No records found', status: 'info', duration: 3000, isClosable: true });
    } catch {
      toast({ title: 'Failed to generate report', status: 'error', duration: 3000, isClosable: true });
    } finally { setReportLoading(false); }
  };

  const handleAddUser = async () => {
    if (!newUser.username || !newUser.password || !newUser.deptid) {
      toast({ title: 'Please fill all fields', status: 'warning', duration: 3000, isClosable: true });
      return;
    }
    setAddingUser(true);
    try {
      await axios.post(`${apiUrl}/users`, newUser);
      toast({ title: 'User created successfully', status: 'success', duration: 3000, isClosable: true });
      setNewUser({ username: '', password: '', usertype: 'employee', deptid: '' });
      fetchUsers();
    } catch (err) {
      toast({ title: 'Failed to create user', description: err?.response?.data?.message || '', status: 'error', duration: 3000, isClosable: true });
    } finally { setAddingUser(false); }
  };

  const handleActivationSelect = (username) => {
    setActivateUser(username);
    if (!username) { setActivateStatus(false); return; }
    const selected = users.find(u => u.username === username);
    setActivateStatus(selected?.status === 'active');
  };

  const handleUpdateActivation = async () => {
    if (!activateUser) {
      toast({ title: 'Please select a user', status: 'warning', duration: 3000, isClosable: true });
      return;
    }
    setUpdatingActivation(true);
    try {
      const status = activateStatus ? 'active' : 'inactive';
      await axios.post(`${apiUrl}/users/toggle-status`, { username: activateUser, status });
      toast({ title: `User ${status === 'active' ? 'activated' : 'deactivated'}`, status: 'success', duration: 3000, isClosable: true });
      fetchUsers();
    } catch {
      toast({ title: 'Failed to update status', status: 'error', duration: 3000, isClosable: true });
    } finally { setUpdatingActivation(false); }
  };

  const handleEmployeeSelect = async (username) => {
    setSelectedEmployee(username);
    if (!username) { setSelectedSections([]); return; }
    setLoadingSections(true);
    try {
      const res = await axios.get(`${apiUrl}/sections/user/${username}`);
      setSelectedSections(res.data || []);
    } catch {
      toast({ title: 'Failed to load sections', status: 'error', duration: 3000, isClosable: true });
      setSelectedSections([]);
    } finally { setLoadingSections(false); }
  };

  const handleSaveSections = async () => {
    if (!selectedEmployee) {
      toast({ title: 'Please select an employee', status: 'warning', duration: 3000, isClosable: true });
      return;
    }
    setSavingSections(true);
    try {
      await axios.post(`${apiUrl}/sections/update`, { username: selectedEmployee, sections: selectedSections });
      toast({ title: 'Sections updated successfully', status: 'success', duration: 3000, isClosable: true });
    } catch {
      toast({ title: 'Failed to save sections', status: 'error', duration: 3000, isClosable: true });
    } finally { setSavingSections(false); }
  };

  const handleChangePassword = async () => {
    if (!passwords.oldPassword || !passwords.newPassword || !passwords.confirmPassword) {
      toast({ title: 'Please fill all fields', status: 'warning', duration: 3000, isClosable: true }); return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast({ title: 'New passwords do not match', status: 'error', duration: 3000, isClosable: true }); return;
    }
    if (passwords.newPassword.length < 6) {
      toast({ title: 'Password must be at least 6 characters', status: 'warning', duration: 3000, isClosable: true }); return;
    }
    setChangingPassword(true);
    try {
      await axios.post(`${apiUrl}/auth/change-password`, { oldPassword: passwords.oldPassword, newPassword: passwords.newPassword });
      toast({ title: 'Password changed successfully', status: 'success', duration: 3000, isClosable: true });
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast({ title: 'Failed to change password', description: err?.response?.data?.message || '', status: 'error', duration: 3000, isClosable: true });
    } finally { setChangingPassword(false); }
  };

  const sharedUserProps = {
    users, departments, newUser, setNewUser, addingUser, onAddUser: handleAddUser,
    activateUser, activateStatus, setActivateStatus, updatingActivation,
    onActivationSelect: handleActivationSelect, onUpdateActivation: handleUpdateActivation,
  };

  const contentMap = {
    reports: () => (
      <AttendanceReport
        reportFilters={reportFilters} setReportFilters={setReportFilters}
        reportData={reportData} reportLoading={reportLoading}
        departments={departments} onGenerateReport={handleGenerateReport} toast={toast}
      />
    ),
    users:     () => <UserSettings {...sharedUserProps} />,
    'new-user': () => <UserSettings {...sharedUserProps} />,
    sections: () => (
      <SectionAccess
        users={users} departments={departments}
        newUser={newUser} setNewUser={setNewUser}
        selectedEmployee={selectedEmployee}
        selectedSections={selectedSections} setSelectedSections={setSelectedSections}
        loadingSections={loadingSections} savingSections={savingSections}
        onEmployeeSelect={handleEmployeeSelect} onSaveSections={handleSaveSections}
      />
    ),
    password: () => (
      <ChangePassword
        passwords={passwords} setPasswords={setPasswords}
        changingPassword={changingPassword} onChangePassword={handleChangePassword}
      />
    ),
  };

  const sidebarOffset = isMobile ? '0px' : collapsed ? SIDEBAR_CW : SIDEBAR_W;

  return (
    <Box minH="100vh" bg={C.pageBg}>
      <Sidebar
        activeTab={activeTab} setActiveTab={setActiveTab}
        collapsed={collapsed} setCollapsed={setCollapsed}
        user={user} isMobile={isMobile}
        isOpen={isOpen} onClose={onClose}
      />

      <Box
        ml={sidebarOffset}
        transition="margin-left 0.22s cubic-bezier(.4,0,.2,1)"
        minH="100vh" display="flex" flexDirection="column"
      >
        <TopHeader
          activeTab={activeTab} onMenuOpen={onOpen}
          isMobile={isMobile} collapsed={collapsed} setCollapsed={setCollapsed}
        />
        <Box flex={1} px={{ base: 4, md: 7 }} py={7} maxW="1400px" w="full">
          {contentMap[activeTab]?.()}
        </Box>
      </Box>
    </Box>
  );
}