
import { User, Prize, Action, PointTransaction, HeatingAction } from '../types';
import { ADMIN_USERNAME, ADMIN_PASSWORD, SALONE_USERNAME, SALONE_PASSWORD } from '../constants';
import { db } from '../firebase';
import { 
    collection, getDocs, doc, setDoc, query, where, writeBatch,
    deleteDoc, getDoc, updateDoc, orderBy, limit, startAfter, QueryDocumentSnapshot, DocumentData, startAt, endAt,
    getCountFromServer
} from "firebase/firestore";

const CURRENT_USER_KEY = 'fidelity_current_user';

// --- Collection References ---
const usersCollection = collection(db, 'users');
const prizesCollection = collection(db, 'prizes');
const actionsCollection = collection(db, 'actions');
const heatingActionsCollection = collection(db, 'heatingActions');
const regulationsCollection = collection(db, 'regulations');
const transactionsCollection = collection(db, 'transactions');

const cleanUserForStorage = (user: User): User => {
    const cleanedUser: any = { ...user };
    delete cleanedUser.password;
    return cleanedUser;
};

export const initData = async (): Promise<void> => {
    // Check for standard admins
    const adminsToCreate = [
        { id: 'admin-user', username: ADMIN_USERNAME, password: ADMIN_PASSWORD, firstName: 'Admin', lastName: 'User' },
        { id: 'salone-user', username: SALONE_USERNAME, password: SALONE_PASSWORD, firstName: 'Salone', lastName: 'Admin' }
    ];

    const batch = writeBatch(db);
    let needsCommit = false;

    for (const adminData of adminsToCreate) {
        const adminRef = doc(db, 'users', adminData.id);
        const adminSnap = await getDoc(adminRef);
        
        if (!adminSnap.exists()) {
            console.log(`Initializing admin account: ${adminData.username}`);
            const adminUser: User = {
                id: adminData.id,
                username: adminData.username,
                password: adminData.password,
                firstName: adminData.firstName,
                lastName: adminData.lastName,
                points: 0,
                isInitialLogin: false,
                role: 'admin',
                creationDate: new Date().toISOString()
            };
            batch.set(adminRef, adminUser);
            needsCommit = true;
        }
    }

    // Initialize prizes and actions only if no prizes exist yet (first run)
    const prizesSnapshot = await getDocs(query(prizesCollection, limit(1)));
    if (prizesSnapshot.empty) {
        console.log("Initializing default prizes and actions...");
        const initialPrizes: Omit<Prize, 'id'>[] = [
            { name: 'Caffè Omaggio', description: 'Un caffè espresso offerto.', pointsRequired: 50 },
            { name: 'Sconto 10% Taglio', description: '10% di sconto sul prossimo taglio.', pointsRequired: 200 },
        ];
        initialPrizes.forEach(prize => {
            const prizeDocRef = doc(prizesCollection);
            batch.set(prizeDocRef, { ...prize, id: prizeDocRef.id });
        });

        const initialActions: Omit<Action, 'id' | 'isEnabled'>[] = [
            { name: 'Taglio Uomo', points: 20, description: 'Servizio di taglio per uomo.' },
            { name: 'Taglio Donna', points: 30, description: 'Servizio di taglio e piega per donna.' },
        ];
        initialActions.forEach(action => {
            const actionDocRef = doc(actionsCollection);
            batch.set(actionDocRef, { ...action, id: actionDocRef.id, isEnabled: true });
        });

        const regulationsDocRef = doc(db, 'regulations', 'main');
        batch.set(regulationsDocRef, { text: 'Benvenuto nel nostro programma fedeltà! Accumula punti con ogni acquisto e riscatta fantastici premi.' });
        needsCommit = true;
    }

    // Initialize heating actions
    const heatingActionsSnapshot = await getDocs(heatingActionsCollection);
    if (heatingActionsSnapshot.empty) {
        console.log("Initializing heating actions...");
        for (let i = 1; i <= 10; i++) {
            const heatingActionDocRef = doc(heatingActionsCollection);
            const newHeatingAction: HeatingAction = {
                id: heatingActionDocRef.id,
                name: `Primi Passi ${i}`,
                description: `Descrizione per l'azione ${i}.`,
                points: 10 * i,
                slot: i,
            };
            batch.set(heatingActionDocRef, newHeatingAction);
        }
        needsCommit = true;
    }

    if (needsCommit) {
        await batch.commit();
        console.log("Database successfully synchronized.");
    }
};

