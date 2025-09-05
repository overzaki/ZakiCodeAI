'use client';

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from 'react';
import { Box, Stack } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import EditorHeader from '../components/EditorHeader';
import EditorChatSection from '../components/EditorChatSection';
import EditorPreviewSection from '../components/EditorPreviewSection';
import { useEditor } from '@/redux/hooks/useEditor';
import { supabase } from '@/lib/supabaseClient';

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

type DBProject = {
  id: string;
  name?: string | null;
  website_code?: string | null;
  mobile_code?: string | null;
  backend_code?: string | null;
  updated_at?: string | null;
};

const PricingPageSection = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());

  const {
    currentView,
    projectId, // يأتي من useEditor
    generatedCode, // للحصول على files array
    navigateToView,
    navigateToERD,
    navigateToMain,
    clearEditor,
  } = useEditor();

  const [chatWidthPct, setChatWidthPct] = useState(35);
  const [currentPage, setCurrentPage] = useState('Home page');
  const [currentDevice, setCurrentDevice] = useState('Desktop');
  const [currentZoom, setCurrentZoom] = useState(100);
  const isDraggingRef = useRef(false);

  // حالة المشروع من الداتابيز
  const [project, setProject] = useState<DBProject | null>(null);
  const [loading, setLoading] = useState(false);

  // --- أدوات مساعدة لدفع الحمولة إلى المعاينة ---
  const pushN8nPayload = useCallback(
    (payload: { website_code?: string | null; files?: any }) => {
      try {
        localStorage.setItem('n8n_payload', JSON.stringify(payload));
      } catch {}
      (window as any).__N8N__ = payload;
      // EditorPreviewSection عامل listener لهالأيفنت
      try {
        window.dispatchEvent(new Event('n8n:payload:update'));
      } catch {}
    },
    [],
  );

  // تحميل مشروع من Supabase
  const loadProject = useCallback(
    async (id?: string | null) => {
      const pid = id || projectId || searchParams.get('projectId');
      if (!pid) return;

      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, website_code, mobile_code, backend_code, updated_at')
        .eq('id', pid)
        .maybeSingle<DBProject>();

      setLoading(false);

      if (error) {
        console.warn('Failed to load project:', error.message);
        return;
      }

      setProject(data || null);
      // ادفع الكود للمعاينة فورًا
      pushN8nPayload({
        website_code: data?.website_code || '',
        files: generatedCode?.files,
      });
    },
    [projectId, searchParams, pushN8nPayload],
  );

  // أول تحميل + عند تغيّر projectId
  useEffect(() => {
    loadProject();
  }, [loadProject]);

  // تحديث المعاينة عند تغيّر generatedCode
  useEffect(() => {
    if (generatedCode?.files || generatedCode?.website_code) {
      console.log('EditorPageSection: Updating payload with generatedCode:', {
        hasFiles: !!generatedCode?.files,
        filesLength: Array.isArray(generatedCode?.files)
          ? generatedCode.files.length
          : 'not array',
        hasWebsiteCode: !!generatedCode?.website_code,
        projectWebsiteCode: !!project?.website_code,
      });
      pushN8nPayload({
        website_code:
          project?.website_code || generatedCode?.website_code || '',
        files: generatedCode?.files,
      });
    }
  }, [generatedCode, project?.website_code, pushN8nPayload]);

  // Realtime: حدِّث المعاينة إذا تغيّر المشروع في الداتابيز
  useEffect(() => {
    const pid = projectId || searchParams.get('projectId');
    if (!pid) return;

    const channel = supabase
      .channel(`projects:${pid}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'projects',
          filter: `id=eq.${pid}`,
        },
        (payload) => {
          const row = payload.new as DBProject;
          setProject(row);
          pushN8nPayload({
            website_code: row?.website_code || '',
            files: generatedCode?.files,
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, searchParams, pushN8nPayload]);

  // سحب الـ divider
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const viewportWidth = window.innerWidth;
      const pct = clamp((e.clientX / viewportWidth) * 100, 20, 70);
      setChatWidthPct(pct);
    };
    const onUp = () => (isDraggingRef.current = false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  const startDrag = () => {
    isDraggingRef.current = true;
  };

  // تنقّلات
  const handleSuccessfulGeneration = (pid: string) =>
    setTimeout(() => navigateToERD(pid), 2000);
  const handleSuccessfulCodeGeneration = (pid: string) =>
    setTimeout(() => navigateToMain(pid), 2000);
  const handleMapClick = () => {
    const newView =
      currentView === 'erd' ||
      currentView === 'frontend' ||
      currentView === 'backend'
        ? 'main'
        : 'erd';
    navigateToView(newView);
  };
  const handleNewProject = () => {
    clearEditor();
    params.delete('projectId');
    params.set('view', 'erd');
    router.replace(`?${params.toString()}`, { scroll: false });
    setProject(null);
    pushN8nPayload({ website_code: '', files: null });
  };

  // أزرار التحكم للمعاينة
  const handleRefresh = () => loadProject();
  const handleViewChange = (v: 'preview' | 'code') => {};
  const handleDownload = () => {};
  const handlePageChange = (p: string) => setCurrentPage(p);
  const handleDeviceChange = (d: string) => setCurrentDevice(d);
  const handleZoomChange = (z: number) => setCurrentZoom(z);
  const handleFullscreen = () => {};
  const handleThemeToggle = () => {};
  const handleResponsiveToggle = () => {};
  const handleViewStructure = (type: 'frontend' | 'backend') =>
    navigateToView(type);
  const handleBackToERD = () => navigateToERD(projectId || '');

  return (
    <Stack
      sx={{ maxHeight: '100dvh', bgcolor: 'primary.contrastText' }}
      direction="column"
    >
      {/* Header */}
      <EditorHeader
        onTypeChange={() => {}}
        onNewProject={handleNewProject}
        onUpgrade={() => {}}
        onInvite={() => {}}
        onPublish={() => {}}
      />

      {/* Content */}
      <Stack direction="row" sx={{ flex: 1, height: `calc(100dvh - 74px)` }}>
        {/* Chat */}
        <Box
          sx={{
            width: `${chatWidthPct}%`,
            minWidth: 260,
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid',
            borderColor: 'rgba(255,255,255,0.08)',
          }}
        >
          <EditorChatSection
            onSendMessage={() => {}}
            onTabChange={() => {}}
            onVisualEdit={() => {}}
            onDiscuss={() => {}}
            onSuccessfulGeneration={handleSuccessfulGeneration}
            onSuccessfulCodeGeneration={handleSuccessfulCodeGeneration}
            projectId={projectId}
            currentView={currentView}
          />
        </Box>

        {/* Divider handle */}
        <Box
          onMouseDown={startDrag}
          sx={{
            width: 6,
            cursor: 'col-resize',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' },
          }}
        />

        {/* Preview */}
        <Box
          sx={{
            flex: 1,
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            height: `calc(100dvh - 74px)`,
            overflowY: 'auto',
          }}
        >
          <EditorPreviewSection
            // ← أهم سطرين: نمرر website_code من الداتابيز للمعاينة
            n8n={{
              website_code: project?.website_code || '',
              files: generatedCode?.files as any,
            }}
            // ويمكن تمرير files إذا كنت تحفظها كصفوف منفصلة
            files={generatedCode?.files as any}
            currentPage={currentPage}
            currentDevice={currentDevice}
            currentZoom={currentZoom}
            currentView={currentView}
            onRefresh={handleRefresh}
            onViewChange={handleViewChange}
            onDownload={handleDownload}
            onPageChange={handlePageChange}
            onDeviceChange={handleDeviceChange}
            onZoomChange={handleZoomChange}
            onFullscreen={handleFullscreen}
            onThemeToggle={handleThemeToggle}
            onResponsiveToggle={handleResponsiveToggle}
            onViewStructure={handleViewStructure}
            onBackToERD={handleBackToERD}
            onBackToMain={() => navigateToMain(projectId || undefined)}
            onMapClick={handleMapClick}
            onSuccessfulCodeGeneration={handleSuccessfulCodeGeneration}
          />
        </Box>
      </Stack>
    </Stack>
  );
};

export default PricingPageSection;
