'use client';

import React, {
  useMemo,
  useCallback,
  useEffect,
  useState,
  useRef,
} from 'react';
import { Box, Button, Stack, Typography, Chip, Grid } from '@mui/material';
import {
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Node,
  Edge,
} from '@xyflow/react';
import { useTranslations } from 'next-intl';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store/store';
import {
  selectFrontendStructure,
  selectBackendStructure,
  setFrontendNodes,
  setFrontendEdges,
  updateFrontendPages,
  setFrontendGenerated,
  removeFrontendPage,
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

interface CombinedStructureViewProps {
  onBackToERD: () => void;
}

export default function CombinedStructureView({
  onBackToERD,
}: CombinedStructureViewProps) {
  const t = useTranslations('FrontendStructure');
  const tMain = useTranslations();
  const { themeDirection } = useSettingsContext();
  const dispatch = useDispatch();
  const {
    message,
    selectedCategories,
    frontendStructure: editorFrontendStructure,
    isLoading,
    generatePages,
    setMessage,
    projectId,
  } = useEditor();
  const frontendStructure = useSelector(selectFrontendStructure);
  const backendStructure = useSelector(selectBackendStructure);
  const [addPageDialogOpen, setAddPageDialogOpen] = useState(false);
  const [editPageDialogOpen, setEditPageDialogOpen] = useState(false);
  const [editingPageName, setEditingPageName] = useState('');
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now());

  // Frontend React Flow state
  const [frontendNodes, setFrontendNodes, onFrontendNodesChange] =
    useNodesState([]);
  const [frontendEdges, setFrontendEdges, onFrontendEdgesChange] =
    useEdgesState([]);

  // Backend React Flow state
  const [backendNodes, setBackendNodes, onBackendNodesChange] = useNodesState(
    [],
  );
  const [backendEdges, setBackendEdges, onBackendEdgesChange] = useEdgesState(
    [],
  );

  // Use Redux state if available
  const pageData = useMemo(() => {
    if (frontendStructure?.pages?.length > 0) {
      console.log('Using saved pages from Redux:', frontendStructure.pages);
      return frontendStructure.pages;
    } else {
      console.log('No saved pages found');
      return [];
    }
  }, [frontendStructure?.pages, frontendStructure?.isGenerated]);

  const initialFrontendNodes = useMemo(() => {
    return pageData.map((page, index) => ({
      id: page.pageName,
      type:
        page.pageType === 'home'
          ? 'input'
          : page.pageType === 'detail'
            ? 'output'
            : 'default',
      data: {
        label: page.pageName,
        description: page.optionalDescription,
        type: page.pageType,
      },
      position: { x: 250, y: index * 150 },
      style: {
        background: '#333',
        border: '1px solid #bbb',
        borderRadius: 8,
        fontWeight: 600,
        fontSize: 15,
        padding: 8,
        minWidth: 120,
        textAlign: 'center',
        boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
        color: '#fff',
      },
    }));
  }, [pageData]);

  const initialFrontendEdges = useMemo(() => {
    const edges: any[] = [];
    pageData.forEach((page) => {
      if (page.parentPage) {
        const edge = {
          id: `e-${page.parentPage}-${page.pageName}`,
          source: page.parentPage,
          target: page.pageName,
          style: { stroke: '#bbb', strokeWidth: 2 },
        };
        edges.push(edge);
      }
    });
    return edges;
  }, [pageData]);

  const onFrontendConnect = useCallback(
    (params: Connection) => setFrontendEdges((eds) => addEdge(params, eds)),
    [setFrontendEdges],
  );

  const onBackendConnect = useCallback(
    (params: Connection) => setBackendEdges((eds) => addEdge(params, eds)),
    [setBackendEdges],
  );

  // Sync React Flow state with Redux state when new pages are generated
  useEffect(() => {
    if (
      frontendStructure?.nodes?.length > 0 &&
      frontendStructure?.edges?.length > 0
    ) {
      console.log('Syncing Frontend React Flow with Redux state:', {
        nodes: frontendStructure.nodes.length,
        edges: frontendStructure.edges.length,
        pages: frontendStructure.pages.length,
        isGenerated: frontendStructure.isGenerated,
      });

      const newNodes = JSON.parse(JSON.stringify(frontendStructure.nodes));
      const newEdges = JSON.parse(JSON.stringify(frontendStructure.edges));

      setFrontendNodes(newNodes as any);
      setFrontendEdges(newEdges as any);
      setLastUpdateTime(Date.now());
    }
  }, [frontendStructure?.nodes?.length, frontendStructure?.edges?.length]);

  // Initialize backend flow from Redux
  useEffect(() => {
    if (
      backendStructure?.nodes?.length > 0 &&
      backendStructure?.edges?.length > 0
    ) {
      setBackendNodes(
        JSON.parse(JSON.stringify(backendStructure.nodes)) as any,
      );
      setBackendEdges(
        JSON.parse(JSON.stringify(backendStructure.edges)) as any,
      );
    } else {
      setBackendNodes([]);
      setBackendEdges([]);
    }
  }, [backendStructure?.nodes?.length, backendStructure?.edges?.length]);

  // Initialize frontend flow
  useEffect(() => {
    const shouldRecalculate =
      !frontendStructure?.nodes?.length ||
      !frontendStructure?.edges?.length ||
      forceUpdate > 0;

    if (shouldRecalculate) {
      console.log('Recalculating frontend diagram with new data:', {
        nodes: initialFrontendNodes.length,
        edges: initialFrontendEdges.length,
        pages: pageData.length,
        forceUpdate,
        hasSavedNodes: !!frontendStructure?.nodes?.length,
        hasSavedEdges: !!frontendStructure?.edges?.length,
      });
      setFrontendNodes(JSON.parse(JSON.stringify(initialFrontendNodes)) as any);
      setFrontendEdges(JSON.parse(JSON.stringify(initialFrontendEdges)) as any);
    }
  }, [
    initialFrontendNodes,
    initialFrontendEdges,
    setFrontendNodes,
    setFrontendEdges,
    pageData.length,
    forceUpdate,
    frontendStructure?.nodes?.length,
    frontendStructure?.edges?.length,
  ]);

  const handleGenerateCode = async () => {
    // Implementation for generating code
  };

  const handlePageAdded = useCallback(() => {
    console.log('Page added, forcing diagram update');
    setForceUpdate((prev) => prev + 1);
  }, []);

  const handleEditPage = useCallback((pageName: string) => {
    setEditingPageName(pageName);
    setEditPageDialogOpen(true);
  }, []);

  const handleDeletePage = useCallback(
    (pageName: string) => {
      const pageIndex = frontendStructure?.pages?.findIndex(
        (page) => page.pageName === pageName,
      );

      if (pageIndex !== undefined && pageIndex >= 0) {
        dispatch(removeFrontendPage(pageIndex));
        setTimeout(() => {
          setForceUpdate((prev) => prev + 1);
        }, 50);
      }
    },
    [dispatch, frontendStructure?.pages],
  );

  const handlePageEdited = useCallback(() => {
    console.log('Page edited, forcing diagram update');
    setForceUpdate((prev) => prev + 1);
  }, []);

  const tableData = pageData.map((page) => ({
    name: page.pageName,
    type: page.pageType,
    parentPage: page.parentPage,
    status: 'Active',
    action: 'Edit',
    description: page.optionalDescription,
  }));

  return (
    <>
      <Box
        sx={{
          height: '100%',
          overflow: 'auto',
          p: 1,
          gap: 1,
        }}
      >
        <Stack
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={1}
          sx={{ mb: 1 }}
        >
          <Stack flexDirection="row" alignItems="center" spacing={1}>
            <Iconify
              icon={
                themeDirection === 'rtl'
                  ? 'mingcute:arrow-right-fill'
                  : 'mingcute:arrow-left-fill'
              }
              onClick={onBackToERD}
              sx={{ cursor: 'pointer' }}
            />
            <Typography variant="h4">{t('title')}</Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              size="small"
              variant={'contained'}
              color={'warning'}
              startIcon={<Iconify icon="tabler:pencil-code" />}
              onClick={handleGenerateCode}
              disabled={isLoading}
              sx={{
                borderRadius: 1,
              }}
            >
              {isLoading ? tMain('Generating') : tMain('Generate Pages')}
            </Button>
            <Button
              size="small"
              variant="contained"
              color="success"
              startIcon={<Iconify icon="mdi:plus" />}
              onClick={() => setAddPageDialogOpen(true)}
              sx={{
                borderRadius: 1,
              }}
            >
              {t('Add Page')}
            </Button>
          </Stack>
        </Stack>

        <Grid container spacing={2}>
          {/* Frontend Structure */}
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ mb: 1, color: 'primary.main' }}>
                Frontend Structure
                {frontendStructure?.isGenerated && (
                  <Chip
                    label={`${frontendStructure?.pages?.length} pages`}
                    color="success"
                    size="small"
                    variant="outlined"
                    sx={{ ml: 1 }}
                  />
                )}
              </Typography>
            </Box>
            <StructureFlow
              key={`frontend-flow-${lastUpdateTime}-${frontendNodes.length}-${frontendEdges.length}`}
              nodes={frontendNodes}
              edges={frontendEdges}
              onNodesChange={onFrontendNodesChange}
              onEdgesChange={onFrontendEdgesChange}
              onConnect={onFrontendConnect}
              type="frontend"
              height="50dvh"
            />
          </Grid>

          {/* Backend Structure */}
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ mb: 1, color: 'secondary.main' }}>
                Backend Structure
                {backendStructure?.isGenerated && (
                  <Chip
                    label={`${backendStructure.entities.length} entities`}
                    color="info"
                    size="small"
                    variant="outlined"
                    sx={{ ml: 1 }}
                  />
                )}
              </Typography>
            </Box>
            <StructureFlow
              key={`backend-flow-${lastUpdateTime}-${backendNodes.length}-${backendEdges.length}`}
              nodes={backendNodes}
              edges={backendEdges}
              onNodesChange={onBackendNodesChange}
              onEdgesChange={onBackendEdgesChange}
              onConnect={onBackendConnect}
              type="backend"
              height="50dvh"
            />
          </Grid>
        </Grid>

        <FrontendStructureTable
          tableData={tableData}
          onEditPage={handleEditPage}
          onDeletePage={handleDeletePage}
        />
      </Box>

      <AddPageDialog
        open={addPageDialogOpen}
        onClose={() => setAddPageDialogOpen(false)}
        onPageAdded={handlePageAdded}
        projectId={projectId as string}
      />

<EditPageDialog
  open={editPageDialogOpen}
  onClose={() => setEditPageDialogOpen(false)}
  pageName={editingPageName}
  onPageEdited={handlePageEdited}
  projectId={projectId as string}   // ✅ أُضيفت
/>

    </>
  );
}
