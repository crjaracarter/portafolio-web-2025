// cursor.component.ts
import { Component, OnInit, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DOCUMENT } from '@angular/common';
import gsap from 'gsap';

@Component({
  selector: 'app-cursor',
  standalone: true,
  template: `
    @if (isBrowser) {
      <div class="cursor">
        <div class="cursor-dot"></div>
        <div class="cursor-outline"></div>
      </div>
    }
  `,
  styles: [
    `
      .cursor {
        pointer-events: none;
        position: fixed;
        z-index: 9999;
        mix-blend-mode: difference;
      }
      .cursor-dot {
        position: fixed;
        width: 8px;
        height: 8px;
        background-color: #00ff00;
        border-radius: 50%;
        transform: translate(-50%, -50%);
      }
      .cursor-outline {
        position: fixed;
        width: 40px;
        height: 40px;
        border: 2px solid #00ff00;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        opacity: 0.5;
        transition: all 0.2s ease-out;
      }

      .cursor-outline.cursor-hover {
        .cursor-dot {
          transform: translate(-50%, -50%) scale(2);
          background-color: #ff00ff;
        }
        .cursor-outline {
          transform: translate(-50%, -50%) scale(1.5);
          border-color: #ff00ff;
        }
      }
    `,
  ],
  styleUrls: ['./cursor.component.scss'],
  imports: [CommonModule],
})
export class CursorComponent implements OnInit {
  isBrowser: boolean;
  private cursor = { x: 0, y: 0 };

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.isBrowser) {
      gsap.to('.cursor-dot', {
        x: event.clientX,
        y: event.clientY,
        duration: 0.1,
      });

      gsap.to('.cursor-outline', {
        x: event.clientX,
        y: event.clientY,
        duration: 0.15,
      });
    }
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.document.body.style.cursor = 'none';
    }
  }

  ngOnDestroy(): void {
    if (this.isBrowser) {
      this.document.body.style.cursor = 'auto';
    }
  }
}