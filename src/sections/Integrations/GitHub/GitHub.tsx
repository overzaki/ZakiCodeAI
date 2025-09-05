'use client';

import * as React from 'react';
import {
  Box, Stack, Typography, Paper, Chip, Button, Link as MUILink,
} from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import WorkspaceSidebar from '@/sections/Workspace/Sidebar';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';

const palette = {
  pageBase: '#0b2c32',
  cardFrom: 'rgba(12, 49, 56, 0.92)',
  cardTo: 'rgba(9, 42, 49, 0.92)',
  line: 'rgba(56, 245, 209, 0.22)',
  text: '#eaf8f9',
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
    }} />
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

export default function GitHubIntegration() {
  const t = useTranslations('github');
  const tb = useTranslations('billing'); // عناوين السايدبار الموجودة
  const { isAuthenticated } = useAuth();

  // غيّر هذا بحسب حالتك الفعلية
  const [connected, setConnected] = React.useState(true);
  const username = 'VendarAli24';

  return (
    <Box sx={{ position: 'relative', minHeight: '100svh', backgroundColor: palette.pageBase, color: palette.text }}>
      <BG />

      <Stack direction="row" gap={2} sx={{ position: 'relative', zIndex: 1, p: { xs: 2, md: 3 }, maxWidth: 1280, mx: 'auto' }}>
        <WorkspaceSidebar t={tb as any} active="github" showPeople={isAuthenticated} />

        <Stack spacing={2} sx={{ flex: 1 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>{t('title')}</Typography>
              <Typography sx={{ opacity: .85 }}>{t('subtitle')}</Typography>
            </Box>
            <MUILink href="/docs" sx={{ color: palette.text, opacity: .9, textDecoration: 'none' }}>{t('docs')}</MUILink>
          </Stack>

          <Card>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography sx={{ fontWeight: 800 }}>{t('connected_account')}</Typography>
                <Chip label={t('admin')} size="small" />
              </Stack>

              {connected ? (
                <Chip
                  icon={<GitHubIcon fontSize="small" />}
                  label={username}
                  sx={{ bgcolor: 'rgba(255,255,255,.06)', color: palette.text }}
                />
              ) : (
                <Button
                  variant="contained"
                  onClick={() => setConnected(true)}
                  sx={{
                    px: 2.2, py: 1, borderRadius: 9999, textTransform: 'none', fontWeight: 800,
                    background: 'linear-gradient(90deg, #0EE5F9 0%, #1EFBB8 100%)', color: '#08262b',
                  }}
                >
                  {t('connect')}
                </Button>
              )}
            </Stack>

            <Typography sx={{ opacity: .85, mt: 1.25 }}>
              {t('connect_hint')}
            </Typography>
          </Card>
        </Stack>
      </Stack>
    </Box>
  );
}
