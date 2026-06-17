import { useState, useEffect } from 'react';
import {
  Box, Flex, Text, VStack, Avatar,
  Tooltip, IconButton, Drawer, DrawerBody,
  DrawerOverlay, DrawerContent,
} from '@chakra-ui/react';
import {
  UserPlus, FileSpreadsheet, ShieldCheck, Key,
  LayoutDashboard, ChevronLeft, ChevronRight, Clock,
} from 'lucide-react';

// ── Design Tokens ─────────────────────────────────────────────────────────────
const C = {
  navy:    '#001A4D',
  blue700: '#0052CC',
  white:   '#FFFFFF',
};

export const SIDEBAR_W  = '248px';
export const SIDEBAR_CW = '64px';

export const navItems = [
  { key: 'reports',  label: 'Attendance',      icon: FileSpreadsheet, description: 'Attendance report'  },
  { key: 'users',    label: 'User Settings',   icon: UserPlus,        description: 'Manage users', subItems: [
    { key: 'new-user', label: 'New User',       icon: UserPlus,        description: 'Create new user'    },
    { key: 'sections', label: 'Section Access', icon: ShieldCheck,     description: 'Access control'     },
  ]},
  { key: 'password', label: 'Change Password', icon: Key,             description: 'Update credentials' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatTime = (date) => {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${h}:${m}:${s}`;
};

const formatDate = (date) =>
  date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

// ── SidebarClock ──────────────────────────────────────────────────────────────
function SidebarClock({ collapsed }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <Box
      px={collapsed ? 2 : 3}
      py={3}
      flexShrink={0}
    >
      <Box h="1px" bg="rgba(255,255,255,0.08)" mb={3} />

      {collapsed ? (
        /* Collapsed: just the icon with time tooltip */
        <Tooltip label={`${formatTime(now)} · ${formatDate(now)}`} placement="right" hasArrow>
          <Flex
            justify="center" align="center"
            w="36px" h="36px" mx="auto"
            borderRadius="9px"
            bg="rgba(255,255,255,0.08)"
            cursor="default"
          >
            <Clock size={16} color="rgba(255,255,255,0.55)" />
          </Flex>
        </Tooltip>
      ) : (
        /* Expanded: icon + time + date */
        <Flex align="center" gap={3} px={2}>
          <Flex
            w="36px" h="36px"
            borderRadius="9px"
            bg={C.blue700}
            align="center"
            justify="center"
            flexShrink={0}
          >
            <Clock size={16} color={C.white} />
          </Flex>

          <Box>
            <Text
              fontSize="16px"
              fontWeight={700}
              color={C.white}
              fontFamily="'SF Mono', 'Fira Code', 'Consolas', monospace"
              letterSpacing="0.04em"
              lineHeight={1.2}
            >
              {formatTime(now)}
            </Text>
            <Text
              fontSize="14px"
              color="rgba(240, 239, 228, 0.83)"
              letterSpacing="0.05em"
              mt="2px"
            >
              {formatDate(now)}
            </Text>
          </Box>
        </Flex>
      )}
    </Box>
  );
}

// ── NavItem ────────────────────────────────────────────────────────────────────
function NavItem({ item, isActive, collapsed, onClick, activeTab, setActiveTab, onClose }) {
  const Icon = item.icon;
  const hasSubItems = item.subItems && item.subItems.length > 0;
  const [expanded, setExpanded] = useState(
    item.subItems?.some(s => s.key === activeTab) || false
  );

  const handleClick = () => {
    if (hasSubItems) setExpanded(e => !e);
    else onClick();
  };

  return (
    <>
      <Tooltip label={collapsed ? item.label : ''} placement="right" hasArrow>
        <Flex
          align="center" gap={3}
          px={collapsed ? 0 : 3} py={2.5}
          borderRadius="10px" cursor="pointer"
          justify={collapsed ? 'center' : 'flex-start'}
          bg={(isActive || (hasSubItems && expanded)) ? 'rgba(255,255,255,0.14)' : 'transparent'}
          borderLeft={(isActive || (hasSubItems && expanded)) && !collapsed
            ? `3px solid ${C.white}`
            : '3px solid transparent'}
          _hover={{
            bg: (isActive || (hasSubItems && expanded))
              ? 'rgba(255,255,255,0.14)'
              : 'rgba(255,255,255,0.07)',
          }}
          onClick={handleClick}
          transition="all 0.15s"
        >
          <Box
            color={(isActive || (hasSubItems && expanded)) ? C.white : 'rgba(255,255,255,0.5)'}
            flexShrink={0} transition="color 0.15s"
          >
            <Icon size={17} />
          </Box>

          {!collapsed && (
            <Text
              fontSize="13px"
              fontWeight={(isActive || (hasSubItems && expanded)) ? 600 : 400}
              color={(isActive || (hasSubItems && expanded)) ? C.white : 'rgba(255,255,255,0.65)'}
              whiteSpace="nowrap" transition="color 0.15s" flex={1}
            >
              {item.label}
            </Text>
          )}

          {hasSubItems && !collapsed && (
            <Box
              color={expanded ? C.white : 'rgba(255,255,255,0.5)'}
              transition="transform 0.2s"
              transform={expanded ? 'rotate(180deg)' : 'rotate(0)'}
            >
              <ChevronRight size={14} />
            </Box>
          )}
        </Flex>
      </Tooltip>

      {hasSubItems && expanded && !collapsed && (
        <VStack spacing={1} align="stretch" pl={4} mt={1}>
          {item.subItems.map(subItem => {
            const SubIcon = subItem.icon;
            const subIsActive = activeTab === subItem.key;
            return (
              <Flex
                key={subItem.key}
                align="center" gap={3}
                px={3} py={2}
                borderRadius="8px" cursor="pointer"
                bg={subIsActive ? 'rgba(255,255,255,0.14)' : 'transparent'}
                borderLeft={subIsActive ? `3px solid ${C.white}` : '3px solid transparent'}
                _hover={{ bg: 'rgba(255,255,255,0.07)' }}
                onClick={() => { setActiveTab(subItem.key); onClose?.(); }}
                transition="all 0.15s"
              >
                <Box
                  color={subIsActive ? C.white : 'rgba(255,255,255,0.5)'}
                  flexShrink={0} transition="color 0.15s"
                >
                  <SubIcon size={15} />
                </Box>
                <Text
                  fontSize="14px"
                  fontWeight={subIsActive ? 600 : 400}
                  color={subIsActive ? C.white : 'rgba(255,255,255,0.65)'}
                  whiteSpace="nowrap" transition="color 0.15s"
                >
                  {subItem.label}
                </Text>
              </Flex>
            );
          })}
        </VStack>
      )}
    </>
  );
}

// ── SidebarContent ─────────────────────────────────────────────────────────────
export function SidebarContent({
  activeTab, setActiveTab,
  collapsed, setCollapsed,
  user, onClose,
}) {
  return (
    <Flex direction="column" h="100%" bg={C.navy} overflow="hidden">

      {/* Header */}
      <Flex
        align="center" h="64px"
        px={collapsed ? 0 : 4}
        justify={collapsed ? 'center' : 'space-between'}
        borderBottom="1px solid rgba(255,255,255,0.08)"
        flexShrink={0}
      >
        {!collapsed && (
          <Flex align="center" gap={3}>
            <Box
              w="34px" h="34px" bg={C.blue700} borderRadius="9px"
              display="flex" alignItems="center" justifyContent="center" flexShrink={0}
            >
              <LayoutDashboard size={17} color="white" />
            </Box>
            <Box>
              <Text fontSize="16px" fontWeight={700} color={C.white} lineHeight={1.2} letterSpacing="-0.01em">
                Admin Portal
              </Text>
              {/* <Text fontSize="10px" color="rgba(255,255,255,0.4)" letterSpacing="0.1em" textTransform="uppercase">
                Admin Portal
              </Text> */}
            </Box>
          </Flex>
        )}

        {setCollapsed && (
          <Tooltip label={collapsed ? 'Expand' : 'Collapse'} placement="right">
            <IconButton
              icon={collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
              size="sm" variant="ghost" color="rgba(255,255,255,0.5)"
              _hover={{ bg: 'rgba(255,255,255,0.1)', color: 'white' }}
              borderRadius="8px" aria-label="Toggle sidebar"
              onClick={() => setCollapsed(c => !c)}
              flexShrink={0}
            />
          </Tooltip>
        )}

        {onClose && (
          <IconButton
            icon={<ChevronLeft size={14} />} size="sm" variant="ghost"
            color="rgba(255,255,255,0.5)"
            _hover={{ bg: 'rgba(255,255,255,0.1)', color: 'white' }}
            borderRadius="8px" aria-label="Close menu"
            onClick={onClose} flexShrink={0}
          />
        )}
      </Flex>

      {/* Nav */}
      <Box
        flex={1} py={4} px={collapsed ? 2 : 3}
        overflowY="auto"
        css={{ '&::-webkit-scrollbar': { display: 'none' } }}
      >
        <VStack spacing={1} align="stretch">
          {navItems.map(item => (
            <NavItem
              key={item.key}
              item={item}
              isActive={activeTab === item.key}
              collapsed={collapsed}
              onClick={() => { setActiveTab(item.key); onClose?.(); }}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onClose={onClose}
            />
          ))}
        </VStack>
      </Box>

      {/* Clock Footer */}
      <SidebarClock collapsed={collapsed} />

    </Flex>
  );
}

// ── Sidebar (desktop + mobile drawer) ─────────────────────────────────────────
export default function Sidebar({
  activeTab, setActiveTab,
  collapsed, setCollapsed,
  user,
  isMobile, isOpen, onClose,
}) {
  if (isMobile) {
    return (
      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="xs">
        <DrawerOverlay />
        <DrawerContent p={0} maxW="260px" bg={C.navy}>
          <DrawerBody p={0}>
            <SidebarContent
              activeTab={activeTab} setActiveTab={setActiveTab}
              collapsed={false} setCollapsed={null}
              user={user} onClose={onClose}
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Box
      position="fixed" top={0} left={0} bottom={0}
      w={collapsed ? SIDEBAR_CW : SIDEBAR_W}
      transition="width 0.22s cubic-bezier(.4,0,.2,1)"
      overflow="hidden" zIndex={100}
      boxShadow="4px 0 20px rgba(10,46,82,0.15)"
    >
      <SidebarContent
        activeTab={activeTab} setActiveTab={setActiveTab}
        collapsed={collapsed} setCollapsed={setCollapsed}
        user={user}
      />
    </Box>
  );
}