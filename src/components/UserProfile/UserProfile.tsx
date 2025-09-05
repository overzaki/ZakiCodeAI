'use client';

import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Divider,
} from '@mui/material';
import { useAuth } from '@/hooks/useAuth';
import LogoutButton from '@/components/LogoutButton';
import Iconify from '@/components/iconify';

const UserProfile: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  const getInitials = (email: string, name?: string) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  return (
    <Box>
      <IconButton
        onClick={handleMenuOpen}
        sx={{
          p: 0,
          '&:hover': {
            backgroundColor: 'rgba(255,255,255,0.1)',
          },
        }}
      >
        <Avatar
          sx={{
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            width: 40,
            height: 40,
            fontSize: '1rem',
            fontWeight: 600,
          }}
        >
          {getInitials(user.email, user.name)}
        </Avatar>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            mt: 1.5,
            minWidth: 200,
            backgroundColor: 'background.paper',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {user.name || 'User'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {user.email}
          </Typography>
        </Box>

        <Divider />

        <MenuItem onClick={handleMenuClose}>
          <Iconify icon="eva:person-fill" sx={{ mr: 2 }} />
          Profile
        </MenuItem>

        <MenuItem onClick={handleMenuClose}>
          <Iconify icon="eva:settings-2-fill" sx={{ mr: 2 }} />
          Settings
        </MenuItem>

        <Divider />

        <MenuItem>
          <LogoutButton
            variant="text"
            sx={{
              justifyContent: 'flex-start',
              width: '100%',
              color: 'error.main',
              '&:hover': {
                backgroundColor: 'error.main',
                color: 'error.contrastText',
              },
            }}
          >
            <Iconify icon="eva:log-out-fill" sx={{ mr: 2 }} />
            Logout
          </LogoutButton>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default UserProfile;
