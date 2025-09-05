'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Stack,
  Grid,
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  IconButton,
  Divider,
  Link as MUILink,
  Container,
  Alert,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useSettingsContext } from '@/components/settings';
import Iconify from '@/components/iconify';
import { Link } from '@/i18n/routing';
import { ImagesSrc } from '@/constants/imagesSrc';
import Image from 'next/image';
import LargeLogo from '@/shared-components/Logo/largeLogo';
import LanguageSwitcher from '@/components/LanguageSwitcher/LanguageSwitcher';

// ⬅️ جديد: عميل Supabase مباشر بدل useAuth
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
type Database = any;

const authImage = ImagesSrc.Auth;

const SignUpPageSection = () => {
  const t = useTranslations();
  const { themeDirection } = useSettingsContext();

  // حالات محلية بدلاً من useAuth
  const [isLoading, setIsLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const clearError = () => setErrMsg(null);

  // عميل Supabase مع تمرير المتغيرات صراحةً لتجنّب Invalid API key
  const supabase = createClientComponentClient<Database>({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });

  const passwordsMismatch = useMemo(
    () =>
      formData.confirmPassword.length > 0 &&
      formData.password !== formData.confirmPassword,
    [formData.password, formData.confirmPassword]
  );

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errMsg) clearError();
  };

  // ⬅️ Google OAuth
  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      setErrMsg(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo:
            typeof window !== 'undefined'
              ? `${window.location.origin}/auth/callback`
              : undefined,
        },
      });
      if (error) setErrMsg(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ⬅️ SignUp عبر Supabase مباشرة
  const handleSignUp = async () => {
    if (passwordsMismatch) return;

    try {
      setIsLoading(true);
      setErrMsg(null);

      const { data, error } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (error) {
        setErrMsg(error.message);
        return;
      }

      // ملاحظة: إذا كان تفعيل البريد مفعّل، الـ session ستكون null
      // بإمكانك عرض رسالة للمستخدم:
      setErrMsg(null);
      alert(t('Please check your email to confirm your account'));
      // أو وجّه لصفحة تعليمات:
      // router.replace('/verify-email');
    } catch (e: any) {
      setErrMsg(e?.message || 'Sign up failed');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      clearError();
    };
  }, []);

  const isFormValid =
    formData.email &&
    formData.password &&
    formData.confirmPassword &&
    !passwordsMismatch &&
    formData.agreeToTerms;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isFormValid && !isLoading) {
      e.preventDefault();
      handleSignUp();
    }
  };

  return (
    <Container>
      <Grid container sx={{ minHeight: '100vh' }}>
        {/* Left Section - Sign Up Form */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            p: 4,
            position: 'relative',
          }}
        >
          {/* Logo and Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <LargeLogo />
            <LanguageSwitcher />
          </Stack>

          {/* Main Content */}
          <Box sx={{ width: '100%' }}>
            <Typography
              sx={{
                color: 'text.primary',
                fontWeight: 700,
                fontSize: { xs: '2rem', md: '2.5rem' },
                textAlign: 'center',
                my: 4,
              }}
            >
              {t('Welcome To ZakiCode')}
            </Typography>

            {/* Error Alert */}
            {errMsg && (
              <Alert severity="error" onClose={clearError} sx={{ mb: 3 }}>
                {errMsg}
              </Alert>
            )}

            {/* Google Sign Up Button */}
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Iconify icon="logos:google-icon" />}
              onClick={signInWithGoogle}
              disabled={isLoading}
              sx={{
                py: 1.5,
                mb: 3,
                borderRadius: 1.5,
                borderColor: 'rgba(255,255,255,0.2)',
                color: 'text.primary',
                '&:hover': {
                  borderColor: 'rgba(255,255,255,0.4)',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                },
              }}
            >
              {t('Sign up with Google')}
            </Button>

            {/* Divider */}
            <Box sx={{ position: 'relative', mb: 3 }}>
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />
              <Typography
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: 'background.default',
                  px: 2,
                  color: 'text.secondary',
                  fontSize: '0.875rem',
                }}
              >
                {t('OR')}
              </Typography>
            </Box>

            {/* Form Fields */}
            <Stack spacing={3} onKeyDown={handleKeyDown}>
              {/* Email Field */}
              <Box>
                <Typography
                  sx={{
                    color: 'text.primary',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    mb: 1,
                  }}
                >
                  {t('Your email')}
                </Typography>
                <TextField
                  fullWidth
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder={t('Enter your email')}
                  autoComplete="email"
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      borderColor: 'rgba(255,255,255,0.2)',
                      '&:hover': { borderColor: 'rgba(255,255,255,0.3)' },
                      '&.Mui-focused': { borderColor: '#1EFBB8' },
                    },
                    '& .MuiInputBase-input': {
                      color: 'text.primary',
                      '&::placeholder': {
                        color: 'text.secondary',
                        opacity: 0.7,
                      },
                    },
                  }}
                />
              </Box>

              {/* Password Field */}
              <Box>
                <Typography
                  sx={{
                    color: 'text.primary',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    mb: 1,
                  }}
                >
                  {t('Your password')}
                </Typography>
                <TextField
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder={t('Create a password')}
                  autoComplete="new-password"
                  variant="outlined"
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: 'text.secondary' }}
                      >
                        <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                      </IconButton>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      borderColor: 'rgba(255,255,255,0.2)',
                      '&:hover': { borderColor: 'rgba(255,255,255,0.3)' },
                      '&.Mui-focused': { borderColor: '#1EFBB8' },
                    },
                    '& .MuiInputBase-input': {
                      color: 'text.primary',
                      '&::placeholder': {
                        color: 'text.secondary',
                        opacity: 0.7,
                      },
                    },
                  }}
                />
              </Box>

              {/* Confirm Password Field */}
              <Box>
                <Typography
                  sx={{
                    color: 'text.primary',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    mb: 1,
                  }}
                >
                  {t('Confirm password')}
                </Typography>
                <TextField
                  fullWidth
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange('confirmPassword', e.target.value)
                  }
                  placeholder={t('Confirm your password')}
                  autoComplete="new-password"
                  error={passwordsMismatch}
                  helperText={passwordsMismatch ? t('Passwords do not match') : ' '}
                  variant="outlined"
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        sx={{ color: 'text.secondary' }}
                      >
                        <Iconify
                          icon={showConfirmPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'}
                        />
                      </IconButton>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      borderColor: 'rgba(255,255,255,0.2)',
                      '&:hover': { borderColor: 'rgba(255,255,255,0.3)' },
                      '&.Mui-focused': { borderColor: '#1EFBB8' },
                    },
                    '& .MuiInputBase-input': {
                      color: 'text.primary',
                      '&::placeholder': {
                        color: 'text.secondary',
                        opacity: 0.7,
                      },
                    },
                  }}
                />
              </Box>

              {/* Terms and Conditions */}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.agreeToTerms}
                    onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                    sx={{
                      color: 'rgba(255,255,255,0.3)',
                      '&.Mui-checked': { color: '#1EFBB8' },
                    }}
                  />
                }
                label={
                  <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                    {t('I have read and agreed to the')}{' '}
                    <MUILink
                      href="/terms"
                      sx={{
                        color: '#1EFBB8',
                        textDecoration: 'none',
                        '&:hover': { textDecoration: 'underline' },
                      }}
                    >
                      {t('Terms of Service')}
                    </MUILink>{' '}
                    {t('and')}{' '}
                    <MUILink
                      href="/privacy"
                      sx={{
                        color: '#1EFBB8',
                        textDecoration: 'none',
                        '&:hover': { textDecoration: 'underline' },
                      }}
                    >
                      {t('Privacy Policy')}
                    </MUILink>
                  </Typography>
                }
                sx={{ alignItems: 'center', mt: 1 }}
              />

              {/* Sign Up Button */}
              <Button
                fullWidth
                onClick={handleSignUp}
                disabled={!isFormValid || isLoading}
                sx={{
                  py: 1.5,
                  mt: 2,
                  borderRadius: 1.5,
                  background:
                    isFormValid && !isLoading
                      ? 'linear-gradient(135deg, #1EFBB8 0%, #0EE5F9 100%)'
                      : 'rgba(255,255,255,0.1)',
                  color: isFormValid && !isLoading ? '#0A121D' : 'text.secondary',
                  fontWeight: 600,
                  fontSize: '1rem',
                  '&:hover': {
                    background:
                      isFormValid && !isLoading
                        ? 'linear-gradient(135deg, #0EE5F9 0%, #1EFBB8 100%)'
                        : 'rgba(255,255,255,0.1)',
                  },
                  '&:disabled': {
                    background: 'rgba(255,255,255,0.1)',
                    color: 'text.secondary',
                  },
                }}
              >
                {isLoading ? t('Signing up') : t('Sign up')}
              </Button>

              {/* Login Link */}
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                  {t('Already have an account')}{' '}
                  <Link
                    href="/signIn"
                    style={{
                      color: '#1EFBB8',
                      textDecoration: 'none',
                      fontWeight: 500,
                    }}
                  >
                    {t('Log In')}
                  </Link>
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Grid>

        {/* Right Illustration */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'relative',
              width: '90%',
              height: '90%',
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            <Image src={authImage} alt="auth" fill />
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SignUpPageSection;
