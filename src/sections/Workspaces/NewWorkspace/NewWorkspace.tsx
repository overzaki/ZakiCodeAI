'use client';

import * as React from 'react';
import {
  Box, Paper, Stack, Typography, TextField, Button
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

const palette = {
  pageBase: '#0b2c32',
  cardFrom: 'rgba(12, 49, 56, 0.95)',
  cardTo: 'rgba(9, 42, 49, 0.95)',
  line: 'rgba(56, 245, 209, 0.22)',
  text: '#eaf8f9',
};

function Background() {
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

export default function NewWorkspace() {
  const t = useTranslations('workspaces_new');
  const router = useRouter();
  const [name, setName] = React.useState('');

  const goBack = () => router.back();
  const toPlan = () => router.push(`/billing?workspace=${encodeURIComponent(name)}`);

  return (
    <Box sx={{ position: 'relative', minHeight: '100svh', display: 'grid', placeItems: 'center', backgroundColor: palette.pageBase, color: palette.text }}>
      <Background />
      <Paper
        elevation={0}
        sx={{
          width: { xs: '92vw', sm: 520 },
          p: 3,
          borderRadius: 3,
          border: `1px solid ${palette.line}`,
          background: `linear-gradient(180deg, ${palette.cardFrom}, ${palette.cardTo})`,
          backdropFilter: 'blur(8px)',
        }}
      >
        <Stack spacing={2}>
          <Stack spacing={0.5}>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>{t('title')}</Typography>
            <Typography sx={{ opacity: .85 }}>{t('subtitle')}</Typography>
          </Stack>

          <Stack spacing={1}>
            <Typography sx={{ fontWeight: 700 }}>{t('label')}</Typography>
            <TextField
              placeholder={t('placeholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              InputProps={{
                sx: {
                  bgcolor: 'rgba(255,255,255,.06)',
                  color: palette.text,
                  borderRadius: 2,
                  '& fieldset': { borderColor: palette.line },
                },
              }}
            />
          </Stack>

          <Stack direction="row" spacing={1.25} sx={{ pt: 1 }}>
            <Button onClick={goBack} sx={{ px: 2.2, py: 1, borderRadius: 2, bgcolor: 'rgba(255,255,255,.08)', color: palette.text, textTransform: 'none', fontWeight: 800 }}>
              {t('back')}
            </Button>

            <Button
              disabled={name.trim().length < 2}
              onClick={toPlan}
              variant="contained"
              sx={{
                flex: 1,
                px: 2.2, py: 1, borderRadius: 2, textTransform: 'none', fontWeight: 800,
                background: 'linear-gradient(90deg, #0EE5F9 0%, #1EFBB8 100%)', color: '#08262b',
                filter: name.trim().length < 2 ? 'grayscale(0.5) opacity(0.8)' : 'none',
              }}
            >
              {t('continue')}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
