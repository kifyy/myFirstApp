import type { FirebaseOptions } from 'firebase/app';

declare module '@/firebase.js' {
  const firebaseConfig: FirebaseOptions;
  export default firebaseConfig;
}
