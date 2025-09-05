import {
  IFooterMenuItem,
  ISocialMediaIcon,
} from '@/sections/Layout/Footer/interfaces';
import { ImagesSrc } from '@/constants/imagesSrc';

export const socialMediaIcons: ISocialMediaIcon[] = [
  // {
  //     icon: ImagesSrc.X,
  //     href: ''
  // },
  // {
  //     icon: ImagesSrc.LinkedIn,
  //     href: ''
  // },
  {
    icon: ImagesSrc.Instagram,
    href: 'https://www.instagram.com/overzakiar?igsh=MWwwNTdrcGV0N2ZiNw==',
  },
  // {
  //     icon: ImagesSrc.Youtube,
  //     href: ''
  // },
  // {
  //     icon: ImagesSrc.Reddit,
  //     href: ''
  // }
];

export const footerMenuItems: IFooterMenuItem[] = [
  {
    category: 'product',
    items: [
      {
        label: 'features',
        href: '',
      },
      {
        label: 'desktopApps',
        href: '',
      },
      {
        label: 'enterprise',
        href: '',
      },
      {
        label: 'pricing',
        href: '',
      },
    ],
  },
  //   {
  //     category: 'menu',
  //     items: [
  //       {
  //         label: 'templates',
  //         href: '/#templates',
  //       },
  //       {
  //         label: 'pricing',
  //         href: '/#pricing',
  //       },
  //       {
  //         label: 'howItWorks',
  //         href: '/#howItWorks',
  //       },
  //       // {
  //       //     label: 'build',
  //       //     href: '/#build'
  //       // },
  //       // {
  //       //     label: 'customize',
  //       //     href: '/#customize'
  //       // },
  //       // {
  //       //     label: 'management',
  //       //     href: '/#management'
  //       // },
  //       // {
  //       //     label: 'deploy',
  //       //     href: '/#deploy'
  //       // },
  //       // {
  //       //     label: 'reviews',
  //       //     href: '/#reviews'
  //       // }
  //     ],
  //   },
  {
    category: 'resource',
    items: [
      {
        label: 'docs',
        href: '/#help',
      },
      {
        label: 'templates',
        href: '/#help',
      },
      {
        label: 'hireADeveloper',
        href: '/#help',
      },
      {
        label: 'trainings',
        href: '/#help',
      },
      {
        label: 'blog',
        href: '/#help',
      },
    ],
  },
  {
    category: 'community',
    items: [
      {
        label: 'community',
        href: '',
      },
      {
        label: 'ambassadors',
        href: '',
      },
    ],
  },
  {
    category: 'company',
    items: [
      {
        label: 'aboutUs',
        href: '/about',
      },
      {
        label: 'careers',
        href: '',
      },
      {
        label: 'partner',
        href: '',
      },
      {
        label: 'contactUs',
        href: '/contact-us',
      },
    ],
  },
  {
    category: 'legal',
    items: [
      {
        label: 'termsAndConditions',
        href: '/terms',
      },
      {
        label: 'privacy',
        href: '/privacy',
      },
      //   {
      //     label: 'faqs',
      //     href: '/faq',
      //   },
      //   {
      //     label: 'deleteAccount',
      //     href: '/delete-account',
      //   },
      {
        label: 'marketplaceTerms',
        href: '/terms',
      },
    ],
  },
];
