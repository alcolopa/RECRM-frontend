import { type TutorialStep } from '../components/TutorialGuide';

export const tutorials: Record<string, TutorialStep[]> = {
  dashboard: [
    {
      title: 'Welcome to EstateHub!',
      description: 'This is your central command center. Here you can see your recent activities, upcoming tasks, and key performance metrics at a glance.'
    },
    {
      title: 'Quick Stats',
      description: 'Monitor your pipeline with real-time stats on active leads, properties, and closed deals.'
    },
    {
      title: 'Activity Feed',
      description: 'Stay updated with everything happening in your organization through the live activity feed.'
    }
  ],
  properties: [
    {
      title: 'Property Management',
      description: 'Manage your entire portfolio here. You can add new listings, track status updates, and manage property images.'
    },
    {
      title: 'Detailed Listings',
      description: 'Click on any property card to view full details, including features, location, and owner information.'
    }
  ],
  contacts: [
    {
      title: 'Your Rolodex',
      description: 'Keep track of all your buyers and sellers in one place. Link contacts to properties and track their negotiation history.'
    }
  ],
  leads: [
    {
      title: 'Lead Pipeline',
      description: 'Capture potential interest early. Track leads from first contact through qualification and finally convert them into active contacts.'
    }
  ],
  offers: [
    {
      title: 'Negotiation Power',
      description: 'Manage all your active offers and price negotiations. Track the back-and-forth between buyers and your agency.'
    },
    {
      title: 'Quick Access',
      description: 'Click on any offer card to see the full detailed timeline and take actions like Counter, Accept, or Reject.'
    }
  ],
  'offer-details': [
    {
      title: 'Deep Dive Negotiation',
      description: 'This is where the magic happens. You can see every single step of the negotiation history here.'
    },
    {
      title: 'Actions',
      description: 'Use the buttons at the top to Counter, Accept, or Reject the current offer. All changes are tracked automatically.'
    },
    {
      title: 'Notes',
      description: 'Add or edit internal notes to keep track of specific terms or buyer preferences.'
    }
  ],
  organization: [
    {
      title: 'Branding & Team',
      description: 'Customize your organization settings, update your logo, and manage team memberships and roles.'
    }
  ]
};