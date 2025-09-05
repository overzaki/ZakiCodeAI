'use client';

import React from 'react';
import Image from 'next/image';
import { Box, Typography, Stack, Grid, IconButton } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useSettingsContext } from '@/components/settings';
import { ImagesSrc } from '@/constants/imagesSrc';
import Iconify from '@/components/iconify';

const sectionImages = [ImagesSrc.magicpen, ImagesSrc.palette, ImagesSrc.rocket];

const items = [
  {
    icon: sectionImages[0],
    title: 'Write Your Idea',
    text: 'Write Your Idea Desc',
  },
  {
    icon: sectionImages[1],
    title: 'Customize It Visually',
    text: 'Customize It Visually Desc',
  },
  {
    icon: sectionImages[2],
    title: 'Launch Or Export Code',
    text: 'Launch Or Export Code Desc',
  },
];

const HowItWorksSection = () => {
  const t = useTranslations();
  const { themeDirection } = useSettingsContext();

  return (
    <Stack
      id="howItWorks"
      alignItems="center"
      sx={{
        py: 8,
        px: 2,
        maxWidth: '1200px',
        mx: 'auto',
      }}
    >
      {/* Section Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography
          component="h2"
          sx={{
            color: 'text.primary',
            mb: 2,
            opacity: 0.95,
            fontSize: { xs: '2rem', md: '2.8rem' },
            fontWeight: 700,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 1.5,
            flexWrap: 'wrap',
          }}
        >
          {t('HowZakiCodeWorks_1')}{' '}
          <Box
            sx={{
              color: 'primary.main',
              width: 65,
              height: 55,
              position: 'relative',
            }}
          >
            <Image
              src={ImagesSrc.Logo}
              alt={t('zakicode')}
              // width={65}
              // height={55}
              fill
            />
          </Box>{' '}
          {t('HowZakiCodeWorks_2')}
        </Typography>
      </Box>

      {/* Cards */}
      <Grid container spacing={2} sx={{ width: '100%' }}>
        {items.map((it, idx) => (
          <Grid item xs={12} md={4} key={it.title}>
            <Box
              sx={{
                bgcolor: 'background.paper',
                borderRadius: 1.5,
                p: 3,
                height: '100%',
                position: 'relative',
                transition: 'transform 200ms ease, box-shadow 200ms ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
                },
              }}
            >
              {/* top-right icon */}
              <IconButton
                size="small"
                sx={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  width: 40,
                  height: 40,
                }}
              >
                <Iconify
                  icon={
                    themeDirection === 'rtl'
                      ? 'icon-park-outline:circle-left-up'
                      : 'icon-park-outline:circle-right-up'
                  }
                  sx={{ width: 40, height: 40 }}
                />
              </IconButton>

              {/* icon */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ position: 'relative', width: 72, height: 72 }}>
                  <Image
                    src={it.icon}
                    alt={it.title}
                    fill
                    style={{ objectFit: 'contain' }}
                  />
                </Box>
              </Box>

              <Typography
                sx={{
                  color: 'text.primary',
                  fontWeight: 700,
                  fontSize: '1.6rem',
                  mb: 2,
                }}
              >
                {t(it.title)}
              </Typography>

              <Typography
                sx={{
                  color: 'text.secondary',
                  lineHeight: 1.8,
                  whiteSpace: 'pre-line',
                }}
              >
                {t(it.text)}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
};

export default HowItWorksSection;
