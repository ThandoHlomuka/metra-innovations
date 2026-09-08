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
    description:
      'A full-featured e-commerce platform built for online retail. Includes inventory management, ' +
      'payment gateway integration, and a responsive design that works across all devices.',
    features: [
      'Custom e-commerce platform',
      'Payment gateway integration (PayFast, Yoco)',
      'Inventory management system',
      'Order tracking and management',
      'Customer accounts and profiles',
      'Responsive mobile-first design'
    ],
    technologies: ['React', 'Node.js', 'MongoDB', 'Stripe API'],
    client: 'Online Retailer',
    year: '2025'
  },
  {
    id: 2,
    title: 'Digital Audio Workstation (DAW)',
    category: 'Software',
    description:
      'A professional audio production software designed for musicians, producers, and audio engineers. ' +
      'Features multi-track recording, MIDI sequencing, and advanced audio processing.',
    features: [
      'Multi-track audio recording',
      'MIDI sequencing and editing',
      'VST plugin support',
      'Advanced mixing console',
      'Real-time audio effects',
      'Export to multiple formats'
    ],
    technologies: ['C++', 'JUCE Framework', 'WebAudio API', 'FFmpeg'],
    client: 'Audio Pro Solutions',
    year: '2025'
  },
  {
    id: 3,
    title: 'E-tolling Payment System',
    category: 'Web Development',
    description:
      'An electronic toll collection and payment platform enabling seamless toll payments for motorists. ' +
      'Includes account management, automated billing, and real-time transaction processing.',
    features: [
      'Electronic toll collection',
      'Account management portal',
      'Automated billing system',
      'Real-time transaction processing',
      'SMS and email notifications',
      'Integration with banking systems'
    ],
    technologies: ['Java', 'Spring Boot', 'PostgreSQL', 'Redis'],
    client: 'Transport Authority',
    year: '2025'
  },
  {
    id: 4,
    title: 'Task Finder',
    category: 'Software',
    description:
      'A comprehensive task management and productivity platform to organize, track, and complete work ' +
      'efficiently. Features task creation, priority management, and collaborative tools.',
    features: [
      'Task creation and management',
      'Priority and deadline tracking',
      'Team collaboration tools',
      'Progress visualization',
      'Automated reminders',
      'Integration with calendar apps'
    ],
    technologies: ['TypeScript', 'React', 'Node.js', 'PostgreSQL'],
    client: 'Productivity Solutions',
    year: '2025'
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
