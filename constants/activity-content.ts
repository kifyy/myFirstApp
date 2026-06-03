export type ActivityKey = 'activity-1' | 'activity-2' | 'activity-3' | 'activity-4';

export type ActivityContent = {
  key: ActivityKey;
  title: string;
  overview: string;
  equipment: string[];
  steps: string[];
};

export const ACTIVITY_CONTENT: Record<ActivityKey, ActivityContent> = {
  'activity-1': {
    key: 'activity-1',
    title: 'Parachute Drop Challenge',
    overview:
      'Students design, build, and test a parachute for a small toy to reduce its landing speed and impact force. Teams iterate their designs under time and material constraints, aiming to achieve the slowest and safest landing within a target area.',
    equipment: [
      'Mobile phone with STEMM Lab app',
      'Small toy (e.g. army toy soldier)',
      'Table or elevated surface',
      'Paper or plastic',
      'String',
      'Scissors',
      'Tape',
    ],
    steps: [
      'Drop the toy without a parachute and record the fall. This is a baseline test.',
      'Build a parachute using provided materials.',
      'Drop the toy from the same height and record the fall.',
      'Review speed and landing accuracy results in the app.',
      'Redesign and test up to three prototypes within 20 minutes.',
      'Upload videos, results, and team reflections.',
    ],
  },
  'activity-2': {
    key: 'activity-2',
    title: 'Sound Pollution Hunter',
    overview:
      'Students measure and compare sound levels in different classroom activities.',
    equipment: [
      'Mobile phone with STEMM Lab app',
    ],
    steps: [
      'Measure noise from different actions (dropping objects (pens, books) talking, walking, stamping your feet).',
      'Record sound levels and locations.',
      'Map loud and quiet zones.',
    ],
  },
  'activity-3': {
    key: 'activity-3',
    title: 'Hand Fan Challenge',
    overview:
      'Students design and test a hand-powered fan to move a lightweight object across a target zone. Teams experiment with blade shape, size, and materials to achieve the greatest distance and accuracy within a set time limit.',
    equipment: [
      'Mobile phone with STEMM Lab app',
      'Paper or cardboard',
      'Scissors',
      'Tape or glue',
      'Pencil or craft stick',
      'Lightweight object (e.g. pompom or paper ball)',
      'Flat surface and measuring tape',
    ],
    steps: [
      'Build a simple hand fan using the provided materials.',
      'Test how far the lightweight object travels with your first design.',
      'Record distance and accuracy for each test run.',
      'Modify your fan design and test again up to three times.',
      'Compare results and identify your most effective design.',
      'Upload videos, results, and team reflections.',
    ],
  },
  'activity-4': {
    key: 'activity-4',
    title: 'Earthquake-Resistant Structure',
    overview:
      'Students design structures that withstand vibration, simulating earthquakes.',
    equipment: [
      'Cardboard, paper, scissors, sticky tape, plastic/paper cups',
      'Mobile phone with vibration sensor',
    ],
    steps: [
      'Build an anti-vibration layer, by folding paper/cardboard.',
      'Place a flat cardboard platform on top.',
      'Place the phone in the centre and activate vibration mode on the STEMM App.',
      'Modify the structure to reduce movement (e.g. more pillars, more folds, etc).',
    ],
  },
};

export function getActivityContent(key: ActivityKey): ActivityContent {
  return ACTIVITY_CONTENT[key];
}
