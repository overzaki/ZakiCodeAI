'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Box, Typography, Stack, Grid, Paper, Drawer, IconButton,
  List, ListItem, ListItemButton, ListItemText, useTheme, useMediaQuery,
  LinearProgress, Alert,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useSettingsContext } from '@/components/settings';
import { ImagesSrc } from '@/constants/imagesSrc';
import { Link } from '@/i18n/routing';
import Iconify from '@/components/iconify';
import { fDate } from '@/utils/format-time';
import { supabase } from '@/lib/supabaseClient';

/* ------------------ التصنيفات المعروضة في الشريط الجانبي ------------------ */
const categories = [
  { id: 'latest', label: 'Latest' },
  { id: 'announcements', label: 'Announcements' },
  { id: 'inside-zakicode', label: 'Inside ZakiCode' },
  { id: 'development-101', label: 'Development 101' },
  { id: 'reports', label: 'Reports' },
  { id: 'tutorials', label: 'Tutorials' },
  { id: 'stories', label: 'Stories' },
];

type DBPostBase = {
  id: string;
  slug: string;
  title: string;
  content: string | null;
  cover_url: string | null;
  status: 'draft'|'published'|'archived';
  published_at: string | null;
  created_at: string | null;
};
type DBPostMaybeCat = DBPostBase & { category?: string | null };

type UIPost = {
  id: string;
  slug: string;
  title: string;
  category: string;    // one of categories ids
  description: string; // snippet from content
  date: string;        // ISO
  image: string | null;
};

/* ------------------ Helpers ------------------ */
const snippet = (text: string | null | undefined, n = 180) => {
  const s = (text ?? '').replace(/\s+/g, ' ').trim();
  return s.length > n ? s.slice(0, n) + '…' : s;
};

async function fetchPosts(): Promise<{ posts: UIPost[]; error?: string }> {
  // نحاول أولاً القراءة مع category (إذا العمود موجود)
  let { data, error } = await supabase
    .from('blog_posts')
    .select('id, slug, title, content, cover_url, status, published_at, created_at, category')
    .eq('status', 'published')
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false, nullsFirst: false });

  // fallback لو عمود category غير موجود
  if (error && /column.*category.*does not exist/i.test(error.message)) {
    const res2 = await supabase
      .from('blog_posts')
      .select('id, slug, title, content, cover_url, status, published_at, created_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false, nullsFirst: false });
    data = res2.data as any;
    error = res2.error as any;
  }

  if (error) return { posts: [], error: error.message };

  const rows = (data || []) as DBPostMaybeCat[];
  const posts: UIPost[] = rows.map((r) => ({
    id: String(r.id),
    slug: r.slug,
    title: r.title,
    category: (r.category || 'announcements') as string,
    description: snippet(r.content),
    date: r.published_at || r.created_at || new Date().toISOString(),
    image: r.cover_url || null,
  }));
  return { posts };
}

