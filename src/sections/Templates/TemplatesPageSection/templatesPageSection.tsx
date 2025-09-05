'use client';

import React, { useMemo, useState } from 'react';
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
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useSettingsContext } from '@/components/settings';
import { ImagesSrc } from '@/constants/imagesSrc';
import { Link } from '@/i18n/routing';
import Iconify from '@/components/iconify';

const templatesImages = [
  ImagesSrc.template1,
  ImagesSrc.template2,
  ImagesSrc.template9,
  ImagesSrc.template3,
  ImagesSrc.template4,
  ImagesSrc.template5,
  ImagesSrc.template6,
  ImagesSrc.template7,
  ImagesSrc.template8,
  ImagesSrc.template9,
  ImagesSrc.template10,
  ImagesSrc.template11,
];

const CATEGORIES = [
  'Discover',
  'HR System',
  'B2B App',
  'Websites',
  'Personal',
  'Internal Tools',
] as const;

type Category = (typeof CATEGORIES)[number];

type TemplateItem = {
  id: string;
  src: string;
  title: string;
  year: string;
  type: 'Website' | 'App' | 'Dashboard';
  category: Category;
};

const buildItems = (): TemplateItem[] =>
  templatesImages.map((src, index) => ({
    id: `template-${index}`,
    src,
    title: 'Plus-Robot-Template',
    year: '2024 Remix',
    type: index % 3 === 1 ? 'App' : index % 2 === 1 ? 'Dashboard' : 'Website',
    category: CATEGORIES[index % CATEGORIES.length],
  }));

const TemplatesPageSection = () => {
  const t = useTranslations();
  const { themeDirection } = useSettingsContext();
  const [activeCategory, setActiveCategory] = useState<Category>('Discover');

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<
    'All' | 'Website' | 'App' | 'Dashboard'
  >('All');

  const items = useMemo(() => buildItems(), []);

  const filtered = useMemo(() => {
    let list = items;
    if (activeCategory !== 'Discover') {
      list = list.filter((i) => i.category === activeCategory);
    }
    if (typeFilter !== 'All') {
      list = list.filter((i) => i.type === typeFilter);
    }
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((i) =>
        [i.title, i.year, i.type, i.category]
          .join(' ')
          .toLowerCase()
          .includes(q),
      );
    }
    return list;
  }, [activeCategory, items, searchQuery, typeFilter]);

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
        <Stack
          direction={'column'}
          spacing={1}
          sx={{ textAlign: 'start', mb: 4 }}
        >
          <Typography
            color="text.primary"
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
            {/* Build Apps Faster, <br /> */}
            {t('App Templates')}
          </Typography>
          <Typography
            color="text.primary"
            fontSize={'1.2rem'}
            sx={{
              opacity: 0.8,
            }}
          >
            {t(
              'Explore A Curated Collection Of Applications Built By Our Community',
            )}{' '}
            <Typography
              component={Link}
              href="#"
              color={'primary.main'}
              fontSize={'1.2rem'}
              sx={{
                textDecoration: 'underline',
              }}
            >
              {t('Learn More')}
            </Typography>
          </Typography>
        </Stack>

        {/* Category Filter */}
        <Stack
          direction="row"
          spacing={2.5}
          sx={{
            flexWrap: 'wrap',
            mb: 2,
          }}
        >
          {CATEGORIES.map((cat) => (
            <Button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              variant="outlined"
              className={activeCategory === cat ? 'active' : ''}
              color={activeCategory === cat ? 'primary' : 'inherit'}
              sx={{
                color:
                  activeCategory === cat ? 'primary.main' : 'text.secondary',
                bgcolor: (theme) =>
                  activeCategory === cat
                    ? alpha(theme.palette.primary.main, 0.1)
                    : alpha(theme.palette.text.secondary, 0.1),
                borderRadius: 999,
                fontWeight: 500,
                px: 2,
              }}
            >
              {t(cat)}
            </Button>
          ))}
        </Stack>

        {/* Search + Type Filter */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          <TextField
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('Search templates') as string}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="mingcute:search-line" />
                </InputAdornment>
              ),
              endAdornment: searchQuery ? (
                <InputAdornment position="end">
                  <Button size="small" onClick={() => setSearchQuery('')}>
                    {t('Clear')}
                  </Button>
                </InputAdornment>
              ) : undefined,
            }}
            sx={{
              '& .MuiInputBase-root': {
                borderRadius: 2,
                bgcolor: (theme) => alpha(theme.palette.text.secondary, 0.08),
              },
            }}
          />

          <FormControl sx={{ minWidth: 160 }}>
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              displayEmpty
              sx={{
                borderRadius: 2,
                bgcolor: (theme) => alpha(theme.palette.text.secondary, 0.08),
              }}
              renderValue={(val) => (val ? t(String(val)) : t('All'))}
            >
              {(['All', 'Website', 'App', 'Dashboard'] as const).map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {t(opt)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Box>

      {/* Templates Grid */}
      <Grid container spacing={2.5} sx={{ width: '100%' }}>
        {filtered.map((item, idx) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Stack
              sx={{
                // bgcolor: '#0D3137',
                overflow: 'hidden',
                height: '100%',
                flexGrow: 1,
                // border: '1px solid rgba(255,255,255,0.06)',
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
                    sx={{
                      bgcolor: 'background.paper',
                      p: 0.8,
                    }}
                  />
                  <Stack spacing={0.5}>
                    <Typography sx={{ color: 'text.primary', fontWeight: 600 }}>
                      {item.title}
                    </Typography>
                    <Typography sx={{ color: 'text.secondary', fontSize: 12 }}>
                      {item.year}
                    </Typography>
                  </Stack>
                  <Chip
                    size="small"
                    label={t(item.type)}
                    sx={{
                      borderRadius: 0.8,
                      fontWeight: 600,
                      marginInlineStart: 'auto',
                      background: (theme) =>
                        `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.info.main})`,
                      color: 'primray.contrastText',
                    }}
                  />
                </Stack>

                {/* Actions */}
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{ pt: 1.5, mt: 'auto' }}
                >
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
    </Stack>
  );
};

export default TemplatesPageSection;
