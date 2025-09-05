'use client';

import * as React from 'react';
import { Box, Container, Grid, Paper, Stack, Typography, Chip, TextField, MenuItem, Select } from '@mui/material';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

const P = { base:'#0b2c32', from:'rgba(12,49,56,.96)', to:'rgba(9,42,49,.96)', line:'rgba(56,245,209,.22)', text:'#eaf8f9' };

function BG() { return (
  <Box aria-hidden sx={{
    position:'absolute', inset:0, pointerEvents:'none',
    background: `
      radial-gradient(1200px 800px at 70% 10%, rgba(56,245,209,.14), transparent 60%),
      radial-gradient(900px 700px at 25% 80%, rgba(14,165,233,.16), transparent 55%),
      radial-gradient(1600px 1200px at 50% 50%, #0b2c32, #0a2a31 65%, #0a2730 100%)
    `
  }}/>
);}

function Card({title}:{title:string}) {
  return (
    <Paper component={Link as any} href="/templates" elevation={0} sx={{
      p:2, borderRadius:3, textDecoration:'none', color:P.text,
      background:`linear-gradient(180deg, ${P.from}, ${P.to})`, border:`1px solid ${P.line}`, height:'100%',
      '&:hover':{ filter:'brightness(1.04)'}
    }}>
      <Box sx={{ height:120, borderRadius:2, bgcolor:'rgba(255,255,255,.06)', mb:1 }} />
      <Typography sx={{ fontWeight:800 }}>{title}</Typography>
      <Typography sx={{ opacity:.85, fontSize:13 }}>Public project • 2.1k views</Typography>
    </Paper>
  );
}

export default function Discover(){
  const t = useTranslations('discover');
  const [tag, setTag] = React.useState('all');

  return (
    <Box sx={{ position:'relative', minHeight:'100svh', color:P.text, backgroundColor:P.base }}>
      <BG />
      <Container sx={{ py:{ xs:6, md:8 } }}>
        <Typography variant="h4" sx={{ fontWeight:900, mb:2 }}>{t('title')}</Typography>
        <Typography sx={{ opacity:.9, mb:3 }}>{t('subtitle')}</Typography>

        <Stack direction={{ xs:'column', md:'row' }} spacing={1.25} sx={{ mb:2 }}>
          <Chip label={t('all')} color={tag==='all' ? 'primary' : 'default'} onClick={()=>setTag('all')} />
          <Chip label="Website" color={tag==='site' ? 'primary' : 'default'} onClick={()=>setTag('site')} />
          <Chip label="Dashboard" color={tag==='dash' ? 'primary' : 'default'} onClick={()=>setTag('dash')} />
          <Chip label="Mobile App" color={tag==='app' ? 'primary' : 'default'} onClick={()=>setTag('app')} />
          <Box flexGrow={1}/>
          <TextField size="small" placeholder={t('search')} sx={{ minWidth:220 }}/>
          <Select size="small" value="popular" sx={{ minWidth:140 }}>
            <MenuItem value="popular">{t('popular')}</MenuItem>
            <MenuItem value="new">{t('new')}</MenuItem>
          </Select>
        </Stack>

        <Grid container spacing={2}>
          {Array.from({length:9}).map((_,i)=>(
            <Grid key={i} item xs={12} sm={6} md={4}>
              <Card title={`Project #${i+1}`} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