export const login = async (username: string, password_input: string): Promise<User | null> => {
    const normalizedInput = username.trim();
    if (!normalizedInput) return null;
    
    let q = query(usersCollection, where("username", "==", normalizedInput));
    let snapshot = await getDocs(q);
    
    if (snapshot.empty) {
        q = query(usersCollection, where("username", "==", normalizedInput.toUpperCase()));
        snapshot = await getDocs(q);
    }
    
    if (snapshot.empty) {
        q = query(usersCollection, where("username", "==", normalizedInput.toLowerCase()));
        snapshot = await getDocs(q);
    }

    if (snapshot.empty && normalizedInput.length > 0) {
        const capitalized = normalizedInput.charAt(0).toUpperCase() + normalizedInput.slice(1).toLowerCase();
        q = query(usersCollection, where("username", "==", capitalized));
        snapshot = await getDocs(q);
    }
    
    if (snapshot.empty) return null;
    
    const userDoc = snapshot.docs[0];
    const user = { ...userDoc.data(), id: userDoc.id } as User;
    
    if (user.password === password_input) {
         localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(cleanUserForStorage(user)));
         return user;
    }
    return null;
};

export const getUserById = async (userId: string): Promise<User | null> => {
    try {
        const userDocRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
            return { ...userSnap.data(), id: userSnap.id } as User;
        }
        return null;
    } catch (e) {
        console.error("Error fetching user by ID:", e);
        return null;
    }
};

export const logout = (): void => {
    localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = (): User | null => {
    const userJson = localStorage.getItem(CURRENT_USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
};

export const getUsers = async (): Promise<User[]> => {
    const snapshot = await getDocs(usersCollection);
    return snapshot.docs.map(d => ({ ...d.data(), id: d.id }) as User);
};

export const getCustomersPaginated = async (
    lastDoc: QueryDocumentSnapshot<DocumentData> | null = null, 
    pageSize: number = 50,
    sortField: string = "creationDate",
    sortDirection: "asc" | "desc" = "desc"
): Promise<{ users: User[], lastVisible: QueryDocumentSnapshot<DocumentData> | null }> => {
    
    let q = query(
        usersCollection, 
        orderBy(sortField, sortDirection),
        limit(pageSize)
    );

    if (lastDoc) {
        q = query(
            usersCollection, 
            orderBy(sortField, sortDirection),
            startAfter(lastDoc),
            limit(pageSize)
        );
    }

    const snapshot = await getDocs(q);
    
    const users = snapshot.docs
        .map(d => ({ ...d.data(), id: d.id } as User))
        .filter(u => u.role !== 'admin');

    const lastVisible = snapshot.docs[snapshot.docs.length - 1] || null;

    return { users, lastVisible };
};

const getSearchVariations = (term: string): string[] => {
    const variations = new Set<string>();
    variations.add(term);
    variations.add(term.toLowerCase());
    variations.add(term.toUpperCase());
    if (term.length > 0) {
        variations.add(term.charAt(0).toUpperCase() + term.slice(1).toLowerCase());
    }
    return Array.from(variations);
};

export const getCredentialsUsersPaginated = async (
    lastDoc: QueryDocumentSnapshot<DocumentData> | null = null,
    pageSize: number = 50,
    searchTerm: string = ''
): Promise<{ users: User[], lastVisible: QueryDocumentSnapshot<DocumentData> | null }> => {
    
    let q;
    const term = searchTerm.trim();

    if (term) {
        const searchResults = await searchCustomers(term);
        return { users: searchResults, lastVisible: null };
    } else {
        q = query(
            usersCollection,
            orderBy("username", "asc"),
            limit(pageSize)
        );

        if (lastDoc) {
            q = query(
                usersCollection,
                orderBy("username", "asc"),
                startAfter(lastDoc),
                limit(pageSize)
            );
        }

        const snapshot = await getDocs(q);
        
        const users = snapshot.docs
            .map(d => ({ ...d.data(), id: d.id } as User))
            .filter(u => u.role !== 'admin');

        const lastVisible = snapshot.docs[snapshot.docs.length - 1] || null;

        return { users, lastVisible };
    }
};

export const searchCustomers = async (searchTerm: string): Promise<User[]> => {
    const term = searchTerm.trim();
    if (!term) return [];

    const variations = getSearchVariations(term);
    const results = new Map<string, User>();
    const promises: Promise<any>[] = [];

    variations.forEach(variation => {
        const q = query(
            usersCollection,
            orderBy("username"),
            startAt(variation),
            endAt(variation + '\uf8ff'),
            limit(10)
        );
        promises.push(getDocs(q));
    });

    variations.forEach(variation => {
        const q = query(
            usersCollection,
            where("lastName", ">=", variation),
            where("lastName", "<=", variation + '\uf8ff'),
            limit(10)
        );
        promises.push(getDocs(q));
    });

    variations.forEach(variation => {
        const q = query(
            usersCollection,
            where("firstName", ">=", variation),
            where("firstName", "<=", variation + '\uf8ff'),
            limit(10)
        );
        promises.push(getDocs(q));
    });

    const snapshots = await Promise.all(promises);

    snapshots.forEach(snap => {
        snap.docs.forEach((d: any) => {
            const u = { ...d.data(), id: d.id } as User;
            if (u.role !== 'admin') {
                results.set(u.id, u);
            }
        });
    });

    return Array.from(results.values());
};

export const createCustomer = async (): Promise<User> => {
    const newId = doc(usersCollection).id;
    
    const snapshot = await getDocs(usersCollection);
    const usedNumbers = new Set<number>();
    
    snapshot.docs.forEach(docSnapshot => {
        const userData = docSnapshot.data() as User;
        const username = userData.username?.toUpperCase() || '';
        
        if (username.startsWith('CL')) {
            const numberPart = username.replace('CL', '');
            const num = parseInt(numberPart, 10);
            if (!isNaN(num) && num > 0) {
                usedNumbers.add(num);
            }
        }
    });

    let nextNumber = 1;
    while (usedNumbers.has(nextNumber)) {
        nextNumber++;
    }

    const suffix = String(nextNumber).padStart(3, '0');
    const username = `CL${suffix}`;
    const password = Math.random().toString(36).slice(-8);

    const newUser: User = {
        id: newId,
        username,
        password,
        firstName: '',
        lastName: '',
        points: 0,
        isInitialLogin: true,
        role: 'customer',
        creationDate: new Date().toISOString()
    };

    await setDoc(doc(usersCollection, newId), newUser);
    return newUser;
};

export const updateUser = async (user: User): Promise<User> => {
    const userRef = doc(db, 'users', user.id);
    const { id, ...data } = user;
    await updateDoc(userRef, data);
    
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === user.id) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(cleanUserForStorage(user)));
    }
    return user;
};

