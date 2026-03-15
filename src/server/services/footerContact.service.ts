import { db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

export interface FooterContactInfo {
  phoneNumbers?: string[];
  address?: string;
  email?: string;
}

export const getFooterContactInfo = async (): Promise<FooterContactInfo> => {
  try {
    // Try to fetch from settings document
    const settingsRef = doc(db, 'settings', 'contact');
    const settingsSnap = await getDoc(settingsRef);

    if (settingsSnap.exists()) {
      return settingsSnap.data() as FooterContactInfo;
    }

    // Return default values if document doesn't exist
    return {
      phoneNumbers: ['+91 93453 73199'],
      address: '2/224 Maruthinagar, Zuzuvadi, Hosur, Tamil Nadu 635109',
      email: 'info@collidedgalaxies.com'
    };
  } catch (error) {
    console.error('Error fetching footer contact info:', error);
    // Return defaults on error
    return {
      phoneNumbers: ['+91 93453 73199'],
      address: '2/224 Maruthinagar, Zuzuvadi, Hosur, Tamil Nadu 635109',
      email: 'info@collidedgalaxies.com'
    };
  }
};
