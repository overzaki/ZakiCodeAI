'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Stack, Grid, Button, TextField, Checkbox,
  FormControlLabel, IconButton, Divider, Link as MUILink, Container, Alert,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useSettingsContext } from '@/components/settings';
import Iconify from '@/components/iconify';
import { Link } from '@/i18n/routing';
import { ImagesSrc } from '@/constants/imagesSrc';
import Image from 'next/image';
import LargeLogo from '@/shared-components/Logo/largeLogo';
import LanguageSwitcher from '@/components/LanguageSwitcher/LanguageSwitcher';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
type Database = any;

const authImage = ImagesSrc.Auth;

const SignInPageSection = () => {
  const t = useTranslations();
  const { themeDirection } = useSettingsContext();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clearError = useCallback(() => setError(null), []);

  const router = useRouter();
  const supabase = createClientComponentClient<Database>();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    agreeToTerms: false,
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) clearError();
  };

  const handleSignIn = async () => {
    if (!formData.email || !formData.password) return;
    setError(null);
    setIsLoading(true);

    const { error: err } = await supabase.auth.signInWithPassword({
      email: formData.email.trim(),
      password: formData.password,
    });

    setIsLoading(false);

    if (err) {
      setError(err.message);
      return;
    }

    // ⬅️ التحويل إلى الصفحة الرئيسية
    router.replace('/');
  };

  const signInWithGoogle = async () => {
    setError(null);
    setIsLoading(true);

    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // ⬅️ العودة إلى الصفحة الرئيسية بعد نجاح OAuth
        redirectTo:
          typeof window !== 'undefined'
            ? `${window.location.origin}/`
            : undefined,
      },
    });

    setIsLoading(false);

    if (err) setError(err.message);
  };

  useEffect(() => () => { clearError(); }, [clearError]);

  const isFormValid = formData.email && formData.password && formData.agreeToTerms;

  return (
    <Container>
      <Grid container sx={{ minHeight: '100vh' }}>
        {/* Left Section */}
        <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', p: 4, position: 'relative' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <LargeLogo />
            <LanguageSwitcher />
          </Stack>

          <Box sx={{ width: '100%' }}>
            <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: { xs: '2rem', md: '2.5rem' }, textAlign: 'center', my: 4 }}>
              {t('Welcome To ZakiCode')}
            </Typography>

            {error && (
              <Alert severity="error" onClose={clearError} sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Google Log In */}
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Iconify icon="logos:google-icon" />}
              onClick={signInWithGoogle}
              disabled={isLoading}
              sx={{
                py: 1.5, mb: 3, borderRadius: 1.5,
                borderColor: 'rgba(255,255,255,0.2)', color: 'text.primary',
                '&:hover': { borderColor: 'rgba(255,255,255,0.4)', backgroundColor: 'rgba(255,255,255,0.05)' },
              }}
            >
              {t('Log In with Google')}
            </Button>

            {/* Divider */}
            <Box sx={{ position: 'relative', mb: 3 }}>
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />
              <Typography sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                backgroundColor: 'background.default', px: 2, color: 'text.secondary', fontSize: '0.875rem' }}>
                {t('OR')}
              </Typography>
            </Box>

            {/* Form */}
            <Stack spacing={3}>
              <Box>
                <Typography sx={{ color: 'text.primary', fontSize: '0.875rem', fontWeight: 500, mb: 1 }}>
                  {t('Your email')}
                </Typography>
                <TextField
                  fullWidth type="email" value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder={t('Enter your email')} variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.2)',
                      '&:hover': { borderColor: 'rgba(255,255,255,0.3)' }, '&.Mui-focused': { borderColor: '#1EFBB8' },
                    },
                    '& .MuiInputBase-input': { color: 'text.primary', '&::placeholder': { color: 'text.secondary', opacity: 0.7 } },
                  }}
                />
              </Box>

              <Box>
                <Typography sx={{ color: 'text.primary', fontSize: '0.875rem', fontWeight: 500, mb: 1 }}>
                  {t('Your password')}
                </Typography>
                <TextField
                  fullWidth type={showPassword ? 'text' : 'password'} value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder={t('Your password')} variant="outlined"
                  InputProps={{
                    endAdornment: (
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: 'text.secondary' }}>
                        <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                      </IconButton>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.2)',
                      '&:hover': { borderColor: 'rgba(255,255,255,0.3)' }, '&.Mui-focused': { borderColor: '#1EFBB8' },
                    },
                    '& .MuiInputBase-input': { color: 'text.primary', '&::placeholder': { color: 'text.secondary', opacity: 0.7 } },
                  }}
                />
              </Box>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.agreeToTerms}
                    onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                    sx={{ color: 'rgba(255,255,255,0.3)', '&.Mui-checked': { color: '#1EFBB8' } }}
                  />
                }
                label={
                  <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                    {t('I have read and agreed to the')}{' '}
                    <MUILink href="/terms" sx={{ color: '#1EFBB8', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                      {t('Terms of Service')}
                    </MUILink>{' '}{t('and')}{' '}
                    <MUILink href="/privacy" sx={{ color: '#1EFBB8', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                      {t('Privacy Policy')}
                    </MUILink>
                  </Typography>
                }
                sx={{ alignItems: 'center', mt: 1 }}
              />

              <Button
                fullWidth onClick={handleSignIn} disabled={!isFormValid || isLoading}
                sx={{
                  py: 1.5, mt: 2, borderRadius: 1.5,
                  background: isFormValid && !isLoading
                    ? 'linear-gradient(135deg, #1EFBB8 0%, #0EE5F9 100%)'
                    : 'rgba(255,255,255,0.1)',
                  color: isFormValid && !isLoading ? '#0A121D' : 'text.secondary',
                  fontWeight: 600, fontSize: '1rem',
                  '&:hover': {
                    background: isFormValid && !isLoading
                      ? 'linear-gradient(135deg, #0EE5F9 0%, #1EFBB8 100%)'
                      : 'rgba(255,255,255,0.1)',
                  },
                  '&:disabled': { background: 'rgba(255,255,255,0.1)', color: 'text.secondary' },
                }}
              >
                {isLoading ? t('Logging in') : t('Log In')}
              </Button>

              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                  {t('Dont have an account')}{' '}
                  <Link href="/signUp" style={{ color: '#1EFBB8', textDecoration: 'none', fontWeight: 500 }}>
                    {t('signUp')}
                  </Link>
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Grid>

        {/* Right image */}
        <Grid item xs={12} md={6}
          sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
          <Box sx={{ position: 'relative', width: '90%', height: '90%', borderRadius: 3, overflow: 'hidden' }}>
            <Image src={authImage} alt="auth" fill />
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SignInPageSection;
