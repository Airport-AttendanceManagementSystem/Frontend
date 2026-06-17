import {
  Box, Flex, Text, Select, Button, Table, Thead, Tbody,
  Tr, Th, Td, Grid, Checkbox, FormControl, FormLabel,
  Spinner, TableContainer,
} from '@chakra-ui/react';
import { ShieldCheck } from 'lucide-react';

const AVAILABLE_SECTIONS = [1, 2, 3, 4, 5, 6, 7, 8];

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

export default function SectionAccess({
  users,
  departments,
  newUser,
  setNewUser,
  selectedEmployee,
  selectedSections,
  setSelectedSections,
  loadingSections,
  savingSections,
  onEmployeeSelect,
  onSaveSections,
}) {
  return (
    <Box maxW="700px" mx="auto">
      <Box {...card} p={6}>
        <SectionLabel icon={ShieldCheck} title="Section Access Control" />
        <Grid templateColumns={{ base: '1fr', sm: '1fr 1fr' }} gap={4} mb={6}>
          <FF label="Select Employee">
            <Select placeholder="Choose an employee" {...inputSx} value={selectedEmployee} onChange={e => onEmployeeSelect(e.target.value)}>
              {users.map(u => (
                <option key={u.username} value={u.username}>
                  {u.NAME || u.username}
                </option>
              ))}
            </Select>
          </FF>
          <FF label="Department">
            <Select placeholder="Select department" {...inputSx} value={newUser.deptid} onChange={e => setNewUser(p => ({ ...p, deptid: e.target.value }))}>
              {departments.map(d => <option key={d.DEPTID} value={d.DEPTID}>{d.DEPTNAME}</option>)}
            </Select>
          </FF>
        </Grid>

        <Text fontSize="11px" fontWeight={700} color={C.blue400} textTransform="uppercase" letterSpacing="0.08em" mb={3}>Section Access</Text>
        <TableContainer mb={4} border={`1px solid ${C.blue200}`} borderRadius="12px" overflow="hidden">
          <Table variant="simple" size="sm">
            <Thead bg={C.blue50}>
              <Tr>
                <TH>Section</TH>
                <TH>Select</TH>
              </Tr>
            </Thead>
            <Tbody>
              {AVAILABLE_SECTIONS.map(section => {
                const checked = selectedSections.includes(section);
                return (
                  <Tr key={section} _hover={{ bg: C.blue50 }} transition="background 0.15s">
                    <TD>Section {section}</TD>
                    <TD>
                      <Checkbox
                        isChecked={checked}
                        colorScheme="blue"
                        borderColor={C.navy}
                        borderWidth="0px"
                        onChange={() => setSelectedSections(p => p.includes(section) ? p.filter(s => s !== section) : [...p, section])}
                      />
                    </TD>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </TableContainer>

        {loadingSections && selectedEmployee && (
          <Flex justify="center" py={4}><Spinner color={C.blue700} size="lg" /></Flex>
        )}
        {!selectedEmployee && (
          <Text fontSize="12px" color={C.blue400} mb={4}>Select an employee above to load and update their section access.</Text>
        )}

        <Button w="full" {...primaryBtn} leftIcon={<ShieldCheck size={14} />} onClick={onSaveSections} isLoading={savingSections} loadingText="Saving…">
          Save Access
        </Button>
      </Box>
    </Box>
  );
}