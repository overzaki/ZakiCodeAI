'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, FormControl, Select, MenuItem,
  Typography, Box, IconButton,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store/store';
import { updateFrontendPage } from '@/redux/slices/editorSlice';
import Iconify from '@/components/iconify';
import { enqueueSnackbar } from 'notistack';

// ✅ Supabase (لو ما هو مُثبّت: npm i @supabase/auth-helpers-nextjs)
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
type Db = any;

interface EditPageDialogProps {
  open: boolean;
  onClose: () => void;
  pageName: string;
  onPageEdited?: () => void;
  projectId: string;
}

export default function EditPageDialog({
  open,
  onClose,
  pageName,
  onPageEdited,
  projectId,
}: EditPageDialogProps) {
  const dispatch = useDispatch();
  const frontendStructure = useSelector((state: RootState) => state.editor.frontendStructure);

  const [formData, setFormData] = useState({
    pageName: '',
    optionalDescription: '',
    parentPage: '',
    pageType: 'blank',
  });
  const [saving, setSaving] = useState(false);
  const [originalName, setOriginalName] = useState(pageName);

  // Supabase client
  const supabase = createClientComponentClient<Db>();

  // الصفحة الحالية من الريدكس
  const currentPage = frontendStructure?.pages?.find((p) => p.pageName === pageName);
  const existingPages = (frontendStructure?.pages || []).filter((p) => p.pageName !== pageName);

  // تهيئة النموذج عند الفتح/تغيير الصفحة
  useEffect(() => {
    if (currentPage) {
      setFormData({
        pageName: currentPage.pageName,
        optionalDescription: currentPage.optionalDescription,
        parentPage: currentPage.parentPage || '',
        pageType: currentPage.pageType,
      });
      setOriginalName(currentPage.pageName);
    }
  }, [currentPage, open]);

  // حفظ في Supabase ثم Redux
  const handleSubmit = async () => {
    if (!formData.pageName.trim() || !currentPage) return;

    setSaving(true);
    try {
      const payload = {
        page_name: formData.pageName.trim(),
        description: formData.optionalDescription.trim() || null,
        parent_page: formData.parentPage || null,
        page_type: formData.pageType,
        platform: currentPage.platform || 'website',
        updated_at: new Date().toISOString(),
      };

      console.log('EditPageDialog: Updating with payload:', payload);
      console.log('EditPageDialog: Project ID:', projectId);
      console.log('EditPageDialog: Original name:', originalName);
      
      // If the page name changed, we need to use a different approach
      if (formData.pageName.trim() !== originalName) {
        console.log('EditPageDialog: Page name changed, need to delete old and insert new');
        
        // Delete the old record
        const { error: deleteErr } = await supabase
          .from('project_pages')
          .delete()
          .eq('project_id', projectId)
          .eq('page_name', originalName);
          
        if (deleteErr) {
          console.error('EditPageDialog: Delete error:', deleteErr);
          throw deleteErr;
        }
        
        // Insert the new record
        const guessedPosition =
          (frontendStructure?.pages?.findIndex((p) => p.pageName === originalName) ?? 0);

        const insertPayload = {
          ...payload,
          project_id: projectId,
          position: guessedPosition,
          created_at: new Date().toISOString(),
        };

        console.log('EditPageDialog: Inserting new payload:', insertPayload);
        
        const { error: insErr } = await supabase
          .from('project_pages')
          .insert(insertPayload);
          
        console.log('EditPageDialog: Insert result:', { insErr });
        
        if (insErr) {
          console.error('EditPageDialog: Insert error:', insErr);
          throw insErr;
        }
      } else {
        // Page name didn't change, just update
        const { data: updated, error: updErr } = await supabase
          .from('project_pages')
          .update(payload)
          .eq('project_id', projectId)
          .eq('page_name', originalName)
          .select('id');

        console.log('EditPageDialog: Update result:', { updated, updErr });
        
        if (updErr) {
          console.error('EditPageDialog: Update error:', updErr);
          throw updErr;
        }

        // If no record was updated, insert a new one
        if (!updated || updated.length === 0) {
          console.log('EditPageDialog: No existing record found, inserting new one');
          
          const guessedPosition =
            (frontendStructure?.pages?.findIndex((p) => p.pageName === originalName) ?? 0);

          const insertPayload = {
            ...payload,
            project_id: projectId,
            position: guessedPosition,
            created_at: new Date().toISOString(),
          };

          console.log('EditPageDialog: Inserting payload:', insertPayload);
          
          const { error: insErr } = await supabase
            .from('project_pages')
            .insert(insertPayload);
            
          console.log('EditPageDialog: Insert result:', { insErr });
          
          if (insErr) {
            console.error('EditPageDialog: Insert error:', insErr);
            throw insErr;
          }
        } else {
          console.log('EditPageDialog: Successfully updated existing record');
        }
      }

      // حدث Redux
      const idx = frontendStructure?.pages?.findIndex((p) => p.pageName === originalName) ?? -1;
      if (idx >= 0) {
        dispatch(
          updateFrontendPage({
            index: idx,
            page: {
              pageName: payload.page_name,
              optionalDescription: formData.optionalDescription.trim(),
              parentPage: formData.parentPage || null,
              pageType: formData.pageType as any,
              platform: currentPage.platform,
            },
          })
        );
      }

      // حفظ سريع لـ localStorage
      setTimeout(() => {
        try {
          const st = JSON.parse(localStorage.getItem('editor-state') || '{}');
          localStorage.setItem('editor-state', JSON.stringify(st));
        } catch {}
      }, 100);

      enqueueSnackbar('Page updated successfully', { variant: 'success' });
      onPageEdited?.();
      onClose();
    } catch (e: any) {
      console.error(e);
      enqueueSnackbar(e?.message || 'Failed to update page', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => onClose();

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Edit Page</Typography>
        <IconButton onClick={handleCancel}><Iconify icon="eva:close-fill" /></IconButton>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>Page Name</Typography>
            <TextField
              fullWidth
              variant="filled"
              value={formData.pageName}
              onChange={(e) => setFormData((prev) => ({ ...prev, pageName: e.target.value }))}
              placeholder="Enter page name"
            />
          </Box>

          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>Optional Description</Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              variant="filled"
              value={formData.optionalDescription}
              onChange={(e) => setFormData((prev) => ({ ...prev, optionalDescription: e.target.value }))}
              placeholder="Describe what this page will contain"
            />
          </Box>

          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>Parent Page (optional)</Typography>
            <FormControl fullWidth variant="filled">
              <Select
                value={formData.parentPage}
                onChange={(e) => setFormData((prev) => ({ ...prev, parentPage: String(e.target.value) }))}
                displayEmpty
              >
                <MenuItem value="">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>Select parent page</Typography>
                </MenuItem>
                {existingPages.map((p) => (
                  <MenuItem key={p.pageName} value={p.pageName}>{p.pageName}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>Page Type</Typography>
            <FormControl fullWidth variant="filled">
              <Select
                value={formData.pageType}
                onChange={(e) => setFormData((prev) => ({ ...prev, pageType: String(e.target.value) }))}
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
        <Button variant="outlined" onClick={handleCancel} startIcon={<Iconify icon="eva:close-fill" />}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={!formData.pageName.trim() || saving}
          startIcon={<Iconify icon={saving ? 'eos-icons:bubble-loading' : 'eva:checkmark-fill'} />}
        >
          {saving ? 'Saving…' : 'Update Page'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
