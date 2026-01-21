import { initializeApp } from "firebase/app";
import { collection, doc, getCountFromServer, getDoc, getDocs, getFirestore, limit, onSnapshot, orderBy, query, setDoc, Timestamp, Unsubscribe, updateDoc, where } from "firebase/firestore";
import firebaseConfig from "./config.json";

const gsa = process.env.GOOGLE_SERVICE_ACCOUNT ? JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT) : firebaseConfig;
const app = initializeApp(gsa);
const db = getFirestore(app);

export async function setUser(id: string, sdp: RTCSessionDescriptionInit = null, offerId = "") {
    await setDoc(doc(db, "users", id), {
        active: true,
        sdp,
        offerId
    });
}

export async function setUserActive(id: string, active: boolean) {
    await updateDoc(doc(db, "users", id), {
        active
    });
}

export async function checkUserExists(id: string) {
    const docRef = doc(db, "users", id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
}

export async function getUserCounts() {
    const coll = collection(db, "users");
    const q = query(coll, where("active", "==", true));
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
}

export async function getUsers() {
    const coll = collection(db, "users");
    const q = query(coll, where("active", "==", true), limit(10));
    const querySnapshot = await getDocs(q);
    return querySnapshot;
}

export function listenOnUser(id: string, callback: (data: any, unsub: Unsubscribe) => void, once = false) {
    const unsub = onSnapshot(doc(db, "users", id), (doc) => {
        try {
            if (!doc.metadata.hasPendingWrites) {
                const data = doc.data();
                callback(data, unsub);
            }
        } catch (e) {
            console.error(e);
        } finally {
            if (once) {
                unsub();
            }
        }
    });
    return unsub;
}
