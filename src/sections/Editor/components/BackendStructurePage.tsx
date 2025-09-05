'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Stack, Card, LinearProgress, Alert
} from '@mui/material';
import {
  useNodesState, useEdgesState, addEdge, Connection, Edge, Node
} from '@xyflow/react';
import StructureFlow from './StructureFlow';
import { useTranslations } from 'next-intl';
import Iconify from '@/components/iconify';
import { supabase } from '@/lib/supabaseClient';

type ProjectPageRow = {
  id: string;                 // uuid
  project_id: string;         // نص أو uuid حسب سكيمتك
  page_name: string;
  platform: 'website'|'mobile'|'backend';
  description: string | null;
  parent_page: string | null;
  page_type: string | null;
  position: number | null;
  created_at: string;
  updated_at: string;
};

interface BackendStructurePageProps {
  onBackToERD: () => void;
  projectId: string; // ضروري لفلترة الصفحات
}

export default function BackendStructurePage({ onBackToERD, projectId }: BackendStructurePageProps) {
  const t = useTranslations('BackendStructure');

  // رسم الـFlow
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // حالة جلب البيانات
  const [rows, setRows] = useState<ProjectPageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // --- جلب صفحات الـ backend من جدول project_pages ---
  const fetchBackendPages = useCallback(async () => {
    setErr(null);
    setLoading(true);
    const { data, error } = await supabase
      .from('project_pages')
      .select('*')
      .eq('project_id', projectId)
      .eq('platform', 'backend')
      .order('position', { ascending: true });

    if (error) {
      setErr(error.message);
      setRows([]);
    } else {
      setRows((data || []) as ProjectPageRow[]);
    }
    setLoading(false);
  }, [projectId]);

  // أول تحميل + Realtime
  useEffect(() => {
    fetchBackendPages();

    // استماع فوري لأي تغيير على project_pages لهذا المشروع
    const ch = supabase
      .channel(`proj-pages-backend-${projectId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'project_pages', filter: `project_id=eq.${projectId}` },
        () => fetchBackendPages()
      )
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  }, [projectId, fetchBackendPages]);

  // --- تحويل الصفوف إلى Nodes مرسومة ---
  // بما أنه لا يوجد حقول pos_x/pos_y، سنرتّبها تلقائيًا على Grid بسيط.
  const computedNodes: Node[] = useMemo(() => {
    const COLS = 4;
    const GAP_X = 280; // المسافة أفقياً
    const GAP_Y = 160; // المسافة عمودياً
    return rows.map((r, i) => {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      return {
        id: r.id,
        position: { x: col * GAP_X, y: row * GAP_Y },
        data: { label: r.page_name, description: r.description || '' },
        type: 'default',
      } as Node;
    });
  }, [rows]);

  // كلما تغيّرت الصفوف، حدث الـnodes. (edges تبقى كما هي مؤقتًا)
  useEffect(() => {
    setNodes(computedNodes as any);
    // لو عندك ربط edges بداتابيز، استرجعها هنا و setEdges(...)
  }, [computedNodes, setNodes]);

  // بيانات الجدول السفلي (من الداتابيز مباشرة)
  const tableData = rows.map(r => ({
    name: r.page_name,
    type: r.page_type || 'API',
    description: r.description || '-',
    status: 'Active',
    action: 'Edit'
  }));

  return (
    <Box sx={{ height: '100%', overflowY: 'auto', overflowX: 'hidden', p: 1, gap: 1 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="eva:arrow-back-fill" onClick={onBackToERD} sx={{ cursor: 'pointer', mr: 1 }} />
          <Typography variant="h6">{t('title')}</Typography>
        </Stack>
      </Stack>

      {/* حالة التحميل/الخطأ */}
      {loading && <LinearProgress sx={{ mb: 1 }} />}
      {err && <Alert severity="error" sx={{ mb: 1 }}>{err}</Alert>}

      {/* المخطط */}
      <StructureFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        type="backend"
      />

      {/* الجدول */}
      <Card sx={{ flex: 1, minHeight: 0, maxHeight: '70dvh' }}>
        <TableContainer component={Paper} sx={{ flex: 1, overflow: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>{t('name')}</TableCell>
                <TableCell>{t('type')}</TableCell>
                <TableCell>{t('description')}</TableCell>
                <TableCell>{t('status')}</TableCell>
                <TableCell>{t('action')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tableData.map((row, i) => (
                <TableRow key={i}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.type}</TableCell>
                  <TableCell>{row.description}</TableCell>
                  <TableCell>{row.status}</TableCell>
                  <TableCell>• • •</TableCell>
                </TableRow>
              ))}
              {!loading && tableData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                    لا توجد صفحات Backend بعد لهذا المشروع.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
