import { useState, useEffect, useCallback } from 'react';
import {
  Box, Flex, Text, Heading,
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
    </Flex>
  );
}

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

  // Attendance report — filter keys match backend DTO
  const [reportFilters, setReportFilters] = useState({
    reportType: '', fromDate: '', fromTime: '', toDate: '', toTime: '',
    deptId: '', section: '', badgeNumber: '', checkType: '',
  });
  const [reportData,     setReportData]     = useState([]);
  const [reportMetaType, setReportMetaType] = useState('daily');
  const [reportLoading,  setReportLoading]  = useState(false);

  // New user form — field names match backend DTO
  const [newUser,    setNewUser]    = useState({
    username: '', password: '', confirmPassword: '', userType: 'user', deptId: '',
  });
  const [addingUser,   setAddingUser]   = useState(false);
  const [deletingUser, setDeletingUser] = useState(false);

  const [activateUser,       setActivateUser]       = useState('');
  const [activateStatus,     setActivateStatus]     = useState(false);
  const [updatingActivation, setUpdatingActivation] = useState(false);

  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedSections, setSelectedSections] = useState([]);
  const [loadingSections,  setLoadingSections]  = useState(false);
  const [savingSections,   setSavingSections]   = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await axios.get(`${apiUrl}/user-settings/user`);
      setUsers(res.data);
    } catch {
      toast({ title: 'Failed to load users', status: 'error', duration: 3000, isClosable: true });
    } finally { setLoadingUsers(false); }
  }, [apiUrl, toast]);

  const fetchDepartments = useCallback(async () => {
    try {
      const res = await axios.get(`${apiUrl}/user-settings/departments`);
      setDepartments(res.data);
    } catch {
      toast({ title: 'Failed to load departments', status: 'error', duration: 3000, isClosable: true });
    }
  }, [apiUrl, toast]);

  useEffect(() => { fetchUsers(); fetchDepartments(); }, [fetchUsers, fetchDepartments]);

  const handleGenerateReport = async () => {
    // Absence Report has no backend logic yet — show empty state instead of
    // silently falling through to another report's data.
    if (reportFilters.reportType === 'Absence Report') {
      setReportData([]);
      setReportMetaType('absence');
      toast({ title: 'Absence Report is not available yet', status: 'info', duration: 3000, isClosable: true });
      return;
    }
    setReportLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(reportFilters).forEach(([k, v]) => { if (v) params.append(k, v); });
      const res = await axios.get(`${apiUrl}/attendance-report?${params.toString()}`);
      setReportData(res.data.records || []);
      setReportMetaType(res.data.reportType || 'daily');
      if (!(res.data.records || []).length)
        toast({ title: 'No records found', status: 'info', duration: 3000, isClosable: true });
    } catch {
      toast({ title: 'Failed to generate report', status: 'error', duration: 3000, isClosable: true });
    } finally { setReportLoading(false); }
  };

  const handleAddUser = async () => {
    if (!newUser.username || !newUser.password || !newUser.deptId) {
      toast({ title: 'Please fill all fields', status: 'warning', duration: 3000, isClosable: true });
      return;
    }
    if (newUser.password !== newUser.confirmPassword) {
      toast({ title: 'Passwords do not match', status: 'error', duration: 3000, isClosable: true });
      return;
    }
    setAddingUser(true);
    try {
      await axios.post(`${apiUrl}/user-settings/user`, {
        username: newUser.username,
        password: newUser.password,
        confirmPassword: newUser.confirmPassword,
        userType: newUser.userType,
        deptId: Number(newUser.deptId),
      });
      toast({ title: 'User created successfully', status: 'success', duration: 3000, isClosable: true });
      setNewUser({ username: '', password: '', confirmPassword: '', userType: 'user', deptId: '' });
      fetchUsers();
    } catch (err) {
      toast({ title: 'Failed to create user', description: err?.response?.data?.message || '', status: 'error', duration: 3000, isClosable: true });
    } finally { setAddingUser(false); }
  };

  const handleDeleteUser = async () => {
    if (!newUser.username) {
      toast({ title: 'Please enter a username to delete', status: 'warning', duration: 3000, isClosable: true });
      return;
    }
    setDeletingUser(true);
    try {
      await axios.delete(`${apiUrl}/user-settings/user/${newUser.username}`);
      toast({ title: 'User deleted successfully', status: 'success', duration: 3000, isClosable: true });
      setNewUser({ username: '', password: '', confirmPassword: '', userType: 'user', deptId: '' });
      fetchUsers();
    } catch (err) {
      toast({ title: 'Failed to delete user', description: err?.response?.data?.message || '', status: 'error', duration: 3000, isClosable: true });
    } finally { setDeletingUser(false); }
  };

  const handleActivationSelect = (username) => {
    setActivateUser(username);
    if (!username) { setActivateStatus(false); return; }
    const selected = users.find(u => u.username === username);
    setActivateStatus(selected?.userStatus === 1);
  };

  const handleUpdateActivation = async () => {
    if (!activateUser) {
      toast({ title: 'Please select a user', status: 'warning', duration: 3000, isClosable: true });
      return;
    }
    setUpdatingActivation(true);
    try {
      const userStatus = activateStatus ? 'active' : 'inactive';
      await axios.patch(`${apiUrl}/user-settings/user/${activateUser}/status`, { userStatus });
      toast({ title: `User ${userStatus === 'active' ? 'activated' : 'deactivated'}`, status: 'success', duration: 3000, isClosable: true });
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
      const res = await axios.get(`${apiUrl}/user-settings/user/${username}`);
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
      await axios.post(`${apiUrl}/user-settings/save`, { username: selectedEmployee, sections: selectedSections });
      toast({ title: 'Sections updated successfully', status: 'success', duration: 3000, isClosable: true });
    } catch {
      toast({ title: 'Failed to save sections', status: 'error', duration: 3000, isClosable: true });
    } finally { setSavingSections(false); }
  };

  const handleChangePassword = async (oldPassword, newPassword) => {
    try {
      await axios.post(`${apiUrl}/user-settings/change-password`, {
        username: user.username,
        currentPassword: oldPassword,
        newPassword,
      });
      return { success: true, message: 'Password changed successfully' };
    } catch (err) {
      return { success: false, message: err?.response?.data?.message || 'Failed to change password' };
    }
  };

  const sharedUserProps = {
    users, departments, newUser, setNewUser,
    addingUser, onAddUser: handleAddUser,
    deletingUser, onDeleteUser: handleDeleteUser,
    activateUser, activateStatus, setActivateStatus, updatingActivation,
    onActivationSelect: handleActivationSelect, onUpdateActivation: handleUpdateActivation,
  };

  const contentMap = {
    reports: () => (
      <AttendanceReport
        reportFilters={reportFilters} setReportFilters={setReportFilters}
        reportData={reportData} reportMetaType={reportMetaType}
        reportLoading={reportLoading} departments={departments}
        onGenerateReport={handleGenerateReport} toast={toast}
      />
    ),
    users:      () => <UserSettings {...sharedUserProps} />,
    'new-user': () => <UserSettings {...sharedUserProps} />,
    sections: () => (
      <SectionAccess
        users={users} departments={departments}
        selectedEmployee={selectedEmployee}
        selectedSections={selectedSections} setSelectedSections={setSelectedSections}
        loadingSections={loadingSections} savingSections={savingSections}
        onEmployeeSelect={handleEmployeeSelect} onSaveSections={handleSaveSections}
      />
    ),
    password: () => (
      <ChangePassword onChangePassword={handleChangePassword} />
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