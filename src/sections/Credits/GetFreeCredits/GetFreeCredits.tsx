'use client';

import * as React from 'react';
import {
  Box, Paper, Stack, Typography, Button, TextField, IconButton, Tooltip, Link as MUILink
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

const palette = {
  pageBase: '#0b2c32',
  cardFrom: 'rgba(12,49,56,.96)',
  cardTo: 'rgba(9,42,49,.96)',
  line: 'rgba(56,245,209,.22)',
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

export default function GetFreeCredits() {
  const t = useTranslations('credits_free');
  const [copied, setCopied] = React.useState(false);

  // غيّر الرابط حسب نظام الدعوات لديك
  const inviteLink = 'https://zakicode.dev/invite/d4262362-a7ea-4f8';

  const copy = async () => {
    setCopied(false);
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <Box sx={{ position: 'relative', minHeight: '100svh', display: 'grid', placeItems: 'center', backgroundColor: palette.pageBase, color: palette.text }}>
      <BG />
      <Paper
        elevation={0}
        sx={{
          width: { xs: '92vw', sm: 640 },
          p: 0,
          borderRadius: 3,
          border: `1px solid ${palette.line}`,
          background: `linear-gradient(180deg, ${palette.cardFrom}, ${palette.cardTo})`,
          overflow: 'hidden',
        }}
      >
        {/* هيدر جذاب */}
        <Box sx={{
          p: { xs: 2, sm: 3 },
          background: 'linear-gradient(90deg, rgba(255,163,77,.25), rgba(139,92,246,.25))',
        }}>
          <Typography sx={{ fontWeight: 800, mb: .5 }}>{t('earn')}</Typography>
          <Typography variant="h4" sx={{ fontWeight: 900 }}>{t('title')}</Typography>
          <Typography sx={{ opacity: .9 }}>{t('subtitle')}</Typography>
        </Box>

        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography sx={{ fontWeight: 800, mb: 1 }}>{t('how')}</Typography>

          <Stack spacing={1.25} sx={{ mb: 2 }}>
            <Typography>⚡ {t('step1')}</Typography>
            <Typography>👥 {t('step2')}</Typography>
            <Typography>✅ {t('step3')}</Typography>
          </Stack>

          <Typography sx={{ fontWeight: 800, mb: .75 }}>{t('your_link')}</Typography>
          <Stack direction="row" spacing={1}>
            <TextField
              fullWidth
              value={inviteLink}
              InputProps={{
                readOnly: true,
                sx: {
                  bgcolor: 'rgba(255,255,255,.06)',
                  color: palette.text,
                  borderRadius: 2,
                  '& fieldset': { borderColor: palette.line },
                },
              }}
            />
            <Tooltip title={copied ? t('copied') : t('copy')}>
              <span>
                <IconButton onClick={copy} sx={{ bgcolor: 'rgba(255,255,255,.10)', '&:hover': { bgcolor: 'rgba(255,255,255,.16)' } }}>
                  <ContentCopyIcon sx={{ color: palette.text }} />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <MUILink component={Link} href="/terms" sx={{ color: '#7dd3fc' }}>
              {t('terms')}
            </MUILink>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
