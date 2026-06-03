export type ActivityItem = {
  key: string;
  title: string;
  description: string;
  image: number;
  route: 'activity-1' | 'activity-2' | 'activity-3' | 'activity-4';
};

export const ACTIVITIES: ActivityItem[] = [
  {
    key: 'activity-1',
    title: 'Parachute Drop Challenge',
    description: 'Design and test parachutes to safely land a small toy.',
    image: require('@/assets/images/partial-react-logo.png'),
    route: 'activity-1',
  },
  {
    key: 'activity-2',
    title: 'Sound Pollution Hunter',
    description: 'Measure and compare sound levels.',
    image: require('@/assets/images/partial-react-logo.png'),
    route: 'activity-2',
  },
  {
    key: 'activity-3',
    title: 'Hand Fan Challenge',
    description: 'Test how air movement affects flexible materials',
    image: require('@/assets/images/partial-react-logo.png'),
    route: 'activity-3',
  },
  {
    key: 'activity-4',
    title: 'Earthquake-Resistant Structure',
    description: 'Design structures that withstand vibration, simulating earthquakes.',
    image: require('@/assets/images/partial-react-logo.png'),
    route: 'activity-4',
  },
];
