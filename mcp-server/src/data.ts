// Company profile, services, and portfolio data for Metra Innovations.
// Single source of truth consumed by tools + resources.

export const COMPANY = {
  name: 'Metra Innovations',
  tagline: 'South African Software Development & Web Design Company',
  founded: 2016,
  location: 'Sandton, Johannesburg, Gauteng',
  address: '83 Rivonia Road, Sandton City, Sandton, Johannesburg, 2196',
  serviceAreas: [
    'Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth',
    'Bloemfontein', 'East London', 'Polokwane', 'Nelspruit'
  ],
  contact: {
    phone: '065 160 1948',
    phoneE164: '+27651601948',
    whatsapp: 'https://wa.me/27651601948',
    email: 'hello@metrainnovations.co.za',
    emailAlt: 'info@metramarket.co.za'
  },
  businessHours: [
    { days: 'Monday - Friday', hours: '08:00 - 18:00' },
    { days: 'Saturday', hours: '09:00 - 13:00' },
    { days: 'Sunday', hours: 'Closed' }
  ],
  description:
    'Metra Innovations is a premier software development company based in Johannesburg, South Africa. ' +
    'We specialize in delivering world-class web development, ecommerce solutions, and custom software ' +
    'to businesses across all 9 provinces of South Africa.'
};

export const SERVICES = [
  {
    id: 'web',
    label: 'Web Development',
    description:
      'Custom websites and web applications, WordPress development and customization, ' +
      'Progressive Web Apps (PWA), and API development and integration.'
  },
  {
    id: 'ecommerce',
    label: 'E-commerce Development',
    description:
      'Custom ecommerce platforms, WooCommerce and Shopify, PayFast/Yoco/Ozow payment ' +
      'integration, and courier integrations (Pudo, PAXI).'
  },
  {
    id: 'mobile',
    label: 'Mobile App Development',
    description:
      'iOS and Android apps built with React Native and Flutter, with data-efficient design.'
  },
  {
    id: 'software',
    label: 'Custom Software',
    description:
      'Enterprise software solutions, CRM and ERP systems, and legacy system modernization.'
  },
  {
    id: 'cloud',
    label: 'Cloud Solutions',
    description:
      'AWS and Azure hosting, DevOps and CI/CD, and POPIA compliant hosting.'
  },
  {
    id: 'consulting',
    label: 'IT Consulting',
    description:
      'Digital transformation, POPIA compliance, and technical audits.'
  },
  {
    id: 'custom-solutions',
    label: 'Custom Solutions',
    description:
      'Tailored software and web solutions built to specific business requirements.'
  },
  {
    id: 'other',
    label: 'Other',
    description: 'Any other software, web, or digital requirement not listed above.'
  }
];

export const BUDGET_RANGES = [
  { value: '5k-10k', label: 'R5,000 - R10,000' },
  { value: '10k-25k', label: 'R10,000 - R25,000' },
  { value: '25k-50k', label: 'R25,000 - R50,000' },
  { value: '50k-100k', label: 'R50,000 - R100,000' },
  { value: '100k+', label: 'R100,000+' }
];

export const PORTFOLIO = [
  {
    id: 1,
    title: 'Online Store',
    category: 'E-commerce',
    description: 'Full-featured e-commerce platform with inventory management',
    url: 'https://metramarket.co.za'
  },
  {
    id: 2,
    title: 'Sthembiso Audio Station',
    category: 'Software',
    description: 'Professional web-based DAW (Digital Audio Workstation) for music production',
    url: 'https://sthembiso-audio-station.vercel.app'
  },
  {
    id: 3,
    title: 'Tollgate System',
    category: 'Web Development',
    description: 'Electronic toll collection and payment platform',
    url: 'https://toollgate.vercel.app'
  },
  {
    id: 4,
    title: 'Cosmic Visualizer',
    category: 'Software',
    description: 'Run cosmic simulations with real-time data for free and without the need to know code',
    url: 'https://cosmic-visualizer.vercel.app'
  }
];

export const KEYWORDS = [
  'software engineers in south africa',
  'web developer',
  'wordpress specialists in south africa',
  'ecommerce specialist in south africa',
  'custom software development',
  'web development johannesburg'
];
