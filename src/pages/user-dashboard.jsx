import { useState, useEffect, useCallback } from 'react';
import {
  Box, Flex, Text, Heading,
  Tooltip, IconButton, useDisclosure, useBreakpointValue, useToast,
} from '@chakra-ui/react';
import { ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

import Sidebar, { navItems, SIDEBAR_W, SIDEBAR_CW } from '../components/Sidebar/UserSidebar';
import AttendanceReport from '../components/Attendance/AttendanceReport';
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

export default function UserDashboard() {
  const { user, apiUrl } = useAuth();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, lg: false });

  const [activeTab, setActiveTab] = useState('reports');
  const [collapsed, setCollapsed] = useState(false);

  const [departments, setDepartments] = useState([]);

  const [reportFilters, setReportFilters] = useState({
    reportType: '', fromDate: '', fromTime: '', toDate: '', toTime: '',
    deptId: '', section: '', badgeNumber: '', checkType: '',
  });
  const [reportData,     setReportData]     = useState([]);
  const [reportMetaType, setReportMetaType] = useState('daily');
  const [reportLoading,  setReportLoading]  = useState(false);

  const fetchDepartments = useCallback(async () => {
    try {
      const res = await axios.get(`${apiUrl}/user-settings/departments`);
      setDepartments(res.data);
    } catch {
      toast({ title: 'Failed to load departments', status: 'error', duration: 3000, isClosable: true });
    }
  }, [apiUrl, toast]);

  useEffect(() => { fetchDepartments(); }, [fetchDepartments]);

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
      setReportMetaType(res.data.reportType || 'Daily');
      if (!(res.data.records || []).length)
        toast({ title: 'No records found', status: 'info', duration: 3000, isClosable: true });
    } catch {
      toast({ title: 'Failed to generate report', status: 'error', duration: 3000, isClosable: true });
    } finally { setReportLoading(false); }
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

  const contentMap = {
    reports: () => (
      <AttendanceReport
        reportFilters={reportFilters} setReportFilters={setReportFilters}
        reportData={reportData} reportMetaType={reportMetaType}
        reportLoading={reportLoading} departments={departments}
        onGenerateReport={handleGenerateReport} toast={toast}
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
        isMobile={isMobile}
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