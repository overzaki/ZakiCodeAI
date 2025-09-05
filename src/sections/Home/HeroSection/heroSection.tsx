'use client';

import React, { useEffect, useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import HeroSectionAnimation from '@/sections/Home/HeroSection/heroSectionAnimation';
import { useTranslations } from 'next-intl';
import { useSettingsContext } from '@/components/settings';
import { ImagesSrc } from '@/constants/imagesSrc';
import { supabase } from '@/lib/supabaseClient';

type HeroRow = {
  name: string | null;
  screenshot_url: string | null;
  meta: Record<string, any> | null;
};

const HeroSection: React.FC = () => {
  const t = useTranslations();
  const { themeDirection } = useSettingsContext();

  const [hero, setHero] = useState<{
    title: string;
    subtitle: string;
    bg: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data, error } = await supabase
        .from('templates')
        .select('name, screenshot_url, meta')
        .eq('category', 'hero')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle<HeroRow>();

      if (cancelled) return;

      if (error) {
        console.error('[HeroSection] load error:', error);
        setHero(null);
        return;
      }

      if (data) {
        const meta = data.meta ?? {};
        setHero({
          title: (meta.title as string) ?? data.name ?? '',
          subtitle: (meta.subtitle as string) ?? '',
          // نأخذ الخلفية من meta.bg_url وإن لم توجد من screenshot_url كخطة بديلة
          bg:
            (meta.bg_url as string) ??
            (data.screenshot_url as string) ??
            ImagesSrc.HeroSectionBackgroundImage,
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const title =
    hero?.title || t('What do you want to build today?');
  const subtitle =
    hero?.subtitle ||
    t('Design websites, mobile apps, or backend services with zero code');
  const bg = hero?.bg || ImagesSrc.HeroSectionBackgroundImage;

  return (
    <Box
      sx={{
        margin: { xs: '20px 0 30px 0', md: '30px 0 80px 0' },
        background: `url(${bg}) no-repeat center / cover`,
        backgroundSize: '1300px auto',
        backdropFilter: 'blur(1px)',
      }}
    >
      <HeroSectionAnimation>
        <Stack direction="column" spacing={1}>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: {
                lg: '3.5rem',
                md: '2.75rem',
                xs: '1.875rem',
                sm: '2.5rem',
              },
            }}
          >
            {title}
          </Typography>

          <Typography color="text.secondary" fontSize="1.2rem">
            {subtitle}
          </Typography>
        </Stack>
      </HeroSectionAnimation>
    </Box>
  );
};

export default HeroSection;
