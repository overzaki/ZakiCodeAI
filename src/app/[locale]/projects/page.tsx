import React from 'react';
import getStaticPageMetaData from '@/utils/getStaticPageMetaData';
import { Container } from '@mui/material';
import ProjectsPageSection from '@/sections/Projects/ProjectsPageSection/projectsPageSection';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations();
  const page = {
    metadataTitle: t('projects'),
    title: t('projects'),
    description: t('projects desc'),
  };

  return getStaticPageMetaData(page);
}

export default async function ProjectsPage() {
  return (
    <Container>
      <ProjectsPageSection />
    </Container>
  );
}
