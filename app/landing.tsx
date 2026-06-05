import { Redirect } from 'expo-router';

/** Legacy route — onboarding now uses /login and /setup. */
export default function LandingScreen() {
  return <Redirect href="/login" />;
}
