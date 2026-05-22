export type ActivityItem = {
  key: string;
  title: string;
  description: string;
  image: number;
  route: 'activity-1' | 'activity-2' | 'activity-3';
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
    description: 'Sound Pollution Hunter description.',
    image: require('@/assets/images/partial-react-logo.png'),
    route: 'activity-2',
  },
  {
    key: 'activity-3',
    title: 'Hand Fan Challenge',
    description: 'Hand Fan Challenge description.',
    image: require('@/assets/images/partial-react-logo.png'),
    route: 'activity-3',
  },
];
