'use client';

import * as React from 'react';
import {
  Box, Stack, Typography, Paper, TextField, Button, Divider, Avatar,
  IconButton, Link as MUILink, RadioGroup, FormControlLabel, Radio, Checkbox
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

/** Heatmap بسيطة (7 صفوف × 53 أسبوع) */
function EditsHeatmap() {
  const cols = 53;
  const rows = 7;
  const cells = Array.from({ length: cols * rows }, (_, i) => {
    const c = Math.floor(i / rows);
    const r = i % rows;
    // نمط ثابت لطيف
    const v =
      (c > 36 && c < 49 && r % 2 === 0) ? 3 :
      (c > 41 && r > 3) ? 2 :
      (c % 9 === 0 && r % 3 === 0) ? 1 : 0;
    const bg =
      v === 0 ? 'rgba(255,255,255,.08)' :
      v === 1 ? 'rgba(125, 211, 252, .55)' :
      v === 2 ? 'rgba(56, 189, 248, .75)' :
                'rgba(14, 165, 233, 1)';
    return <Box key={i} sx={{ width: 12, height: 12, borderRadius: 2.5, bgcolor: bg }} />;
  });

  return (
    <Box sx={{
      p: 1.25, borderRadius: 2, border: `1px solid ${palette.line}`,
      background: 'rgba(255,255,255,.06)'
    }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 12px)`, gap: .5 }}>
        {cells}
      </Box>
    </Box>
  );
}

export default function AccountSettings() {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const t = useTranslations('account');
  const tb = useTranslations('billing'); // عناوين السايدبار الموجودة مسبقًا

  return (
    <Box sx={{ position: 'relative', minHeight: '100svh', backgroundColor: palette.pageBase, color: palette.text }}>
      <BG />

      <Stack direction="row" gap={2} sx={{ position: 'relative', zIndex: 1, p: { xs: 2, md: 3 }, maxWidth: 1280, mx: 'auto' }}>
        {/* سايدبار مشترك — يميز عنصر الحساب كـ Active */}
        <WorkspaceSidebar t={tb as any} active="account" showPeople={isAuthenticated} />

        {/* Main */}
        <Stack spacing={2} sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>{t('title')}</Typography>
          <Typography sx={{ opacity: .85 }}>{t('subtitle')}</Typography>

          {/* العداد + الخريطة الحرارية */}
          <Card>
            <Typography sx={{ fontWeight: 800, mb: 1 }}>
              {t('edits_banner', { n: 6886, brand: 'ZakiCode' })}
            </Typography>
            <EditsHeatmap />
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mt: 1.5 }}>
              <Card sx={{ flex: 1, p: 1.5 }}>
                <Typography sx={{ opacity: .8, fontSize: 13 }}>{t('daily_avg')}</Typography>
                <Typography sx={{ fontWeight: 800, mt: .5 }}>18.9 {t('edits')}</Typography>
              </Card>
              <Card sx={{ flex: 1, p: 1.5 }}>
                <Typography sx={{ opacity: .8, fontSize: 13 }}>{t('days_edited')}</Typography>
                <Typography sx={{ fontWeight: 800, mt: .5 }}>81 (22%)</Typography>
              </Card>
              <Card sx={{ flex: 1, p: 1.5 }}>
                <Typography sx={{ opacity: .8, fontSize: 13 }}>{t('current_streak')}</Typography>
                <Typography sx={{ fontWeight: 800, mt: .5 }}>0 {t('days')}</Typography>
              </Card>
            </Stack>
          </Card>

          {/* الحقول */}
          <Card>
            {/* Avatar */}
            <Typography sx={{ fontWeight: 800, mb: .25 }}>{t('avatar')}</Typography>
            <Typography sx={{ opacity: .75, mb: 1 }}>{t('avatar_hint')}</Typography>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{ position: 'relative', width: 44, height: 44 }}>
                <Avatar sx={{ width: 44, height: 44, bgcolor: '#1EFBB855', color: '#08262b', fontWeight: 800 }}>M</Avatar>
                <IconButton size="small" sx={{
                  position: 'absolute', right: -6, bottom: -6,
                  bgcolor: 'rgba(255,255,255,0.10)', '&:hover': { bgcolor: 'rgba(255,255,255,0.18)' }
                }}>
                  <EditRoundedIcon fontSize="small" />
                </IconButton>
              </Box>
              <Button variant="outlined" sx={{ borderColor: palette.line, color: palette.text }}>{t('upload')}</Button>
            </Stack>

            <Divider sx={{ borderColor: palette.line, my: 2 }} />

            {/* Username */}
            <Typography sx={{ fontWeight: 800, mb: .25 }}>{t('username')}</Typography>
            <Typography sx={{ opacity: .75, mb: 1 }}>{t('username_hint')}</Typography>
            <TextField
              fullWidth defaultValue="zakicode"
              InputProps={{ sx: { bgcolor: 'rgba(255,255,255,0.06)', color: palette.text, borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: palette.line } } }}
              sx={{ mb: .75 }}
            />
            <MUILink href="https://zaki.dev/@zakicode" target="_blank" sx={{ color: '#7dd3fc' }}>
              zaki.dev/@zakicode ↗
            </MUILink>

            <Divider sx={{ borderColor: palette.line, my: 2 }} />

            {/* Email */}
            <Typography sx={{ fontWeight: 800, mb: .25 }}>{t('email')}</Typography>
            <Typography sx={{ opacity: .75, mb: 1 }}>{t('email_hint')}</Typography>
            <TextField
              fullWidth defaultValue="maherlok@gmail.com"
              InputProps={{ sx: { bgcolor: 'rgba(255,255,255,0.06)', color: palette.text, borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: palette.line } } }}
            />

            <Divider sx={{ borderColor: palette.line, my: 2 }} />

            {/* Name */}
            <Typography sx={{ fontWeight: 800, mb: .25 }}>{t('name')}</Typography>
            <Typography sx={{ opacity: .75, mb: 1 }}>{t('name_hint')}</Typography>
            <TextField
              fullWidth
              InputProps={{ sx: { bgcolor: 'rgba(255,255,255,0.06)', color: palette.text, borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: palette.line } } }}
            />

            <Divider sx={{ borderColor: palette.line, my: 2 }} />

            {/* Description */}
            <Typography sx={{ fontWeight: 800, mb: .25 }}>{t('description')}</Typography>
            <Typography sx={{ opacity: .75, mb: 1 }}>{t('description_hint')}</Typography>
            <TextField
              fullWidth multiline minRows={3}
              InputProps={{ sx: { bgcolor: 'rgba(255,255,255,0.06)', color: palette.text, borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: palette.line } } }}
            />

            <Divider sx={{ borderColor: palette.line, my: 2 }} />

            {/* Location */}
            <Typography sx={{ fontWeight: 800, mb: .25 }}>{t('location')}</Typography>
            <Typography sx={{ opacity: .75, mb: 1 }}>{t('location_hint')}</Typography>
            <TextField
              fullWidth
              InputProps={{ sx: { bgcolor: 'rgba(255,255,255,0.06)', color: palette.text, borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: palette.line } } }}
            />

            <Divider sx={{ borderColor: palette.line, my: 2 }} />

            {/* Link */}
            <Typography sx={{ fontWeight: 800, mb: .25 }}>{t('link')}</Typography>
            <Typography sx={{ opacity: .75, mb: 1 }}>{t('link_hint')}</Typography>
            <TextField
              fullWidth placeholder="https://"
              InputProps={{ sx: { bgcolor: 'rgba(255,255,255,0.06)', color: palette.text, borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: palette.line } } }}
            />

            <Divider sx={{ borderColor: palette.line, my: 2 }} />

            {/* Hide profile picture */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: .5 }}>
              <Box>
                <Typography sx={{ fontWeight: 800 }}>{t('hide_pic')}</Typography>
                <Typography sx={{ opacity: .75 }}>{t('hide_pic_hint')}</Typography>
              </Box>
              <Checkbox />
            </Stack>

            <Divider sx={{ borderColor: palette.line, my: 2 }} />

            {/* Generation complete sound */}
            <Typography sx={{ fontWeight: 800, mb: .5 }}>{t('gen_sound')}</Typography>
            <RadioGroup defaultValue="first" sx={{ gap: .5 }}>
              <FormControlLabel value="first" control={<Radio />} label={t('first_generation')} />
              <FormControlLabel value="always" control={<Radio />} label={t('always')} />
              <FormControlLabel value="never" control={<Radio />} label={t('never')} />
            </RadioGroup>

            <Divider sx={{ borderColor: palette.line, my: 2 }} />

            {/* Link SSO */}
            <Typography sx={{ fontWeight: 800, mb: .25 }}>{t('link_sso')}</Typography>
            <Typography sx={{ opacity: .75, mb: 1 }}>{t('link_sso_hint')}</Typography>
            <Button
              variant="outlined"
              sx={{ borderColor: palette.line, color: palette.text, borderRadius: 2, px: 2.5 }}
            >
              {t('link_sso_btn')}
            </Button>

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