export const deleteCustomer = async (userId: string): Promise<void> => {
    const q = query(transactionsCollection, where("userId", "==", userId));
    const txSnapshot = await getDocs(q);
    const batch = writeBatch(db);

    txSnapshot.docs.forEach((txDoc) => {
        batch.delete(txDoc.ref);
    });

    batch.delete(doc(db, 'users', userId));
    await batch.commit();
};

export const updateUserPoints = async (userId: string, pointsChange: number, description: string, performedBy?: string): Promise<User | null> => {
    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) return null;
        
        const userData = userSnap.data() as User;
        const newPoints = (userData.points || 0) + pointsChange;
        
        await updateDoc(userRef, { points: newPoints });
        
        const transaction: PointTransaction = {
            id: doc(transactionsCollection).id,
            userId,
            date: new Date().toISOString(),
            type: pointsChange > 0 ? 'assignment' : 'redemption',
            description,
            pointsChange,
            balanceAfter: newPoints,
            performedBy: performedBy
        };
        await setDoc(doc(transactionsCollection, transaction.id), transaction);

        return { ...userData, points: newPoints, id: userId };
    } catch (e) {
        console.error("Error updating points:", e);
        return null;
    }
};

export const assignHeatingAction = async (userId: string, action: HeatingAction, performedBy?: string): Promise<User | null> => {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return null;
    const userData = userSnap.data() as User;
    
    const completed = userData.completedHeatingActions || [];
    if (completed.includes(action.id)) return userData;

    const newPoints = (userData.points || 0) + action.points;
    const newCompleted = [...completed, action.id];

    await updateDoc(userRef, { 
        points: newPoints,
        completedHeatingActions: newCompleted
    });

    const transaction: PointTransaction = {
        id: doc(transactionsCollection).id,
        userId,
        date: new Date().toISOString(),
        type: 'assignment',
        description: `Primi Passi: ${action.name}`,
        pointsChange: action.points,
        balanceAfter: newPoints,
        performedBy: performedBy
    };
    await setDoc(doc(transactionsCollection, transaction.id), transaction);

    return { ...userData, points: newPoints, completedHeatingActions: newCompleted, id: userId };
}

export const assignPointsToMultipleUsers = async (userIds: string[], points: number, description: string, performedBy?: string): Promise<void> => {
    for (const userId of userIds) {
        await updateUserPoints(userId, points, description, performedBy); 
    }
};

