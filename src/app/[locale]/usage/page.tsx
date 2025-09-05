import React from 'react';
import { getTranslations } from 'next-intl/server';
import getStaticPageMetaData from '@/utils/getStaticPageMetaData';
import { Container } from '@mui/material';
import UsagePageSection from '@/sections/Usage/UsagePageSection/usagePageSection';

export async function generateMetadata() {
  const t = await getTranslations();
  const page = {
    metadataTitle: t('usage'),
    title: t('usage'),
    description: t('usage desc'),
  };

  return getStaticPageMetaData(page);
}

export default async function UsagePage() {
  return (
    <Container>
      <UsagePageSection />
    </Container>
  );
}
