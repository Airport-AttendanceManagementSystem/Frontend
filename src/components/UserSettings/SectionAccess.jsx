import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
  Box, Flex, Text, Select, Button, Table, Thead, Tbody,
  Tr, Th, Td, Grid, Checkbox, FormControl, FormLabel,
  Spinner, TableContainer,
} from '@chakra-ui/react';
import { ShieldCheck } from 'lucide-react';

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

const SectionLabel = ({ icon: Icon, title }) => (
  <Flex align="center" gap={2} mb={5}>
    <Box bg={C.blue100} p={2} borderRadius="8px" color={C.blue700}><Icon size={16} /></Box>
    <Text fontSize="md" fontWeight={700} color={C.navy} letterSpacing="-0.01em">{title}</Text>
  </Flex>
);

export default function SectionAccess({
  users,
  departments,
  selectedEmployee,
  selectedSections,
  setSelectedSections,
  loadingSections,
  savingSections,
  onEmployeeSelect,
  onSaveSections,
}) {
  const { apiUrl } = useAuth();
  const [availableSections, setAvailableSections] = useState([]);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [deptId,   setDeptId]   = useState('');
  const [deptName, setDeptName] = useState('');

  // Auto-detect department when employee changes
  useEffect(() => {
    if (!selectedEmployee) {
      setDeptId(''); setDeptName(''); setAvailableSections([]); return;
    }
    const user = users.find(u => u.username === selectedEmployee);
    if (!user?.deptId) {
      setDeptId(''); setDeptName(''); setAvailableSections([]); return;
    }
    const dept = departments.find(d => Number(d.deptId) === Number(user.deptId));
    setDeptId(user.deptId);
    setDeptName(dept?.deptName ?? 'Unknown Department');
  }, [selectedEmployee, users, departments]);

  // Fetch sections when department is resolved
  useEffect(() => {
    if (!deptId) { setAvailableSections([]); return; }
    setLoadingAvailable(true);
    axios.get(`${apiUrl}/user-settings/sections?deptId=${deptId}`)
      .then(res => setAvailableSections(Array.isArray(res.data) ? res.data : []))
      .catch(() => setAvailableSections([]))
      .finally(() => setLoadingAvailable(false));
  }, [deptId, apiUrl]);

  const toggleSection = (sectionId) => {
    setSelectedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(s => s !== sectionId)
        : [...prev, sectionId]
    );
  };

  return (
    <Box maxW="700px" mx="auto">
      <Box {...card} p={6}>
        <SectionLabel icon={ShieldCheck} title="Section Access Control" />

        {/* Employee selector + auto-displayed department */}
        <Grid templateColumns={{ base: '1fr', sm: '1fr 1fr' }} gap={4} mb={6}>
          <FF label="Select Employee">
            <Select
              placeholder="Choose an employee"
              {...inputSx}
              value={selectedEmployee}
              onChange={e => onEmployeeSelect(e.target.value)}
            >
              {users.map(u => (
                <option key={u.username} value={u.username}>{u.username}</option>
              ))}
            </Select>
          </FF>

          <FF label="Department">
            <Box
              {...inputSx}
              display="flex" alignItems="center" px={3}
              borderRadius="8px" minH="38px"
              bg={selectedEmployee && deptName ? C.blue50 : C.blue50}
              border={`1px solid ${C.blue200}`}
            >
              <Text
                fontSize="sm"
                color={deptName ? C.navy : C.blue400}
                fontWeight={deptName ? 500 : 400}
                noOfLines={1}
              >
                {deptName || (selectedEmployee ? 'No department assigned' : 'Auto-filled from employee')}
              </Text>
            </Box>
          </FF>
        </Grid>

        <Text fontSize="11px" fontWeight={700} color={C.blue400}
          textTransform="uppercase" letterSpacing="0.08em" mb={3}>
          Section Access
        </Text>

        {/* No department selected */}
        {!deptId && (
          <Flex
            justify="center" align="center" py={8}
            border={`1px dashed ${C.blue200}`} borderRadius="10px" mb={4}
          >
            <Text fontSize="13px" color={C.blue400}>
              Select an employee above to view their sections.
            </Text>
          </Flex>
        )}

        {/* Loading sections */}
        {deptId && loadingAvailable && (
          <Flex justify="center" py={6} mb={4}>
            <Spinner color={C.blue700} size="lg" />
          </Flex>
        )}

        {/* Sections table */}
        {deptId && !loadingAvailable && availableSections.length > 0 && (
          <TableContainer mb={4} border={`1px solid ${C.blue200}`} borderRadius="12px" overflow="hidden">
            <Table variant="simple" size="sm">
              <Thead bg={C.blue50}>
                <Tr>
                  <TH>Section</TH>
                  <TH>Access</TH>
                </Tr>
              </Thead>
              <Tbody>
                {availableSections.map(section => {
                  const checked = selectedSections.includes(section.sectionId);
                  return (
                    <Tr key={section.sectionId} _hover={{ bg: C.blue100 }} transition="background 0.15s">
                      <TD fontWeight={500}>{section.sectionName}</TD>
                      <TD>
                        <Checkbox
                          border={`1px solid ${C.blue600}`}
                          isChecked={checked}
                          colorScheme="blue"
                          onChange={() => toggleSection(section.sectionId)}
                        />
                      </TD>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </TableContainer>
        )}

        {/* Department has no sub-sections */}
        {deptId && !loadingAvailable && availableSections.length === 0 && (
          <Flex
            justify="center" align="center" py={8}
            border={`1px dashed ${C.blue200}`} borderRadius="10px" mb={4}
          >
            <Text fontSize="13px" color={C.blue400}>
              No sections found for this department.
            </Text>
          </Flex>
        )}

        {loadingSections && selectedEmployee && (
          <Flex justify="center" py={4}>
            <Spinner color={C.blue700} size="lg" />
          </Flex>
        )}

        {!selectedEmployee && (
          <Text fontSize="12px" color={C.blue400} mb={4}>
            Select an employee above to load and update their section access.
          </Text>
        )}

        <Button
          w="full" {...primaryBtn}
          leftIcon={<ShieldCheck size={14} />}
          onClick={onSaveSections}
          isLoading={savingSections}
          loadingText="Saving…"
          isDisabled={!selectedEmployee}
        >
          Save Access
        </Button>
      </Box>
    </Box>
  );
}
