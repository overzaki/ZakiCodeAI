'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  IconButton,
  alpha,
  LinearProgress,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import Iconify from '@/components/iconify';
import { supabase } from '@/lib/supabaseClient';
import { useSearchParams } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import { useEditor } from '@/hooks/useEditor';

type TableRowData = {
  name: string;
  type: string;
  parentPage: string | null;
  status: string;
  action: string;
  description: string;
};

type Props = {
  /** بيانات جاهزة من الأب (اختياري). لو أرسلتها، لن نحمّل من DB */
  tableData?: TableRowData[];
  /** projectId للتحميل/الحذف المباشر من Supabase (اختياري) */
  projectId?: string;
  /** لو true (الافتراضي) نحمل من DB عند وجود projectId */
  autoLoadFromDB?: boolean;

  onEditPage?: (pageName: string) => void;
  onDeletePage?: (pageName: string) => void;
};

export default function FrontendStructureTable({
  tableData,
  projectId: projectIdProp,
  autoLoadFromDB = true,
  onEditPage,
  onDeletePage,
}: Props) {
  const t = useTranslations('FrontendStructure');
  const searchParams = useSearchParams();
  const { projectId: projectIdFromEditor } = useEditor();

  // ✅ اقرأ من prop ثم ?project ثم ?projectId ثم من الـ hook
  const projectId =
    projectIdProp ||
    searchParams.get('project') ||
    searchParams.get('projectId') ||
    projectIdFromEditor ||
    null;

  const [rows, setRows] = useState<TableRowData[]>(tableData ?? []);
  const [loading, setLoading] = useState(false);

  // لو تغيّرت بيانات الأب، نستخدمها مباشرة
  useEffect(() => {
    if (tableData) setRows(tableData);
  }, [tableData]);

  // تحميل من Supabase + Realtime (فقط لو ما في tableData من الأب)
  useEffect(() => {
    if (!autoLoadFromDB || !projectId || tableData) return;

    let mounted = true;

    const mapRows = (data: any[] = []): TableRowData[] =>
      data.map((r) => ({
        name: r.page_name,
        type: r.page_type,
        parentPage: r.parent_page,
        status: 'Active',
        action: 'Edit',
        description: r.description ?? '',
      }));

    const load = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('project_pages')
          .select('page_name,page_type,parent_page,description,position,created_at')
          .eq('project_id', projectId)
          .order('position', { ascending: true })
          .order('created_at', { ascending: true });

        if (!mounted) return;
        if (error) throw error;

        setRows(mapRows(data || []));
      } catch (err: any) {
        enqueueSnackbar(err?.message || 'Failed to load pages', { variant: 'error' });
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    const channel = supabase
      .channel(`project_pages:${projectId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'project_pages', filter: `project_id=eq.${projectId}` },
        () => load()
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [autoLoadFromDB, projectId, tableData]);

  const handleEdit = (pageName: string) => {
    onEditPage?.(pageName);
  };

  const handleDelete = async (pageName: string) => {
    // لو الأب مرّر callback، خليه يتولى الحذف (DB + Redux)
    if (onDeletePage) return onDeletePage(pageName);

    // خلاف ذلك، نحذف مباشرة من Supabase
    if (!projectId) return;
    try {
      const { error } = await supabase
        .from('project_pages')
        .delete()
        .eq('project_id', projectId)
        .eq('page_name', pageName);

      if (error) throw error;

      setRows((prev) => prev.filter((r) => r.name !== pageName));
      enqueueSnackbar('Page deleted', { variant: 'success' });
    } catch (err: any) {
      enqueueSnackbar(err?.message || 'Failed to delete page', { variant: 'error' });
    }
  };

  const dataToRender = useMemo(() => rows, [rows]);

  return (
    <Card sx={{ flex: 1, minHeight: 0, maxHeight: '70dvh' }}>
      {loading && <LinearProgress />}
      <TableContainer component={Paper} sx={{ flex: 1, overflow: 'auto' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>{t('name')}</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>{t('parentPage')}</TableCell>
              <TableCell>{t('action')}</TableCell>
            </TableRow>
          </TableHead>

          <TableBody sx={{ bgcolor: 'background.default' }}>
            {dataToRender.map((row, index) => (
              <TableRow key={index} hover>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.description}</TableCell>
                <TableCell>{row.parentPage || '-'}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleEdit(row.name)}
                      sx={{
                        borderRadius: 1.2,
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                      }}
                    >
                      <Iconify icon="solar:pen-2-outline" sx={{ cursor: 'pointer', color: 'primary.main' }} />
                    </IconButton>

                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(row.name)}
                      sx={{
                        borderRadius: 1.2,
                        bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
                      }}
                    >
                      <Iconify icon="solar:trash-bin-trash-linear" sx={{ cursor: 'pointer', color: 'error.main' }} />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}

            {!loading && dataToRender.length === 0 && (
              <TableRow>
                <TableCell colSpan={4}>
                  <Typography variant="body2" color="text.secondary">
                    No pages found.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}
