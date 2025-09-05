'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Box,
  Typography,
  Stack,
  Grid,
  Button,
  Chip,
  Avatar,
  alpha,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useSettingsContext } from '@/components/settings';
import { ImagesSrc } from '@/constants/imagesSrc';
import Iconify from '@/components/iconify';
import { supabase } from '@/lib/supabaseClient';

type TemplateRow = {
  id: string;
  name: string | null;
  category: string | null;
  screenshot_url: string | null;
  meta: {
    year?: string | null;
    type?: 'Website' | 'App' | 'Dashboard' | string | null;
  } | null;
};

type TemplateItem = {
  id: string;
  src: string;
  title: string;
  year: string;
  type: string;        // نعرضه كما هو، أو ترجم إذا عندك مفاتيح
  category: string;    // للتصفية
};

const TemplatesSection = () => {
  const t = useTranslations();
  const { themeDirection } = useSettingsContext();

  const [items, setItems] = useState<TemplateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('Discover');
  const [visibleCount, setVisibleCount] = useState(9);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      // نقرأ كل القوالب المتاحة للعرض
      const { data, error } = await supabase
        .from('templates')
        .select('id,name,category,screenshot_url,meta')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const mapped: TemplateItem[] = (data as TemplateRow[])
          .filter((r) => !!r.screenshot_url) // لازم صورة للعرض
          .map((r) => ({
            id: r.id,
            src: r.screenshot_url as string,
            title: r.name ?? 'Template',
            year: r.meta?.year ?? '',
            type: r.meta?.type ?? 'Website',
            category: r.category ?? 'Uncategorized',
          }));

        setItems(mapped);
      }
      setLoading(false);
    };

    load();
  }, []);

  // استنتاج التصنيفات من الداتا
  const categories = useMemo(() => {
    const uniq = Array.from(new Set(items.map((i) => i.category))).filter(Boolean) as string[];
    return ['Discover', ...uniq];
  }, [items]);

  const filtered = useMemo(() => {
    const base = activeCategory === 'Discover'
      ? items
      : items.filter((i) => i.category === activeCategory);
    return base.slice(0, visibleCount);
  }, [activeCategory, items, visibleCount]);

  return (
    <Stack
      alignItems="center"
      sx={{ py: 8, px: 2, maxWidth: '1200px', mx: 'auto' }}
    >
      {/* Section Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography
          component="h2"
          sx={{
            color: 'text.primary',
            mb: 2,
            opacity: 0.9,
            fontSize: '3.3rem',
            fontWeight: 700,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 1.5,
            flexWrap: 'wrap',
          }}
        >
          {t('Try A Template')}{' '}
          <Box sx={{ color: 'primary.main', width: 65, height: 55, position: 'relative' }}>
            <Image src={ImagesSrc.Logo} alt={t('zakicode')} fill />
          </Box>{' '}
          {t('Fully Editable')}
        </Typography>

        {/* Category Filter */}
        <Stack
          direction="row"
          spacing={2.5}
          sx={{ flexWrap: 'wrap', justifyContent: 'center', mb: 3 }}
        >
          {categories.map((cat) => (
            <Button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              variant="outlined"
              className={activeCategory === cat ? 'active' : ''}
              color={activeCategory === cat ? 'primary' : 'inherit'}
              sx={{
                color: activeCategory === cat ? 'primary.main' : 'text.secondary',
                bgcolor: (theme) =>
                  activeCategory === cat
                    ? alpha(theme.palette.primary.main, 0.1)
                    : alpha(theme.palette.text.secondary, 0.1),
                borderRadius: 999,
                fontWeight: 500,
                px: 2,
              }}
            >
              {cat === 'Discover' ? t('Discover') : cat}
            </Button>
          ))}
        </Stack>
      </Box>

      {/* Loading / Empty states */}
      {loading && (
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {t('Loading')}...
        </Typography>
      )}
      {!loading && items.length === 0 && (
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {t('No data')}
        </Typography>
      )}

      {/* Templates Grid */}
      <Grid container spacing={2.5} sx={{ width: '100%' }}>
        {filtered.map((item, idx) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Stack
              sx={{
                overflow: 'hidden',
                height: '100%',
                flexGrow: 1,
              }}
            >
              {/* Thumbnail */}
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  pt: '60%',
                  borderRadius: 3,
                  overflow: 'hidden',
                }}
              >
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                  priority={idx < 3}
                />
              </Box>

              {/* Meta */}
              <Stack sx={{ py: 2, height: '100%', flexGrow: 1 }}>
                <Stack direction="row" spacing={1}>
                  <Avatar
                    src={ImagesSrc.Logo}
                    sx={{ bgcolor: 'background.paper', p: 0.8 }}
                  />
                  <Stack spacing={0.5}>
                    <Typography sx={{ color: 'text.primary', fontWeight: 600 }}>
                      {item.title}
                    </Typography>
                    {!!item.year && (
                      <Typography sx={{ color: 'text.secondary', fontSize: 12 }}>
                        {item.year}
                      </Typography>
                    )}
                  </Stack>

                  <Chip
                    size="small"
                    label={item.type}
                    sx={{
                      borderRadius: 0.8,
                      fontWeight: 600,
                      marginInlineStart: 'auto',
                      background: (theme) =>
                        `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.info.main})`,
                      color: 'primary.contrastText',
                    }}
                  />
                </Stack>

                {/* Actions */}
                <Stack direction="row" spacing={1.5} sx={{ pt: 1.5, mt: 'auto' }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="inherit"
                    sx={{
                      borderRadius: 1,
                      bgcolor: 'background.default',
                      color: 'text.primary',
                    }}
                  >
                    {t('Preview')}
                  </Button>
                  <Button
                    fullWidth
                    variant="contained"
                    color="inherit"
                    sx={{ borderRadius: 1 }}
                  >
                    {t('Remix')}
                  </Button>
                </Stack>
              </Stack>
            </Stack>
          </Grid>
        ))}
      </Grid>

      {/* Load More */}
      {!loading && filtered.length < (activeCategory === 'Discover'
        ? items.length
        : items.filter((i) => i.category === activeCategory).length) && (
        <Button
          sx={{
            mt: 4,
            px: 3,
            borderRadius: 999,
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.primary.main})`,
            color: 'primary.contrastText',
            fontSize: '1.3rem',
            fontWeight: 600,
            textTransform: 'none',
            '&:hover': { filter: 'brightness(1.05)' },
          }}
          endIcon={
            <Iconify
              icon={
                themeDirection === 'rtl'
                  ? 'fa6-solid:arrow-left'
                  : 'fa6-solid:arrow-right'
              }
              color="primary.contrastText"
            />
          }
          onClick={() => setVisibleCount((v) => v + 9)}
        >
          {t('Show More')}
        </Button>
      )}
    </Stack>
  );
};

export default TemplatesSection;
