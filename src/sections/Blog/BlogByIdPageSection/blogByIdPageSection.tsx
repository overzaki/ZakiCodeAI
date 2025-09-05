'use client';

import React from 'react';
import Image from 'next/image';
import {
  Box,
  Typography,
  Stack,
  Grid,
  Paper,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  useMediaQuery,
  Divider,
  Button,
  LinearProgress,
  Alert,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useSettingsContext } from '@/components/settings';
import { ImagesSrc } from '@/constants/imagesSrc';
import { Link } from '@/i18n/routing';
import Iconify from '@/components/iconify';
import { fDate } from '@/utils/format-time';
import ColorizedLabel from '@/shared-components/ColorizedLabel/colorizedLabel';
import { supabase } from '@/lib/supabaseClient';
import { usePathname } from 'next/navigation';

/** ================= Helpers ================= */
type DBPost = {
  id: string;
  slug: string;
  title: string;
  content: string;          // Markdown أو نص عادي
  cover_url: string | null;
  status: 'draft' | 'published' | 'archived';
  published_at: string | null;
  created_at: string | null;
};

type UIBlock =
  | { type: 'paragraph'; value: string }
  | { type: 'heading'; value: string; level?: 2 }
  | { type: 'image'; value?: string; src?: string; alt?: string }
  | { type: 'table'; value?: string; data: string[][] };

type UIArticle = {
  id: string;
  slug: string;
  title: string;
  publishedDate: string;
  category?: string;
  readTime: string;
  tags?: string[];
  summaryPoints?: string[];
  heroMedia: { type: 'image'; src: string; alt: string };
  content: UIBlock[];
  relatedArticles: Array<{
    id: string;
    slug: string;
    title: string;
    category?: string;
    description?: string;
    date: string;
    image?: string | null;
  }>;
};

