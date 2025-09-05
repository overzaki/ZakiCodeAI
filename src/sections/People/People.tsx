'use client';

import * as React from 'react';
import {
  Box, Stack, Typography, Paper, TextField, Button, IconButton,
  Divider, Tabs, Tab, Avatar, Link as MUILink
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import ArrowDropDownRoundedIcon from '@mui/icons-material/ArrowDropDownRounded';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import WorkspaceSidebar from '@/sections/Workspace/Sidebar';
import { useAuth } from '@/hooks/useAuth';

const palette = {
  pageBase: '#0b2c32',
  cardFrom: 'rgba(12, 49, 56, 0.92)',
  cardTo: 'rgba(9, 42, 49, 0.92)',
  line: 'rgba(56, 245, 209, 0.22)',
  text: '#eaf8f9',
  subtext: 'rgba(234, 248, 249, .85)',
};

function BG() {
  return (
    <Box aria-hidden sx={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      background: `
        radial-gradient(1200px 800px at 70% 10%, rgba(56,245,209,.14), transparent 60%),
        radial-gradient(900px 700px at 25% 80%, rgba(14,165,233,.16), transparent 55%),
        radial-gradient(1600px 1200px at 50% 50%, #0b2c32, #0a2a31 65%, #0a2730 100%)
      `,
      filter: 'saturate(1.05)',
    }}/>
  );
}

function Card({ children, sx }: React.PropsWithChildren<{ sx?: any }>) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 3,
        color: palette.text,
        background: `linear-gradient(180deg, ${palette.cardFrom}, ${palette.cardTo})`,
        border: `1px solid ${palette.line}`,
        backdropFilter: 'blur(8px)',
        ...sx,
      }}
    >
      {children}
    </Paper>
  );
}

export default function People() {
  const tb = useTranslations('billing'); // لإظهار نصوص السايدبار نفسها
  const t = useTranslations('people');
  const { isAuthenticated } = useAuth();
  const [tab, setTab] = React.useState(0);

  return (
    <Box sx={{ position: 'relative', minHeight: '100svh', backgroundColor: palette.pageBase, color: palette.text }}>
      <BG />

      <Stack direction="row" gap={2} sx={{ position: 'relative', zIndex: 1, p: { xs: 2, md: 3 }, maxWidth: 1280, mx: 'auto' }}>
        {/* Sidebar: أخفي People من السايدبار إذا غير مسجل دخول */}
        <WorkspaceSidebar t={tb as any} active="people" showPeople={isAuthenticated} />

        {/* Main */}
        <Stack spacing={2} sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>{t('title')}</Typography>

          {/* دعوة أعضاء */}
          <Card>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ md: 'center' }}>
              <Typography sx={{ fontWeight: 800, flexShrink: 0 }}>{t('invite_new')}</Typography>
              <Stack direction="row" spacing={1} sx={{ flex: 1 }}>
                <TextField
                  fullWidth placeholder={t('add_emails')}
                  InputProps={{
                    sx: {
                      bgcolor: 'rgba(255,255,255,0.06)', color: palette.text, borderRadius: 2,
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: palette.line },
                    },
                  }}
                />
                <Button
                  variant="contained"
                  sx={{
                    px: 2.4, borderRadius: 9999, textTransform: 'none', fontWeight: 800,
                    background: 'linear-gradient(90deg, #0EE5F9 0%, #1EFBB8 100%)', color: '#08262b',
                  }}
                >
                  {t('invite')}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<FileDownloadRoundedIcon />}
                  sx={{ borderColor: palette.line, color: palette.text }}
                >
                  {t('export')}
                </Button>
              </Stack>
            </Stack>
          </Card>

          {/* الأعضاء */}
          <Card>
            <Typography sx={{ fontWeight: 800, mb: 1 }}>{t('members')}</Typography>

            {/* شريط البحث + التابات */}
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ md: 'center' }} sx={{ mb: 1 }}>
              <TextField
                fullWidth placeholder={t('search_placeholder')}
                InputProps={{
                  startAdornment: <SearchRoundedIcon style={{ opacity: .7, marginRight: 6 }} />,
                  sx: {
                    bgcolor: 'rgba(255,255,255,0.06)', color: palette.text, borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: palette.line },
                  },
                }}
              />
              <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                sx={{
                  minHeight: 36, height: 36,
                  '& .MuiTab-root': {
                    minHeight: 36, height: 36, textTransform: 'none',
                    color: palette.text, opacity: .9,
                  },
                  '& .MuiTabs-indicator': { background: 'linear-gradient(90deg,#0EE5F9,#1EFBB8)' },
                }}
              >
                <Tab label={t('tab_all')} />
                <Tab label={t('tab_active')} />
                <Tab label={t('tab_pending')} />
              </Tabs>
            </Stack>

            <Divider sx={{ borderColor: palette.line, my: 1 }} />

            {/* عنصر عضو واحد كمثال */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 1 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar sx={{ bgcolor: '#1EFBB855', color: '#08262b', fontWeight: 800 }}>M</Avatar>
                <Box>
                  <Typography sx={{ fontWeight: 700 }}>Maher Al-Khawndi <Typography component="span" sx={{ opacity: .7, ml: .5 }}>({t('you')})</Typography></Typography>
                  <Typography sx={{ opacity: .75, fontSize: 13 }}>maherlok@gmail.com</Typography>
                </Box>
              </Stack>

              <Button
                size="small"
                endIcon={<ArrowDropDownRoundedIcon />}
                variant="outlined"
                sx={{ borderColor: palette.line, color: palette.text, textTransform: 'none' }}
              >
                {t('role_owner')}
              </Button>
            </Stack>
          </Card>

          {/* الاستخدام */}
          <Card>
            <Typography sx={{ fontWeight: 800, mb: 1 }}>{t('usage')}</Typography>
            <Typography sx={{ opacity: .85, mb: 1 }}>
              {t('usage_month', { month: 'August', year: '2025' })}
            </Typography>

            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 1 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar sx={{ bgcolor: '#1EFBB855', color: '#08262b', fontWeight: 800 }}>M</Avatar>
                <Typography sx={{ fontWeight: 700 }}>Maher Al-Khawndi</Typography>
              </Stack>
              <Typography sx={{ opacity: .9 }}>{t('credits_used', { credits: '945.60' })}</Typography>
            </Stack>

            <Divider sx={{ borderColor: palette.line, my: 1 }} />

            <Typography sx={{ opacity: .85, mb: 1 }}>{t('total_usage')}</Typography>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 1 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar sx={{ bgcolor: '#1EFBB855', color: '#08262b', fontWeight: 800 }}>M</Avatar>
                <Typography sx={{ fontWeight: 700 }}>Maher Al-Khawndi</Typography>
              </Stack>
              <Typography sx={{ opacity: .9 }}>{t('credits_total', { credits: '2489.70' })}</Typography>
            </Stack>
          </Card>
        </Stack>
      </Stack>
    </Box>
  );
}
