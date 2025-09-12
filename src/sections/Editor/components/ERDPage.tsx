// FILE: src/sections/Editor/components/ERDPage.tsx
'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Box,
  Stack,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Tooltip,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material';
import Iconify from '@/components/iconify';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type Platform = 'website' | 'backend' | 'mobile';

interface ERDPageProps {
  onViewStructure: (type: 'frontend' | 'backend') => void;
  /** اختياري: لو وصل من أبّ أعلى */
  projectId?: string;
}

interface ProjectInfo {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  meta?: any;
}

function isUuid(x?: string | null) {
  return !!x && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(x);
}

const ERDPage: React.FC<ERDPageProps> = ({ onViewStructure, projectId: propProjectId }) => {
  const search = useSearchParams();

  // Get type from URL to auto-redirect
  const urlType = (search.get('type') || 'website').toLowerCase();
  
  // State management
  const [activeId, setActiveId] = useState<string | null>(null);
  const [projectInfo, setProjectInfo] = useState<ProjectInfo | null>(null);
  const [resolvingId, setResolvingId] = useState(true);
  const [webCount, setWebCount] = useState(0);
  const [backendCount, setBackendCount] = useState(0);
  const [mobileCount, setMobileCount] = useState(0);
  const [loadingCounts, setLoadingCounts] = useState(false);
  const [hasAutoRedirected, setHasAutoRedirected] = useState(false);

  // دالة تحسم الـ id وتحمل معلومات المشروع
  const resolveActiveProjectId = useCallback(async () => {
    setResolvingId(true);
    let pid: string | null =
      // 1) من props لو موجود
      propProjectId ||
      // 2) من URL (نقبل project أو projectId أو id أو slug)
      search.get('project') || search.get('projectId') || search.get('id') || search.get('slug') ||
      // 3) من التخزين المحلي لو محفوظ سابقًا
      (typeof window !== 'undefined' ? localStorage.getItem('activeProjectId') : null);

    // لو القيمة من URL كانت slug (مو UUID) نحولها إلى id من projects
    if (pid && !isUuid(pid)) {
      const { data } = await supabase
        .from('projects')
        .select('id, name, slug, created_at, meta')
        .eq('slug', pid)
        .maybeSingle();
      if (data) {
        pid = data.id;
        setProjectInfo(data);
      } else {
        pid = null;
      }
    }

    // لو ما في لسه أو كان UUID، نحمل معلومات المشروع
    if (pid && isUuid(pid)) {
      const { data } = await supabase
        .from('projects')
        .select('id, name, slug, created_at, meta')
        .eq('id', pid)
        .maybeSingle();
      if (data) {
        setProjectInfo(data);
      }
    }

    // لو ما في لسه → خذ أحدث مشروع له صفحات من project_pages
    if (!pid) {
      const { data } = await supabase
        .from('project_pages')
        .select('project_id, projects!inner(id, name, slug, created_at, meta)')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (data?.[0] && data[0].projects) {
        pid = data[0].project_id;
        setProjectInfo(data[0].projects as unknown as ProjectInfo);
      }
    }

    // لو ما في لسه → خذ أحدث مشروع من projects
    if (!pid) {
      const { data } = await supabase
        .from('projects')
        .select('id, name, slug, created_at, meta')
        .order('updated_at', { ascending: false })
        .limit(1);
      
      if (data?.[0]) {
        pid = data[0].id;
        setProjectInfo(data[0]);
      }
    }

    if (pid) {
      setActiveId(pid);
      try { 
        localStorage.setItem('activeProjectId', pid); 
      } catch (e) {
        console.warn('Failed to save to localStorage:', e);
      }
    } else {
      setActiveId(null);
      setProjectInfo(null);
    }
    setResolvingId(false);
  }, [propProjectId, search]);

  useEffect(() => {
    resolveActiveProjectId();
  }, [resolveActiveProjectId]);

  // Auto-redirect based on URL type after project is resolved
  useEffect(() => {
    if (!resolvingId && activeId && !hasAutoRedirected) {
      setHasAutoRedirected(true);
      
      // Map URL type to structure type
      if (urlType === 'website') {
        console.log('Auto-redirecting to frontend structure');
        onViewStructure('frontend');
      } else if (urlType === 'backend' || urlType === 'dashboard') {
        console.log('Auto-redirecting to backend structure');
        onViewStructure('backend');
      } else if (urlType === 'app' || urlType === 'mobile') {
        console.log('Auto-redirecting to frontend structure (mobile app)');
        onViewStructure('frontend'); // Mobile apps use frontend structure
      } else {
        // Default to frontend for unknown types
        console.log('Auto-redirecting to frontend structure (default)');
        onViewStructure('frontend');
      }
    }
  }, [resolvingId, activeId, hasAutoRedirected, urlType, onViewStructure]);

  // تحميل العدّ لكل منصة + Realtime
  const loadCounts = useCallback(async (pid: string) => {
    setLoadingCounts(true);

    try {
      const countFor = async (platform: Platform) => {
        const { data, error } = await supabase
          .from('project_pages')
          .select('id', { count: 'exact', head: true })
          .eq('project_id', pid)
          .eq('platform', platform);
        
        if (error) {
          console.error(`Error counting ${platform} pages:`, error);
          return 0;
        }
        return data?.length ?? 0;
      };

      const [w, b, m] = await Promise.all([
        countFor('website'), 
        countFor('backend'),
        countFor('mobile')
      ]);
      
      setWebCount(w);
      setBackendCount(b);
      setMobileCount(m);
    } catch (error) {
      console.error('Error loading counts:', error);
      setWebCount(0);
      setBackendCount(0);
      setMobileCount(0);
    } finally {
      setLoadingCounts(false);
    }
  }, []);

  useEffect(() => {
    if (!activeId) return;

    loadCounts(activeId);

    const channel = supabase
      .channel(`project_pages_erd_${activeId}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'project_pages', 
          filter: `project_id=eq.${activeId}` 
        },
        (payload) => {
          console.log('Real-time update:', payload);
          loadCounts(activeId);
        }
      )
      .subscribe();

    return () => {
      void channel.unsubscribe();
    };
  }, [activeId, loadCounts]);

  // حساب العدد الإجمالي
  const totalPages = webCount + backendCount + mobileCount;

  // Show loading state while auto-redirecting
  if (resolvingId || !hasAutoRedirected) {
    return (
      <Box sx={{ p: 3, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Stack spacing={3} alignItems="center">
          <CircularProgress size={40} />
          <Typography variant="h6" sx={{ color: 'text.secondary' }}>
            {resolvingId ? 'Resolving project...' : `Loading ${urlType} structure...`}
          </Typography>
          {projectInfo && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {projectInfo.name}
            </Typography>
          )}
        </Stack>
      </Box>
    );
  }

  // Fallback UI (should rarely be seen due to auto-redirect)
  return (
    <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      <Stack spacing={4} alignItems="center">
        {/* Header */}
        <Stack spacing={2} alignItems="center">
          <Typography variant="h4" sx={{ fontWeight: 700, textAlign: 'center' }}>
            Loading Structure...
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', textAlign: 'center', maxWidth: 600 }}>
            Redirecting to {urlType} structure based on your selection.
          </Typography>

          {/* Project Info */}
          {!resolvingId && (
            <>
              {projectInfo ? (
                <Stack spacing={1} alignItems="center">
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {projectInfo.name}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" justifyContent="center">
                    <Chip
                      size="small"
                      label={`ID: ${activeId?.slice(0, 8)}...`}
                      variant="outlined"
                    />
                    <Chip
                      size="small"
                      color="primary"
                      label={`${totalPages} total pages`}
                    />
                    {mobileCount > 0 && (
                      <Chip
                        size="small"
                        color="secondary"
                        variant="outlined"
                        label={`${mobileCount} mobile pages`}
                      />
                    )}
                  </Stack>
                </Stack>
              ) : (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  No project found. Please create a project first to continue.
                </Alert>
              )}
            </>
          )}

          {resolvingId && (
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={20} />
              <Typography variant="body2" color="text.secondary">
                Resolving project...
              </Typography>
            </Stack>
          )}
        </Stack>

        {/* Platform Cards */}
        <Grid container spacing={3} maxWidth={1000} justifyContent="center">
          {/* Frontend Website */}
          <Grid item xs={12} md={6} lg={4}>
            <Card
              sx={{
                height: '100%',
                borderRadius: 3,
                bgcolor: 'background.paper',
                boxShadow: 3,
                transition: 'all 0.3s ease',
                '&:hover': { 
                  transform: 'translateY(-4px)', 
                  boxShadow: 6 
                },
              }}
            >
              <CardContent sx={{ p: 3, height: '100%' }}>
                <Stack spacing={2} alignItems="center" textAlign="center" height="100%">
                  <Box
                    sx={{
                      width: 70, 
                      height: 70, 
                      borderRadius: 3, 
                      bgcolor: 'primary.lighter',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: 'primary.main'
                    }}
                  >
                    <Iconify icon="streamline:code-monitor-2-remix" sx={{ fontSize: 36 }} />
                  </Box>

                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Frontend Website
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', flexGrow: 1 }}>
                    Build the public-facing site with user login, profiles, and interactive features.
                  </Typography>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      label={loadingCounts ? 'Loading...' : `${webCount} pages`}
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                    {loadingCounts && <CircularProgress size={16} />}
                  </Stack>

                  <Tooltip title={!activeId ? 'Select or create a project first' : ''}>
                    <span style={{ width: '100%' }}>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<Iconify icon="mdi:eye" />}
                        onClick={() => onViewStructure('frontend')}
                        disabled={!activeId}
                        fullWidth
                        sx={{ py: 1.5, borderRadius: 2 }}
                      >
                        View Structure
                      </Button>
                    </span>
                  </Tooltip>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Backend System */}
          <Grid item xs={12} md={6} lg={4}>
            <Card
              sx={{
                height: '100%',
                borderRadius: 3,
                bgcolor: 'background.paper',
                boxShadow: 3,
                transition: 'all 0.3s ease',
                '&:hover': { 
                  transform: 'translateY(-4px)', 
                  boxShadow: 6 
                },
              }}
            >
              <CardContent sx={{ p: 3, height: '100%' }}>
                <Stack spacing={2} alignItems="center" textAlign="center" height="100%">
                  <Box
                    sx={{
                      width: 70, 
                      height: 70, 
                      borderRadius: 3, 
                      bgcolor: 'info.lighter',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: 'info.main'
                    }}
                  >
                    <Iconify icon="streamline:code-monitor-1-remix" sx={{ fontSize: 36 }} />
                  </Box>

                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Backend System
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', flexGrow: 1 }}>
                    Build the admin dashboard for managing content, users, and analytics.
                  </Typography>

                  <Chip
                    label={loadingCounts ? 'Loading...' : `${backendCount} pages`}
                    size="small"
                    color="info"
                    variant="outlined"
                  />

                  <Tooltip title={!activeId ? 'Select or create a project first' : ''}>
                    <span style={{ width: '100%' }}>
                      <Button
                        variant="contained"
                        color="info"
                        startIcon={<Iconify icon="mdi:eye" />}
                        onClick={() => onViewStructure('backend')}
                        disabled={!activeId}
                        fullWidth
                        sx={{ py: 1.5, borderRadius: 2 }}
                      >
                        View Structure
                      </Button>
                    </span>
                  </Tooltip>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Mobile App (if exists) */}
          {mobileCount > 0 && (
            <Grid item xs={12} md={6} lg={4}>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: 3,
                  bgcolor: 'background.paper',
                  boxShadow: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    transform: 'translateY(-4px)', 
                    boxShadow: 6 
                  },
                }}
              >
                <CardContent sx={{ p: 3, height: '100%' }}>
                  <Stack spacing={2} alignItems="center" textAlign="center" height="100%">
                    <Box
                      sx={{
                        width: 70, 
                        height: 70, 
                        borderRadius: 3, 
                        bgcolor: 'secondary.lighter',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: 'secondary.main'
                      }}
                    >
                      <Iconify icon="streamline:phone-actions-smartphone" sx={{ fontSize: 36 }} />
                    </Box>

                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Mobile App
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', flexGrow: 1 }}>
                      Native mobile application with optimized user experience.
                    </Typography>

                    <Chip
                      label={loadingCounts ? 'Loading...' : `${mobileCount} screens`}
                      size="small"
                      color="secondary"
                      variant="outlined"
                    />

                    <Tooltip title={!activeId ? 'Select or create a project first' : ''}>
                      <span style={{ width: '100%' }}>
                        <Button
                          variant="outlined"
                          color="secondary"
                          startIcon={<Iconify icon="mdi:eye" />}
                          disabled={!activeId}
                          fullWidth
                          sx={{ py: 1.5, borderRadius: 2 }}
                        >
                          View Screens
                        </Button>
                      </span>
                    </Tooltip>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>

        {/* Additional Info */}
        {activeId && totalPages === 0 && !loadingCounts && (
          <Alert severity="info" sx={{ mt: 2 }}>
            This project doesn't have any pages yet. Create some pages first to see the structure.
          </Alert>
        )}
      </Stack>
    </Box>
  );
};

export default ERDPage;