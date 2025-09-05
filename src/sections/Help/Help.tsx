'use client';

import * as React from 'react';
import { Box, Container, Grid, Paper, Stack, Typography, Button } from '@mui/material';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

const P = { base:'#0b2c32', from:'rgba(12,49,56,.96)', to:'rgba(9,42,49,.96)', line:'rgba(56,245,209,.22)', text:'#eaf8f9' };

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

function Card({title,desc,href}:{title:string;desc:string;href:string}){
  return (
    <Paper elevation={0} sx={{
      p:2.5, borderRadius:3, height:'100%', color:P.text,
      background:`linear-gradient(180deg, ${P.from}, ${P.to})`, border:`1px solid ${P.line}`
    }}>
      <Stack spacing={1}>
        <Typography sx={{ fontWeight:800 }}>{title}</Typography>
        <Typography sx={{ opacity:.9 }}>{desc}</Typography>
        <Box flexGrow={1}/>
        <Button component={Link as any} href={href} variant="contained"
          sx={{ alignSelf:'flex-start', textTransform:'none', fontWeight:800,
            background:'linear-gradient(90deg,#0EE5F9 0%, #1EFBB8 100%)', color:'#08262b' }}>
          Learn more
        </Button>
      </Stack>
    </Paper>
  );
}

export default function Help(){
  const t = useTranslations('help');
  return (
    <Box sx={{ position:'relative', minHeight:'100svh', backgroundColor:P.base, color:P.text }}>
      <BG />
      <Container sx={{ py:{ xs:6, md:8 } }}>
        <Typography variant="h4" sx={{ fontWeight:900, mb:2 }}>{t('title')}</Typography>
        <Typography sx={{ opacity:.9, mb:3 }}>{t('subtitle')}</Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Card title={t('docs_t')} desc={t('docs_d')} href="/howItWorks" />
          </Grid>
          <Grid item xs={12} md={4}>
            <Card title={t('faq_t')} desc={t('faq_d')} href="/faq" />
          </Grid>
          <Grid item xs={12} md={4}>
            <Card title={t('contact_t')} desc={t('contact_d')} href="/contact-us" />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
