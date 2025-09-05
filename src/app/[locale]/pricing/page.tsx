import React from 'react';
import getStaticPageMetaData from '@/utils/getStaticPageMetaData';
import { Container } from '@mui/material';
import PricingPageSection from '@/sections/Pricing/PricingPageSection/pricingPageSection';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations();
  const page = {
    metadataTitle: t('pricing'),
    title: t('pricing'),
    description: t('pricing desc'),
  };

  return getStaticPageMetaData(page);
}

export default async function PricingPage() {
  return (
    <Container>
      <PricingPageSection />
    </Container>
  );
}
