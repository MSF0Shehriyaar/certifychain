import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  where,
  serverTimestamp,
  doc,
  getDoc
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import CryptoJS from 'crypto-js';
import { Certificate, OperationType } from '../types';

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const generateHash = (data: Partial<Certificate>): string => {
  const content = `${data.recipientName}|${data.courseName}|${data.issuerName}|${data.issueDate}|${data.prevHash}`;
  return CryptoJS.SHA256(content).toString();
};

export const getLatestCertificate = async (): Promise<Certificate | null> => {
  const path = 'certificates';
  try {
    const q = query(collection(db, path), orderBy('timestamp', 'desc'), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Certificate;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return null;
  }
};

export const issueCertificate = async (
  recipientName: string,
  courseName: string,
  issuerName: string,
  issueDate: string
): Promise<string> => {
  const latest = await getLatestCertificate();
  const prevHash = latest ? latest.dataHash : '0'.repeat(64);
  
  const dataToHash = {
    recipientName,
    courseName,
    issuerName,
    issueDate,
    prevHash
  };
  
  const dataHash = generateHash(dataToHash);
  const path = 'certificates';

  try {
    const docRef = await addDoc(collection(db, path), {
      ...dataToHash,
      dataHash,
      timestamp: Date.now()
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
};

export const verifyCertificate = async (certificateId: string, providedData?: Partial<Certificate>) => {
  const path = `certificates/${certificateId}`;
  try {
    const docRef = doc(db, 'certificates', certificateId);
    const snapshot = await getDoc(docRef);
    
    if (!snapshot.exists()) {
      return { valid: false, message: 'Certificate ID not found in the blockchain ledger.' };
    }
    
    const stored = snapshot.data() as Certificate;
    
    // If we provided data (e.g. from a file upload), check if it matches the hash
    if (providedData) {
      const recalculatedHash = generateHash({
        recipientName: providedData.recipientName,
        courseName: providedData.courseName,
        issuerName: providedData.issuerName,
        issueDate: providedData.issueDate,
        prevHash: stored.prevHash // We trust the ledger for the prevHash
      });
      
      if (recalculatedHash !== stored.dataHash) {
        return { valid: false, message: 'Cryptographic hash mismatch. Certificate data has been tampered with.', stored };
      }
    }
    
    return { valid: true, message: 'Certificate verified successfully on the blockchain.', stored };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    throw error;
  }
};

export const getAllCertificates = async (): Promise<Certificate[]> => {
  const path = 'certificates';
  try {
    const q = query(collection(db, path), orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Certificate));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};
