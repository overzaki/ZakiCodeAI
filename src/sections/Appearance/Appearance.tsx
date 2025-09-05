'use client';

import * as React from 'react';
import {
  Box, Container, Paper, Stack, Typography, RadioGroup, FormControlLabel,
  Radio, Divider, Select, MenuItem, Button
} from '@mui/material';
import { useTranslations } from 'next-intl';

const P = {
  base:'#0b2c32', from:'rgba(12,49,56,.96)', to:'rgba(9,42,49,.96)', line:'rgba(56,245,209,.22)', text:'#eaf8f9'
};

function BG(){ return (
  <Box aria-hidden sx={{
    position:'absolute', inset:0, pointerEvents:'none',
    background: `
      radial-gradient(1200px 800px at 70% 10%, rgba(56,245,209,.14), transparent 60%),
      radial-gradient(900px 700px at 25% 80%, rgba(14,165,233,.16), transparent 55%),
      radial-gradient(1600px 1200px at 50% 50%, #0b2c32, #0a2a31 65%, #0a2730 100%)
    `
  }}/>
);}

export default function Appearance(){
  const t = useTranslations('appearance');
  const [theme, setTheme] = React.useState<'system'|'light'|'dark'>('system');
  const [lang, setLang] = React.useState<'en'|'ar'>('en');

  return (
    <Box sx={{ position:'relative', minHeight:'100svh', backgroundColor:P.base, color:P.text }}>
      <BG />
      <Container sx={{ py:{ xs:6, md:8 } }}>
        <Typography variant="h4" sx={{ fontWeight:900, mb:2 }}>{t('title')}</Typography>
        <Typography sx={{ opacity:.9, mb:3 }}>{t('subtitle')}</Typography>

        <Paper elevation={0} sx={{ p:2.5, borderRadius:3, background:`linear-gradient(180deg, ${P.from}, ${P.to})`, border:`1px solid ${P.line}` }}>
          <Typography sx={{ fontWeight:800, mb:1 }}>{t('theme')}</Typography>
          <RadioGroup row value={theme} onChange={(e)=>setTheme(e.target.value as any)}>
            <FormControlLabel value="system" control={<Radio />} label={t('system')} />
            <FormControlLabel value="light"  control={<Radio />} label={t('light')} />
            <FormControlLabel value="dark"   control={<Radio />} label={t('dark')} />
          </RadioGroup>

          <Divider sx={{ my:2, borderColor:P.line }} />

          <Typography sx={{ fontWeight:800, mb:1 }}>{t('language')}</Typography>
          <Select value={lang} onChange={(e)=>setLang(e.target.value as any)} sx={{ minWidth:180 }}>
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="ar">العربية</MenuItem>
          </Select>

          <Stack direction="row" justifyContent="flex-end" sx={{ mt:2 }}>
            <Button
              variant="contained"
              sx={{ textTransform:'none', fontWeight:800,
                background:'linear-gradient(90deg,#0EE5F9 0%, #1EFBB8 100%)', color:'#08262b' }}>
              {t('save')}
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
