import React from 'react';
import getStaticPage from '@/api/static-page/getStaticPage';
import getStaticPageMetaData from '@/utils/getStaticPageMetaData';
import { Container } from '@mui/material';
import TemplatesPageSection from '@/sections/Templates/TemplatesPageSection/templatesPageSection';

export async function generateMetadata() {
  const { page } = await getStaticPage('templates');

  return getStaticPageMetaData(page);
}

export default async function TemplatesPage() {
  return (
    <Container>
      <TemplatesPageSection />
    </Container>
  );
}
