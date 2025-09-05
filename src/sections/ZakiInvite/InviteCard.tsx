'use client';

import * as React from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  Stack,
  Button,
  Link as MUILink,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import LogoMark from '@/shared-components/Logo/LogoMark';

const InviteCard: React.FC = () => {
  const t = useTranslations('invite');

  // ألوان فاتحة لا تحتوي على الأسود
  const palette = {
    pageBase: '#0b2c32',
    cardFrom: 'rgba(12, 49, 56, 0.92)',
    cardTo: 'rgba(9, 42, 49, 0.92)',
    fieldBg: '#10424a',
    fieldBorder: 'rgba(56, 245, 209, 0.22)',
    fieldBorderHover: 'rgba(56, 245, 209, 0.36)',
    glow: 'rgba(56, 245, 209, 0.14)',
    watermarkStroke: 'rgba(56, 245, 209, 0.10)',
  };

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100svh',
        display: 'grid',
        placeItems: 'center',
        overflow: 'hidden',
        backgroundColor: palette.pageBase,
      }}
    >
      {/* خلفية هادئة متناغمة مع الهوم */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          background: `
            radial-gradient(1200px 800px at 70% 10%, rgba(56,245,209,.14), transparent 60%),
            radial-gradient(900px 700px at 25% 80%, rgba(14,165,233,.16), transparent 55%),
            radial-gradient(1600px 1200px at 50% 50%, #0b2c32, #0a2a31 65%, #0a2730 100%)
          `,
          filter: 'saturate(1.05)',
        }}
      />

      {/* Watermark */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          display: 'grid',
          placeItems: 'center',
          pointerEvents: 'none',
          userSelect: 'none',
          fontWeight: 900,
          letterSpacing: '0.12em',
          fontSize: { xs: '48px', sm: '96px', md: '160px', lg: '220px' },
          color: 'transparent',
          WebkitTextStroke: `1px ${palette.watermarkStroke}`,
          textShadow: `0 0 40px ${palette.glow}, 0 0 80px ${palette.glow}`,
        }}
      >
        {t('watermark')}
      </Box>

      {/* إطار متدرّج رفيع حول البطاقة */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          width: { xs: '92vw', sm: 520 },
          p: '1px',
          borderRadius: 3,
          background:
            'linear-gradient(135deg, rgba(56,245,209,0.28) 0%, rgba(14,165,233,0.28) 100%)',
          boxShadow: `0 0 30px ${palette.glow}`,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            p: 3,
            color: '#eaf8f9',
            background: `linear-gradient(180deg, ${palette.cardFrom}, ${palette.cardTo})`,
            backdropFilter: 'blur(8px)',
            boxShadow:
              '0 10px 30px rgba(0,0,0,.20), inset 0 1px 0 rgba(255,255,255,.04)',
          }}
        >
          {/* ✅ شعار ZakiCode: صورة فقط بدون كتابة */}
          <Box sx={{ display: 'grid', placeItems: 'center', mb: 1 }}>
            <LogoMark size={56} /> {/* يستخدم /public/brand/zaki-mark.svg */}
          </Box>

          <Typography variant="body2" align="center" sx={{ opacity: 0.9, mt: 0.5 }}>
            {t('title_invited')}
          </Typography>

          <Typography variant="h5" align="center" sx={{ fontWeight: 800, mt: 0.5, mb: 2 }}>
            {t('community_name')}
          </Typography>

          {/* اسم العرض */}
          <Stack spacing={1.2} sx={{ mb: 2 }}>
            <Typography sx={{ fontWeight: 600 }}>{t('display_name')}</Typography>
            <TextField
              variant="outlined"
              fullWidth
              placeholder={t('display_name_hint')}
              InputProps={{
                sx: {
                  bgcolor: palette.fieldBg,
                  color: '#eaf8f9',
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: palette.fieldBorder,
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: palette.fieldBorderHover,
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: palette.fieldBorderHover,
                  },
                },
              }}
            />
            <Typography variant="caption" sx={{ opacity: 0.78 }}>
              {t('helper_text')}
            </Typography>
          </Stack>

          {/* تاريخ الميلاد */}
          <Stack spacing={1.2} sx={{ mb: 2 }}>
            <Typography sx={{ fontWeight: 600 }}>{t('dob')}</Typography>
            <Stack direction="row" spacing={1.25}>
              {['month', 'day', 'year'].map((k) => (
                <Select
                  key={k}
                  fullWidth
                  displayEmpty
                  value=""
                  renderValue={(v) => (v ? v : t(k as any))}
                  sx={{
                    bgcolor: palette.fieldBg,
                    color: '#eaf8f9',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: palette.fieldBorder,
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: palette.fieldBorderHover,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: palette.fieldBorderHover,
                    },
                  }}
                >
                  <MenuItem value="">{t(k as any)}</MenuItem>
                </Select>
              ))}
            </Stack>
          </Stack>

          {/* زر بنفس تدرج Start Building وبزوايا كاملة */}
          <Button
            fullWidth
            variant="contained"
            sx={{
              mt: 1,
              py: 1.25,
              fontWeight: 800,
              borderRadius: 9999,
              textTransform: 'none',
              letterSpacing: '.3px',
              background: 'linear-gradient(90deg, #0EE5F9 0%, #1EFBB8 100%)',
              color: '#08262b', // نص غامق وواضح على التدرج الفاتح
              boxShadow:
                '0 8px 24px rgba(14,165,233,.24), inset 0 0 0 1px rgba(255,255,255,.05)',
              '&:hover': {
                filter: 'brightness(1.04)',
                boxShadow:
                  '0 10px 28px rgba(14,165,233,.28), inset 0 0 0 1px rgba(255,255,255,.06)',
              },
            }}
          >
            {t('create_account')}
          </Button>

          <Typography align="center" sx={{ mt: 1.5, opacity: 0.9 }}>
            {t('already_have')}{' '}
            <MUILink component={Link} href="/signIn" sx={{ color: '#7dd3fc' }}>
              {t('login')}
            </MUILink>
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default InviteCard;
