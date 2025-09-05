'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Box, Typography, Stack, Grid, Paper, Divider } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useSettingsContext } from '@/components/settings';
import { ImagesSrc } from '@/constants/imagesSrc';
import { Link } from '@/i18n/routing';
import Iconify from '@/components/iconify';
import { fDate } from '@/utils/format-time';
import EditorFieldSection from '@/sections/Home/EditorFieldSection/editorFieldSection';
import HeroSection from '@/sections/Home/HeroSection/heroSection';

const projects = [
  {
    id: 1,
    name: 'Xeowox',
    platform: 'website',
    description:
      'Build beautiful website with AI. Describe your vision and idea Build beautiful website with AI. Describe your vision and idea',
    updatedAt: '2025-01-08T19:38:00.000Z',
    image: null,
    icon: '🎨',
  },
  {
    id: 2,
    name: 'فهرس المنتجات',
    platform: 'website',
    description: 'عرض قائمة المنتجات المتاحة',
    updatedAt: '2025-08-12T19:38:00.000Z',
    image: null,
  },
  {
    id: 3,
    name: 'تفاصيل المنتج',
    platform: 'website',
    description: 'عرض تفاصيل حول منتج معين',
    updatedAt: '2025-08-12T19:38:00.000Z',
    image: null,
  },
  {
    id: 4,
    name: 'عربة التسوق',
    platform: 'website',
    description: 'عرض المنتجات التي تم اختيارها للشراء',
    updatedAt: '2025-08-12T19:38:00.000Z',
    image: null,
  },
  {
    id: 5,
    name: 'إتمام الشراء',
    platform: 'website',
    description: 'صفحة إتمام عملية الشراء',
    updatedAt: '2025-08-12T19:38:00.000Z',
    image: null,
  },
  {
    id: 6,
    name: 'ملف المستخدم',
    platform: 'website',
    description: 'عرض وتعديل معلومات المستخدم',
    updatedAt: '2025-08-12T19:38:00.000Z',
    image: null,
  },
  {
    id: 7,
    name: 'لوحة تحكم المدير',
    platform: 'website',
    description: 'إدارة إعدادات المتجر والمستخدمين',
    updatedAt: '2025-08-12T19:38:00.000Z',
    image: null,
  },
];

const ProjectsPageSection = () => {
  const t = useTranslations();
  const { themeDirection } = useSettingsContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

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
      <Box sx={{ width: '100%', textAlign: 'center', mb: 4, zIndex: 1 }}>
        {/* Editor Field Section */}
        <HeroSection />
        <EditorFieldSection />

        {/* Projects filters / title */}
        {/* My Recent App Section */}
        <Box sx={{ mt: 8, mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              textAlign: 'start',
              color: 'white',
              fontWeight: 700,
              mb: 1,
              fontSize: { xs: '1.5rem', md: '1.75rem' },
            }}
          >
            {t('My Recent Apps')}
          </Typography>
          <Box
            sx={{
              width: '100px',
              height: '5px',
              background: 'linear-gradient(90deg, #00d4aa, #00b4d8)',
              borderRadius: '2px',
              mb: 3,
            }}
          />
        </Box>

        {/* Projects filters / title */}
        {/* My Recent App Section */}
        {/* <Box sx={{ mb: 4 }}>
            <Typography
              variant="h4"
              sx={{
                color: 'white',
                fontWeight: 700,
                mb: 1,
                fontSize: { xs: '1.5rem', md: '1.75rem' },
              }}
            >
              My Recent Apps
            </Typography>
            <Box
              sx={{
                width: '60px',
                height: '3px',
                background: 'linear-gradient(90deg, #00d4aa, #00b4d8)',
                borderRadius: '2px',
                mb: 3,
              }}
            />
          </Box> */}

        {/* Projects Grid */}
        <Grid container spacing={3} sx={{ width: '100%' }}>
          {projects?.map((item, idx) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Paper
                elevation={0}
                sx={{
                  bgcolor: 'background.paper',
                  borderRadius: 3,
                  backdropFilter: 'blur(10px)',
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  },
                }}
              >
                <Stack sx={{ height: '100%' }}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={2}
                    sx={{ px: 2.5, pt: 2.5 }}
                  >
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 1.5,
                        bgcolor: 'action.disabledBackground',
                        position: 'relative',
                      }}
                    >
                      <Image
                        src={item.image || ImagesSrc.Logo}
                        alt={item.name}
                        fill
                        style={{ objectFit: 'cover' }}
                        priority={idx < 3}
                      />
                    </Box>
                    {/* <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      background:
                        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      fontWeight: 600,
                      color: 'white',
                    }}
                  >
                    {item.icon}
                  </Box> */}
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        sx={{
                          textAlign: 'start',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '1rem',
                          mb: 0.5,
                        }}
                      >
                        {item.name}
                      </Typography>
                    </Box>
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  <Typography
                    sx={{
                      textAlign: 'start',
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '0.875rem',
                      lineHeight: 1.5,
                      mb: 2,
                      px: 2.5,
                    }}
                  >
                    {item.description}
                  </Typography>

                  <Stack mt="auto" spacing={1}>
                    <Divider sx={{ my: 1 }} />
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ px: 2.5, pb: 2.5 }}
                    >
                      <Iconify
                        icon="mdi:clock-outline"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.5)',
                          fontSize: '1rem',
                        }}
                      />
                      <Typography
                        sx={{
                          color: 'rgba(255, 255, 255, 0.5)',
                          fontSize: '0.75rem',
                        }}
                      >
                        Updated {fDate(item.updatedAt)}
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Stack>
  );
};

export default ProjectsPageSection;
