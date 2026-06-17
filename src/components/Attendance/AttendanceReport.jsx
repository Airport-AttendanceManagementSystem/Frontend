import { useRef } from 'react';
import {
  Box, Flex, Text, Input, Select, Button, Table, Thead, Tbody,
  Tr, Th, Td, Badge, Grid, InputGroup, InputRightElement,
  TableContainer, FormControl, FormLabel,
} from '@chakra-ui/react';
import {
  FileSpreadsheet, Download, RefreshCw, FileText, Calendar, Clock, Printer,
} from 'lucide-react';

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
  green:   { bg: '#E6F4D7', text: '#2E6B0A' },
  amber:   { bg: '#FEF3D0', text: '#7A4C07' },
};

const card = {
  bg: C.white,
  border: `1px solid ${C.blue200}`,
  borderRadius: '12px',
  boxShadow: '0 1px 4px rgba(179, 201, 222, 0.07)',
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

const outlineBtn = {
  bg: C.white,
  color: C.blue700,
  border: `1px solid ${C.blue700}`,
  fontWeight: 600,
  fontSize: 'sm',
  borderRadius: '8px',
  h: '38px',
  px: 5,
  _hover: { bg: C.blue50 },
  transition: 'all 0.15s',
};

const compactBtn = {
  ...outlineBtn,
  fontSize: 'xs',
  borderRadius: '6px',
  h: '34px',
  px: 3,
  minW: 'auto',
  _hover: { bg: C.blue50, transform: 'none', boxShadow: 'none' },
};

const TypeBadge = ({ type }) => {
  const isIn = String(type).toLowerCase().includes('in') || String(type) === '0';
  return (
    <Badge
      bg={isIn ? C.green.bg : C.amber.bg}
      color={isIn ? C.green.text : C.amber.text}
      px={2.5} py={0.5} borderRadius="full" fontSize="11px" fontWeight={600}
    >
      {isIn ? 'Check-In' : 'Check-Out'}
    </Badge>
  );
};

const FF = ({ label, children }) => (
  <FormControl>
    <FormLabel fontSize="11px" fontWeight={700} color={C.blue500} textTransform="uppercase" letterSpacing="0.08em" mb={1}>{label}</FormLabel>
    {children}
  </FormControl>
);

const TH = ({ children }) => (
  <Th bg={C.blue50} color={C.blue400} fontSize="10px" textTransform="uppercase" letterSpacing="0.08em" fontWeight={700} py={3} borderBottom={`1px solid ${C.blue200}`} whiteSpace="nowrap">{children}</Th>
);
const TD = ({ children, ...p }) => (
  <Td py={3} px={4} fontSize="13px" color={C.navy} borderBottom={`1px solid ${C.blue50}`} {...p}>{children}</Td>
);

const SectionLabel = ({ icon: Icon, title }) => (
  <Flex align="center" gap={2} mb={5}>
    <Box bg={C.blue100} p={2} borderRadius="8px" color={C.blue700}><Icon size={16} /></Box>
    <Text fontSize="md" fontWeight={700} color={C.navy} letterSpacing="-0.01em">{title}</Text>
  </Flex>
);

const EmptyState = ({ icon: Icon, title, subtitle }) => (
  <Flex direction="column" align="center" justify="center" py={16} gap={3}>
    <Box bg={C.blue100} p={4} borderRadius="full" color={C.blue400}><Icon size={32} /></Box>
    <Text color={C.navy} fontSize="sm" fontWeight={600}>{title}</Text>
    <Text color={C.blue400} fontSize="xs" textAlign="center">{subtitle}</Text>
  </Flex>
);

const formatCheckType = (type) => {
  const value = String(type).toLowerCase();
  if (value === '0' || value.includes('in')) return '1';
  if (value === '1' || value.includes('out')) return '0';
  return String(type);
};

const escapePdfString = (text) => String(text)
  .replace(/\\/g, '\\\\')
  .replace(/\(/g, '\\(')
  .replace(/\)/g, '\\)')
  .replace(/\r/g, '\\r')
  .replace(/\n/g, '\\n');

const createPdfBlob = ({ title, detailRows, headers, rows }) => {
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 40;
  const titleFontSize = 18;
  const detailFontSize = 10;
  const headerFontSize = 10;
  const rowFontSize = 10;
  const rowHeight = 24;
  const headerHeight = 28;
  const detailSpacing = 18;
  const tableWidth = pageWidth - margin * 2;
  const colWidths = [70, 190, 90, 90, 92];
  const colPositions = [margin];
  for (let i = 0; i < colWidths.length; i += 1) {
    colPositions.push(colPositions[i] + colWidths[i]);
  }

  const titleY = pageHeight - margin;
  const detailStartY = titleY - titleFontSize - 14;
  const tableTop = detailStartY - detailRows.length * detailSpacing - 16;
  const tableBottom = tableTop - headerHeight - rowHeight * rows.length;
  const tableLines = [];
  const textLines = [];

  textLines.push(`/F1 ${titleFontSize} Tf`);
  textLines.push(`1 0 0 1 ${margin} ${titleY} Tm (${escapePdfString(title)}) Tj`);

  textLines.push(`/F1 ${detailFontSize} Tf`);
  detailRows.forEach((row, index) => {
    const y = detailStartY - index * detailSpacing;
    textLines.push(`1 0 0 1 ${margin} ${y} Tm (${escapePdfString(`${row[0]}:`)}) Tj`);
    textLines.push(`1 0 0 1 ${margin + 130} ${y} Tm (${escapePdfString(row[1])}) Tj`);
  });

  textLines.push(`/F1 ${headerFontSize} Tf`);
  const headerTextY = tableTop - headerHeight / 2 - 6;
  headers.forEach((header, index) => {
    textLines.push(`1 0 0 1 ${colPositions[index] + 6} ${headerTextY} Tm (${escapePdfString(header)}) Tj`);
  });

  textLines.push(`/F1 ${rowFontSize} Tf`);
  rows.forEach((row, rowIndex) => {
    const y = tableTop - headerHeight - rowHeight * rowIndex - 10;
    row.forEach((cell, cellIndex) => {
      textLines.push(`1 0 0 1 ${colPositions[cellIndex] + 6} ${y} Tm (${escapePdfString(cell)}) Tj`);
    });
  });

  textLines.push(`/F1 9 Tf`);
  textLines.push(`1 0 0 1 ${margin} 30 Tm (${escapePdfString(`Generated on: ${new Date().toLocaleString()}`)}) Tj`);

  tableLines.push('0.4 w');
  tableLines.push(`${margin} ${titleY - 8} m ${margin + tableWidth} ${titleY - 8} l S`);
  tableLines.push('0 G');
  tableLines.push('0 g');
  tableLines.push('0.5 w');
  tableLines.push(`${margin} ${tableTop} m ${margin + tableWidth} ${tableTop} l S`);
  tableLines.push(`${margin} ${tableTop - headerHeight} m ${margin + tableWidth} ${tableTop - headerHeight} l S`);
  for (let i = 1; i <= rows.length; i += 1) {
    const y = tableTop - headerHeight - rowHeight * i;
    tableLines.push(`${margin} ${y} m ${margin + tableWidth} ${y} l S`);
  }
  for (let i = 0; i < colPositions.length; i += 1) {
    const x = colPositions[i];
    tableLines.push(`${x} ${tableTop} m ${x} ${tableBottom} l S`);
  }
  tableLines.push(`${margin + tableWidth} ${tableTop} m ${margin + tableWidth} ${tableBottom} l S`);

  const contentStream = `BT\n${textLines.join('\n')}\nET\n${tableLines.join('\n')}`;
  const objects = [
    `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`,
    `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`,
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`,
    `4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`,
    `5 0 obj\n<< /Length ${new TextEncoder().encode(contentStream).length} >>\nstream\n${contentStream}\nendstream\nendobj\n`,
  ];
  const encoder = new TextEncoder();
  const header = '%PDF-1.3\n';
  const offsets = [];
  let currentOffset = encoder.encode(header).length;
  for (const obj of objects) {
    offsets.push(currentOffset);
    currentOffset += encoder.encode(obj).length;
  }
  const xrefEntries = offsets.map(offset => `${String(offset).padStart(10, '0')} 00000 n \n`).join('');
  const xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${xrefEntries}`;
  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${currentOffset}\n%%EOF`;
  const pdf = header + objects.join('') + xref + '\n' + trailer;
  return new Blob([pdf], { type: 'application/pdf' });
};

export default function AttendanceReport({
  reportFilters,
  setReportFilters,
  reportData,
  reportLoading,
  departments,
  onGenerateReport,
  toast,
}) {
  const startDateInputRef = useRef(null);
  const endDateInputRef = useRef(null);

  const handleDownloadCSV = () => {
    if (!reportData.length) { toast({ title: 'No data to download', status: 'warning', duration: 3000, isClosable: true }); return; }
    const deptName = (reportFilters.deptId && (departments.find(d => String(d.DEPTID) === String(reportFilters.deptId))?.DEPTNAME)) || 'All';
    const headingRows = [
      `Department: ${deptName}`,
      `Section: ${deptName}`,
      `From: ${reportFilters.startDate} ${reportFilters.startTime}`,
      `To: ${reportFilters.endDate} ${reportFilters.endTime}`,
      '',
    ];
    const headers = ['EPF No', 'Name', 'Date', 'Time', 'Type'];
    const rows = reportData.map(r => {
      const d = new Date(r.CHECKTIME);
      return [r.USERID, r.employeeName, d.toLocaleDateString(), d.toLocaleTimeString(), formatCheckType(r.CHECKTYPE)];
    });
    const csv = [...headingRows, headers, ...rows].map(row => Array.isArray(row) ? row.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',') : `"${String(row)}"`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.setAttribute('download', `attendance_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const handleDownloadWord = () => {
    if (!reportData.length) { toast({ title: 'No data to download', status: 'warning', duration: 3000, isClosable: true }); return; }
    const deptName = (reportFilters.deptId && (departments.find(d => String(d.DEPTID) === String(reportFilters.deptId))?.DEPTNAME)) || 'All';
    const headers = ['EPF No', 'Name', 'Date', 'Time', 'Type'];
    const rows = reportData.map(r => {
      const d = new Date(r.CHECKTIME);
      return [r.USERID, r.employeeName, d.toLocaleDateString(), d.toLocaleTimeString(), formatCheckType(r.CHECKTYPE)];
    });
    let html = '<h2>Attendance Report</h2><p><strong>Department:</strong> ' + deptName + '</p><p><strong>Section:</strong> '+ deptName +'</p><p><strong>From:</strong> ' + reportFilters.startDate + ' ' + reportFilters.startTime + '</p><p><strong>To:</strong> ' + reportFilters.endDate + ' ' + reportFilters.endTime + '</p><table border="1" cellpadding="8"><tr>' + headers.map(h => `<th style="background-color:#0052CC;color:white;">${h}</th>`).join('') + '</tr>';
    rows.forEach(row => { html += '<tr>' + row.map(v => `<td>${v}</td>`).join('') + '</tr>'; });
    html += '</table>';
    const blob = new Blob([html], { type: 'application/msword;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.setAttribute('download', `attendance_report_${new Date().toISOString().slice(0, 10)}.doc`);
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = () => {
    if (!reportData.length) { toast({ title: 'No data to download', status: 'warning', duration: 3000, isClosable: true }); return; }
    const deptName = (reportFilters.deptId && (departments.find(d => String(d.DEPTID) === String(reportFilters.deptId))?.DEPTNAME)) || 'All';
    const headers = ['EPF No', 'Name', 'Date', 'Time', 'Type'];
    const rows = reportData.map(r => {
      const d = new Date(r.CHECKTIME);
      return [r.USERID, r.employeeName, d.toLocaleDateString(), d.toLocaleTimeString(), formatCheckType(r.CHECKTYPE)];
    });
    const detailRows = [
      ['Department', deptName],
      ['Section', '-'],
      ['From', `${reportFilters.startDate} ${reportFilters.startTime}`],
      ['To', `${reportFilters.endDate} ${reportFilters.endTime}`],
      ['Total Records', String(rows.length)],
    ];
    const blob = createPdfBlob({ title: 'Attendance Report', detailRows, headers, rows });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.setAttribute('download', `attendance_report_${new Date().toISOString().slice(0, 10)}.pdf`);
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  return (
    <Box>
      <Box {...card} p={6} mb={5}>
        <SectionLabel icon={FileSpreadsheet} title="Attendance Report" />
        <Grid templateColumns={{ base: '1fr', sm: 'repeat(2,1fr)', md: 'repeat(4,1fr)', lg: 'repeat(5,1fr)' }} gap={4} mb={5}>
          <FF label="Report">
            <Select placeholder=" " {...inputSx} value={reportFilters.deptId} onChange={e => setReportFilters(p => ({ ...p, deptId: e.target.value }))}>
              {departments.map(d => <option key={d.DEPTID} value={d.DEPTID}>{d.DEPTNAME}</option>)}
            </Select>
          </FF>
          <FF label="Department">
            <Select placeholder="All Departments" {...inputSx} value={reportFilters.deptId} onChange={e => setReportFilters(p => ({ ...p, deptId: e.target.value }))}>
              {departments.map(d => <option key={d.DEPTID} value={d.DEPTID}>{d.DEPTNAME}</option>)}
            </Select>
          </FF>
          <FF label="Section">
            <Select placeholder=" " {...inputSx} value={reportFilters.deptId} onChange={e => setReportFilters(p => ({ ...p, deptId: e.target.value }))}>
              {departments.map(d => <option key={d.DEPTID} value={d.DEPTID}>{d.DEPTNAME}</option>)}
            </Select>
          </FF>
          <FF label="Type">
            <Select placeholder="IN / OUT" {...inputSx} value={reportFilters.type} onChange={e => setReportFilters(p => ({ ...p, type: e.target.value }))}>
              <option value="IN">IN</option>
              <option value="OUT">OUT</option>
            </Select>
          </FF>
          <FF label="EPF">
            <Input placeholder="EPF number" {...inputSx} value={reportFilters.epf} onChange={e => setReportFilters(p => ({ ...p, epf: e.target.value }))} />
          </FF>
          <FF label="From">
            <Flex gap={2} flexWrap={{ base: 'wrap', md: 'nowrap' }}>
              <InputGroup flex="1">
                <Input ref={startDateInputRef} type="date" {...inputSx} value={reportFilters.startDate} onChange={e => setReportFilters(p => ({ ...p, startDate: e.target.value }))} sx={{ '::-webkit-calendar-picker-indicator': { opacity: 0.5 } }} />
                <InputRightElement pointerEvents="auto" color={C.blue500} cursor="pointer" onClick={() => startDateInputRef.current?.showPicker ? startDateInputRef.current.showPicker() : startDateInputRef.current?.focus()}>
                  <Calendar size={16} />
                </InputRightElement>
              </InputGroup>
              <InputGroup flex="1">
                <Input type="time" {...inputSx} value={reportFilters.startTime} onChange={e => setReportFilters(p => ({ ...p, startTime: e.target.value }))} />
                <InputRightElement pointerEvents="none">
                  <Clock size={16} color={C.navy} />
                </InputRightElement>
              </InputGroup>
            </Flex>
          </FF>
          <FF label="To">
            <Flex gap={2} flexWrap={{ base: 'wrap', md: 'nowrap' }}>
              <InputGroup flex="1">
                <Input ref={endDateInputRef} type="date" {...inputSx} value={reportFilters.endDate} onChange={e => setReportFilters(p => ({ ...p, endDate: e.target.value }))} sx={{ '::-webkit-calendar-picker-indicator': { opacity: 0.5 } }} />
                <InputRightElement pointerEvents="auto" color={C.blue500} cursor="pointer" onClick={() => endDateInputRef.current?.showPicker ? endDateInputRef.current.showPicker() : endDateInputRef.current?.focus()}>
                  <Calendar size={16} />
                </InputRightElement>
              </InputGroup>
              <InputGroup flex="1">
                <Input type="time" {...inputSx} value={reportFilters.endTime} onChange={e => setReportFilters(p => ({ ...p, endTime: e.target.value }))} />
                <InputRightElement pointerEvents="none">
                  <Clock size={16} color={C.navy} />
                </InputRightElement>
              </InputGroup>
            </Flex>
          </FF>
        </Grid>
        <Flex gap={3} justify="flex-end" flexWrap="wrap">
          <Button {...primaryBtn} leftIcon={<RefreshCw size={14} />} onClick={onGenerateReport} isLoading={reportLoading} loadingText="Generating…">Show Report</Button>
        </Flex>
      </Box>

      <Box {...card} overflow="hidden">
        <Text fontSize="sm" fontWeight={600} mb={3} color={C.navy}>Export Options</Text>
        <Flex gap={1} flexWrap="wrap" align="center">
          <Button {...compactBtn} leftIcon={<Download size={12} />} onClick={handleDownloadCSV}>Export CSV</Button>
          <Button {...compactBtn} leftIcon={<FileText size={12} />} onClick={handleDownloadWord}>Export Word</Button>
          <Button {...compactBtn} leftIcon={<FileText size={12} />} onClick={handleDownloadPDF}>Export PDF</Button>
          <Button {...compactBtn} leftIcon={<Printer size={12} />} onClick={() => window.print()}>Print</Button>
        </Flex>
        {reportData.length === 0 ? (
          <EmptyState icon={FileSpreadsheet} title="No report data" subtitle="Configure the filters above and click Show Report." />
        ) : (
          <Box>
            <Box bg={C.blue50} p={4} mb={4} borderRadius="md">
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2,1fr)' }} gap={4} fontSize="sm">
                <Flex direction="column">
                  <Text fontWeight={600} color={C.navy}>Department: <Text as="span" fontWeight={400}>{(reportFilters.deptId && (departments.find(d => String(d.DEPTID) === String(reportFilters.deptId))?.DEPTNAME)) || 'All'}</Text></Text>
                </Flex>
                <Flex direction="column">
                  <Text fontWeight={600} color={C.navy}>Section: <Text as="span" fontWeight={400}>{(reportFilters.deptId && (departments.find(d => String(d.DEPTID) === String(reportFilters.deptId))?.DEPTNAME)) || 'All'}</Text></Text>
                </Flex>
                <Flex direction="column">
                  <Text fontWeight={600} color={C.navy}>From: <Text as="span" fontWeight={400}>{reportFilters.startDate} {reportFilters.startTime}</Text></Text>
                </Flex>
                <Flex direction="column">
                  <Text fontWeight={600} color={C.navy}>To: <Text as="span" fontWeight={400}>{reportFilters.endDate} {reportFilters.endTime}</Text></Text>
                </Flex>
              </Grid>
            </Box>
            <TableContainer>
              <Table variant="unstyled" size="sm">
                <Thead><Tr>{['EPF No', 'Name', 'Date', 'Time', 'Type'].map(h => <TH key={h}>{h}</TH>)}</Tr></Thead>
                <Tbody>
                  {reportData.map((row, i) => {
                    const checkTime = new Date(row.CHECKTIME);
                    const date = checkTime.toLocaleDateString();
                    const time = checkTime.toLocaleTimeString();
                    return (
                      <Tr key={i} _hover={{ bg: C.blue50 }} transition="background 0.1s">
                        <TD color={C.blue500} fontWeight={600}>{row.USERID}</TD>
                        <TD fontWeight={600}>{row.employeeName}</TD>
                        <TD>{date}</TD>
                        <TD>{time}</TD>
                        <TD><TypeBadge type={row.CHECKTYPE} /></TD>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Box>
    </Box>
  );
}