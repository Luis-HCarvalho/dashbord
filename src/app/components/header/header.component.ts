import { Component, EventEmitter, Output } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-header',
    imports: [
        MatToolbarModule,
        MatDividerModule,
        MatButtonModule,
        MatIconModule,
    ],
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss'
})
export class HeaderComponent {
    @Output() sidebarToggle = new EventEmitter<void>();

    toggle() {
        this.sidebarToggle.emit();
    }
}
