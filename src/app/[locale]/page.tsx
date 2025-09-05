import React from 'react';
import { Container } from '@mui/material';
import HeroSection from '@/sections/Home/HeroSection/heroSection';
import EditorFieldSection from '@/sections/Home/EditorFieldSection/editorFieldSection';
import StepsSection from '@/sections/Home/StepsSection/stepsSection';
import FrameworksSection from '@/sections/Home/FrameworksSection/frameworksSection';
import TemplatesSection from '@/sections/Home/TemplatesSection/templatesSection';
import HowItWorksSection from '@/sections/Home/HowItWorksSection/howItWorksSection';
import WhatsappFixedButton from '@/components/whatsapp-fixed-button/whatsappFixedButton';

// 👇 هذا هو الاستيراد الناقص
import ProjectsSection from '@/sections/Home/ProjectsSection/projectsSection';

export default function Home() {
  return (
    <>
      <Container>
        <HeroSection />
        <EditorFieldSection />
        <ProjectsSection />
        <StepsSection />
        <FrameworksSection />
        <TemplatesSection />
        <HowItWorksSection />
        {/* تقدر تخليه جوّا الـ Container لو بدك نفس العرض */}
      
      </Container>

      {/* أو خليه برّه إذا بدك ياخد العرض الكامل */}
      <WhatsappFixedButton />
    </>
  );
}
