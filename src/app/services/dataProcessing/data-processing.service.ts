import { Injectable } from '@angular/core';
import { FirestoreService } from '../firestore/firestore.service';

@Injectable({
    providedIn: 'root'
})
export class DataProcessingService {
    /**
     * the indexes respect the following order: 0 for Sunday, 1 for Monday,
     * 2 for Tuesday, and so on.
     */
    private weekDayCount = [0, 0, 0, 0, 0, 0, 0];

    private minDate!: number;
    private maxDate!: number;
    private readingTime: number[] = [0, 0];     // [count, sum]
    private tags: any = {};
    private totalDataLen?: number;  // used to track if the data was alread retrieved and processed

    constructor(
        private SFStore: FirestoreService,
    ) { }

    private tagListCount(tags: string[], comments: number, reactions: number) {
        tags.forEach(tag => {
            if (!this.tags[tag]) {
                this.tags[tag] = [1, comments, reactions];
            } else {
                this.tags[tag][0]++;
                this.tags[tag][1] += comments;
                this.tags[tag][2] += reactions;
            }
        });
    }

    private async processData() {
        const data = await this.SFStore.fetch(10);
        if (!data) return Promise.reject();

        this.totalDataLen = data.length;
        this.minDate = this.maxDate = data[0][`published_at_int`];
        
        data.forEach(d => {
            if (d[`published_at_int`] < this.minDate)
                this.minDate = d[`published_at_int`]
            else if (d[`published_at_int`] > this.maxDate)
                this.maxDate = d[`published_at_int`]

            this.tagListCount(
                d[`tag_list`], 
                d[`comments_count`], 
                d[`public_reactions_count`]
            );

            this.readingTime[0]++;
            this.readingTime[1] += d[`reading_time`];

            const date = new Date(d[`published_at_int`]);
            this.weekDayCount[date.getUTCDay()]++;
        })
    }

    public getDataLen() {
        if (this.totalDataLen) {
            return Promise.resolve(this.totalDataLen)
        } else {
            return new Promise<number>((res, rej) => {
                this.processData().then(() => {
                    res(<number>this.totalDataLen);
                }).catch(err => rej(err));
            });
        }
    }

    public async getTimeRange() {
        const dataLen = await this.getDataLen();
        if (!dataLen) 
            return Promise.reject();

        return Promise.resolve([
            new Date(this.minDate * 1000).toLocaleDateString(),
            new Date(this.maxDate * 1000).toLocaleDateString()
        ]);
    }

    public async avgReadingTime() {
        const dataLen = await this.getDataLen();
        if (!dataLen) 
            return Promise.reject();

        return Promise.resolve(this.readingTime[1] / this.readingTime[0]);
    }

    public async getTagData() {
        const dataLen = await this.getDataLen();
        if (!dataLen) 
            return Promise.reject();

        return Promise.resolve(this.tags);
    }

    public async getWeekdaysData() {
        const dataLen = await this.getDataLen();
        if (!dataLen) 
            return Promise.reject();

        return Promise.resolve(this.weekDayCount);
    }
}