const BlogPageSection = () => {
  const t = useTranslations();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedCategory, setSelectedCategory] = useState('latest');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const [posts, setPosts] = useState<UIPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const { posts, error } = await fetchPosts();
      if (!alive) return;
      if (error) setErr(error);
      setPosts(posts);
      setLoading(false);
    })();
    return () => { alive = false; };
  }, []);

  const filteredPosts = useMemo(() => {
    if (selectedCategory === 'latest') return posts;
    return posts.filter((p) => p.category === selectedCategory);
  }, [posts, selectedCategory]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (isMobile) setMobileDrawerOpen(false);
  };

  const CategorySidebar = () => (
    <Box sx={{ width: { xs: '100%', md: 240 }, minWidth: { md: 240 }, pr: { md: 3 }, mt: 2 }}>
      <List sx={{ p: 0 }}>
        {categories.map((category) => (
          <ListItem key={category.id} sx={{ p: 0, mb: 0.5 }}>
            <ListItemButton
              onClick={() => handleCategoryChange(category.id)}
              selected={selectedCategory === category.id}
              sx={{
                borderRadius: 1,
                color: selectedCategory === category.id ? '#00d4aa' : 'rgba(255,255,255,.7)',
                '&.Mui-selected': {
                  backgroundColor: 'rgba(0,212,170,.10)',
                  '&:hover': { backgroundColor: 'rgba(0,212,170,.15)' },
                },
                '&:hover': { backgroundColor: 'rgba(255,255,255,.05)' },
              }}
            >
              <ListItemText
                primary={category.label}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: selectedCategory === category.id ? 600 : 400,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', py: { xs: 4, md: 6 }, px: { xs: 2, md: 4 } }}>
      <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
        {/* Mobile Category Toggle */}
        {isMobile && (
          <Box sx={{ mb: 3 }}>
            <IconButton onClick={() => setMobileDrawerOpen(true)} sx={{ color: 'white' }}>
              <Iconify icon="mdi:menu" />
            </IconButton>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,.7)', ml: 1, display: 'inline-block' }}>
              {t('Filter by category')}
            </Typography>
          </Box>
        )}

        {/* Drawer */}
        <Drawer
          anchor="left"
          open={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          PaperProps={{
            sx: { width: 280, background: 'linear-gradient(180deg,#0a1929 0%,#0f2a3d 100%)', border: 'none' },
          }}
        >
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 2 }}>
              {t('Categories')}
            </Typography>
            <CategorySidebar />
          </Box>
        </Drawer>

        {/* Loading / Error */}
        {loading && (
          <Box sx={{ py: 8, display: 'grid', placeItems: 'center' }}>
            <LinearProgress sx={{ width: 360, maxWidth: '90vw' }} />
          </Box>
        )}
        {!!err && !loading && (
          <Box sx={{ py: 6 }}>
            <Alert severity="error">{err}</Alert>
          </Box>
        )}

        {!loading && !err && (
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 3, md: 4 }} sx={{ width: '100%' }}>
            {/* Sidebar */}
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <CategorySidebar />
            </Box>

            {/* Grid */}
            <Box sx={{ flex: 1 }}>
              <Grid container spacing={3}>
                {filteredPosts.map((post) => (
                  <Grid item xs={12} sm={6} key={post.id}>
                    <Link href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
                      <Paper
                        elevation={0}
                        sx={{
                          bgcolor: 'transparent',
                          borderRadius: 3,
                          backdropFilter: 'blur(10px)',
                          height: '100%',
                          transition: 'all .3s ease',
                          cursor: 'pointer',
                          '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 32px rgba(0,0,0,.3)' },
                        }}
                      >
                        <Box sx={{ p: 1 }}>
                          {/* Image */}
                          <Box
                            sx={{
                              width: '100%',
                              height: 200,
                              borderRadius: 2,
                              overflow: 'hidden',
                              mb: 2,
                              position: 'relative',
                            }}
                          >
                            <Image
                              src={post.image || ImagesSrc.Logo}
                              alt={post.title}
                              fill
                              style={{ objectFit: 'cover' }}
                            />
                          </Box>

                          {/* Category */}
                          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
                            {categories.find((c) => c.id === post.category)?.label || post.category}
                          </Typography>

                          {/* Title */}
                          <Typography
                            variant="h6"
                            sx={{
                              color: 'white',
                              fontWeight: 600,
                              mb: 1.5,
                              fontSize: '1.1rem',
                              lineHeight: 1.4,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {post.title}
                          </Typography>

                          {/* Description */}
                          {!!post.description && (
                            <Typography
                              sx={{
                                color: 'rgba(255,255,255,.7)',
                                fontSize: '0.875rem',
                                lineHeight: 1.5,
                                mb: 2,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {post.description}
                            </Typography>
                          )}

                          {/* Date */}
                          <Typography sx={{ color: '#00d4aa', fontSize: '0.875rem', fontWeight: 500 }}>
                            {fDate(post.date)}
                          </Typography>
                        </Box>
                      </Paper>
                    </Link>
                  </Grid>
                ))}
              </Grid>

              {/* Empty state */}
              {filteredPosts.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography sx={{ color: 'rgba(255,255,255,.5)', fontSize: '1.1rem' }}>
                    {t('No posts found in this category')}
                  </Typography>
                </Box>
              )}
            </Box>
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default BlogPageSection;
