import React from 'react';
import getStaticPageMetaData from '@/utils/getStaticPageMetaData';
import { Container } from '@mui/material';
import SignUpPageSection from '@/sections/Auth/SignUp/signUpPageSection';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations();
  const page = {
    metadataTitle: t('signUp'),
    title: t('signUp'),
    description: t('signUp desc'),
  };

  return getStaticPageMetaData(page);
}

export default async function SignUpPage() {
  return (
    <Container>
      <SignUpPageSection />
    </Container>
  );
}
