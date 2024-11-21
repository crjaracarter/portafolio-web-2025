import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
})
export class ContactComponent implements OnInit, AfterViewInit {
  @ViewChild('connectionText') connectionText!: ElementRef;
  @ViewChild('typingText') typingText!: ElementRef;

  showContent = false;

  private readonly welcomeMessage =
    '¡Hola! Estoy siempre interesado en colaborar en proyectos innovadores y conectar con otros profesionales. ¡Contáctame!';

  ngOnInit(): void {
    // Removemos la llamada a simulateConnection de aquí
  }

  ngAfterViewInit(): void {
    // Mantenemos solo una llamada a simulateConnection
    setTimeout(() => {
      this.simulateConnection();
    }, 0);
  }

  private simulateConnection(): void {
    // Agregamos una verificación de seguridad
    if (!this.connectionText?.nativeElement) return;

    const lines = Array.from(
      this.connectionText.nativeElement.children
    ) as HTMLElement[];

    lines.forEach((line: HTMLElement, index: number) => {
      setTimeout(() => {
        line.classList.add('visible');

        if (index === lines.length - 1) {
          setTimeout(() => {
            this.showContent = true;
            this.typeWelcomeMessage();
          }, 500);
        }
      }, index * 500);
    });
  }

  private typeWelcomeMessage(): void {
    if (!this.typingText?.nativeElement) return;

    let i = 0;
    const typing = setInterval(() => {
      if (!this.typingText?.nativeElement) {
        clearInterval(typing);
        return;
      }
      
      this.typingText.nativeElement.textContent = this.welcomeMessage.substring(
        0,
        i
      );
      i++;

      if (i > this.welcomeMessage.length) {
        clearInterval(typing);
      }
    }, 50);
  }
}