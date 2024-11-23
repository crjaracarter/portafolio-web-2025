import { Component, ElementRef, OnInit, ViewChild, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import anime from 'animejs';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  @ViewChild('asciiArt') asciiArt!: ElementRef;
  @ViewChild('typedText') typedText!: ElementRef;

  private readonly welcomeText = 'Bienvenido a mi portafolio web!!!111...';
  private readonly asciiLogo = `
  Alias: Coma
 ██████╗ ██████╗ ███╗   ███╗ █████╗ 
██╔════╝██╔═══██╗████╗ ████║██╔══██╗
██║     ██║   ██║██╔████╔██║███████║
██║     ██║   ██║██║╚██╔╝██║██╔══██║
╚██████╗╚██████╔╝██║ ╚═╝ ██║██║  ██║
 ╚═════╝ ╚═════╝ ╚═╝     ╚═╝╚═╝  ╚═╝
`;

constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

ngOnInit() {
  if (isPlatformBrowser(this.platformId)) {
    this.initializeAnimations();
    // this.initMatrixBackground();
  }
}

private initializeAnimations() {
  setTimeout(() => {
    this.typeText();
    this.showAsciiArt();
    this.animateRoles();
  }, 500);
}

// private initMatrixBackground(): void {
//   const canvas = document.createElement('canvas');
//   const ctx = canvas.getContext('2d');
  
//   canvas.classList.add('matrix-background');
//   document.querySelector('.home')?.appendChild(canvas);

//   let width = canvas.width = window.innerWidth;
//   let height = canvas.height = window.innerHeight;

//   const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$@#&%'.split('');
//   const fontSize = 16;
//   const columns = width / fontSize;
//   const drops: number[] = [];

//   for (let i = 0; i < columns; i++) {
//     drops[i] = 1;
//   }

//   function draw() {
//     if (!ctx) return;
//     ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
//     ctx.fillRect(0, 0, width, height);
//     ctx.fillStyle = '#0F0';
//     ctx.font = fontSize + 'px monospace';

//     for (let i = 0; i < drops.length; i++) {
//       const text = chars[Math.floor(Math.random() * chars.length)];
//       ctx.fillText(text, i * fontSize, drops[i] * fontSize);
//       if (drops[i] * fontSize > height && Math.random() > 0.975) {
//         drops[i] = 0;
//       }
//       drops[i]++;
//     }
//   }

//   setInterval(draw, 35);

//   window.addEventListener('resize', () => {
//     width = canvas.width = window.innerWidth;
//     height = canvas.height = window.innerHeight;
//   });
// }

private typeText() {
  if (!this.typedText?.nativeElement) return;
  
  let i = 0;
  const typing = setInterval(() => {
    this.typedText.nativeElement.textContent = this.welcomeText.substring(0, i);
    i++;
    if (i > this.welcomeText.length) {
      clearInterval(typing);
      this.animateRoles();
    }
  }, 50);
}

private showAsciiArt() {
  if (!this.asciiArt?.nativeElement) return;
  
  this.asciiArt.nativeElement.textContent = this.asciiLogo;
  anime({
    targets: this.asciiArt.nativeElement,
    opacity: [0, 1],
    duration: 2000,
    easing: 'easeInOutQuad'
  });
}

private animateRoles() {
  const roles = document.querySelectorAll('.role-item');
  roles.forEach((role, index) => {
    setTimeout(() => {
      role.classList.add('visible');
    }, 2000 + (index * 200));
  });
}
}