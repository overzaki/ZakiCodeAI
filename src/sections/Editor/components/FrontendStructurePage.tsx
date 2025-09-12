'use client';

import React, {
  useMemo,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { Box, Button, Stack, Typography, Chip, Alert, CircularProgress, Backdrop } from '@mui/material';
import {
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Node,
  Edge,
  MarkerType,
} from '@xyflow/react';
import { useTranslations } from 'next-intl';
import { useDispatch } from 'react-redux';
import { useSearchParams } from 'next/navigation';
import {
  updateFrontendPages,
  addChatMessage,
} from '@/redux/slices/editorSlice';
import Iconify from '@/components/iconify';
import StructureFlow from './StructureFlow';
import FrontendStructureTable from './FrontendStructureTable';
import AddPageDialog from './AddPageDialog';
import EditPageDialog from './EditPageDialog';
import { useSettingsContext } from '@/components/settings';
import { useEditor } from '@/hooks/useEditor';
import { enqueueSnackbar } from 'notistack';
import { supabase } from '@/lib/supabaseClient';

/* ---------------- Types ---------------- */
type PageType =
  | 'auth'
  | 'home'
  | 'catalog'
  | 'detail'
  | 'profile'
  | 'admin'
  | 'custom'
  | 'api';

type Platform = 'website' | 'mobile' | 'backend';

interface IPageData {
  pageName: string;
  pageType: PageType;
  parentPage: string | null;
  optionalDescription: string;
  platform: Platform;
  position: number;
  __id?: string;
}

/* ---------------- Helper Functions ---------------- */
const toPageType = (v?: string | null): PageType => {
  const s = String(v || '').trim().toLowerCase();
  switch (s) {
    case 'home': return 'home';
    case 'detail': return 'detail';
    case 'catalog': return 'catalog';
    case 'profile': return 'profile';
    case 'admin': return 'admin';
    case 'auth': return 'auth';
    case 'api': return 'api';
    default: return 'custom';
  }
};

const toPlatform = (v?: string | null): Platform => {
  const s = String(v || '').trim().toLowerCase();
  if (s === 'mobile') return 'mobile';
  if (s === 'backend') return 'backend';
  return 'website';
};

const isUuid = (s?: string | null): s is string =>
  !!s && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);

