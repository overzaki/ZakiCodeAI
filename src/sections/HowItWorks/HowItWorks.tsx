'use client';

import * as React from 'react';
import { Box, Container, Grid, Paper, Stack, Typography } from '@mui/material';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { useTranslations } from 'next-intl';

const P = {
  base: '#0b2c32',
  from: 'rgba(12,49,56,.96)',
  to: 'rgba(9,42,49,.96)',
  line: 'rgba(56,245,209,.22)',
  text: '#eaf8f9',
};

function BG() {
  return (
    <Box aria-hidden sx={{
      position:'absolute', inset:0, pointerEvents:'none',
      background: `
        radial-gradient(1200px 800px at 70% 10%, rgba(56,245,209,.14), transparent 60%),
        radial-gradient(900px 700px at 25% 80%, rgba(14,165,233,.16), transparent 55%),
        radial-gradient(1600px 1200px at 50% 50%, #0b2c32, #0a2a31 65%, #0a2730 100%)
      `,
      filter:'saturate(1.05)'
    }}/>
  );
}

function Card({title,desc}:{title:string;desc:string}) {
  return (
    <Paper elevation={0} sx={{
      p:2.5, borderRadius:3, color:P.text,
      background:`linear-gradient(180deg, ${P.from}, ${P.to})`,
      border:`1px solid ${P.line}`, height:'100%'
    }}>
      <Stack direction="row" spacing={1.25} alignItems="flex-start">
        <CheckRoundedIcon sx={{ color:'#82ffd8' }}/>
        <Box>
          <Typography sx={{ fontWeight:800, mb:.5 }}>{title}</Typography>
          <Typography sx={{ opacity:.9 }}>{desc}</Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

export default function HowItWorks() {
  const t = useTranslations('howitworks');
  return (
    <Box sx={{ position:'relative', minHeight:'100svh', backgroundColor:P.base, color:P.text }}>
      <BG />
      <Container sx={{ py:{ xs:6, md:10 } }}>
        <Typography variant="h3" sx={{ fontWeight:900, mb:2, textAlign:'center' }}>
          {t('title')}
        </Typography>
        <Typography sx={{ opacity:.9, textAlign:'center', mb:5 }}>
          {t('subtitle')}
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}><Card title={t('s1t')} desc={t('s1d')} /></Grid>
          <Grid item xs={12} md={4}><Card title={t('s2t')} desc={t('s2d')} /></Grid>
          <Grid item xs={12} md={4}><Card title={t('s3t')} desc={t('s3d')} /></Grid>
        </Grid>
      </Container>
    </Box>
  );
}