export const reverseTransaction = async (transactionId: string, performedBy?: string): Promise<User | null> => {
    const txRef = doc(db, 'transactions', transactionId);
    const txSnap = await getDoc(txRef);
    
    if (!txSnap.exists()) return null;
    const txData = txSnap.data() as PointTransaction;
    
    if (txData.isReversed) return null; 
    
    const reversePoints = -txData.pointsChange;
    const userRef = doc(db, 'users', txData.userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return null;
    const userData = userSnap.data() as User;
    
    const newBalance = userData.points + reversePoints;
    
    await updateDoc(txRef, { isReversed: true });
    
    const reversalTx: PointTransaction = {
        id: doc(transactionsCollection).id,
        userId: txData.userId,
        date: new Date().toISOString(),
        type: 'reversal',
        description: `Storno: ${txData.description}`,
        pointsChange: reversePoints,
        balanceAfter: newBalance,
        reversalOf: transactionId,
        performedBy: performedBy
    };
    await setDoc(doc(transactionsCollection, reversalTx.id), reversalTx);
    
    await updateDoc(userRef, { points: newBalance });
    
    return { ...userData, points: newBalance, id: userData.id };
};

export const getTransactionsForUser = async (userId: string): Promise<PointTransaction[]> => {
    const q = query(transactionsCollection, where("userId", "==", userId));
    const snapshot = await getDocs(q);
    const transactions = snapshot.docs.map(d => d.data() as PointTransaction);
    return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getRecentTransactions = async (limitCount: number = 20): Promise<(PointTransaction & { userName: string })[]> => {
    const q = query(transactionsCollection, orderBy("date", "desc"), limit(limitCount));
    const snapshot = await getDocs(q);
    
    const transactions = snapshot.docs.map(d => d.data() as PointTransaction);
    
    const userIds = new Set<string>(transactions.map(t => t.userId));
    const userMap = new Map<string, string>();
    
    await Promise.all(Array.from(userIds).map(async (uid) => {
        const uSnap = await getDoc(doc(db, 'users', uid));
        if (uSnap.exists()) {
            const u = uSnap.data() as User;
            userMap.set(uid, u.firstName ? `${u.firstName} ${u.lastName}` : u.username);
        } else {
            userMap.set(uid, 'Utente Eliminato');
        }
    }));
    
    return transactions.map(t => ({
        ...t,
        userName: userMap.get(t.userId) || 'Sconosciuto'
    }));
};

export const clearAllTransactions = async (): Promise<void> => {
    const snapshot = await getDocs(transactionsCollection);
    const batch = writeBatch(db);
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });
    await batch.commit();
};

export const getDashboardStats = async (): Promise<{ totalCustomers: number, totalRedeemed: number, totalActions: number }> => {
    try {
        const customersQ = query(usersCollection, where("role", "==", "customer"));
        const customersSnap = await getCountFromServer(customersQ);
        const totalCustomers = customersSnap.data().count;

        const redemptionsQ = query(transactionsCollection, where("type", "==", "redemption"));
        const redemptionsSnap = await getCountFromServer(redemptionsQ);
        const totalRedeemed = redemptionsSnap.data().count;

        const actionsQ = query(transactionsCollection, where("type", "==", "assignment"));
        const actionsSnap = await getCountFromServer(actionsQ);
        const totalActions = actionsSnap.data().count;

        return {
            totalCustomers,
            totalRedeemed,
            totalActions
        };
    } catch (e) {
        console.error("Error fetching stats:", e);
        return { totalCustomers: 0, totalRedeemed: 0, totalActions: 0 };
    }
};

export const getActions = async (): Promise<Action[]> => {
    const snapshot = await getDocs(actionsCollection);
    return snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Action));
};

export const getHeatingActions = async (): Promise<HeatingAction[]> => {
    const q = query(heatingActionsCollection, orderBy("slot", "asc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ ...d.data(), id: d.id } as HeatingAction));
};

export const createOrUpdateAction = async (action: Partial<Action>): Promise<void> => {
    if (action.id) {
        const ref = doc(db, 'actions', action.id);
        await updateDoc(ref, action);
    } else {
        const ref = doc(actionsCollection);
        await setDoc(ref, { ...action, id: ref.id, isEnabled: true });
    }
};

export const createOrUpdateHeatingAction = async (action: Partial<HeatingAction>): Promise<void> => {
    if (action.id) {
        const ref = doc(db, 'heatingActions', action.id);
        await updateDoc(ref, action);
    }
}

export const deleteAction = async (id: string): Promise<void> => {
    await deleteDoc(doc(db, 'actions', id));
};

export const getPrizes = async (): Promise<Prize[]> => {
    const q = query(prizesCollection, orderBy("pointsRequired", "asc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Prize));
};

export const createOrUpdatePrize = async (prize: Omit<Prize, 'id'> & { id?: string }): Promise<void> => {
    if (prize.id) {
        const ref = doc(db, 'prizes', prize.id);
        await updateDoc(ref, prize);
    } else {
        const ref = doc(prizesCollection);
        await setDoc(ref, { ...prize, id: ref.id });
    }
};

export const deletePrize = async (id: string): Promise<void> => {
    await deleteDoc(doc(db, 'prizes', id));
};

export const getRegulations = async (): Promise<string> => {
    const snap = await getDoc(doc(db, 'regulations', 'main'));
    return snap.exists() ? snap.data().text : '';
};

export const saveRegulations = async (text: string): Promise<void> => {
    await setDoc(doc(db, 'regulations', 'main'), { text });
};
