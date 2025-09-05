'use client';

import * as React from 'react';
import {
  Box, Stack, Typography, Paper, TextField, Button, Divider,
  Avatar, IconButton, Chip, Switch, Link as MUILink, Tooltip
} from '@mui/material';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import WorkspaceSidebar from '@/sections/Workspace/Sidebar';
import { useTranslations } from 'next-intl';
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
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        background: `
          radial-gradient(1200px 800px at 70% 10%, rgba(56,245,209,.14), transparent 60%),
          radial-gradient(900px 700px at 25% 80%, rgba(14,165,233,.16), transparent 55%),
          radial-gradient(1600px 1200px at 50% 50%, #0b2c32, #0a2a31 65%, #0a2730 100%)
        `,
        filter: 'saturate(1.05)',
      }}
    />
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

export default function WorkspaceSettings() {
  const { isAuthenticated } = useAuth();
  const t = useTranslations('workspace');          // نصوص الصفحة
  const tb = useTranslations('billing');           // نصوص السايدبار الموجودة مسبقًا

  return (
    <Box sx={{ position: 'relative', minHeight: '100svh', backgroundColor: palette.pageBase, color: palette.text }}>
      <BG />

      <Stack direction="row" gap={2} sx={{ position: 'relative', zIndex: 1, p: { xs: 2, md: 3 }, maxWidth: 1280, mx: 'auto' }}>
        {/* سايدبار مشترك */}
        <WorkspaceSidebar t={tb as any} active="workspace" showPeople={isAuthenticated} />

        {/* Main */}
        <Stack spacing={2} sx={{ flex: 1 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>{t('title')}</Typography>
              <Typography sx={{ opacity: .85 }}>{t('subtitle')}</Typography>
            </Box>
            <MUILink href="/docs" sx={{ color: palette.text, opacity: .9, textDecoration: 'none' }}>{t('docs')}</MUILink>
          </Stack>

          <Card>
            {/* Avatar */}
            <Stack spacing={0.5} sx={{ mb: 2 }}>
              <Typography sx={{ fontWeight: 800 }}>{t('avatar_label')}</Typography>
              <Typography sx={{ opacity: .75 }}>{t('avatar_hint')}</Typography>
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ position: 'relative', width: 44, height: 44 }}>
                <Avatar sx={{ width: 44, height: 44, bgcolor: '#1EFBB855', color: '#08262b', fontWeight: 800 }}>M</Avatar>
                <Tooltip title={t('upload')}>
                  <IconButton
                    size="small"
                    sx={{
                      position: 'absolute', right: -6, bottom: -6,
                      bgcolor: 'rgba(255,255,255,0.10)', '&:hover': { bgcolor: 'rgba(255,255,255,0.18)' }
                    }}
                  >
                    <EditRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Button variant="outlined" sx={{ borderColor: palette.line, color: palette.text }}>{t('upload')}</Button>
            </Stack>

            <Divider sx={{ borderColor: palette.line, my: 2 }} />

            {/* Name */}
            <Stack spacing={0.5} sx={{ mb: 1 }}>
              <Typography sx={{ fontWeight: 800 }}>{t('name_label')}</Typography>
              <Typography sx={{ opacity: .75 }}>{t('name_hint')}</Typography>
            </Stack>
            <TextField
              fullWidth
              defaultValue="My Workspace"
              InputProps={{
                sx: {
                  bgcolor: 'rgba(255,255,255,0.06)', color: palette.text, borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: palette.line },
                },
              }}
            />

            <Divider sx={{ borderColor: palette.line, my: 2 }} />

            {/* Description */}
            <Stack spacing={0.5} sx={{ mb: 1 }}>
              <Typography sx={{ fontWeight: 800 }}>{t('desc_label')}</Typography>
              <Typography sx={{ opacity: .75 }}>{t('desc_hint')}</Typography>
            </Stack>
            <TextField
              fullWidth
              placeholder={t('desc_placeholder')}
              multiline
              minRows={3}
              InputProps={{
                sx: {
                  bgcolor: 'rgba(255,255,255,0.06)', color: palette.text, borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: palette.line },
                },
              }}
            />

            <Divider sx={{ borderColor: palette.line, my: 2 }} />

            {/* Toggle 1 */}
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} sx={{ py: 0.5 }}>
              <Box>
                <Typography sx={{ fontWeight: 800 }}>{t('scan_label')}</Typography>
                <Typography sx={{ opacity: .75 }}>{t('scan_hint')}</Typography>
              </Box>
              <Switch />
            </Stack>

            <Divider sx={{ borderColor: palette.line, my: 2 }} />

            {/* Toggle 2 */}
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} sx={{ py: 0.5 }}>
              <Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography sx={{ fontWeight: 800 }}>{t('invite_editors_label')}</Typography>
                  <Chip label={t('pro_chip')} size="small" />
                </Stack>
                <Typography sx={{ opacity: .75 }}>{t('invite_editors_hint')}</Typography>
              </Box>
              <Switch />
            </Stack>

            <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
              <Button
                variant="contained"
                sx={{
                  px: 2.6, py: 1, borderRadius: 9999, textTransform: 'none', fontWeight: 800,
                  background: 'linear-gradient(90deg, #0EE5F9 0%, #1EFBB8 100%)', color: '#08262b',
                }}
              >
                {t('save')}
              </Button>
            </Stack>
          </Card>
        </Stack>
      </Stack>
    </Box>
  );
}
