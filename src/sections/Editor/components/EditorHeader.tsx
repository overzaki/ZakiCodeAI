'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Stack,
  Typography,
  IconButton,
  Button,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
} from '@mui/material';
import Iconify from '@/components/iconify';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEditor } from '@/redux/hooks/useEditor';
import { supabase } from '@/lib/supabaseClient';

type Project = {
  id: string;
  name: string;
  slug: string;
  workspace_id: string;
  owner_id: string;
  visibility: string | null; // project_visibility
  status: string | null;     // project_status
  published_at: string | null;
  updated_at: string | null;
};

type Workspace = {
  id: string;
  name: string;
  owner_id: string;
};

interface EditorHeaderProps {
  selectedProject?: string;
  selectedType?: 'website' | 'backend' | 'app';
  onProjectChange?: (project: string) => void;
  onTypeChange?: (type: 'website' | 'backend' | 'app') => void;
  onNewProject?: () => void;
  onUpgrade?: () => void;
  onInvite?: () => void;
  onPublish?: () => void;
}

const EditorHeader: React.FC<EditorHeaderProps> = ({
  selectedType = 'website',
  onTypeChange,
  onPublish,
}) => {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedCategories, currentView } = useEditor();

  // ===== URL type =====
  const currentType: 'website' | 'backend' | 'app' = useMemo(() => {
    const urlType = (searchParams.get('type') || '').toLowerCase();
    if (urlType === 'website' || urlType === 'backend' || urlType === 'app') return urlType as any;
    return selectedType;
  }, [searchParams, selectedType]);

  // ===== Active type for visual display (based on current view) =====
  const activeType: 'website' | 'backend' | 'app' = useMemo(() => {
    // Show active state based on current view
    if (currentView === 'backend') {
      return 'backend';
    } else if (currentView === 'frontend') {
      // For frontend, check URL to distinguish between website and app
      const urlType = (searchParams.get('type') || '').toLowerCase();
      if (urlType === 'app' || urlType === 'mobile') {
        return 'app';
      }
      return 'website';
    }
    
    // For other views (main, erd), use URL type
    return currentType;
  }, [currentView, currentType, searchParams]);

  // ===== URL project =====
  const urlProjectId = searchParams.get('project') || '';

  // ===== DB state =====
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ===== helpers =====
  const updateURL = (paramsObj: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(paramsObj).forEach(([k, v]) => {
      if (!v) params.delete(k);
      else params.set(k, v);
    });
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const handleTypeChange = (type: 'website' | 'backend' | 'app') => {
    updateURL({ type, project: currentProject?.id });
    onTypeChange?.(type);
  };

  const createSlug = (name: string) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 48) + '-' + Math.random().toString(36).slice(2, 6);

  const ensureWorkspace = async (uid: string): Promise<Workspace> => {
    // حاول إيجاد workspace للمستخدم
    const { data: ws, error: wsErr } = await supabase
      .from('workspaces')
      .select('id, name, owner_id')
      .eq('owner_id', uid)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (wsErr && wsErr.code !== 'PGRST116') throw wsErr;
    if (ws) return ws as Workspace;

    // لو ما في، أنشئ واحد
    const { data: userData } = await supabase.auth.getUser();
    const email = userData.user?.email || 'my-workspace';

    const { data: newWs, error: newErr } = await supabase
      .from('workspaces')
      .insert({ name: `${email.split('@')[0]} workspace`, owner_id: uid, plan: 'free' })
      .select('id, name, owner_id')
      .single();
    if (newErr) throw newErr;
    return newWs as Workspace;
  };

  // ===== auth → load projects =====
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        setError(error.message);
        return;
      }
      setUserId(data.user?.id ?? null);
    })();
  }, []);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        // اجلب مشاريع يملكها المستخدم
        const { data: rows, error: projErr } = await supabase
          .from('projects')
          .select('id, name, slug, workspace_id, owner_id, visibility, status, published_at, updated_at')
          .eq('owner_id', userId)
          .order('updated_at', { ascending: false });

        if (projErr) throw projErr;

        setProjects(rows as Project[]);

        // حدّد المشروع الحالي من URL أو الأول في القائمة
        let selected = rows?.find((p) => p.id === urlProjectId) || rows?.[0] || null;
        setCurrentProject(selected || null);

        if (selected && selected.id !== urlProjectId) {
          updateURL({ type: currentType, project: selected.id });
        }
      } catch (e: any) {
        setError(e?.message || String(e));
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // ===== create new project =====
  const handleCreateProject = async () => {
    if (!userId) return;
    setSaving(true);
    setError(null);
    try {
      const ws = await ensureWorkspace(userId);
      const baseName = 'New Project';
      const slug = createSlug(baseName);

      const { data, error: insErr } = await supabase
        .from('projects')
        .insert({
          workspace_id: ws.id,
          owner_id: userId,
          name: baseName,
          slug,
          visibility: 'private', // enum project_visibility
          meta: {},
        })
        .select('id, name, slug, workspace_id, owner_id, visibility, status, published_at, updated_at')
        .single();

      if (insErr) throw insErr;

      const newProj = data as Project;
      setProjects((prev) => [newProj, ...prev]);
      setCurrentProject(newProj);
      updateURL({ type: currentType, project: newProj.id });
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setSaving(false);
    }
  };

  // ===== publish (make public + set published_at) =====
  const handlePublish = async () => {
    if (!currentProject) return;
    setSaving(true);
    setError(null);
    try {
      const now = new Date().toISOString();
      const { data, error: upErr } = await supabase
        .from('projects')
        .update({ visibility: 'public', published_at: now })
        .eq('id', currentProject.id)
        .select('id, name, slug, workspace_id, owner_id, visibility, status, published_at, updated_at')
        .single();
      if (upErr) throw upErr;

      const updated = data as Project;
      setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setCurrentProject(updated);
      onPublish?.();
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setSaving(false);
    }
  };

  // ===== UI helpers =====
  const selectedLabel = currentProject?.name || 'New Project';

  // ===== category Types from selectedCategories =====
  const categoryTypes = selectedCategories.map((category) => {
    switch (category) {
      case 'website':
        return { key: 'website', label: 'Website' };
      case 'backend':
        return { key: 'backend', label: 'Dashboard' };
      case 'mobile':
        return { key: 'app', label: 'Mobile App' };
      default:
        return { key: category, label: category };
    }
  });

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{
        p: 2,
        height: 74,
        borderBottom: '1px solid',
        borderColor: 'rgba(255,255,255,0.08)',
        bgcolor: 'background.paper',
      }}
    >
      {/* Left — Project selector */}
      <Stack direction="row" alignItems="center" spacing={1}>
        <Iconify
          icon="mdi:home"
          sx={{
            fontSize: 20,
            color: 'text.primary',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 1,
            p: 0.5,
          }}
        />
        <Box
          onClick={(e) => setMenuAnchor(e.currentTarget as HTMLElement)}
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        >
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              color: 'text.primary',
              '&:hover': { opacity: 0.8 },
              mr: 0.5,
            }}
          >
            {selectedLabel}
          </Typography>
          <Iconify icon="mdi:chevron-down" sx={{ fontSize: 18, color: 'text.secondary' }} />
        </Box>

        <IconButton
          size="small"
          sx={{ color: 'text.secondary', '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' } }}
          onClick={handleCreateProject}
          disabled={saving}
        >
          <Iconify icon="mdi:plus" />
        </IconButton>

        {currentProject?.visibility && (
          <Chip
            size="small"
            color={currentProject.visibility === 'public' ? 'success' : 'default'}
            label={currentProject.visibility}
            sx={{ ml: 1 }}
          />
        )}
      </Stack>

      {/* Middle — Type selector */}
      <Stack
        direction="row"
        spacing={0.5}
        sx={{
          bgcolor: 'action.disabledBackground',
          borderRadius: 9999,
          py: 1,
          px: 1.2,
        }}
      >
        {categoryTypes.map((type) => {
          const isActive = activeType === (type.key as any);
          return (
            <Chip
              key={type.key}
              label={t(type.label)}
              onClick={() => handleTypeChange(type.key as 'website' | 'backend' | 'app')}
              sx={{
                bgcolor: isActive ? 'primary.main' : 'transparent',
                color: isActive ? 'primary.contrastText' : 'text.secondary',
                border: '1px solid',
                borderColor: isActive ? 'primary.main' : 'transparent',
                borderRadius: 2,
                px: 2,
                py: 1,
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: isActive ? 'primary.dark' : 'rgba(255,255,255,0.08)',
                },
              }}
            />
          );
        })}
      </Stack>

      {/* Right — Actions */}
      <Stack direction="row" alignItems="center" spacing={1}>
        <IconButton size="small" sx={{ color: 'text.secondary', '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' } }}>
          <Iconify icon="uil:setting" />
        </IconButton>
        <IconButton size="small" sx={{ color: 'text.secondary', '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' } }}>
          <Iconify icon="meteor-icons:bolt" />
        </IconButton>
        <IconButton size="small" sx={{ color: 'text.secondary', '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' } }}>
          <Iconify icon="mingcute:github-line" />
        </IconButton>

        <Button
          variant="contained"
          size="small"
          onClick={handlePublish}
          color="primary"
          disabled={!currentProject || saving}
          sx={{ borderRadius: 0.8, px: 2, py: 0.75, fontSize: '0.875rem' }}
        >
          {t('Publish')}
        </Button>
      </Stack>

      {/* Project menu */}
      <Menu
        anchorEl={menuAnchor}
        open={!!menuAnchor}
        onClose={() => setMenuAnchor(null)}
        PaperProps={{ sx: { minWidth: 260 } }}
      >
        <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle2">{t('Projects')}</Typography>
          {loading && <CircularProgress size={16} />}
        </Box>
        <Divider />
        {projects.length === 0 && (
          <MenuItem disabled>
            <ListItemText primary={t('No projects yet')} />
          </MenuItem>
        )}
        {projects.map((p) => {
          const active = currentProject?.id === p.id;
          return (
            <MenuItem
              key={p.id}
              selected={active}
              onClick={() => {
                setCurrentProject(p);
                updateURL({ type: currentType, project: p.id });
                setMenuAnchor(null);
              }}
            >
              <ListItemIcon>
                <Iconify icon={active ? 'mdi:check-circle' : 'mdi:circle-outline'} />
              </ListItemIcon>
              <ListItemText
                primary={p.name}
                secondary={p.visibility === 'public' ? 'public' : 'private'}
                primaryTypographyProps={{ noWrap: true }}
                secondaryTypographyProps={{ noWrap: true }}
              />
            </MenuItem>
          );
        })}
        <Divider />
        <MenuItem onClick={() => { setMenuAnchor(null); handleCreateProject(); }}>
          <ListItemIcon><Iconify icon="mdi:plus" /></ListItemIcon>
          <ListItemText primary={t('New Project')} />
        </MenuItem>
      </Menu>

      {/* Errors */}
      {error && (
        <Box sx={{ position: 'fixed', bottom: 12, left: 12, bgcolor: 'error.main', color: '#fff', px: 1.5, py: 1, borderRadius: 1 }}>
          <Typography variant="caption">{error}</Typography>
        </Box>
      )}
    </Stack>
  );
};

export default EditorHeader;
