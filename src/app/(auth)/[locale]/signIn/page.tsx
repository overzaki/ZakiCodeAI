import React from 'react';
import getStaticPageMetaData from '@/utils/getStaticPageMetaData';
import { Container } from '@mui/material';
import SignInPageSection from '@/sections/Auth/SignIn/signInPageSection';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations();
  const page = {
    metadataTitle: t('signIn'),
    title: t('signIn'),
    description: t('signIn desc'),
  };

  return getStaticPageMetaData(page);
}

export default async function SignInPage() {
  return (
    <Container>
      <SignInPageSection />
    </Container>
  );
}
