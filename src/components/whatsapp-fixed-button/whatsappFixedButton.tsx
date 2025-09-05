'use client';

import React from 'react';
import { Box } from '@mui/material';
import NextSvgImage from '../next-svg-image';
import Link from 'next/link';

const WhatsappFixedButton = () => {
  return (
    <Box
      sx={{
        position: 'fixed',
        left: '15px',
        bottom: '15px',
        zIndex: 2000,
        width: '40px',
        height: '40px',
        cursor: 'pointer',
      }}
    >
      <Link href="https://wa.me/96522289957" target="_blank">
        <NextSvgImage
          src={'/assets/social-media/whatsapp.svg'}
          draggable={false}
          style={{
            width: '100%',
            height: '100%',
          }}
        />
      </Link>
    </Box>
  );
};

export default WhatsappFixedButton;
