'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Button,
  Divider,
  alpha,
  Stack,
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import Iconify from '@/components/iconify';
import ColorizedLabel from '@/shared-components/ColorizedLabel/colorizedLabel';
import { useTranslations } from 'next-intl';
import { useSettingsContext } from '@/components/settings';
import { useRouter as useIntlRouter } from '@/i18n/routing';
import { useEditor } from '@/redux/hooks/useEditor';
import { useDispatch } from 'react-redux';
import { setIsCreatingNewProject } from '@/redux/slices/editorSlice';

// ✅ استخدم سينجلتون supabase
import { getSupabaseClient } from '@/lib/supabaseClient';
type Database = any;

const TABLE_NAME = 'projects';

// ————— helpers —————
function computePlatformFlags(selected: string[]) {
  const has = (k: string) => selected.includes(k);
  const website = has('website');
  const mobile = has('mobile');
  const backend = has('backend') || has('api') || has('server');
  return { website, mobile, backend };
}

const EditorFieldSection: React.FC = () => {
  const t = useTranslations();
  const { themeDirection } = useSettingsContext();
  const intlRouter = useIntlRouter();
  const dispatch = useDispatch();

  const editor = useEditor();
  const {
    message,
    selectedCategories,
    setMessage,
    setSelectedCategories,
    addCategory,
    removeCategory,
  } = editor;

  const [showSelectionBar, setShowSelectionBar] = useState(false);

  // ✅ عميل Supabase (سينجلتون)
  const supabase = getSupabaseClient();

  useEffect(() => {
    setShowSelectionBar(selectedCategories.length > 0);
  }, [selectedCategories.length]);

  // === helpers: workspace + project ===
  async function ensureWorkspaceForUser(userId: string) {
    // 1) جرّب العضويات
    const { data: m1, error: e1 } = await supabase
      .from('workspace_members')
      .select('workspace_id')
      .eq('user_id', userId)
      .limit(1);

    if (!e1 && m1 && m1.length && 'workspace_id' in m1[0]) {
      return (m1[0] as { workspace_id: string }).workspace_id;
    }

    // 2) جرّب ورشة يملكها المستخدم
    const { data: w1 } = await supabase
      .from('workspaces')
      .select('id')
      .eq('owner_id', userId)
      .limit(1);

    if (w1 && w1.length && 'id' in w1[0]) {
      const wid = (w1[0] as { id: string }).id;
      await supabase
        .from('workspace_members')
        .insert([{ workspace_id: wid, user_id: userId, role: 'owner' } as any])
        .select();
      return wid;
    }

    // 3) أنشئ ورشة "Personal"
    const { data: created, error: e2 } = await supabase
      .from('workspaces')
      .insert([{ owner_id: userId, name: 'Personal' } as any])
      .select('id')
      .single();

    if (e2 || !created || !('id' in created))
      throw e2 || new Error('Failed to create workspace');

    const wid = (created as { id: string }).id;

    await supabase
      .from('workspace_members')
      .insert([{ workspace_id: wid, user_id: userId, role: 'owner' } as any])
      .select();

    return wid;
  }

  const slugify = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const handleSend = () => {
    if (selectedCategories.length === 0) {
      enqueueSnackbar(
        t('Please select at least one category before proceeding'),
        {
          variant: 'warning',
          autoHideDuration: 4000,
        },
      );
      return;
    }
    if (!message.trim()) return;

    // Set flag to indicate we're creating a new project
    dispatch(setIsCreatingNewProject(true));

    // Navigate to editor page - the editor will handle the API call
    intlRouter.push({ pathname: '/editor' });
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '700px', mx: 'auto', p: 2 }}>
      {/* Category Buttons */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="center"
          sx={{
            '& .MuiButtonBase-root': {
              color: '#9E9E9E',
              backgroundColor: '#0b3a42',
              border: '1px solid #34939F',
              borderRadius: 9999,
              px: 2.5,
              py: 1.5,
              textTransform: 'none',
              fontSize: '14px',
              fontWeight: 500,
              '&.active': {
                background: () =>
                  themeDirection === 'ltr'
                    ? 'linear-gradient(293.54deg, #1EFBB8 15.17%, #0EE5F9 84.83%)'
                    : 'linear-gradient(66.46deg, #1EFBB8 85%, #0EE5F9 85%)',
                color: 'primary.contrastText',
              },
              '&:hover': { backgroundColor: 'rgba(0, 184, 217, 0.2)' },
            },
          }}
        >
          <Button
            className={selectedCategories.includes('website') ? 'active' : ''}
            onClick={() =>
              selectedCategories.includes('website')
                ? removeCategory('website')
                : addCategory('website')
            }
          >
            {selectedCategories.includes('website') ? (
              <Box sx={{ display: 'inline', lineHeight: '1' }}>
                {t('Website')}
              </Box>
            ) : (
              <ColorizedLabel label={t('Website')} />
            )}
          </Button>

          <Button
            className={selectedCategories.includes('backend') ? 'active' : ''}
            onClick={() =>
              selectedCategories.includes('backend')
                ? removeCategory('backend')
                : addCategory('backend')
            }
          >
            {selectedCategories.includes('backend') ? (
              <Box sx={{ display: 'inline', lineHeight: '1' }}>
                {t('Dashboard')}
              </Box>
            ) : (
              <ColorizedLabel label={t('Dashboard')} />
            )}
          </Button>

          <Button
            className={selectedCategories.includes('mobile') ? 'active' : ''}
            onClick={() =>
              selectedCategories.includes('mobile')
                ? removeCategory('mobile')
                : addCategory('mobile')
            }
          >
            {selectedCategories.includes('mobile') ? (
              <Box sx={{ display: 'inline', lineHeight: '1' }}>
                {t('Mobile App')}
              </Box>
            ) : (
              <ColorizedLabel label={t('Mobile App')} />
            )}
          </Button>
        </Stack>
      </Box>

      {/* Animated Border Container */}
      <Box
        className="animate-border-color"
        sx={{ position: 'relative', p: '2px' }}
      >
        <Box
          className="inner-content"
          sx={{
            border: '1px solid',
            borderColor: (theme) => alpha(theme.palette.primary.main, 0.3),
          }}
        >
          {/* Selected Categories */}
          <Box
            sx={{
              overflow: 'hidden',
              transition: 'all 0.3s ease-in-out',
              maxHeight: showSelectionBar ? '60px' : '0px',
              opacity: showSelectionBar ? 1 : 0,
              transform: showSelectionBar
                ? 'translateY(0)'
                : 'translateY(-10px)',
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{
                backgroundColor: '#0D3137',
                p: 2,
                borderTopLeftRadius: '25px',
                borderTopRightRadius: '25px',
                fontSize: '14px',
                fontWeight: 500,
                textAlign: 'center',
                minHeight: '40px',
              }}
            >
              <IconButton onClick={() => setSelectedCategories([])}>
                <Iconify
                  icon={
                    themeDirection === 'ltr'
                      ? 'line-md:arrow-left'
                      : 'line-md:arrow-right'
                  }
                />
              </IconButton>
              {selectedCategories.length === 1
                ? selectedCategories[0] === 'website'
                  ? t('Website')
                  : selectedCategories[0] === 'backend'
                    ? t('Dashboard')
                    : t('Mobile App')
                : selectedCategories.length > 1
                  ? t('Multiple Selected')
                  : ''}
            </Stack>
          </Box>

          {/* Main Text Input Area */}
          <Box sx={{ p: 2 }}>
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1,
              }}
            >
              <TextField
                multiline
                minRows={6}
                maxRows={10}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t('Editor Placeholder')}
                variant="standard"
                fullWidth
                sx={{
                  '& .MuiInputBase-root': {
                    color: '#E0E0E0',
                    fontSize: '16px',
                    p: 2,
                    '&:before': { borderBottom: 'none' },
                    '&:after': { borderBottom: 'none' },
                    '&:hover:not(.Mui-disabled):before': {
                      borderBottom: 'none',
                    },
                  },
                  '& ::placeholder': {
                    color: (theme) =>
                      `${alpha(theme.palette.text.primary, 0.64)} !important`,
                  },
                }}
              />
              <IconButton
                onClick={handleSend}
                disabled={!message.trim()}
                sx={{
                  backgroundColor: message.trim() ? '#E0E0E0' : '#424242',
                  color: '#424242',
                  width: 30,
                  height: 30,
                  mt: 0.5,
                  '&:hover': {
                    backgroundColor: message.trim() ? '#FFFFFF' : '#424242',
                  },
                  '&.Mui-disabled': { backgroundColor: '#777777' },
                }}
              >
                <Iconify icon="fa6-solid:arrow-up" />
              </IconButton>
            </Box>

            {/* Bottom Control Bar */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mt: 2,
                pt: 1,
              }}
            >
              <IconButton
                size="small"
                sx={{
                  color: 'text.secondary',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                }}
              >
                <Iconify icon="eva:settings-outline" />
              </IconButton>

              <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

              <IconButton
                size="small"
                sx={{
                  color: 'text.secondary',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                }}
              >
                <Iconify icon="eva:plus-outline" />
              </IconButton>

              <Button
                variant="soft"
                size="small"
                startIcon={<Iconify icon="mingcute:message-4-line" />}
                sx={{
                  color: 'text.secondary',
                  backgroundColor: 'action.disabledBackground',
                  borderRadius: 1,
                  textTransform: 'none',
                  fontSize: '14px',
                  fontWeight: 600,
                  '&:hover': {
                    color: (theme) => alpha(theme.palette.text.secondary, 0.8),
                    backgroundColor: (theme) =>
                      alpha(theme.palette.action.disabledBackground, 0.1),
                  },
                }}
              >
                {t('Discuss')}
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default EditorFieldSection;
