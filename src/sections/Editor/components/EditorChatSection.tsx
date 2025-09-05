'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Box, Stack, Typography, IconButton, Button, Avatar, TextField,
  InputAdornment, Chip, Alert, LinearProgress,
} from '@mui/material';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';

import { RootState } from '@/redux/store/store';
import { selectChatMessages, addChatMessage, IChatMessage } from '@/redux/slices/editorSlice';
import { useEditor } from '@/hooks/useEditor';
import { useTranslations } from 'next-intl';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { ImagesSrc } from '@/constants/imagesSrc';
import Iconify from '@/components/iconify';
import { useSearchParams } from 'next/navigation';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
type Database = any;

const isUuid = (v?: string | null) =>
  !!v && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v!);

function computePlatformFlags(selected: string[] | undefined | null) {
  const s = new Set((selected || []).map((x) => String(x).toLowerCase()));
  const website = s.has('website') || s.has('dashboard');
  const mobile  = s.has('mobile');
  const backend = s.has('backend') || s.has('api') || s.has('server');
  return { website, mobile, backend };
}

interface EditorChatSectionProps {
  onSendMessage?: (message: string) => void;
  onTabChange?: (tab: 'chat' | 'design') => void;
  onVisualEdit?: () => void;
  onDiscuss?: () => void;
  onSuccessfulGeneration?: (projectId: string) => void;
  onSuccessfulCodeGeneration?: (projectId: string) => void;
  projectId?: string | null;
  currentView?: string;
}

