import { isDev } from "@/app/utils/base";
import { initializeApp } from "firebase/app";
import { collection, deleteDoc, doc, getDoc, getDocs, getFirestore, onSnapshot, or, query, setDoc, Unsubscribe, where } from "firebase/firestore";

const app = initializeApp(JSON.parse(process.env.FIREBASE_CONFIG));
const db = getFirestore(app);

enum ActiveTypes {
    DISABLED,
    PROD,
    DEV
}

export async function setUser(id: string) {
    await setDoc(doc(db, "users", id), {
        active: isDev ? ActiveTypes.DEV : ActiveTypes.DISABLED,
    });
}

export async function setSDP(peerAB: [string, string], sdp: RTCSessionDescriptionInit = null) {
    const uniqueId = peerAB.sort().join("_")
    await setDoc(doc(db, "connections", uniqueId), {
        peerA: peerAB[0],
        peerB: peerAB[1],
        sdp,
    });
}

export async function setUserActive(id: string, active: boolean) {
    await setDoc(doc(db, "users", id), {
        active: isDev ? ActiveTypes.DEV : (active ? ActiveTypes.PROD : ActiveTypes.DISABLED)
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

export async function deleteDevUsers() {
    const coll = collection(db, "users");
    const q = query(coll, where("active", "==", ActiveTypes.DEV));
    const users = await getDocs(q);
    for (const userDoc of users.docs) {
        await deleteDoc(doc(db, "users", userDoc.id));
    }
}

export function listenOnConnection(id: string, callback: (data: any, unsub: Unsubscribe) => void) {
    const unsub = onSnapshot(doc(db, "connections", id), (doc) => {
        if (!doc.metadata.hasPendingWrites) {
            const data = doc.data();
            callback(data, unsub);
        }
    });
    return unsub;
}

let init = false;
export function listenOnConnections(id: string, callback: (cid: string, data: any, unsub: Unsubscribe) => void) {
    const q = query(collection(db, "connections"), or(where("peerA", "==", id), where("peerB", "==", id)))
    const unsub = onSnapshot(q, (snapshot) => {
        if (!snapshot.metadata.hasPendingWrites) {
            if (!init) {
                init = true
                return
            }
            snapshot.docChanges().forEach((change) => {
                const data = change.doc.data();
                console.log(`${change.type}: `, data);
                callback(change.doc.id, data, unsub);
            });
        }
    });
    return unsub;
}
