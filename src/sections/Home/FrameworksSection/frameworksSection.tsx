'use client';

import React from 'react';
import { Box, Typography, Stack, Grid } from '@mui/material';
import Iconify from '@/components/iconify';
import { useTranslations } from 'next-intl';
import { useSettingsContext } from '@/components/settings';
import Image from 'next/image';
import { ImagesSrc } from '@/constants/imagesSrc';
import SvgColor from '@/components/svg-color';

const frameworks = [
  ImagesSrc.react,
  ImagesSrc.node,
  ImagesSrc.vite,
  ImagesSrc.nextjs,
];

const FrameworksSection = () => {
  const t = useTranslations();
  const { themeDirection } = useSettingsContext();

  return (
    <Stack
      alignItems="center"
      sx={{
        py: 8,
        px: 2,
        maxWidth: '1200px',
        mx: 'auto',
      }}
    >
      {/* Section Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography
          component="h2"
          sx={{
            color: 'text.primary',
            opacity: 0.8,
            fontSize: '1.5rem',
            textTransform: 'uppercase',
            letterSpacing: '8px',
          }}
        >
          {t('Frameworks We Support')}
        </Typography>
      </Box>
      {/* Steps Container */}
      <Grid
        container
        rowSpacing={{ xs: 5, md: 1 }}
        columnSpacing={{ xs: 5, md: 0 }}
        sx={{
          position: 'relative',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          maxWidth: '700px',
        }}
      >
        {frameworks.map((image) => (
          <Grid
            item
            xs={6}
            md={'auto'}
            key={image}
            sx={{
              position: 'relative',
              height: '100px',
              minWidth: '140px',
            }}
          >
            <SvgColor
              src={image}
              color="text.secondary"
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
};

export default FrameworksSection;
