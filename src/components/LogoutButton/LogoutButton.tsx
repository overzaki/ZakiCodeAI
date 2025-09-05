'use client';

import React from 'react';
import { Button, ButtonProps } from '@mui/material';
import { useAuth } from '@/hooks/useAuth';

interface LogoutButtonProps extends Omit<ButtonProps, 'onClick'> {
  children?: React.ReactNode;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({
  children = 'Logout',
  disabled,
  ...props
}) => {
  const { logout, isLoading } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <Button onClick={handleLogout} disabled={disabled || isLoading} {...props}>
      {isLoading ? 'Logging out' : children}
    </Button>
  );
};

export default LogoutButton;
