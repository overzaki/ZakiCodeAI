'use client';

import * as React from 'react';
import {
  Avatar, Box, Button, Chip, Divider, LinearProgress, MenuList,
  MenuItem, ListItemIcon, ListItemText, Paper, Popover, Stack, Typography
} from '@mui/material';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import GroupAddOutlinedIcon from '@mui/icons-material/GroupAddOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import RedeemOutlinedIcon from '@mui/icons-material/RedeemOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { Link } from '@/i18n/routing';

type Props = {
  workspaceName?: string;
  email?: string;
  creditsLeft?: number;     // 390.4 مثلاً
  creditsMax?: number;      // 1205 مثلاً
  onSignOut?: () => void;
};

const palette = {
  text: '#eaf8f9',
  muted: 'rgba(234,248,249,.8)',
  line: 'rgba(56,245,209,.22)',
};

export default function UserMenu({
  workspaceName = 'My Workspace',
  email = 'user@example.com',
  creditsLeft = 390.4,
  creditsMax = 1205,
  onSignOut,
}: Props) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  const handleOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const pct = Math.min(100, Math.max(0, (creditsLeft / creditsMax) * 100));
  const letter = workspaceName?.[0]?.toUpperCase() ?? 'W';

  return (
    <>
      <Button
        onClick={handleOpen}
        endIcon={<KeyboardArrowDownRoundedIcon />}
        sx={{
          px: 1.25, py: 0.75, borderRadius: 9999,
          bgcolor: 'rgba(255,255,255,.10)', color: palette.text,
          '&:hover': { bgcolor: 'rgba(255,255,255,.16)' },
          textTransform: 'none', fontWeight: 700,
          gap: 1,
        }}
      >
        <Avatar sx={{ width: 24, height: 24, fontSize: 14, bgcolor: '#1EFBB855', color: '#08262b', fontWeight: 800 }}>
          {letter}
        </Avatar>
        {workspaceName}
      </Button>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          elevation: 0,
          sx: {
            mt: 1, borderRadius: 3, overflow: 'hidden',
            border: `1px solid ${palette.line}`,
            background: 'linear-gradient(180deg, rgba(12,49,56,.98), rgba(9,42,49,.98))',
            color: palette.text, width: 320,
          },
        }}
      >
        <Paper elevation={0} sx={{ p: 1.25, bgcolor: 'transparent' }}>
          {/* رأس القائمة */}
          <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 1 }}>
            <Avatar sx={{ width: 32, height: 32, fontSize: 16, bgcolor: '#1EFBB855', color: '#08262b', fontWeight: 800 }}>
              {letter}
            </Avatar>
            <Box>
              <Typography sx={{ fontWeight: 800, lineHeight: 1 }}>{workspaceName}</Typography>
              <Typography sx={{ fontSize: 12, opacity: .85 }}>{email}</Typography>
            </Box>
          </Stack>

          {/* Credits */}
          <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 2, borderColor: palette.line, bgcolor: 'rgba(255,255,255,.06)' }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
              <Typography sx={{ fontWeight: 800 }}>Credits</Typography>
              <Typography sx={{ opacity: .9 }}>{creditsLeft} left</Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={pct}
              sx={{
                height: 8, borderRadius: 6,
                backgroundColor: 'rgba(255,255,255,.12)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 6,
                  background: 'linear-gradient(90deg, #0EE5F9 0%, #1EFBB8 100%)',
                },
              }}
            />
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: .75 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: 9999, bgcolor: '#7dd3fc' }} />
              <Typography sx={{ fontSize: 12, opacity: .9 }}>Daily credits used first</Typography>
            </Stack>
          </Paper>

          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Button
              component={Link as any}
              href="/workspace"
              startIcon={<SettingsOutlinedIcon />}
              fullWidth
              sx={{
                borderRadius: 2,
                bgcolor: 'rgba(255,255,255,.08)', color: palette.text,
                '&:hover': { bgcolor: 'rgba(255,255,255,.14)' },
                textTransform: 'none', fontWeight: 800,
              }}
            >
              Settings
            </Button>
            <Button
              component={Link as any}
              href="/people"
              startIcon={<GroupAddOutlinedIcon />}
              fullWidth
              sx={{
                borderRadius: 2,
                bgcolor: 'rgba(255,255,255,.08)', color: palette.text,
                '&:hover': { bgcolor: 'rgba(255,255,255,.14)' },
                textTransform: 'none', fontWeight: 800,
              }}
            >
              Invite
            </Button>
          </Stack>

          <Divider sx={{ my: 1, borderColor: palette.line }} />

          {/* Workspaces */}
          <Typography sx={{ fontSize: 12, opacity: .85, mb: .5 }}>Workspaces (1)</Typography>
          <MenuList dense disablePadding>
            <MenuItem component={Link as any} href="/workspaces" sx={{ borderRadius: 2 }}>
              <ListItemIcon>
                <WorkspacePremiumOutlinedIcon fontSize="small" sx={{ color: palette.text }} />
              </ListItemIcon>
              <ListItemText primary="My Workspace" />
              <Chip size="small" label="PRO" sx={{ ml: 1 }} />
            </MenuItem>

            <MenuItem component={Link as any} href="/workspaces/new" sx={{ borderRadius: 2 }}>
              <ListItemIcon>
                <AddOutlinedIcon fontSize="small" sx={{ color: palette.text }} />
              </ListItemIcon>
              <ListItemText primary="Create new workspace" />
            </MenuItem>
          </MenuList>

          <Divider sx={{ my: 1, borderColor: palette.line }} />

          {/* Links */}
          <MenuList dense disablePadding>
            <MenuItem component={Link as any} href="/credits" sx={{ borderRadius: 2 }}>
              <ListItemIcon><RedeemOutlinedIcon fontSize="small" sx={{ color: palette.text }} /></ListItemIcon>
              <ListItemText primary="Get free credits" />
            </MenuItem>
            <MenuItem component={Link as any} href="/help" sx={{ borderRadius: 2 }}>
              <ListItemIcon><HelpOutlineOutlinedIcon fontSize="small" sx={{ color: palette.text }} /></ListItemIcon>
              <ListItemText primary="Help Center" />
            </MenuItem>
            <MenuItem component={Link as any} href="/appearance" sx={{ borderRadius: 2 }}>
              <ListItemIcon><PaletteOutlinedIcon fontSize="small" sx={{ color: palette.text }} /></ListItemIcon>
              <ListItemText primary="Appearance" />
            </MenuItem>
          </MenuList>

          <Divider sx={{ my: 1, borderColor: palette.line }} />

          <MenuItem
            onClick={() => { handleClose(); onSignOut?.(); }}
            sx={{ borderRadius: 2, color: palette.text }}
          >
            <ListItemIcon><LogoutOutlinedIcon fontSize="small" sx={{ color: palette.text }} /></ListItemIcon>
            <ListItemText primary="Sign out" />
          </MenuItem>
        </Paper>
      </Popover>
    </>
  );
}