/* ================ خوارزمية التخطيط الهرمي ================ */
const createHierarchicalLayout = (pages: IPageData[]): { nodes: Node[]; edges: Edge[] } => {
  if (!pages.length) return { nodes: [], edges: [] };

  // بناء خريطة العلاقات
  const childrenMap = new Map<string, string[]>();
  const parentMap = new Map<string, string>();
  
  pages.forEach(page => {
    if (page.parentPage) {
      parentMap.set(page.pageName, page.parentPage);
      if (!childrenMap.has(page.parentPage)) {
        childrenMap.set(page.parentPage, []);
      }
      childrenMap.get(page.parentPage)!.push(page.pageName);
    }
  });

  // ترتيب هرمي
  const levels: string[][] = [];
  const processed = new Set<string>();
  
  // المستوى الأول: الصفحات الجذور
  const rootPages = pages.filter(p => !p.parentPage).map(p => p.pageName);
  if (rootPages.length > 0) {
    levels.push(rootPages);
    rootPages.forEach(name => processed.add(name));
  }

  // المستويات التالية
  let currentLevel = rootPages;
  while (currentLevel.length > 0) {
    const nextLevel: string[] = [];
    currentLevel.forEach(pageName => {
      const children = childrenMap.get(pageName) || [];
      children.forEach(childName => {
        if (!processed.has(childName)) {
          nextLevel.push(childName);
          processed.add(childName);
        }
      });
    });
    if (nextLevel.length > 0) {
      levels.push(nextLevel);
      currentLevel = nextLevel;
    } else {
      break;
    }
  }

  // الصفحات المتبقية
  const orphanPages = pages.filter(p => !processed.has(p.pageName)).map(p => p.pageName);
  if (orphanPages.length > 0) {
    levels.push(orphanPages);
  }

  // حساب المواضع
  const nodeWidth = 200;
  const nodeHeight = 80;
  const horizontalSpacing = 150;
  const verticalSpacing = 180;

  const pageMap = new Map(pages.map(p => [p.pageName, p]));
  const nodes: Node[] = levels.flatMap((levelPages, levelIndex) => {
    const levelWidth = levelPages.length * nodeWidth + (levelPages.length - 1) * horizontalSpacing;
    const startX = Math.max(100, (1200 - levelWidth) / 2);
    
    return levelPages.map((pageName, pageIndex) => {
      const page = pageMap.get(pageName)!;
      const x = startX + (pageIndex * (nodeWidth + horizontalSpacing));
      const y = 100 + (levelIndex * (nodeHeight + verticalSpacing));
      
      // تحديد ألوان العقدة
      let backgroundColor = '#64748b';
      let borderColor = '#475569';
      
      switch (page.pageType) {
        case 'home':
          backgroundColor = '#10b981';
          borderColor = '#059669';
          break;
        case 'auth':
          backgroundColor = '#8b5cf6';
          borderColor = '#7c3aed';
          break;
        case 'admin':
          backgroundColor = '#ef4444';
          borderColor = '#dc2626';
          break;
        case 'catalog':
          backgroundColor = '#06b6d4';
          borderColor = '#0891b2';
          break;
        case 'detail':
          backgroundColor = '#f59e0b';
          borderColor = '#d97706';
          break;
        case 'profile':
          backgroundColor = '#ec4899';
          borderColor = '#db2777';
          break;
        default:
          if (page.platform === 'website') {
            backgroundColor = '#3b82f6';
            borderColor = '#2563eb';
          } else if (page.platform === 'mobile') {
            backgroundColor = '#10b981';
            borderColor = '#059669';
          } else if (page.platform === 'backend') {
            backgroundColor = '#f59e0b';
            borderColor = '#d97706';
          }
      }

      return {
        id: page.pageName,
        type: page.pageType === 'home' ? 'input' : 
              page.pageType === 'detail' ? 'output' : 'default',
        data: {
          label: page.pageName,
          description: page.optionalDescription,
          type: page.pageType,
          platform: page.platform,
        },
        position: { x, y },
        style: {
          background: backgroundColor,
          border: `3px solid ${borderColor}`,
          borderRadius: 16,
          fontWeight: 700,
          fontSize: 14,
          padding: '12px 16px',
          width: nodeWidth,
          height: nodeHeight,
          textAlign: 'center' as const,
          color: '#ffffff',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          cursor: 'grab',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
        draggable: true,
      } as Node;
    });
  });

  // إنشاء الحواف
  const edges: Edge[] = pages
    .filter(page => page.parentPage && pageMap.has(page.parentPage))
    .map(page => ({
      id: `edge-${page.parentPage}-${page.pageName}`,
      source: page.parentPage!,
      target: page.pageName,
      type: 'smoothstep',
      style: { 
        stroke: '#6b7280', 
        strokeWidth: 3,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#6b7280',
        width: 25,
        height: 25,
      },
      animated: false,
    } as Edge));

  return { nodes, edges };
};

interface FrontendStructurePageProps {
  onBackToERD: () => void;
  onSuccessfulCodeGeneration?: (projectId: string) => void;
  projectId?: string;
}

export default function FrontendStructurePage({
  onBackToERD,
  onSuccessfulCodeGeneration,
  projectId: projectIdProp,
}: FrontendStructurePageProps) {
  const t = useTranslations('FrontendStructure');
  const tMain = useTranslations();
  const { themeDirection } = useSettingsContext();
  const dispatch = useDispatch();
  const search = useSearchParams();

  const {
    currentProject,
    isGeneratingCode,
    generateCode,
    projectId: projectIdFromEditor,
  } = useEditor();

  // تحديد projectId النشط
  const urlProject = search.get('project') || search.get('projectId') || undefined;
  const activeProjectId = useMemo(
    () => {
      if (projectIdProp && isUuid(projectIdProp)) return projectIdProp;
      if (isUuid(projectIdFromEditor)) return projectIdFromEditor;
      if (isUuid(urlProject)) return urlProject;
      return undefined;
    },
    [projectIdProp, projectIdFromEditor, urlProject]
  );

  // State
  const [pagesFromDB, setPagesFromDB] = useState<IPageData[]>([]);
  const [addPageDialogOpen, setAddPageDialogOpen] = useState(false);
  const [editPageDialogOpen, setEditPageDialogOpen] = useState(false);
  const [editingPageName, setEditingPageName] = useState('');
  const [loadingPages, setLoadingPages] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  /* ───────── تحميل الصفحات من قاعدة البيانات ───────── */
  const loadPagesFromDB = useCallback(async () => {
    if (!activeProjectId) {
      setPagesFromDB([]);
      return;
    }
    
    setLoadingPages(true);
    try {
      const { data, error } = await supabase
        .from('project_pages')
        .select('id,page_name,page_type,parent_page,description,position,platform')
        .eq('project_id', activeProjectId)
        .order('position', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) throw error;

      const pages: IPageData[] = (data || []).map((r, index) => ({
        pageName: r.page_name || `Page ${index + 1}`,
        pageType: toPageType(r.page_type),
        parentPage: r.parent_page || null,
        optionalDescription: r.description || '',
        platform: toPlatform(r.platform),
        position: typeof r.position === 'number' ? r.position : index,
        __id: r.id,
      }));

      console.log('FrontendStructurePage: Loaded pages from DB:', pages);
      
      setPagesFromDB(pages);
      dispatch(updateFrontendPages(pages));

    } catch (e: any) {
      console.error('خطأ في تحميل الصفحات:', e);
      enqueueSnackbar(e?.message || 'Failed to load pages', { variant: 'error' });
      setPagesFromDB([]);
    } finally {
      setLoadingPages(false);
    }
  }, [dispatch, activeProjectId]);

  /* ───────── Realtime Subscription ───────── */
  useEffect(() => {
    if (!activeProjectId) return;

    loadPagesFromDB();

    const channel = supabase
      .channel(`project_pages_frontend_${activeProjectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_pages',
          filter: `project_id=eq.${activeProjectId}`,
        },
        (payload) => {
          console.log('تحديث مباشر:', payload);
          loadPagesFromDB();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeProjectId, loadPagesFromDB]);

  /* ───────── بناء المخطط ───────── */
  const { nodes: calculatedNodes, edges: calculatedEdges } = useMemo(() => {
    return createHierarchicalLayout(pagesFromDB);
  }, [pagesFromDB]);

  // تحديث العقد والحواف
  useEffect(() => {
    if (calculatedNodes.length > 0) {
      setNodes(calculatedNodes);
      setEdges(calculatedEdges);
    } else {
      setNodes([]);
      setEdges([]);
    }
  }, [calculatedNodes, calculatedEdges, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  /* ───────── Event Handlers ───────── */
  const handlePageAdded = useCallback(() => {
    console.log('FrontendStructurePage: handlePageAdded called');
    setTimeout(() => {
      console.log('FrontendStructurePage: Reloading pages from DB after add');
      loadPagesFromDB();
    }, 500);
  }, [loadPagesFromDB]);

  const handleEditPage = useCallback((pageName: string) => {
    setEditingPageName(pageName);
    setEditPageDialogOpen(true);
  }, []);

  const handleDeletePage = useCallback(
    async (pageName: string) => {
      if (!activeProjectId) return;

      try {
        const { error } = await supabase
          .from('project_pages')
          .delete()
          .eq('project_id', activeProjectId)
          .eq('page_name', pageName);

        if (error) throw error;

        enqueueSnackbar(`تم حذف الصفحة "${pageName}" بنجاح`, { variant: 'success' });
      } catch (error: any) {
        enqueueSnackbar(`فشل في حذف الصفحة: ${error?.message}`, { variant: 'error' });
      }
    },
    [activeProjectId]
  );

  const handlePageEdited = useCallback(() => {
    console.log('FrontendStructurePage: handlePageEdited called');
    setTimeout(() => {
      console.log('FrontendStructurePage: Reloading pages from DB after edit');
      loadPagesFromDB();
    }, 500);
  }, [loadPagesFromDB]);

  const handleGenerateCode = async () => {
    const projectToUse = currentProject || activeProjectId;
    
    if (!projectToUse) {
      enqueueSnackbar('Please select a project first', { variant: 'warning' });
      return;
    }

    if (!pagesFromDB.length) {
      enqueueSnackbar('Please generate pages first before generating code', { variant: 'warning' });
      return;
    }

    console.log('FrontendStructurePage: Starting code generation...');
    console.log('FrontendStructurePage: isGeneratingCode before:', isGeneratingCode);

    try {
      const pages = pagesFromDB.map((p) => ({
        pageName: p.pageName,
        pageType: p.pageType,
        parentPage: p.parentPage,
        platform: p.platform,
      }));

      const result = await generateCode(projectToUse, pages, true);

      console.log('FrontendStructurePage: Code generation completed:', result);
      console.log('FrontendStructurePage: isGeneratingCode after:', isGeneratingCode);

      if (result.success && result.data) {
        dispatch(
          addChatMessage({
            id: (Date.now() + 1).toString(),
            type: 'ai',
            content: "تم توليد الكود بنجاح! يمكنك الآن مراجعة الكود المولد.",
            timestamp: new Date().toISOString(),
            name: 'ZakiCode',
          })
        );
        enqueueSnackbar('Code generated successfully!', { variant: 'success' });

        if (result.data.projectId && onSuccessfulCodeGeneration) {
          enqueueSnackbar('Redirecting to code view...', {
            variant: 'info',
            autoHideDuration: 2000,
          });
          onSuccessfulCodeGeneration(result.data.projectId);
        }
      } else {
        enqueueSnackbar(result.error || 'Failed to generate code', { variant: 'error' });
      }
    } catch (error: any) {
      console.error('Generate code error:', error);
      enqueueSnackbar(error?.message || 'An unexpected error occurred', { variant: 'error' });
    }
  };

  // تحويل البيانات للجدول
  const tableData = pagesFromDB.map((page) => ({
    name: page.pageName,
    type: page.pageType,
    parentPage: page.parentPage,
    status: 'Active',
    action: 'Edit',
    description: page.optionalDescription,
  }));

  // تحويل Set إلى Array لتجنب مشاكل TypeScript

  // Show full page loading state
  if (loadingPages) {
    return (
      <Box sx={{ p: 3, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Stack spacing={3} alignItems="center">
          <CircularProgress size={40} />
          <Typography variant="h6" sx={{ color: 'text.secondary' }}>
            Loading frontend structure...
          </Typography>
          {activeProjectId && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Project: {activeProjectId.slice(0, 8)}...
            </Typography>
          )}
        </Stack>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ height: '100%', overflow: 'auto', p: 2, position: 'relative' }}>
        {/* Code Generation Loading Overlay */}
        {isGeneratingCode && (
          <Backdrop
            open={true}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(0, 0, 0, 0.8)',
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(4px)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Iconify 
                icon="vscode-icons:file-type-js-official" 
                sx={{ fontSize: 50, mr: 2, color: 'warning.main' }} 
              />
              <CircularProgress
                size={70}
                thickness={4}
                sx={{
                  color: 'warning.main',
                }}
              />
            </Box>
            <Typography
              variant="h6"
              sx={{
                color: 'white',
                mb: 1,
                textAlign: 'center',
              }}
            >
              Generating code...
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                textAlign: 'center',
                maxWidth: 400,
              }}
            >
              Please wait while ZakiCode generates the complete source code for your application based on the current page structure.
            </Typography>
            
            {/* Progress Steps */}
            <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', mb: 1 }}>
                Current step: Analyzing page structure
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {[1, 2, 3, 4].map((step) => (
                  <Box
                    key={step}
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: step <= 2 ? 'warning.main' : 'rgba(255, 255, 255, 0.3)',
                      animation: step === 2 ? 'pulse 1.5s infinite' : 'none',
                      '@keyframes pulse': {
                        '0%': { opacity: 1 },
                        '50%': { opacity: 0.5 },
                        '100%': { opacity: 1 },
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Backdrop>
        )}

        {/* تنبيه إذا لم يكن هناك مشروع محدد */}
        {!activeProjectId && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            No project selected. Create/select a project to sync with the database.
          </Alert>
        )}

        {/* الرأس مع الأزرار */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
          sx={{ mb: 2 }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            {/* <Iconify
              icon={themeDirection === 'rtl' ? 'mingcute:arrow-right-fill' : 'mingcute:arrow-left-fill'}
              onClick={onBackToERD}
              sx={{ cursor: 'pointer', fontSize: 24 }}
            /> */}
            <Typography variant="h5" fontWeight="bold">
              {t('title')}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1}>
            {/* زر توليد الكود */}
            {(activeProjectId && pagesFromDB.length > 0) && (
              <Button
                variant="contained"
                color="warning"
                startIcon={<Iconify icon="mdi:code-braces" />}
                onClick={handleGenerateCode}
                disabled={isGeneratingCode}
                sx={{ borderRadius: 2 }}
              >
                {isGeneratingCode ? 'Generating...' : 'Generate Code'}
              </Button>
            )}
            
            {/* زر إضافة صفحة */}
            <Button
              variant="contained"
              color="success"
              startIcon={<Iconify icon="mdi:plus" />}
              onClick={() => setAddPageDialogOpen(true)}
              disabled={!activeProjectId}
              sx={{ borderRadius: 2 }}
            >
              Add Page
            </Button>
          </Stack>
        </Stack>

        {/* إحصائيات */}
        {activeProjectId && (
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Chip 
              label={`Project: ${activeProjectId.slice(0, 8)}...`} 
              variant="outlined" 
              size="small"
            />
            <Chip 
              label={`Pages: ${pagesFromDB.length}`} 
              color="primary" 
              size="small"
            />
           
          </Stack>
        )}

        {/* المخطط التفاعلي */}
        {pagesFromDB.length > 0 ? (
          <Box sx={{ height: 600, mb: 3 }}>
            <StructureFlow
              key={`flow-${pagesFromDB.length}-${activeProjectId}`}
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              type="frontend"
            />
          </Box>
        ) : (
          <Box 
            sx={{ 
              height: 300, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              bgcolor: 'background.paper',
              borderRadius: 2,
              border: '2px dashed #ccc',
              mb: 3
            }}
          >
            <Stack alignItems="center" spacing={2}>
              <Iconify icon="mdi:file-document-outline" sx={{ fontSize: 48, color: 'text.secondary' }} />
              <Typography variant="h6" color="text.secondary">
                {activeProjectId ? 'No pages found in this project' : 'Please select a project first'}
              </Typography>
              {activeProjectId && (
                <Button
                  variant="outlined"
                  startIcon={<Iconify icon="mdi:plus" />}
                  onClick={() => setAddPageDialogOpen(true)}
                >
                  Add First Page
                </Button>
              )}
            </Stack>
          </Box>
        )}

        {/* جدول الصفحات */}
        {pagesFromDB.length > 0 && (
          <FrontendStructureTable
            tableData={tableData}
            projectId={activeProjectId as string}
            autoLoadFromDB={false}
            onEditPage={handleEditPage}
            onDeletePage={handleDeletePage}
          />
        )}
      </Box>

      {/* حوارات الإضافة والتعديل */}
      <AddPageDialog
        open={addPageDialogOpen}
        onClose={() => setAddPageDialogOpen(false)}
        onPageAdded={handlePageAdded}
        projectId={activeProjectId as string}
      />

      <EditPageDialog
        open={editPageDialogOpen}
        onClose={() => setEditPageDialogOpen(false)}
        pageName={editingPageName}
        onPageEdited={handlePageEdited}
        projectId={activeProjectId as string}
      />
    </>
  );
}