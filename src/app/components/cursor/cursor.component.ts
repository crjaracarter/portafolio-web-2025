// cursor.component.ts
import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import gsap from 'gsap';

@Component({
  selector: 'app-cursor',
  standalone: true,
  template: `
    <div class="cursor">
      <div class="cursor-dot"></div>
      <div class="cursor-outline"></div>
    </div>
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
        background-color: #00ff00; // Verde neón de tu paleta
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

      cursor-outline.cursor-hover {
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
})
export class CursorComponent implements OnInit {
  private cursor = { x: 0, y: 0 };

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
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
  ngOnInit(): void {
    // Ocultar el cursor original
    document.body.style.cursor = 'none';
  }
}
