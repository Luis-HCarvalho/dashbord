import { Component, OnInit } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData } from 'chart.js';
import { MatGridListModule } from '@angular/material/grid-list';
import { DataProcessingService } from '../../services/dataProcessing/data-processing.service';
import { MatCardModule } from '@angular/material/card';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { HeaderComponent } from '../header/header.component';
import interact from 'interactjs'

@Component({
    selector: 'app-dashboard',
    imports: [
        BaseChartDirective,
        MatGridListModule,
        MatCardModule,
        MatSidenavModule,
        MatListModule,
        HeaderComponent,
        MatSlideToggleModule
    ],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
    weekdayData?: ChartData<'bar'>;
    tagData?: ChartData<'pie'>;
    engagementData?: ChartData<'radar'>;
    avgReadingTime: number = 0;
    minDate!: string;
    maxDate!: string;
    datalen!: number;

    constructor(
        private SDProcessing: DataProcessingService
    ) {
        interact("mat-card").resizable({
            edges: { left: true, right: true, top: true, bottom: true },
            listeners: {
                move(event) {
                    const target = event.target;
                    let x = (parseFloat(target.getAttribute("data-x")) || 0);
                    let y = (parseFloat(target.getAttribute("data-y")) || 0);

                    target.style.width = event.rect.width + "px";
                    target.style.height = event.rect.height + "px";

                    x += event.deltaRect.left;
                    y += event.deltaRect.top;
                    target.style.transform = 'translate(' + x + 'px,' + y + 'px)'

                    target.setAttribute('data-x', x)
                    target.setAttribute('data-y', y)
                }
            },
            modifiers: [
                interact.modifiers.restrictEdges({ outer: "parent" }),
                interact.modifiers.restrictSize({ min: { width: 100, height: 50 } })
            ],
            inertia: true
        }).draggable({
            listeners: { 
                move(event) {
                    const target = event.target;
                    let x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
                    let y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

                    target.style.webkitTransform = target.style.transform =
                        'translate(' + x + 'px, ' + y + 'px)';

                    target.setAttribute('data-x', x);
                    target.setAttribute('data-y', y);
                }
            },
            inertia: true,
            modifiers: [
                interact.modifiers.restrictRect({
                    // restriction: 'parent',
                    endOnly: true
                })
            ]
        })
    }

    async ngOnInit() {
        const tags = await this.SDProcessing.getTagData();
        if (tags) {
            const entries = Object.entries(tags);
            const sorted = entries
                .sort((a, b) => (<number[]>b[1])[0] - (<number[]>a[1])[0]);
            
            let top;
            let others = ["others", 0];
            if (sorted.length > 10) {
                top = sorted.slice(0, 10);
                others[1] = sorted.slice(10).reduce((acc, crr) => { 
                    return acc + (<number[]>crr[1])[0]; 
                }, 0);
            } else {
                top = sorted;
            }
            
            this.tagData = {
                labels: [...top.map(tag => tag[0]), "others"],
                datasets: [{ 
                    data: [...top.map(tag => (<number[]>tag[1])[0]), <number>others[1]],
                }],
            };

            this.engagementData = {
                labels: [...top.map(tag => tag[0])],
                datasets: [
                    { data: top.map(tag => (<number[]>tag[1])[1]), label: `comments`},
                    { data: top.map(tag => (<number[]>tag[1])[2]), label: `reactions`},
                ]
            }
        }

        this.avgReadingTime = await this.SDProcessing.avgReadingTime();
        const tmp = await this.SDProcessing.getTimeRange();
        this.minDate = tmp[0];
        this.maxDate = tmp[1];

        this.datalen = await this.SDProcessing.getDataLen();

        const wkdaysData = await this.SDProcessing.getWeekdaysData();

        this.weekdayData  = {
            labels: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            datasets: [
                { data: wkdaysData, label: 'Publish At' }
            ],
        };
    }
}
