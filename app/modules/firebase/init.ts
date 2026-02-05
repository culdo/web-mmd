import { isDev } from "@/app/utils/base";
import { initializeApp } from "firebase/app";
import { collection, doc, getCountFromServer, getDoc, getDocs, getFirestore, limit, onSnapshot, orderBy, query, setDoc, Timestamp, Unsubscribe, updateDoc, where } from "firebase/firestore";

const app = initializeApp(JSON.parse(process.env.FIREBASE_CONFIG));
const db = getFirestore(app);

enum ActiveTypes {
    DISABLED,
    PROD,
    DEV
}

export async function setUser(id: string, sdp: RTCSessionDescriptionInit = null, offerId = "") {
    await setDoc(doc(db, "users", id), {
        active: isDev ? ActiveTypes.DEV : ActiveTypes.DISABLED,
        sdp,
        offerId
    });
}

export async function setUserActive(id: string, active: boolean) {
    await updateDoc(doc(db, "users", id), {
        active: isDev ? ActiveTypes.DEV : ActiveTypes.PROD
    });
}

export async function checkUserExists(id: string) {
    const docRef = doc(db, "users", id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
}

export async function getActiveUsers() {
    const coll = collection(db, "users");
    const q = query(coll, where("active", "==", isDev ? ActiveTypes.DEV : ActiveTypes.PROD));
    const querySnapshot = await getDocs(q);
    return querySnapshot;
}

export function listenOnUser(id: string, callback: (data: any, unsub: Unsubscribe) => void) {
    const unsub = onSnapshot(doc(db, "users", id), (doc) => {
        if (!doc.metadata.hasPendingWrites) {
            const data = doc.data();
            callback(data, unsub);
        }
    });
    return unsub;
}
