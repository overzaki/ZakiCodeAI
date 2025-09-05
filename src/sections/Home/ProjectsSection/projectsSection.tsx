'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import {
  Box,
  Typography,
  Stack,
  Grid,
  Button,
  Chip,
  Avatar,
  CircularProgress,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useSettingsContext } from '@/components/settings';
import Iconify from '@/components/iconify';
import { ImagesSrc } from '@/constants/imagesSrc';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter as useIntlRouter } from '@/i18n/routing';

type Project = {
  id: string;
  name: string;
  slug: string;
  status: 'draft' | 'active' | 'archived';
  visibility: 'private' | 'public';
  meta: Record<string, any> | null;
  created_at: string;
  updated_at: string;
};

const PAGE_SIZE = 9;

const ProjectsSection: React.FC = () => {
  const t = useTranslations();
  const { themeDirection } = useSettingsContext();
  const router = useIntlRouter();
  const supabase = createClientComponentClient(); // 👈 عميل الكلاينت الرسمي

  const [projects, setProjects] = useState<Project[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // جلب userId ثم المشاريع الخاصة به
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      setLoading(true);

      // 1) الطريقة الآمنة: احصل على السيشن أولاً
      const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
      if (sessionErr) console.warn('getSession error:', sessionErr);
      const uid = session?.user?.id ?? null;
      if (mounted) setUserId(uid);

      // 2) الصفحة الأولى من المشاريع
      await fetchPage(0, uid, true);

      if (mounted) setLoading(false);
    };

    init();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // دالة جلب صفحة من المشاريع (فلترة على owner_id = userId)
  const fetchPage = async (pageIndex: number, uid: string | null, replace = false) => {
    if (!uid) {
      setProjects([]);
      setHasMore(false);
      return;
    }

    const from = pageIndex * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from('projects')
      .select('id,name,slug,status,visibility,meta,created_at,updated_at')
      .eq('owner_id', uid)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('fetch projects error:', error);
      // لو عندك RLS غير مفعّلة أو سياسة ناقصة ستظهر هنا
      return;
    }

    setProjects((prev) => (replace ? (data ?? []) : [...prev, ...(data ?? [])]));
    setHasMore((data?.length ?? 0) === PAGE_SIZE);
    setPage(pageIndex);
  };

  const loadMore = async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    await fetchPage(page + 1, userId, false);
    setLoadingMore(false);
  };

  const title = useMemo(() => t('My Projects'), [t]);

  return (
    <Stack
      alignItems="center"
      sx={{ py: 8, px: 2, maxWidth: '1200px', mx: 'auto' }}
    >
      {/* العنوان */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
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
          {title}{' '}
          <Box sx={{ color: 'primary.main', width: 65, height: 55, position: 'relative' }}>
            <Image src={ImagesSrc.Logo} alt="logo" fill />
          </Box>
        </Typography>

        {!userId && (
          <Typography sx={{ color: 'text.secondary' }}>
            {t('Sign in to see your projects')}
          </Typography>
        )}
      </Box>

      {/* حالة التحميل الأولى */}
      {loading ? (
        <Box sx={{ py: 6, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <CircularProgress size={22} />
          <Typography sx={{ color: 'text.secondary' }}>{t('Loading')}</Typography>
        </Box>
      ) : projects.length === 0 ? (
        // لا توجد مشاريع
        <Stack spacing={2} alignItems="center" sx={{ py: 6 }}>
          <Typography sx={{ color: 'text.secondary' }}>
            {t('No projects yet')}
          </Typography>
          <Button
            variant="contained"
            onClick={() => router.push('/editor')}
            endIcon={
              <Iconify
                icon={themeDirection === 'rtl' ? 'fa6-solid:arrow-left' : 'fa6-solid:arrow-right'}
              />
            }
            sx={{ borderRadius: 1 }}
          >
            {t('Create Project')}
          </Button>
        </Stack>
      ) : (
        <>
          {/* شبكة المشاريع */}
          <Grid container spacing={2.5} sx={{ width: '100%' }}>
            {projects.map((item) => {
              const cover =
                (item.meta && (item.meta.cover_url || item.meta.screenshot_url)) ||
                ImagesSrc.template1;

              const typeLabel =
                (item.meta && (item.meta.type as string)) ||
                (item.status === 'draft' ? 'Draft' : item.status === 'active' ? 'Active' : 'Archived');

              return (
                <Grid item xs={12} sm={6} md={4} key={item.id}>
                  <Stack sx={{ overflow: 'hidden', height: '100%', flexGrow: 1 }}>
                    {/* صورة/غلاف */}
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
                        src={cover}
                        alt={item.name}
                        fill
                        style={{ objectFit: 'cover' }}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                        priority={false}
                      />
                    </Box>

                    {/* الميتاداتا */}
                    <Stack sx={{ py: 2, height: '100%', flexGrow: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar src={ImagesSrc.Logo} sx={{ bgcolor: 'background.paper', p: 0.8 }} />
                        <Stack spacing={0.5}>
                          <Typography sx={{ color: 'text.primary', fontWeight: 600 }}>
                            {item.name}
                          </Typography>
                          <Typography sx={{ color: 'text.secondary', fontSize: 12 }}>
                            {new Date(item.created_at).toLocaleDateString()}
                          </Typography>
                        </Stack>

                        <Chip
                          size="small"
                          label={t(typeLabel)}
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

                      {/* أزرار */}
                      <Stack direction="row" spacing={1.5} sx={{ pt: 1.5, mt: 'auto' }}>
                        <Button
                          fullWidth
                          variant="outlined"
                          color="inherit"
                          sx={{ borderRadius: 1, bgcolor: 'background.default', color: 'text.primary' }}
                          onClick={() => router.push(`/editor?projectId=${item.id}`)} // 👈 توحيد على projectId
                        >
                          {t('Open')}
                        </Button>
                        <Button
                          fullWidth
                          variant="contained"
                          color="inherit"
                          sx={{ borderRadius: 1 }}
                          onClick={() => router.push(`/editor?projectId=${item.id}&mode=edit`)} // 👈
                        >
                          {t('Edit')}
                        </Button>
                      </Stack>
                    </Stack>
                  </Stack>
                </Grid>
              );
            })}
          </Grid>

          {/* Load More */}
          {hasMore && (
            <Button
              onClick={loadMore}
              disabled={loadingMore}
              sx={{
                mt: 4,
                px: 3,
                borderRadius: 999,
                background: (theme) =>
                  `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.primary.main})`,
                color: 'primary.contrastText',
                fontSize: '1.1rem',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': { filter: 'brightness(1.05)' },
              }}
              endIcon={
                loadingMore ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <Iconify
                    icon={themeDirection === 'rtl' ? 'fa6-solid:arrow-left' : 'fa6-solid:arrow-right'}
                    color="primary.contrastText"
                  />
                )
              }
            >
              {loadingMore ? t('Loading') : t('Show More')}
            </Button>
          )}
        </>
      )}
    </Stack>
  );
};

export default ProjectsSection;