const EditorChatSection: React.FC<EditorChatSectionProps> = ({ onTabChange, projectId }) => {
  const t = useTranslations();
  const dispatch = useDispatch();
  const { copy } = useCopyToClipboard();
  const searchParams = useSearchParams();

  const editor = useEditor() as any;
  const message: string = editor?.message ?? '';
  const isLoading: boolean = !!editor?.isLoading;
  const setMessage: (v: string) => void = editor?.setMessage ?? (() => {});
  const selectedCategories: string[] = editor?.selectedCategories ?? [];

  const chatMessages = useSelector((s: RootState) => selectChatMessages(s)) || [];

  const [activeTab, setActiveTab] = useState<'chat' | 'design'>('chat');
  const [saving, setSaving] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const pendingClientIds = useRef<Set<string>>(new Set());

  const supabase = useMemo(() => createClientComponentClient<Database>(), []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleTabChange = (tab: 'chat' | 'design') => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  useEffect(() => {
    let cancelled = false;

    const seed = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!cancelled) setUserId(error ? null : (data.user?.id ?? null));
    };
    seed();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!cancelled) setUserId(session?.user?.id ?? null);
    });

    return () => {
      cancelled = true;
      sub?.subscription?.unsubscribe?.();
    };
  }, [supabase]);

  useEffect(() => {
    if (!userId) return;

    const safeProjectId = isUuid(projectId || '') ? (projectId as string) : null;
    const convKey = `conv:${safeProjectId || 'global'}`;

    const init = async () => {
      setDbError(null);
      try {
        const cached =
          typeof window !== 'undefined' ? localStorage.getItem(convKey) : null;
        if (cached) {
          setConversationId(cached);
          return;
        }

        const { data, error } = await supabase
          .from('chat_conversations')
          .insert({ user_id: userId, project_id: safeProjectId, title: null })
          .select('id')
          .single();

        if (error) throw error;
        localStorage.setItem(convKey, data!.id);
        setConversationId(data!.id);
      } catch (e: any) {
        console.error(e);
        setDbError(e?.message || String(e));
      }
    };

    init();
  }, [userId, projectId, supabase]);

  useEffect(() => {
    if (!conversationId) return;
    (async () => {
      setDbError(null);
      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('id, role, content, created_at, meta')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });

        if (error) throw error;

        if (!chatMessages.length && data?.length) {
          data.forEach((row) => {
            dispatch(
              addChatMessage({
                id: row.id,
                type: row.role === 'assistant' ? 'ai' : 'user',
                content: row.content,
                timestamp: row.created_at,
                name: row.role === 'assistant' ? 'ZakiCode' : 'User',
              })
            );
          });
        }
      } catch (e: any) {
        console.error(e);
        setDbError(e?.message || String(e));
      }
    })();
  }, [conversationId, dispatch, supabase, chatMessages.length]);

  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const row: any = payload.new;
          const cid = row?.meta?.client_id;
          if (cid && pendingClientIds.current.has(cid)) {
            pendingClientIds.current.delete(cid);
            return;
          }
          dispatch(
            addChatMessage({
              id: row.id,
              type: row.role === 'assistant' ? 'ai' : 'user',
              content: row.content,
              timestamp: row.created_at,
              name: row.role === 'assistant' ? 'ZakiCode' : 'User',
            })
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, dispatch, supabase]);

  useEffect(() => { scrollToBottom(); }, [chatMessages.length, scrollToBottom]);

  const sendToN8n = async (body: any) => {
    const res = await fetch('/api/chat/send', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await res.text());
    try { return await res.json(); } catch { return {}; }
  };

  const getPlatformFlags = (): { website: boolean; mobile: boolean; backend: boolean } => {
    let flags = computePlatformFlags(selectedCategories);
    if (flags.website || flags.mobile || flags.backend) return flags;

    try {
      const rid = searchParams?.get('rid');
      if (typeof window !== 'undefined' && rid) {
        const raw = localStorage.getItem(`req:${rid}`);
        if (raw) {
          const parsed = JSON.parse(raw || '{}');
          if (Array.isArray(parsed?.selectedCategories)) {
            flags = computePlatformFlags(parsed.selectedCategories);
          } else if (parsed?.flags) {
            return {
              website: !!parsed.flags.website,
              mobile: !!parsed.flags.mobile,
              backend: !!parsed.flags.backend,
            };
          }
        }
      }
    } catch { /* ignore */ }

    return flags;
  };

  const handleSendMessage = async () => {
    if (!message?.trim()) return;

    if (!userId || !conversationId) {
      enqueueSnackbar('Please sign in first.', { variant: 'warning' });
      return;
    }

    const client_id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;

    const userMessage: IChatMessage = {
      id: `local-${client_id}`,
      type: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString(),
      name: 'User',
    };
    dispatch(addChatMessage(userMessage));
    pendingClientIds.current.add(client_id);

    setMessage('');
    setSaving(true);
    setDbError(null);

    try {
      const { website, mobile, backend } = getPlatformFlags();

      // ✅ هنا التغيير: نرسل action='init'
      await sendToN8n({
        action: 'init',
        prompt: userMessage.content,
        conversation_id: conversationId,
        user_id: userId,
        project_id: isUuid(projectId || '') ? projectId : null,
        client_id,
        website,
        mobile,
        backend,
      });
    } catch (e: any) {
      console.error(e);
      setDbError(e?.message || String(e));
    } finally {
      setSaving(false);
    }
  };

  const handleKeyPress = (ev: React.KeyboardEvent) => {
    if (ev.key === 'Enter' && !ev.shiftKey) {
      ev.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Stack sx={{ maxHeight: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {(saving || dbError) && (
        <Box sx={{ p: 1, borderBottom: '1px solid rgba(255,255,255,0.08)', bgcolor: 'rgba(0,0,0,0.15)' }}>
          {saving && <LinearProgress />}
          {dbError && <Alert severity="error" sx={{ mt: saving ? 1 : 0 }}>{dbError}</Alert>}
        </Box>
      )}

      <Stack direction="row" spacing={1} sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'rgba(255,255,255,0.08)' }}>
        <Button
          size="small"
          variant={activeTab === 'chat' ? 'contained' : 'soft'}
          color={activeTab === 'chat' ? 'primary' : 'inherit'}
          startIcon={<Iconify icon="fluent:pen-sparkle-16-regular" />}
          onClick={() => handleTabChange('chat')}
          sx={{ borderRadius: 1 }}
        >
          {t('Chat')}
        </Button>
        <Button
          size="small"
          variant={activeTab === 'design' ? 'contained' : 'soft'}
          color={activeTab === 'design' ? 'primary' : 'inherit'}
          startIcon={<Iconify icon="tabler:brush" />}
          onClick={() => handleTabChange('design')}
          sx={{ borderRadius: 1 }}
        >
          {t('Design')}
        </Button>
        {conversationId && <Chip size="small" sx={{ ml: 1 }} label={`Conv: ${conversationId.slice(0, 6)}…`} />}
      </Stack>

      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        <Stack spacing={2}>
          {chatMessages.map((m: IChatMessage) => (
            <Box key={m.id}>
              {m.type === 'ai' ? (
                <Stack spacing={1}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box sx={{ color: 'primary.main', width: 24, height: 24, position: 'relative' }}>
                      <Image src={ImagesSrc.Logo} alt={t('zakicode')} fill />
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'white' }}>
                      {m.name}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ color: 'text.secondary', whiteSpace: 'pre-wrap', ml: 4 }}>
                    {m.content}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ ml: 4 }}>
                    <IconButton size="small" sx={{ color: 'text.secondary' }}><Iconify icon="mdi:thumb-down" /></IconButton>
                    <IconButton size="small" sx={{ color: 'text.secondary' }}><Iconify icon="mdi:thumb-up" /></IconButton>
                    <IconButton size="small" sx={{ color: 'text.secondary' }} onClick={() => copy(m.content)}>
                      <Iconify icon="mdi:content-copy" />
                    </IconButton>
                  </Stack>
                </Stack>
              ) : (
                <Stack spacing={1} alignItems="flex-end">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'white' }}>
                      {m.name || 'User'}
                    </Typography>
                    <Avatar sx={{ width: 24, height: 24, bgcolor: 'secondary.main', fontSize: 12 }}>
                      {(m.name || 'U').charAt(0)}
                    </Avatar>
                  </Stack>
                  <Box sx={{ maxWidth: '80%', p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', wordBreak: 'break-word' }}>
                      {m.content}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} sx={{ ml: 4 }}>
                    <IconButton size="small" sx={{ color: 'text.secondary' }}><Iconify icon="eva:edit-2-outline" /></IconButton>
                    <IconButton size="small" sx={{ color: 'text.secondary' }} onClick={() => copy(m.content)}>
                      <Iconify icon="mdi:content-copy" />
                    </IconButton>
                  </Stack>
                </Stack>
              )}
            </Box>
          ))}
        </Stack>
        <div ref={messagesEndRef} />
      </Box>

      <Box sx={{ m: 2, p: 2, borderRadius: 3, borderTop: '1px solid', borderColor: 'rgba(255,255,255,0.08)', bgcolor: 'rgba(255,255,255,0.06)' }}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          value={message || ''}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={t('Ask ZakiCode') + '...'}
          variant="filled"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleSendMessage}
                  disabled={!message?.trim() || isLoading}
                  sx={{
                    backgroundColor: message?.trim() ? '#E0E0E0' : '#424242',
                    color: '#424242',
                    width: 30,
                    height: 30,
                    mt: 0.5,
                    '&:hover': { backgroundColor: message?.trim() ? '#FFFFFF' : '#424242' },
                    '&.Mui-disabled': { backgroundColor: '#777777' },
                  }}
                >
                  <Iconify icon={isLoading ? 'eos-icons:bubble-loading' : 'fa6-solid:arrow-up'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiFilledInput-root': {
              p: '12px',
              borderRadius: 2,
              backgroundColor: 'transparent',
              '&:hover': { borderColor: 'rgba(255,255,255,0.2)' },
              '&.Mui-focused': { borderColor: 'success.main' },
            },
            '& .MuiInputBase-input': { color: 'text.primary', '&::placeholder': { color: 'text.secondary', opacity: 0.7 } },
          }}
        />
      </Box>
    </Stack>
  );
};

export default EditorChatSection;
