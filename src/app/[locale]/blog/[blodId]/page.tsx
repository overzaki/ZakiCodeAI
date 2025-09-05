import React from 'react';
import getStaticPageMetaData from '@/utils/getStaticPageMetaData';
import { Container } from '@mui/material';
import BlogByIdPageSection from '@/sections/Blog/BlogByIdPageSection/blogByIdPageSection';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations();
  // TODO: get blog by id
  const page = {
    metadataTitle: t('blog'),
    title: t('blog'),
    description: t('blog desc'),
  };

  return getStaticPageMetaData(page);
}

export default async function BlogByIdPage() {
  return (
    <Container>
      <BlogByIdPageSection />
    </Container>
  );
}