/** حوّل نص المحتوى إلى بلوكات بسيطة (فقرات وعناوين) */
function parseContentToBlocks(raw: string): UIBlock[] {
  if (!raw) return [];
  const lines = raw.replace(/\r\n/g, '\n').split('\n\n');
  const blocks: UIBlock[] = [];
  for (const chunk of lines) {
    const trimmed = chunk.trim();
    if (!trimmed) continue;
    if (/^##\s+/.test(trimmed)) {
      blocks.push({ type: 'heading', value: trimmed.replace(/^##\s+/, ''), level: 2 });
    } else if (/^#\s+/.test(trimmed)) {
      blocks.push({ type: 'heading', value: trimmed.replace(/^#\s+/, ''), level: 2 });
    } else {
      blocks.push({ type: 'paragraph', value: trimmed });
    }
  }
  return blocks;
}

/** احسب وقت القراءة (كلمات/دقيقة ≈ 200) */
function computeReadTime(text: string): string {
  const words = (text || '').trim().split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.ceil(words / 200));
  return `${mins} min read`;
}

/** ملخص قصير من النص للمقالات ذات الصلة */
function snippet(text: string, n = 160): string {
  const s = (text || '').replace(/\s+/g, ' ').trim();
  return s.length > n ? s.slice(0, n) + '…' : s;
}

/** =================== API Hooks =================== */
function useSlugFromPath() {
  const pathname = usePathname();
  return React.useMemo(() => {
    const parts = (pathname || '').split('?')[0].split('/').filter(Boolean);
    // آخر جزء هو الـ slug (مع مسارات i18n)
    return parts[parts.length - 1] || '';
  }, [pathname]);
}

function useBlogPost(slug: string) {
  const [data, setData] = React.useState<UIArticle | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let alive = true;
    if (!slug) return;

    (async () => {
      setLoading(true);
      setError(null);

      const { data: row, error } = await supabase
        .from('blog_posts')
        .select('id, slug, title, content, cover_url, status, published_at, created_at')
        .eq('slug', slug)
        .eq('status', 'published')
        .single<DBPost>();

      if (!alive) return;

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      if (!row) {
        setError('Post not found');
        setLoading(false);
        return;
      }

      const publishedDate = row.published_at || row.created_at || new Date().toISOString();
      const readTime = computeReadTime(row.content || '');

      // related
      const { data: rel } = await supabase
        .from('blog_posts')
        .select('id, slug, title, content, cover_url, published_at, created_at')
        .eq('status', 'published')
        .neq('id', row.id)
        .order('published_at', { ascending: false, nullsFirst: false })
        .limit(2);

      const related = (rel || []).map((r) => ({
        id: String(r.id),
        slug: r.slug,
        title: r.title,
        category: 'blog',
        description: snippet((r as any).content || ''),
        date: (r as any).published_at || (r as any).created_at || new Date().toISOString(),
        image: (r as any).cover_url || null,
      }));

      const ui: UIArticle = {
        id: String(row.id),
        slug: row.slug,
        title: row.title,
        publishedDate,
        category: 'blog',
        readTime,
        tags: [], // إن أردتها من DB أضف عمود tags[] لاحقًا
        summaryPoints: [], // اختياري
        heroMedia: {
          type: 'image',
          src: row.cover_url || ImagesSrc.template1,
          alt: row.title,
        },
        content: parseContentToBlocks(row.content || ''),
        relatedArticles: related,
      };

      setData(ui);
      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [slug]);

  return { data, loading, error };
}

/** =================== UI =================== */
const BlogByIdPageSection = () => {
  const t = useTranslations();
  const { themeDirection } = useSettingsContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const slug = useSlugFromPath();
  const { data: post, loading, error } = useBlogPost(slug);

  const renderContent = (content: UIBlock) => {
    switch (content.type) {
      case 'paragraph':
        return (
          <Typography
            sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '1.1rem',
              lineHeight: 1.7,
              mb: 3,
            }}
          >
            {content.value}
          </Typography>
        );

      case 'heading':
        return (
          <Typography
            variant={`h${content.level || 2}` as any}
            sx={{
              color: 'white',
              fontWeight: 600,
              mb: 2,
              mt: 4,
              fontSize: content.level === 2 ? '1.75rem' : '1.5rem',
            }}
          >
            {content.value}
          </Typography>
        );

      case 'image':
        return (
          <Box sx={{ my: 4 }}>
            <Box
              sx={{
                width: '100%',
                height: 300,
                borderRadius: 2,
                overflow: 'hidden',
                position: 'relative',
                mb: 2,
              }}
            >
              <Image
                src={content.src || ImagesSrc.template1}
                alt={content.alt || content.value || ''}
                fill
                style={{ objectFit: 'cover' }}
              />
            </Box>
            {content.value && (
              <Typography
                sx={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '0.875rem',
                  textAlign: 'center',
                  fontStyle: 'italic',
                }}
              >
                {content.value}
              </Typography>
            )}
          </Box>
        );

      case 'table':
        return (
          <Box sx={{ my: 4 }}>
            <TableContainer component={Paper} sx={{ bgcolor: 'transparent' }}>
              <Table>
                <TableHead sx={{ bgcolor: 'transparent' }}>
                  <TableRow sx={{ bgcolor: 'transparent' }}>
                    {content.data?.[0]?.map((header: string, index: number) => (
                      <TableCell
                        key={index}
                        sx={{
                          bgcolor: 'transparent',
                          color: 'white',
                          fontWeight: 600,
                          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        {header}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {content.data?.slice(1).map((row: string[], rowIndex: number) => (
                    <TableRow key={rowIndex}>
                      {row.map((cell: string, cellIndex: number) => (
                        <TableCell
                          key={cellIndex}
                          sx={{
                            color: 'rgba(255, 255, 255, 0.8)',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                          }}
                        >
                          {cell}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '50vh', display: 'grid', placeItems: 'center', p: 4 }}>
        <LinearProgress sx={{ width: 360, maxWidth: '90vw' }} />
      </Box>
    );
  }

  if (error || !post) {
    return (
      <Box sx={{ minHeight: '50vh', display: 'grid', placeItems: 'center', p: 4 }}>
        <Alert severity="error">{error || 'Post not found'}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', py: { xs: 4, md: 6 }, px: { xs: 2, md: 4 } }}>
      <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
        {/* Breadcrumbs */}
        <Box sx={{ mb: 4 }}>
          <Link href="/blog" style={{ textDecoration: 'none' }}>
            <Typography
              sx={{
                fontSize: '0.875rem',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              <Iconify
                icon={useSettingsContext().themeDirection === 'rtl' ? 'mingcute:right-fill' : 'mingcute:left-fill'}
                sx={{ mr: 1, fontSize: '1rem' }}
              />
              {t('All Posts')}
            </Typography>
          </Link>
        </Box>

        {/* Publication Info */}
        <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem', mb: 2 }}>
          Published {fDate(post.publishedDate)} in {post.category || 'blog'}
        </Typography>

        <Grid container spacing={4}>
          {/* Main */}
          <Grid item xs={12} lg={8}>
            <Typography
              variant="h1"
              sx={{
                color: 'white',
                fontWeight: 700,
                fontSize: { xs: '2rem', md: '3rem' },
                lineHeight: 1.2,
                mb: 4,
              }}
            >
              {post.title}
            </Typography>

            {/* Hero */}
            <Box sx={{ mb: 4 }}>
              <Box
                sx={{
                  width: '100%',
                  height: 300,
                  borderRadius: 2,
                  overflow: 'hidden',
                  position: 'relative',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <Image
                  src={post.heroMedia.src || ImagesSrc.template1}
                  alt={post.title}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </Box>
            </Box>

            {/* Content */}
            <Box>
              {post.content.map((content, index) => (
                <Box key={index}>{renderContent(content)}</Box>
              ))}
            </Box>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} lg={4}>
            <Box sx={{ position: 'sticky', top: 100 }}>
              <Paper elevation={0} sx={{ bgcolor: 'transparent', p: 3, mb: 3 }}>
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem', mb: 2 }}>
                  {post.readTime}
                </Typography>

                <Divider sx={{ width: '50%' }} />

                {/* Tags (اختياري) */}
                {!!post.tags?.length && (
                  <Stack direction="row" spacing={1} sx={{ my: 3 }}>
                    {post.tags.map((tag, i) => (
                      <Typography key={i} color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                        {tag}
                      </Typography>
                    ))}
                  </Stack>
                )}

                {/* Summary points (اختياري) */}
                {!!post.summaryPoints?.length && (
                  <Stack direction="row" flexWrap="wrap" sx={{ color: 'text.secondary' }}>
                    {post.summaryPoints.map((point, i) => (i ? `, ${point}` : point))}
                  </Stack>
                )}
              </Paper>

              <Divider sx={{ width: '50%' }} />

              {/* Share */}
              <Paper elevation={0} sx={{ bgcolor: 'transparent', p: 3 }}>
                <Typography sx={{ color: 'white', fontWeight: 600, fontSize: '0.875rem', mb: 2 }}>
                  {t('Share this')}
                </Typography>
                <Stack direction="row" spacing={1}>
                  <IconButton sx={{ color: 'rgba(255, 255, 255, 0.7)', '&:hover': { color: '#00d4aa' } }}>
                    <Iconify icon="ri:twitter-x-line" />
                  </IconButton>
                  <IconButton sx={{ color: 'rgba(255, 255, 255, 0.7)', '&:hover': { color: '#00d4aa' } }}>
                    <Iconify icon="ri:reddit-line" />
                  </IconButton>
                </Stack>
              </Paper>
            </Box>
          </Grid>
        </Grid>

        {/* Related */}
        {!!post.relatedArticles.length && (
          <Box sx={{ mt: 8 }}>
            <Typography variant="h3" sx={{ color: 'white', fontWeight: 600, mb: 4, fontSize: '1.75rem' }}>
              Related articles
            </Typography>

            <Grid container spacing={3}>
              {post.relatedArticles.map((rp) => (
                <Grid item xs={12} sm={6} key={rp.id}>
                  <Link href={`/blog/${rp.slug}`} style={{ textDecoration: 'none' }}>
                    <Paper
                      elevation={0}
                      sx={{
                        bgcolor: 'transparent',
                        borderRadius: 3,
                        backdropFilter: 'blur(10px)',
                        height: '100%',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 32px rgba(0,0,0,.3)' },
                      }}
                    >
                      <Box sx={{ p: 1 }}>
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
                            src={rp.image || ImagesSrc.Logo}
                            alt={rp.title}
                            fill
                            style={{ objectFit: 'cover' }}
                          />
                        </Box>

                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
                          {rp.category || 'blog'}
                        </Typography>

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
                          {rp.title}
                        </Typography>

                        {rp.description && (
                          <Typography
                            sx={{
                              color: 'rgba(255, 255, 255, 0.7)',
                              fontSize: '0.875rem',
                              lineHeight: 1.5,
                              mb: 2,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {rp.description}
                          </Typography>
                        )}

                        <Typography sx={{ color: '#00d4aa', fontSize: '0.875rem', fontWeight: 500 }}>
                          {fDate(rp.date)}
                        </Typography>
                      </Box>
                    </Paper>
                  </Link>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* CTA */}
        <Box
          sx={{
            mt: 8,
            background: 'linear-gradient(135deg,rgba(0, 212, 170, 0.4) 0%,rgba(0, 180, 216, 0.4) 100%)',
            borderRadius: 1,
            p: { xs: 4, md: 6 },
            textAlign: 'center',
          }}
        >
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, fontSize: { xs: '1.5rem', md: '2rem' } }}>
            <ColorizedLabel label="Idea to app in seconds" />
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,.9)', fontSize: '1.1rem', mb: 3 }}>
            Build apps by chatting with an AI.
          </Typography>
          <Link href="/editor" style={{ textDecoration: 'none' }}>
            <Box
              component={Button}
              variant="contained"
              sx={{
                bgcolor: 'black',
                color: 'white',
                border: 'none',
                borderRadius: 1.2,
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all .3s ease',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(0,0,0,.2)' },
              }}
            >
              Start for free
            </Box>
          </Link>
        </Box>
      </Box>
    </Box>
  );
};

export default BlogByIdPageSection;
