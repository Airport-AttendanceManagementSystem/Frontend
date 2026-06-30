import { useRef, useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
  Box, Flex, Text, Input, Select, Button, Table, Thead, Tbody,
  Tr, Th, Td, Badge, InputGroup, InputRightElement,
  TableContainer, FormControl, FormLabel,Menu, MenuButton, MenuList, MenuItem, SimpleGrid,
} from '@chakra-ui/react';
import {
  FileSpreadsheet, Download, RefreshCw, FileText, Calendar, Clock, Printer, Search,ZoomIn,
} from 'lucide-react';

// ── Design Tokens ──────────────────────────────────────────────────────────────
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
  green:   { bg: '#E6F4D7', text: '#2E6B0A' },
  amber:   { bg: '#FEF3D0', text: '#7A4C07' },
};

const card = {
  bg: C.white,
  border: `1px solid ${C.blue200}`,
  borderRadius: '12px',
  boxShadow: '0 1px 4px rgba(179,201,222,0.07)',
};

const inputSx = {
  bg: C.blue50,
  border: `1px solid ${C.blue200}`,
  borderRadius: '8px',
  color: C.navy,
  fontSize: 'sm',
  h: '38px',
  _placeholder: { color: C.blue400 },
  _hover: { borderColor: C.blue500 },
  _focus: { borderColor: C.blue600, boxShadow: `0 0 0 3px ${C.blue100}`, bg: C.white },
  sx: {
    option: {
      bg: C.blue50,
      color: C.navy,
    },
    'option:hover': {
      bg: C.blue700,
    },
  },
};


const primaryBtn = {
  bg: C.navy,
  color: C.white,
  fontWeight: 600,
  fontSize: 'sm',
  borderRadius: '8px',
  h: '38px',
  px: 5,
  _hover: { bg: C.blue600, transform: 'translateY(-1px)', boxShadow: 'md' },
  _active: { transform: 'translateY(0)', bg: C.navy },
  transition: 'all 0.15s',
};

const compactBtn = {
  bg: C.white,
  color: C.blue700,
  border: `1px solid ${C.blue200}`,
  fontWeight: 600,
  fontSize: 'xs',
  borderRadius: '6px',
  h: '34px',
  px: 3,
  _hover: { bg: C.blue50 },
  transition: 'all 0.15s',
};


// ── Sub-components ─────────────────────────────────────────────────────────────
const TypeBadge = ({ type }) => {
  const val = String(type).toUpperCase();
  const isIn = val === 'I' || val === 'IN';
  return (
    <Badge
      bg={isIn ? C.green.bg : C.amber.bg}
      color={isIn ? C.green.text : C.amber.text}
      px={2.5} py={0.5} borderRadius="full" fontSize="11px" fontWeight={600}
    >
      {isIn ? 'I' : 'O'}
    </Badge>
  );
};

const FF = ({ label, children }) => (
  <FormControl>
    <FormLabel fontSize="11px" fontWeight={700} color={C.blue500}
      textTransform="uppercase" letterSpacing="0.08em" mb={1}>
      {label}
    </FormLabel>
    {children}
  </FormControl>
);

const TH = ({ children }) => (
  <Th bg={C.blue50} color={C.blue400} fontSize="10px" textTransform="uppercase"
    letterSpacing="0.08em" fontWeight={700} py={3}
    borderBottom={`1px solid ${C.blue200}`} whiteSpace="nowrap">
    {children}
  </Th>
);
const TD = ({ children, ...p }) => (
  <Td py={3} px={4} fontSize="13px" color={C.navy}
    borderBottom={`1px solid ${C.blue50}`} {...p}>
    {children}
  </Td>
);

