import { getApps, initializeApp } from 'firebase-admin/app';
import { credential } from 'firebase-admin';

export function ensureFirebaseAdmin(): boolean {
    if (getApps().length > 0) {
        return true;
    }

    const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')?.trim();

    if (!projectId || !clientEmail || !privateKey) {
        return false;
    }

    try {
        initializeApp({
            credential: credential.cert({
                projectId,
                clientEmail,
                privateKey,
            }),
        });
        return true;
    } catch (error) {
        console.warn(
            'Firebase init failed:',
            error instanceof Error ? error.message : error,
        );
        return false;
    }
}
