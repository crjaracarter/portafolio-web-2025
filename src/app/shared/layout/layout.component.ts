import {
  Component,
  OnInit,
  OnDestroy,
  PLATFORM_ID,
  Inject,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { gsap } from 'gsap';
import { routeAnimations } from '../../shared/animations/route-animations';
import { RouterOutlet } from '@angular/router';
import {
  trigger,
  transition,
  style,
  animate,
  query,
  group,
} from '@angular/animations';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet, // Añadir RouterOutlet explícitamente
    HeaderComponent,
    FooterComponent,
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  animations: [routeAnimations],
})
export class LayoutComponent implements OnInit, OnDestroy {
  private animationFrameId?: number;
  private resizeHandler?: () => void;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  getRouteState(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData ? outlet.activatedRouteData['animation'] : 'none';
  }

  

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initMatrixBackground();
      this.initGlitchEffect();
    }
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
    }
  }

  private initGlitchEffect(): void {
    const element = document.querySelector('.glitch-overlay');
    if (element) {
      gsap.to(element, {
        opacity: 1,
        duration: 0.1,
        repeat: -1,
        yoyo: true,
        ease: 'none',
        repeatDelay: 5,
      });
    }
  }

  private initMatrixBackground(): void {
    const canvas = document.getElementById('matrixCanvas') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$@#&%'.split('');
    const fontSize = 20;
    const columns = Math.ceil(width / fontSize);
    const drops: number[] = new Array(columns).fill(1);

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'; 
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = 'rgba(0, 255, 0, 0.9)'; // Verde más visible
      ctx.font = `${fontSize}px "IBM Plex Mono", monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        ctx.fillText(text, x, y);

        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i] += 0.5;
      }
    };

    const animate = () => {
      // Reducir la frecuencia de actualización
      setTimeout(() => {
        draw();
        this.animationFrameId = requestAnimationFrame(animate);
      }, 3); // Puedes ajustar este valor (en milisegundos) - mayor número = más lento
    };
    animate();

    this.resizeHandler = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;

      const newColumns = Math.ceil(width / fontSize);
      drops.length = newColumns;
      for (let i = drops.length; i < newColumns; i++) {
        drops[i] = 1;
      }
    };

    window.addEventListener('resize', this.resizeHandler);
  }
}
