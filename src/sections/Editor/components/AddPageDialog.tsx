'use client';

import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, FormControl, Select, MenuItem,
  Typography, Box, IconButton, Alert, CircularProgress
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store/store';
import { addFrontendPage } from '@/redux/slices/editorSlice';
import Iconify from '@/components/iconify';
import { supabase } from '@/lib/supabaseClient';

interface AddPageDialog {
  open: boolean;
  onClose: () => void;
  onPageAdded?: () => void;
  /** مرّر معرف المشروع الحالي (UUID أو نص حسب سكيمتك) */
  projectId: string;
  /** المنصّة: website | mobile | backend (مطابقة للـ CHECK في الجدول) */
  platform?: 'website' | 'mobile' | 'backend';
}

export default function AddPageDialog({
  open,
  onClose,
  onPageAdded,
  projectId,
  platform = 'website',
}: AddPageDialog) {
  const dispatch = useDispatch();
  const frontendStructure = useSelector(
    (state: RootState) => state.editor.frontendStructure,
  );

  const [formData, setFormData] = useState({
    pageName: '',
    optionalDescription: '',
    parentPage: '',
    pageType: 'blank',
  });

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const existingPages = frontendStructure?.pages || [];

  const handleSubmit = async () => {
    setErrorMsg(null);
    if (!formData.pageName.trim()) return;
    if (!projectId) {
      setErrorMsg('Missing projectId to save the page in database.');
      return;
    }

    try {
      setSaving(true);

      // رتّب position بسرعة بناءً على عدد الصفحات الحالية (أو احسبها بالسيرفر لاحقًا)
      const position = existingPages.length;

      // كتابة للقاعدة مع onConflict على (project_id,page_name)
      const payload = {
        project_id: projectId, // UUID أو TEXT حسب سكيمتك
        page_name: formData.pageName.trim(),
        platform,
        description: formData.optionalDescription.trim() || null,
        parent_page: formData.parentPage || null,
        page_type: formData.pageType,
        position,
      };

      const { data, error } = await supabase
        .from('project_pages')
        .upsert(payload, { onConflict: 'project_id,page_name' })
        .select()
        .single();

      if (error) throw error;

      // بعد نجاح DB: حدّث الواجهة (Redux) — إبقِ الحقول كما كنت تعمل
      dispatch(
        addFrontendPage({
          pageName: payload.page_name,
          optionalDescription: payload.description || '',
          parentPage: payload.parent_page,
          pageType: payload.page_type as any,
          platform: payload.platform,
          // تقدر تحتفظ بـ data.id لو حاب تربط عقدة الـERD بالـUUID
          // id: data?.id,
        }),
      );

      // حفظ سريع للـlocalStorage (كما عندك)
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          try {
            const currentState = JSON.parse(
              localStorage.getItem('editor-state') || '{}',
            );
            localStorage.setItem('editor-state', JSON.stringify(currentState));
          } catch (e) {
            console.warn('Failed to save to localStorage:', e);
          }
        }
      }, 100);

      // حدّث مخطط الـERD (استدعاء الدالة اللي بترسمه)
      onPageAdded?.();

      // تصفير النموذج وإغلاق
      setFormData({
        pageName: '',
        optionalDescription: '',
        parentPage: '',
        pageType: 'blank',
      });
      onClose();
    } catch (err: any) {
      // لو unique violation مثلاً
      setErrorMsg(err?.message || 'Failed to save page.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      pageName: '',
      optionalDescription: '',
      parentPage: '',
      pageType: 'blank',
    });
    setErrorMsg(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <Typography variant="h6">Add Page to Map</Typography>
        <IconButton onClick={handleCancel}><Iconify icon="eva:close-fill" /></IconButton>
      </DialogTitle>

      <DialogContent>
        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Page Name
            </Typography>
            <TextField
              fullWidth variant="filled"
              value={formData.pageName}
              onChange={(e) =>
                setFormData((p) => ({ ...p, pageName: e.target.value }))
              }
              placeholder="Enter page name"
            />
          </Box>

          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Optional Description
            </Typography>
            <TextField
              fullWidth multiline rows={3} variant="filled"
              value={formData.optionalDescription}
              onChange={(e) =>
                setFormData((p) => ({ ...p, optionalDescription: e.target.value }))
              }
              placeholder="Describe what this page will contain"
            />
          </Box>

          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Parent Page (optional)
            </Typography>
            <FormControl fullWidth variant="filled">
              <Select
                value={formData.parentPage}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, parentPage: e.target.value as string }))
                }
                displayEmpty
              >
                <MenuItem value="">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Select parent page
                  </Typography>
                </MenuItem>
                {existingPages.map((page: any) => (
                  <MenuItem key={page.pageName} value={page.pageName}>
                    {page.pageName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Page Type
            </Typography>
            <FormControl fullWidth variant="filled">
              <Select
                value={formData.pageType}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, pageType: e.target.value as string }))
                }
              >
                <MenuItem value="blank">Blank page</MenuItem>
                <MenuItem value="template">Template page</MenuItem>
                <MenuItem value="duplicate">Duplicate from existing</MenuItem>
                <MenuItem value="external">External link</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button variant="outlined" onClick={handleCancel}
          startIcon={<Iconify icon="eva:close-fill" />}>
          Cancel
        </Button>
        <Button
          variant="contained" color="success" onClick={handleSubmit}
          disabled={!formData.pageName.trim() || saving}
          startIcon={
            saving ? <CircularProgress size={18} color="inherit" /> : <Iconify icon="eva:checkmark-fill" />
          }
        >
          {saving ? 'Saving...' : 'Add Page to Map'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
