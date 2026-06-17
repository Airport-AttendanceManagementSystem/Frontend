import {
  Box, Flex, Text, Input, Select, Button, Grid, GridItem,
  Checkbox, FormControl, FormLabel, VStack, Avatar, Badge,
} from '@chakra-ui/react';
import { UserPlus, ShieldCheck } from 'lucide-react';

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
  red:     { bg: '#FDE8E8', text: '#9E1B1B' },
  purple:  { bg: '#EEECFD', text: '#4A42B5' },
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

const StatusBadge = ({ status }) => (
  <Badge
    bg={status === 'active' ? C.green.bg : C.red.bg}
    color={status === 'active' ? C.green.text : C.red.text}
    px={2.5} py={0.5} borderRadius="full" fontSize="11px" fontWeight={600} textTransform="capitalize"
  >
    {status}
  </Badge>
);

const FF = ({ label, children }) => (
  <FormControl>
    <FormLabel fontSize="11px" fontWeight={700} color={C.blue500} textTransform="uppercase" letterSpacing="0.08em" mb={1}>{label}</FormLabel>
    {children}
  </FormControl>
);

const SectionLabel = ({ icon: Icon, title }) => (
  <Flex align="center" gap={2} mb={5}>
    <Box bg={C.blue100} p={2} borderRadius="8px" color={C.blue700}><Icon size={16} /></Box>
    <Text fontSize="md" fontWeight={700} color={C.navy} letterSpacing="-0.01em">{title}</Text>
  </Flex>
);

export default function UserSettings({
  users,
  departments,
  newUser,
  setNewUser,
  addingUser,
  onAddUser,
  activateUser,
  activateStatus,
  setActivateStatus,
  updatingActivation,
  onActivationSelect,
  onUpdateActivation,
}) {
  return (
    <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6}>
      <GridItem>
        <Box {...card} p={6} h="full">
          <SectionLabel icon={UserPlus} title="New User" />
          <VStack spacing={4}>
            <FF label="Username">
              <Input placeholder="Enter username" {...inputSx} value={newUser.username} onChange={e => setNewUser(p => ({ ...p, username: e.target.value }))} />
            </FF>
            <FF label="Password">
              <Input type="password" placeholder="Enter password" {...inputSx} value={newUser.password} onChange={e => setNewUser(p => ({ ...p, password: e.target.value }))} />
            </FF>
            <FF label="Re-Enter Password">
              <Input type="password" placeholder="Re-enter password" {...inputSx} value={newUser.password} onChange={e => setNewUser(p => ({ ...p, password: e.target.value }))} />
            </FF>
            <FF label="User Type">
              <Select {...inputSx} value={newUser.usertype} onChange={e => setNewUser(p => ({ ...p, usertype: e.target.value }))}>
                <option value="employee">User</option>
                <option value="admin">Admin</option>
              </Select>
            </FF>
            <FF label="Department">
              <Select placeholder="Select department" {...inputSx} value={newUser.deptid} onChange={e => setNewUser(p => ({ ...p, deptid: e.target.value }))}>
                {departments.map(d => <option key={d.DEPTID} value={d.DEPTID}>{d.DEPTNAME}</option>)}
              </Select>
            </FF>
            <Flex w="full" gap={3} pt={1}>
              <Button flex={1} {...outlineBtn} onClick={onAddUser} isLoading={addingUser}>Delete</Button>
              <Button flex={1} {...primaryBtn} leftIcon={<UserPlus size={14} />} onClick={onAddUser} isLoading={addingUser} loadingText="Creating…">Add User</Button>
            </Flex>
          </VStack>
        </Box>
      </GridItem>

      <GridItem>
        <Box {...card} p={6} h="full">
          <SectionLabel icon={ShieldCheck} title="User Activation" />
          <VStack spacing={4} align="stretch">
            <FF label="Select User">
              <Select
                placeholder="Choose a user"
                {...inputSx}
                value={activateUser}
                onChange={e => onActivationSelect(e.target.value)}
              >
                {users.map(u => (
                  <option key={u.username} value={u.username}>
                    {u.NAME || u.username} {u.status ? `(${u.status})` : ''}
                  </option>
                ))}
              </Select>
            </FF>

            {activateUser && (
              <Box bg={C.blue50} p={4} borderRadius="10px" border={`1px solid ${C.blue200}`}>
                <Flex align="center" gap={3} mb={3}>
                  <Avatar size="sm" name={activateUser} bg={C.blue700} color={C.white} fontSize="xs" />
                  <Box flex={1}>
                    <Text fontSize="13px" fontWeight={600} color={C.navy}>{activateUser}</Text>
                    <StatusBadge status={activateStatus ? 'active' : 'deactive'} />
                  </Box>
                </Flex>
              </Box>
            )}

            <FF label="Status">
              <Flex align="center" justify="space-between" bg={C.blue50} p={4} borderRadius="10px" border={`1px solid ${C.blue200}`}>
                <Flex align="center" gap={3} flex={1}>
                  <Box w="10px" h="10px" borderRadius="full" bg={activateStatus ? C.green.text : C.red.text} />
                  <Text fontSize="13px" fontWeight={600} color={C.navy}>
                    {activateStatus ? 'Active' : 'Deactive'}
                  </Text>
                </Flex>
                <Checkbox
                  colorScheme="blue"
                  isChecked={activateStatus}
                  onChange={e => setActivateStatus(e.target.checked)}
                  size="lg"
                  borderColor={C.navy}
                  borderWidth="1px"
                />
              </Flex>
              <Text fontSize="11px" color={C.blue700} mt={2}>
                {activateStatus ? 'deactivate' : 'activate'} the selected user account.
              </Text>
            </FF>

            <Button
              w="full"
              {...primaryBtn}
              onClick={onUpdateActivation}
              isLoading={updatingActivation}
              loadingText="Updating…"
              mt={3}
              isDisabled={!activateUser}
            >
              Update Status
            </Button>
          </VStack>
        </Box>
      </GridItem>
    </Grid>
  );
}