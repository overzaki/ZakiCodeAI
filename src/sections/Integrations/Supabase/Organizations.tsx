'use client';

import * as React from 'react';
import { Box, Stack, Typography, Paper, Chip, Button, Avatar } from '@mui/material';
import { useTranslations } from 'next-intl';
import WorkspaceSidebar from '@/sections/Workspace/Sidebar';
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
    <Paper elevation={0} sx={{
      p: 2.5, borderRadius: 3, color: palette.text,
      background: `linear-gradient(180deg, ${palette.cardFrom}, ${palette.cardTo})`,
      border: `1px solid ${palette.line}`, backdropFilter: 'blur(8px)', ...sx,
    }}>
      {children}
    </Paper>
  );
}

const mockOrgs = [
  'OVERZAKI CRM',
  "rkddjdxhddj@gmail.com's Org",
  "vendarMohammedali23@gmail.com's Org",
  'ZakiCRM',
];

export default function SupabaseOrganizations() {
  const t = useTranslations('supabase');
  const tb = useTranslations('billing');
  const { isAuthenticated } = useAuth();

  return (
    <Box sx={{ position: 'relative', minHeight: '100svh', backgroundColor: palette.pageBase, color: palette.text }}>
      <BG />
      <Stack direction="row" gap={2} sx={{ position: 'relative', zIndex: 1, p: { xs: 2, md: 3 }, maxWidth: 1280, mx: 'auto' }}>
        <WorkspaceSidebar t={tb as any} active="supabase" showPeople={isAuthenticated} />

        <Stack spacing={2} sx={{ flex: 1 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Typography variant="h5" sx={{ fontWeight: 800 }}>{t('linked_orgs')}</Typography>
              <Chip label={t('admin')} size="small" />
            </Stack>
            <Typography sx={{ opacity: .85 }}>{t('anyone_can_view')}</Typography>
          </Stack>

          <Card>
            <Typography sx={{ fontWeight: 800, mb: 1 }}>{t('workspace')}</Typography>

            <Stack spacing={1.25} sx={{ mt: 1 }}>
              {mockOrgs.map((name, i) => (
                <Stack key={i} direction="row" spacing={1.25} alignItems="center">
                  <Avatar
                    sx={{
                      width: 26, height: 26, fontSize: 14,
                      bgcolor: 'rgba(56,245,209,.25)', color: '#08262b', fontWeight: 800,
                    }}
                  >
                    ⚡
                  </Avatar>
                  <Typography>{name}</Typography>
                </Stack>
              ))}
            </Stack>

            <Stack direction="row" justifyContent="flex-start" sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                sx={{ borderColor: palette.line, color: palette.text, borderRadius: 2, px: 2 }}
              >
                {t('add_more')}
              </Button>
            </Stack>
          </Card>
        </Stack>
      </Stack>
    </Box>
  );
}