const EmptyState = () => (
  <Flex direction="column" align="center" justify="center" py={16} gap={3}>
    <Box bg={C.blue100} p={4} borderRadius="full" color={C.blue400}>
      <FileSpreadsheet size={32} />
    </Box>
    <Text color={C.navy} fontSize="sm" fontWeight={600}>No report data</Text>
    <Text color={C.blue400} fontSize="xs" textAlign="center">
      Configure the filters above and click Show Report.
    </Text>
  </Flex>
);

// ── Helpers ────────────────────────────────────────────────────────────────────
const getDeptName = (departments, deptId) =>
  (deptId && departments.find(d => String(d.deptId) === String(deptId))?.deptName) || 'All';

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AttendanceReport({
  reportFilters,
  setReportFilters,
  reportData,
  reportMetaType = 'daily',
  reportLoading,
  departments,
  onGenerateReport,
  toast,
}) {
  const { apiUrl } = useAuth();
  const startDateRef = useRef(null);
  const endDateRef   = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sections, setSections] = useState([]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [exportLoading, setExportLoading] = useState('');

  // Fetch sub-departments (sections) for the selected department
  useEffect(() => {
    const deptId = reportFilters.deptId;
    if (!deptId) { setSections([]); return; }
    axios.get(`${apiUrl}/user-settings/sections?deptId=${deptId}`)
      .then(res => setSections(Array.isArray(res.data) ? res.data : []))
      .catch(() => setSections([]));
  }, [reportFilters.deptId, apiUrl]);

  const set = (field) => (e) => {
    const value = e.target.value;
    if (field === 'deptId') {
      setReportFilters(p => ({ ...p, deptId: value, section: '' }));
    } else {
      setReportFilters(p => ({ ...p, [field]: value }));
    }
  };

  // Client-side search — filters by EPF or name (all report types)
  const filteredData = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return reportData;
    return reportData.filter(r => {
      const epf  = String(r.badgeNumber ?? r.userId ?? '').toLowerCase();
      const name = String(r.name ?? '').toLowerCase();
      const location = String(r.location ?? '').toLowerCase();
      const extra = r.checkTime
        ? new Date(r.checkTime).toLocaleDateString().toLowerCase()
        : String(r.month ?? '').toLowerCase();
      return epf.includes(q) || name.includes(q) || location.includes(q) || extra.includes(q);
    });
  }, [reportData, searchQuery]);


    const download = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.setAttribute('download', filename);
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const buildExportParams = () => {
    const params = new URLSearchParams();
    Object.entries(reportFilters).forEach(([k, v]) => { if (v) params.append(k, v); });
    const deptName = getDeptName(departments, reportFilters.deptId);
    if (deptName && deptName !== 'All') params.append('deptName', deptName);
    const section = sections.find(s => String(s.sectionId) === String(reportFilters.section));
    if (section?.sectionName) params.append('sectionName', section.sectionName);
    return params.toString();
  };

  const downloadFromBackend = async (endpoint, filename, type) => {
    if (!filteredData.length) {
      toast({ title: 'No data to download', status: 'warning', duration: 3000, isClosable: true });
      return;
    }
    setExportLoading(type);
    try {
      const res = await axios.get(`${apiUrl}/attendance-report/${endpoint}?${buildExportParams()}`, {
        responseType: 'blob',
      });
      download(new Blob([res.data], { type: res.headers['content-type'] }), filename);
    } catch {
      toast({ title: 'Export failed. Please try again.', status: 'error', duration: 3000, isClosable: true });
    } finally {
      setExportLoading('');
    }
  };

  const handleDownloadCSV = () =>
    downloadFromBackend('export/csv', `attendance_${new Date().toISOString().slice(0, 10)}.csv`, 'csv');

  const handleDownloadWord = () =>
    downloadFromBackend('export/word', `attendance_${new Date().toISOString().slice(0, 10)}.docx`, 'word');

  const handleDownloadPDF = () => {
    const isSerial = String(reportFilters.reportType).toLowerCase().includes('serial');
    const endpoint = isSerial ? 'export/serial-epf-pdf' : 'export/pdf';
    downloadFromBackend(endpoint, `attendance_${new Date().toISOString().slice(0, 10)}.pdf`, 'pdf');
  };

  // Row builder — adapts per report type
  const buildRows = (data) => {
    // if (reportMetaType === 'absence') {
    //   return data.map((r, i) => [String(i + 1), String(r.badgeNumber ?? ''), String(r.name ?? '')]);
    // }
    if (reportMetaType === 'monthly') {
      // return data.map((r, i) => [
        // String(i + 1),
        // String(r.badgeNumber ?? ''),
        // String(r.name ?? ''),
        // String(r.month ?? ''),
        // String(r.daysPresent ?? ''),
      // ]);
    }
    // return data.map(r => {
    //   const d = new Date(r.checkTime);
    //   return [
    //     String(r.badgeNumber ?? r.userId ?? ''),
    //     String(r.name ?? ''),
    //     d.toLocaleDateString(),
    //     d.toLocaleTimeString(),
    //     r.checkTypeDisplay ?? (r.checkType === 'I' ? 'IN' : 'OUT'),
    //   ];
    // });
  };

  

  // Generate an array of dates between startDate and endDate (For Monthly report)

  const getDateRange = (startDate, endDate) => {
  const dates = [];

  if (!startDate || !endDate) return dates;

  let current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    dates.push(current.toISOString().split("T")[0]);

    current.setDate(current.getDate() + 1);
  }

  return dates;
};

 const selectedDates = getDateRange(
    reportFilters.fromDate,
    reportFilters.toDate
  );

  return (
    <Box>
      {/* ── Filter Card ────────────────────────────────────────────────────── */}
      <Box {...card} p={6} mb={5}>
        <Flex align="center" gap={2} mb={5}>
          <Box bg={C.blue100} p={2} borderRadius="8px" color={C.blue700}>
            <FileSpreadsheet size={16} />
          </Box>
          <Text fontSize="md" fontWeight={700} color={C.navy} letterSpacing="-0.01em">
            Attendance Report
          </Text>
        </Flex>

        {/* Row 1: REPORT | DEPARTMENT | SECTION | TYPE | EPF */}
        <Flex gap={4} mb={5} flexWrap={{ base: 'wrap', lg: 'nowrap' }}>

          {/* REPORT — report type */}
          <FF label="Report">
            <Select {...inputSx}  value={reportFilters.reportType} onChange={set('reportType')}>
              <option value="Daily Attendance">Daily Attendance</option>
              <option value="Daily Attendance II">Daily Attendance II</option>
              <option value="Absence Report">Absence Report</option>
              <option value="Monthly Attendance">Monthly Attendance</option>
              <option value="Monthly Attendance II">Monthly Attendance II</option>
              <option value="Daily Attendance II">Daily Attendance II</option>
              <option value="Serial/EPF">Serial / EPF</option>
            </Select>
          </FF>

          {/* DEPARTMENT — all departments, same for admin and user */}
          <FF label="Department">
            <Select {...inputSx}  value={reportFilters.deptId} onChange={set('deptId')}>
              {departments.map(d => (
                <option key={d.deptId} value={d.deptId}>{d.deptName}</option>
              ))}
            </Select>
          </FF>

          {/* SECTION — sub-departments of selected department */}
          <FF label="Section">
            <Select
              {...inputSx}
              placeholder={reportFilters.deptId ? 'All Sections' : 'Select Department first'}
              value={reportFilters.section}
              onChange={set('section')}
              isDisabled={!reportFilters.deptId}
            >
              {sections.map(s => (
                <option key={s.sectionId} value={s.sectionId}>{s.sectionName}</option>
              ))}
            </Select>
          </FF>

          {/* TYPE — hidden for monthly Attendance */}
          {reportFilters.reportType !== 'Monthly Attendance' && <FF label="Type">
            <Select {...inputSx} placeholder="IN / OUT" value={reportFilters.checkType} onChange={set('checkType')}>
              <option value="IN">IN</option>
              <option value="OUT">OUT</option>
            </Select>
          </FF>}

          {/* EPF number */}
          <FF label="EPF">
            <Input
              {...inputSx} placeholder="EPF number"
              value={reportFilters.badgeNumber}
              onChange={set('badgeNumber')}
            />
          </FF>
        </Flex>

        {/* Row 2: FROM | TO | Show Report */}
        <Flex gap={4} align="flex-end" flexWrap={{ base: 'wrap', md: 'nowrap' }}>
          <FF label="From">
            <Flex gap={2}>
              <InputGroup flex="1">
                <Input
                  ref={startDateRef} type="date" {...inputSx}
                  value={reportFilters.fromDate} onChange={set('fromDate')}
                  sx={{ '::-webkit-calendar-picker-indicator': { display: 'none' } }}
                />
                <InputRightElement
                  pointerEvents="auto" color={C.blue500} cursor="pointer" h="full"
                  _hover={{ color: C.blue700 }}
                  onClick={() => startDateRef.current?.showPicker?.() ?? startDateRef.current?.focus()}
                >
                  <Calendar size={15} />
                </InputRightElement>
              </InputGroup>
              <InputGroup flex="1">
                <Input
                  type="time" {...inputSx}
                  value={reportFilters.fromTime} onChange={set('fromTime')}
                  sx={{
                    '::-webkit-calendar-picker-indicator': {
                      opacity: 0, cursor: 'pointer',
                      position: 'absolute', right: 0, top: 0,
                      width: '36px', height: '100%',
                    },
                  }}
                />
                <InputRightElement pointerEvents="none" color={C.blue500} h="full">
                  <Clock size={15} />
                </InputRightElement>
              </InputGroup>
            </Flex>
          </FF>

          <FF label="To">
            <Flex gap={2}>
              <InputGroup flex="1">
                <Input
                  ref={endDateRef} type="date" {...inputSx}
                  value={reportFilters.toDate} onChange={set('toDate')}
                  sx={{ '::-webkit-calendar-picker-indicator': { display: 'none' } }}
                />
                <InputRightElement
                  pointerEvents="auto" color={C.blue500} cursor="pointer" h="full"
                  _hover={{ color: C.blue700 }}
                  onClick={() => endDateRef.current?.showPicker?.() ?? endDateRef.current?.focus()}
                >
                  <Calendar size={15} />
                </InputRightElement>
              </InputGroup>
              <InputGroup flex="1">
                <Input
                  type="time" {...inputSx}
                  value={reportFilters.toTime} onChange={set('toTime')}
                  sx={{
                    '::-webkit-calendar-picker-indicator': {
                      opacity: 0, cursor: 'pointer',
                      position: 'absolute', right: 0, top: 0,
                      width: '36px', height: '100%',
                    },
                  }}
                />
                <InputRightElement pointerEvents="none" color={C.blue500} h="full">
                  <Clock size={15} />
                </InputRightElement>
              </InputGroup>
            </Flex>
          </FF>

          <Box>
            
           
            <Button
              {...primaryBtn}
              leftIcon={<RefreshCw size={14} />}
              onClick={onGenerateReport}
              isLoading={reportLoading}
              loadingText="Generating…"
            >
              Show Report
            </Button>
          </Box>
        </Flex>
      </Box>

      {/* ── Export + Results Card ─────────────────────────────────────────────── */}
      <Box {...card} p={6} overflow="hidden">
         <Flex
          justify="space-between"
          align={{ base: 'flex-start', md: 'center' }}
          direction={{ base: 'column', md: 'row' }}
          gap={3}
          mb={3} >
         
          <Text fontSize="sm" fontWeight={600} color={C.navy}>Export Options</Text>
            </Flex>
        <Flex gap={2} flexWrap="wrap" align="center" mb={4}>
          <Button {...compactBtn} leftIcon={<Download size={12} />} onClick={handleDownloadCSV}>Export Excel</Button>
          <Button {...compactBtn} leftIcon={<FileText size={12} />} onClick={handleDownloadWord}>Export Word</Button>
          <Button {...compactBtn} leftIcon={<FileText size={12} />} onClick={handleDownloadPDF}>Export PDF</Button>
          <Button {...compactBtn} leftIcon={<Printer size={12} />} onClick={() => window.print()}>Print</Button>
          <Menu>
              <MenuButton as={Button} {...compactBtn} leftIcon={<ZoomIn size={12}/>}>Zoom {Math.round(zoomLevel * 100)}%</MenuButton>
              <MenuList>
                  <MenuItem onClick={() => setZoomLevel(0.5)}>50%</MenuItem>
                  <MenuItem onClick={() => setZoomLevel(0.75)}>75%</MenuItem>
                  <MenuItem onClick={() => setZoomLevel(1)}>100%</MenuItem>
                  <MenuItem onClick={() => setZoomLevel(1.25)}>125%</MenuItem>
                  <MenuItem onClick={() => setZoomLevel(1.5)}>150%</MenuItem>
              </MenuList>
          </Menu>
          {/* Search — filters table by EPF, name,  date */}
          <InputGroup maxW="260px" ml={{ base: 0, md: 'auto' }}>
            <Input
              h="34px" fontSize="sm" borderRadius="6px"
              border={`1px solid ${C.blue200}`} bg={C.white} color={C.navy}
              placeholder="Search EPF no, name, date"
              _placeholder={{ color: C.blue400 }}
              _focus={{ borderColor: C.blue600, boxShadow: `0 0 0 3px ${C.blue100}` }}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <InputRightElement pointerEvents="none" color={C.blue400} h="34px">
              <Search size={13} />
            </InputRightElement>
          </InputGroup>
        </Flex>

        {/* Results */}
       {reportData.length === 0 ? (
                <EmptyState />
              ) : (
                <Box
  sx={{
    zoom: zoomLevel,
    overflowX: 'auto',
    width: '100%',
  }}
>
                   {/* Summary bar */}
            <Box >
             <Flex justify="center" mb={2}>
              <img src="/src/assets/AASL.png" alt="Report Banner" width="20%" borderRadius="8px" mb={4}  />
            </Flex> 
              <Text textAlign="center"fontSize="lg" fontWeight={700} color={C.navy} mb={0.2}>
                Airport and Aviation Services (Sri Lanka) Limited
              </Text>
              <Text textAlign="center" fontSize="lg" fontWeight={700} color={C.navy} mb={0.2}>
                Bandaranaike International Airport
              </Text>
              <Text textAlign="center" fontSize="lg" fontWeight={700} color={C.navy} mb={3}>
                Katunayake
              </Text>
                <Text textAlign="center" fontSize="lg" fontWeight={700} color={C.navy} mb={4}>
                  <Text as="span" fontSize="lg" fontWeight={500} color={C.navy}>
                    {
                      reportMetaType === 'monthly'
                        ? 'Monthly Attendance Report'
                        : reportMetaType === 'daily'
                          ? 'Daily Attendance Report'
                          : reportMetaType === 'serial'
                            ? 'Serial / EPF Report'
                              : reportMetaType === 'absence'
                            ? 'Absence Report'
                            : reportMetaType
                    }
                  </Text>
                </Text>


            {/* <Flex bg={C.blue50} borderRadius="8px" p={4} mb={4} gap={6} flexWrap="wrap" fontSize="sm">
              <Text fontWeight={600} color={C.navy}>
                Division: <Text as="span" fontWeight={400}>{getDeptName(departments, reportFilters.deptId)}</Text>
              </Text>
              <Flex direction="column">
                  <Text fontWeight={600} color={C.navy}>Section: <Text as="span" fontWeight={400}>{(reportFilters.deptId && (departments.find(d => String(d.DEPTID) === String(reportFilters.deptId))?.DEPTNAME)) || 'All'}</Text></Text>
                </Flex>
              {reportFilters.fromDate && (
                <Text fontWeight={600} color={C.navy}>
                  From: <Text as="span" fontWeight={400}>{reportFilters.fromDate} {reportFilters.fromTime}</Text>
                </Text>
              )}
              {reportFilters.toDate && (
                <Text fontWeight={600} color={C.navy}>
                  To: <Text as="span" fontWeight={400}>{reportFilters.toDate} {reportFilters.toTime}</Text>
                </Text>
              )}
              <Text fontWeight={600} color={C.navy}>
                Total: <Text as="span" fontWeight={400}>{filteredData.length} records</Text>
              </Text>
            </Flex> */}
            <Box bg={C.blue50} borderRadius="8px" p={4} mb={4} fontSize="sm">
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacingY={3} spacingX={8}>

                    {/* Division */}
                    <Text fontWeight={600} color={C.navy}>
                      DIVISION :
                      <Text as="span" fontWeight={400} ml={2}>
                        {getDeptName(
                          departments,
                          reportFilters.deptId
                        )}
                      </Text>
                    </Text>


                    {/* From Date */}
                    <Text fontWeight={600} color={C.navy}>
                      FROM :
                      <Text as="span" fontWeight={400} ml={2}>
                        {reportFilters.fromDate}  {reportFilters.fromTime}
                      </Text>
                    </Text>


                    {/* To Date */}
                    <Text fontWeight={600} color={C.navy}>
                      TO :
                      <Text as="span" fontWeight={400} ml={2}>
                        {reportFilters.toDate}  {reportFilters.toTime}
                      </Text>
                    </Text>


                    {/* Section */}
                    <Text fontWeight={600} color={C.navy}>
                      SECTION :
                      <Text as="span" fontWeight={400} ml={2}>
                        {
                          (
                            reportFilters.deptId &&
                            departments.find(
                              d =>
                                String(d.DEPTID) ===
                                String(reportFilters.deptId)
                            )?.DEPTNAME
                          ) || "All"
                        }
                      </Text>
                    </Text>


                    {/* Total */}
                    <Text fontWeight={600} color={C.navy}>
                      Total :
                      <Text as="span" fontWeight={400} ml={2}>
                        {filteredData.length}
                      </Text>
                    </Text>

                  </SimpleGrid>
            </Box>
            </Box>
            <Box
              transform={`scale(${zoomLevel})`}
              transformOrigin="top left"
              width={`${100 / zoomLevel}%`}
            >
            {/* ── Absence Report table ── */}
            {/* {reportMetaType === 'absence' && (
              <TableContainer>
                <Table variant="unstyled" size="sm">
                  <Thead>
                    <Tr>{['EPF No', 'Name'].map(h => <TH key={h}>{h}</TH>)}</Tr>
                  </Thead>
                  <Tbody>
                    {filteredData.map((row, i) => (
                      <Tr key={i} _hover={{ bg: C.blue50 }} transition="background 0.1s">
                     
                        <TD color={C.blue500} fontWeight={600}>{row.badgeNumber}</TD>
                        <TD fontWeight={600}>{row.name}</TD>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            )} */}

            {/* ── monthly Attendance table ── */}
            {reportMetaType === 'monthly' && (
              <TableContainer>
                <Table variant="unstyled" size="sm" >
                   <Thead >
                    <Tr>{['EPF No', 'Name', ...selectedDates].map(h => <TH key={h}>{h}</TH>)}</Tr>
                  </Thead> 
                  
                 <Tbody>
                    {filteredData.map((row, i) => (
                      <Tr
                        key={i}
                        _hover={{ bg: C.blue50 }}
                        transition="background 0.1s"
                      >
                        {/* EPF No */}
                        <TD color={C.blue500} fontWeight={600}>
                          {row.badgeNumber}
                        </TD>

                        {/* Name */}
                        <TD fontWeight={600}>
                          {row.name}
                        </TD>

                        {/* Dynamic Date Columns */}
                        {selectedDates.map((date) => {
                          const record = row.attendance?.find(
                            (a) => a.date === date
                          );

                          return (
                            <TD key={date} textAlign="center">
                              {record ? (
                                <Box fontSize="xs">
                                  <Text>{record.in || "-"}</Text>
                                  <Text color="gray.500">|</Text>
                                  <Text>{record.out || "-"}</Text>
                                </Box>
                              ) : (
                                "-"
                              )}
                            </TD>
                          );
                        })}
                      </Tr>
                    ))}
                </Tbody>
                </Table>
              </TableContainer>
            )}

            {/* ── Daily ── */}
            {(reportMetaType === 'daily') && (
              <TableContainer>
                <Table variant="unstyled" size="sm" >
                  <Thead>
                    <Tr>
                      {['EPF No', 'Name', 'Location', 'Date', 'Time', 'Type'].map(h => <TH key={h}>{h}</TH>)}
                  </Tr>
                  </Thead>
                  <Tbody>
                    {filteredData.map((row, i) => {
                      const t = new Date(row.checkTime);
                      return (
                        <Tr key={i} _hover={{ bg: C.blue100 }} transition="background 0.1s">
                          <TD color={C.blue500} fontWeight={600}>{row.badgeNumber ?? row.userId}</TD>
                          <TD fontWeight={600}>{row.name}</TD>
                          <TD fontWeight={600}>{row.location ?? '-'}</TD>
                          <TD>{t.toLocaleDateString()}</TD>
                          <TD>{t.toLocaleTimeString()}</TD>
                          <TD><TypeBadge type={row.checkType} /></TD>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </TableContainer>
            )}

            {/* Serial-EPF table ── */}
            {/* {(reportMetaType === 'serial') && (
              <TableContainer>
                <Table variant="unstyled" size="sm">
                  <Thead>
                    <Tr>{['Serial No', 'EPF No', 'Name'].map(h => <TH key={h}>{h}</TH>)}</Tr>
                  </Thead>
                  <Tbody>
                    {filteredData.map((row, i) => {
                      const t = new Date(row.checkTime);
                      return (
                        <Tr key={i} _hover={{ bg: C.blue50 }} transition="background 0.1s">
                          <TD color={C.blue500} fontWeight={600}>{row.serialNumber}</TD>
                          <TD color={C.blue500} fontWeight={600}>{row.badgeNumber ?? row.userId}</TD>
                          <TD fontWeight={600}>{row.name}</TD>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </TableContainer>
            )} */}
            {/* Serial-EPF table */}
{reportMetaType === 'serial' && (
  <TableContainer>
    <Table variant="unstyled" size="sm">
      <Thead>
        <Tr>
          {['Serial No', 'EPF No', 'Name'].map(h => (
            <TH key={h}>{h}</TH>
          ))}
        </Tr>
      </Thead>

      <Tbody>
        {filteredData.map((row, i) => (
          <Tr 
            key={i}
            _hover={{ bg: C.blue50 }}
            transition="background 0.1s"
          >

            {/* Serial Number */}
            <TD color={C.blue500} fontWeight={600}>
              {i + 1}
            </TD>

            {/* EPF Number */}
            <TD color={C.blue500} fontWeight={600}>
              {row.badgeNumber || row.epfNo || row.userId || '-'}
            </TD>

            {/* Name */}
            <TD fontWeight={600}>
              {row.name || '-'}
            </TD>

          </Tr>
        ))}
      </Tbody>

    </Table>
  </TableContainer>
)}
          </Box>
          </Box>  
        )}
      </Box>
    </Box>
  );
}
