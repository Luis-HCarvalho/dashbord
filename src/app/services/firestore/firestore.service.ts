import { Injectable } from '@angular/core';
import { collection, collectionData, DocumentData, Firestore, limit, query } from '@angular/fire/firestore';
import { firstValueFrom } from 'rxjs';
// import * as fs from 'node:fs';

@Injectable({
    providedIn: 'root'
})
export class FirestoreService {

    constructor(
        private firestore: Firestore
    ) { }

    public fetch(lmt?: number): Promise<DocumentData[]> {
        const ref = collection(this.firestore, `posts`);
        if (lmt) {
            const refQ = query(ref, limit(lmt));
            return firstValueFrom(collectionData(refQ));
        } else {
            return firstValueFrom(collectionData(ref))
        }
    }

    // storeData() {
    //     console.log(`i`);
    //     const json = JSON.stringify({ name: "bob" });
    //     fs.writeFile(`test.json`, json, `utf8`, (err: any) => {
    //         if (err)
    //             console.error(err);
    //     });
    // }
}
