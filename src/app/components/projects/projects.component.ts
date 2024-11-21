import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import anime from 'animejs';

@Component({
    selector: 'app-projects',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './projects.component.html',
    styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit {
    constructor() {}

    ngOnInit(): void {
        this.initializeAnimations();
    }

    private initializeAnimations(): void {
        anime({
            targets: '.project-card',
            translateY: [20, 0],
            opacity: [0, 1],
            delay: anime.stagger(100)
        });
    }

    onProjectHover(event: MouseEvent): void {
        const card = event.currentTarget as HTMLElement;
        
        anime({
            targets: card.querySelector('.tech-stack span'),
            scale: [1, 1.1],
            duration: 200,
            direction: 'alternate'
        });
    }
}