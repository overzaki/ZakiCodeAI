import React from 'react';
import getStaticPageMetaData from '@/utils/getStaticPageMetaData';
import { Container } from '@mui/material';
import BlogPageSection from '@/sections/Blog/BlogPageSection/blogPageSection';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations();
  const page = {
    metadataTitle: t('blog'),
    title: t('blog'),
    description: t('blog desc'),
  };

  return getStaticPageMetaData(page);
}

export default async function BlogPage() {
  return (
    <Container>
      <BlogPageSection />
    </Container>
  );
}
