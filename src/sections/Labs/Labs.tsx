'use client';

import * as React from 'react';
import {
  Box, Stack, Typography, Paper, Divider, Switch,
  Link as MUILink, Select, MenuItem, InputLabel, FormControl, Button
} from '@mui/material';
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

export default function Labs() {
  const t = useTranslations('labs');
  const tb = useTranslations('billing'); // للعناوين في السايدبار
  const { user } = useAuth();
  const isAuthenticated = !!user;

  const [legacyMode, setLegacyMode] = React.useState(false);
  const [branchSwitch, setBranchSwitch] = React.useState(false);
  const [branch, setBranch] = React.useState('main');

  return (
    <Box sx={{ position: 'relative', minHeight: '100svh', backgroundColor: palette.pageBase, color: palette.text }}>
      <BG />

      <Stack direction="row" gap={2} sx={{ position: 'relative', zIndex: 1, p: { xs: 2, md: 3 }, maxWidth: 1280, mx: 'auto' }}>
        <WorkspaceSidebar t={tb as any} active="labs" showPeople={isAuthenticated} />

        <Stack spacing={2} sx={{ flex: 1 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>{t('title')}</Typography>
              <Typography sx={{ opacity: .85 }}>{t('subtitle')}</Typography>
            </Box>
            <MUILink href="/docs" sx={{ color: palette.text, opacity: .9, textDecoration: 'none' }}>{t('docs')}</MUILink>
          </Stack>

          <Card>
            {/* Legacy Mode */}
            <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }} justifyContent="space-between" sx={{ py: .5 }}>
              <Box>
                <Typography sx={{ fontWeight: 800 }}>{t('legacy_title')}</Typography>
                <Typography sx={{ opacity: .8 }}>
                  {t('legacy_desc')}{' '}
                  <MUILink href="/learn-more" sx={{ color: '#7dd3fc' }}>{t('learn_more')}</MUILink>
                </Typography>
              </Box>
              <Switch checked={legacyMode} onChange={(e) => setLegacyMode(e.target.checked)} />
            </Stack>

            <Divider sx={{ borderColor: palette.line, my: 2 }} />

            {/* GitHub Branch Switching */}
            <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }} justifyContent="space-between" sx={{ py: .5 }}>
              <Box sx={{ flex: 1, pr: { md: 2 } }}>
                <Typography sx={{ fontWeight: 800 }}>{t('gh_title')}</Typography>
                <Typography sx={{ opacity: .8 }}>{t('gh_desc')}</Typography>
              </Box>

              <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mt: { xs: 1, md: 0 } }}>
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel id="branch-label" sx={{ color: palette.text }}>{t('branch')}</InputLabel>
                  <Select
                    labelId="branch-label"
                    value={branch}
                    label={t('branch')}
                    onChange={(e) => setBranch(e.target.value as string)}
                    disabled={!branchSwitch}
                    sx={{
                      color: palette.text,
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: palette.line },
                      bgcolor: 'rgba(255,255,255,.06)',
                      borderRadius: 2,
                    }}
                  >
                    <MenuItem value="main">main</MenuItem>
                    <MenuItem value="develop">develop</MenuItem>
                    <MenuItem value="release">release</MenuItem>
                  </Select>
                </FormControl>

                <Switch checked={branchSwitch} onChange={(e) => setBranchSwitch(e.target.checked)} />
              </Stack>
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
