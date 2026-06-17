import { useState } from 'react';
import {
  Box, Flex, Text, Button, VStack,
  Input, InputGroup, InputRightElement,
  FormControl, FormLabel, FormErrorMessage,
  IconButton, useToast,
} from '@chakra-ui/react';
import { Lock, Eye, EyeOff } from 'lucide-react';

// ── Design Tokens ─────────────────────────────────────────────────────────────
const C = {
  navy:      '#001A4D',
  blue700:   '#0052CC',
  blue500:   '#0745a3',
  blue200:   '#CCE5FF',
  blue100:   '#E6F2FF',
  blue50:    '#F0F5FF',
  white:     '#FFFFFF',
  pageBg:    '#F4F7FB',
};

const inputSx = {
  bg: C.blue50,
  border: `1.5px solid ${C.blue200}`,
  borderRadius: '10px',
  color: C.navy,
  fontSize: 'sm',
  h: '44px',
  _placeholder: { color: '#7BA7D4' },
  _hover: { borderColor: C.blue500 },
  _focus: {
    borderColor: C.blue700,
    boxShadow: `0 0 0 3px ${C.blue100}`,
    bg: C.white,
  },
};

// ── Field wrapper ─────────────────────────────────────────────────────────────
const FF = ({ label, error, children }) => (
  <FormControl isInvalid={!!error}>
    <FormLabel
      fontSize="11px" fontWeight={700} color={C.blue500}
      textTransform="uppercase" letterSpacing="0.09em" mb="6px"
    >
      {label}
    </FormLabel>
    {children}
    <FormErrorMessage fontSize="xs" mt={1}>{error}</FormErrorMessage>
  </FormControl>
);

// ── Main Component ────────────────────────────────────────────────────────────
export default function ChangePasswordForm({ onChangePassword }) {
  const toast = useToast();

  const [passwords, setPasswords] = useState({
    oldPassword: '', newPassword: '', confirmPassword: '',
  });
  const [show, setShow] = useState({
    oldPassword: false, newPassword: false, confirmPassword: false,
  });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) =>
    setPasswords(p => ({ ...p, [field]: e.target.value }));

  const toggleShow = (field) =>
    setShow(s => ({ ...s, [field]: !s[field] }));

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!passwords.oldPassword)
      errs.oldPassword = 'Current password is required';
    if (!passwords.newPassword)
      errs.newPassword = 'New password is required';
    else if (passwords.newPassword.length < 4)
      errs.newPassword = 'Password must be at least 4 characters';
    if (!passwords.confirmPassword)
      errs.confirmPassword = 'Please confirm your new password';
    else if (passwords.newPassword !== passwords.confirmPassword)
      errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const result = await onChangePassword(passwords.oldPassword, passwords.newPassword);
      if (result?.success) {
        toast({
          title: 'Password updated',
          description: String(result.message || 'Your password has been changed successfully.'),
          status: 'success', duration: 4000, isClosable: true, position: 'top-right',
        });
        setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setErrors({});
      } else {
        toast({
          title: 'Update failed',
          description: String(result?.message || 'Please try again.'),
          status: 'error', duration: 4000, isClosable: true, position: 'top-right',
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: String(err?.response?.data?.message || err.message || 'Something went wrong'),
        status: 'error', duration: 4000, isClosable: true, position: 'top-right',
      });
    } finally {
      setLoading(false);
    }
  };

  // ── Eye toggle button ───────────────────────────────────────────────────────
  const EyeBtn = ({ field }) => (
    <InputRightElement h="44px" w="44px">
      <IconButton
        icon={show[field] ? <EyeOff size={15} /> : <Eye size={15} />}
        variant="ghost" size="sm"
        color={C.blue500}
        _hover={{ color: C.navy, bg: 'transparent' }}
        onClick={() => toggleShow(field)}
        aria-label="Toggle visibility"
      />
    </InputRightElement>
  );

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <Flex  maxW="440px" mx="auto">
      <Box
        w="100%" maxW="560px"
        bg={C.white}
        border={`1px solid ${C.blue200}`}
        borderRadius="16px"
        boxShadow="0 2px 16px rgba(0,82,204,0.07), 0 1px 4px rgba(0,26,77,0.05)"
        p={8}
      >
        {/* ── Header: icon + title inline ─────────────────────────────── */}
        <Flex align="center" gap={3} mb={7}>
          <Flex
            w="36px" h="36px" borderRadius="9px"
            bg={C.blue100} align="center" justify="center" flexShrink={0}
          >
            <Lock size={17} color={C.blue700} />
          </Flex>
          <Text fontSize="lg" fontWeight={700} color={C.navy} letterSpacing="-0.01em">
            Change Password
          </Text>
        </Flex>

        {/* ── Fields ─────────────────────────────────────────────────── */}
        <VStack spacing={5}>
          <FF label="Current Password" error={errors.oldPassword}>
            <InputGroup>
              <Input
                {...inputSx}
                type={show.oldPassword ? 'text' : 'password'}
                placeholder="Enter current password"
                autoComplete="current-password"
                value={passwords.oldPassword}
                onChange={set('oldPassword')}
              />
              <EyeBtn field="oldPassword" />
            </InputGroup>
          </FF>

          <FF label="New Password" error={errors.newPassword}>
            <InputGroup>
              <Input
                {...inputSx}
                type={show.newPassword ? 'text' : 'password'}
                placeholder="Enter new password"
                autoComplete="new-password"
                value={passwords.newPassword}
                onChange={set('newPassword')}
              />
              <EyeBtn field="newPassword" />
            </InputGroup>
          </FF>

          <FF label="Confirm New Password" error={errors.confirmPassword}>
            <InputGroup>
              <Input
                {...inputSx}
                type={show.confirmPassword ? 'text' : 'password'}
                placeholder="Confirm new password"
                autoComplete="new-password"
                value={passwords.confirmPassword}
                onChange={set('confirmPassword')}
              />
              <EyeBtn field="confirmPassword" />
            </InputGroup>
          </FF>

          {/* ── Submit ────────────────────────────────────────────────── */}
          <Button
            w="100%"
            h="50px"
            mt={1}
            borderRadius="10px"
            bg={C.navy}
            color={C.white}
            fontWeight={700}
            fontSize="sm"
            letterSpacing="0.01em"
            leftIcon={<Lock size={15} />}
            _hover={{ bg: C.blue700, transform: 'translateY(-1px)', boxShadow: 'md' }}
            _active={{ transform: 'translateY(0)', bg: C.navy }}
            _disabled={{ opacity: 0.5, cursor: 'not-allowed', transform: 'none' }}
            transition="all 0.15s"
            onClick={handleSubmit}
            isLoading={loading}
            loadingText="Updating…"
          >
            Update Password
          </Button>
        </VStack>
      </Box>
    </Flex>
  );
}