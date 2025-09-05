'use client';

import * as React from 'react';
import {
  Box, Paper, Stack, Typography, Divider, Chip, Link as MUILink,
} from '@mui/material';
import { Link } from '@/i18n/routing';

const palette = {
  cardFrom: 'rgba(12, 49, 56, 0.92)',
  cardTo: 'rgba(9, 42, 49, 0.92)',
  line: 'rgba(56, 245, 209, 0.22)',
  text: '#eaf8f9',
};

function Shell({ children, sx }: React.PropsWithChildren<{ sx?: any }>) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
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

export default function WorkspaceSidebar({
  t,
  active,
  showPeople = true,
}: {
  t: (key: string) => string;
// عدّل نوع الـactive ليشمل 'account'
active: 'workspace' | 'people' | 'billing' | 'account' | 'labs' | 'supabase' | 'github';
  showPeople?: boolean;
}) {
  return (
    <Shell sx={{ width: 260, display: { xs: 'none', md: 'block' }, alignSelf: 'flex-start' }}>
      <Stack spacing={1.5}>
        <Typography variant="overline" sx={{ opacity: 0.7 }}>
          {t('workspace')}
        </Typography>

        <MUILink component={Link} href="/Workspace" sx={{ color: palette.text, textDecoration: 'none', opacity: 0.9 }}>
          {t('my_workspace')}
        </MUILink>

        {showPeople && (
          active === 'people' ? (
            <Chip label={t('people')} size="small" sx={{ alignSelf: 'start' }} />
          ) : (
            <MUILink component={Link} href="/people" sx={{ color: palette.text, textDecoration: 'none', opacity: 0.9 }}>
              {t('people')}
            </MUILink>
          )
        )}

        {active === 'billing' ? (
          <Chip label={t('plans_billing')} size="small" sx={{ alignSelf: 'start' }} />
        ) : (
          <MUILink component={Link} href="/billing" sx={{ color: palette.text, textDecoration: 'none', opacity: 0.9 }}>
            {t('plans_billing')}
          </MUILink>
        )}

        <Divider sx={{ borderColor: palette.line }} />

        <Typography variant="overline" sx={{ opacity: 0.7 }}>
          {t('account')}
        </Typography>
        <MUILink component={Link} href="/account" sx={{ color: palette.text, textDecoration: 'none', opacity: 0.9 }}>
          {t('account_name')}
        </MUILink>
        <MUILink component={Link} href="/labs" sx={{ color: palette.text, textDecoration: 'none', opacity: 0.9 }}>
          {t('labs')}
        </MUILink>

        <Divider sx={{ borderColor: palette.line }} />

        <Typography variant="overline" sx={{ opacity: 0.7 }}>
          {t('integrations')}
        </Typography>
        <MUILink component={Link} href="/integrations/supabase" sx={{ color: palette.text, textDecoration: 'none', opacity: 0.9 }}>
          Supabase
        </MUILink>
        <MUILink component={Link} href="/integrations/github" sx={{ color: palette.text, textDecoration: 'none', opacity: 0.9 }}>
          GitHub
        </MUILink>
      </Stack>
    </Shell>
  );
}
