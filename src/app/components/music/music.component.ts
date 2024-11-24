import { Component, OnInit, OnDestroy, ViewChild, ElementRef, inject, AfterViewInit, signal, ViewEncapsulation } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AudioService } from '../../services/audio/audio.service';
import { Song } from '../../models/song.interface';
import { Subject, fromEvent, interval } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-music',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './music.component.html',
  styleUrls: ['./music.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class MusicComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('visualizerCanvas') visualizerCanvas!: ElementRef<HTMLCanvasElement>;
  
  protected audioService = inject(AudioService);
  private destroy$ = new Subject<void>();

   // Signals para estado reactivo
   currentSongSignal = signal<Song | null>(null);
   isPlayingSignal = signal(false);
   currentTimeSignal = signal(0);
   durationSignal = signal(0);
  
  // Estado del reproductor
  playlist: Song[] = [];
  currentTime = new Date();
  isMaximized = signal(false);
  isMinimized = signal(false);
  isRepeatActive = signal(false);
  isShuffleActive = signal(false);
  volume = signal(100);
  
  // Estado de la interfaz
  isDragging = false;
  initialPosition = { x: 0, y: 0 };
  currentPosition = { x: 0, y: 0 };

  constructor() {
    interval(1000)
      .pipe(
        takeUntil(this.destroy$),
        catchError(err => {
          console.error('Error en el intervalo:', err);
          return interval(1000);
        })
      )
      .subscribe(() => {
        this.currentTime = new Date();
      });
  }
  
  ngOnInit() {
    try {
      this.playlist = this.audioService.getPlaylist();
      this.initializeKeyboardControls();
      this.initializeWindowDrag();
      this.initializeAudioListeners();
    } catch (error) {
      console.error('Error en la inicialización:', error);
    }
  }

  private initializeAudioListeners() {
    this.audioService.currentTime$
      .pipe(takeUntil(this.destroy$))
      .subscribe(time => {
        console.log('Time update:', time); // Para debug
        this.currentTimeSignal.set(time);
      });
  
    this.audioService.duration$
      .pipe(takeUntil(this.destroy$))
      .subscribe(duration => {
        console.log('Duration update:', duration); // Para debug
        this.durationSignal.set(duration);
      });
  
    this.audioService.currentSong$
      .pipe(takeUntil(this.destroy$))
      .subscribe(song => {
        console.log('Current song:', song); // Para debug
        this.currentSongSignal.set(song);
      });
  
    this.audioService.isPlaying$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isPlaying => {
        console.log('Is playing:', isPlaying); // Para debug
        this.isPlayingSignal.set(isPlaying);
      });
  }


  ngAfterViewInit() {
    this.initializeVisualizer();
  }

  private initializeKeyboardControls() {
    fromEvent<KeyboardEvent>(document, 'keydown')
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => this.handleKeyboardControls(event));
  }

  private initializeWindowDrag() {
    document.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        const deltaX = e.clientX - this.initialPosition.x;
        const deltaY = e.clientY - this.initialPosition.y;
        
        const playerElement = document.querySelector('.matrix-player') as HTMLElement;
        if (playerElement) {
          playerElement.style.transform = `translate(${this.currentPosition.x + deltaX}px, ${this.currentPosition.y + deltaY}px)`;
        }
      }
    });

    document.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.isDragging = false;
        const playerElement = document.querySelector('.matrix-player') as HTMLElement;
        const transform = getComputedStyle(playerElement).transform;
        const matrix = new DOMMatrix(transform);
        this.currentPosition = {
          x: matrix.m41,
          y: matrix.m42
        };
      }
    });
  }

  private initializeVisualizer() {
    if (this.visualizerCanvas) {
      const canvas = this.visualizerCanvas.nativeElement;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Ajustar tamaño del canvas
      const resizeCanvas = () => {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
      };
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);

      // Aquí puedes agregar la lógica del visualizador
      // Por ejemplo, una simple animación matrix
      const drawMatrix = () => {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#0F0';
        ctx.font = '10px monospace';
        
        for (let i = 0; i < canvas.width/10; i++) {
          const text = String.fromCharCode(Math.random() * 128);
          ctx.fillText(text, i * 10, Math.random() * canvas.height);
        }

        requestAnimationFrame(drawMatrix);
      };

      drawMatrix();
    }
  }

  // Controles de reproducción
  async playSong(song: Song) {
    try {
      await this.audioService.playSong(song);
    } catch (error) {
      console.error('Error al reproducir la canción:', error);
    }
  }

  async togglePlay() {
    try {
      const currentSong = this.currentSongSignal();
      if (currentSong) {
        await this.audioService.togglePlay();
      } else if (this.playlist.length > 0) {
        await this.playSong(this.playlist[0]);
      }
    } catch (error) {
      console.error('Error al togglePlay:', error);
    }
  }

  playNext() {
    try {
      if (this.isShuffleActive()) {
        this.playRandomSong();
      } else {
        this.audioService.playNext();
      }
    } catch (error) {
      console.error('Error en playNext:', error);
    }
  }

  playPrevious() {
    try {
      this.audioService.playPrevious();
    } catch (error) {
      console.error('Error en playPrevious:', error);
    }
  }

  playRandomSong() {
    try {
      if (this.playlist.length > 0) {
        const currentIndex = this.playlist.findIndex(
          song => song.id === this.currentSongSignal()?.id
        );
        let randomIndex;
        do {
          randomIndex = Math.floor(Math.random() * this.playlist.length);
        } while (randomIndex === currentIndex && this.playlist.length > 1);
        
        this.playSong(this.playlist[randomIndex]);
      }
    } catch (error) {
      console.error('Error en playRandomSong:', error);
    }
  }

  // Control de progreso y volumen
  seekTrack(event: MouseEvent) {
    try {
      const element = event.currentTarget as HTMLElement;
      const rect = element.getBoundingClientRect();
      const x = Math.max(0, Math.min(event.clientX - rect.left, rect.width));
      const percentage = x / rect.width;
      const duration = this.durationSignal();
      
      console.log('Seek attempt:', { x, percentage, duration }); // Para debug
      
      if (duration > 0) {
        const time = percentage * duration;
        this.audioService.seek(time);
        // Actualizar inmediatamente el visual
        this.currentTimeSignal.set(time);
      }
    } catch (error) {
      console.error('Error en seekTrack:', error);
    }
  }

  calculateProgress(): number {
    const currentTime = this.currentTimeSignal();
    const duration = this.durationSignal();
    
    if (!currentTime || !duration) return 0;
    
    const progress = (currentTime / duration) * 100;
    return Math.min(100, Math.max(0, progress));
  }

  setVolume(value: number) {
    try {
      const normalizedValue = Math.max(0, Math.min(100, value));
      this.volume.set(normalizedValue);
      this.audioService.setVolume(value / 100);
    } catch (error) {
      console.error('Error al ajustar volumen:', error);
    }
  }

  // Controles de ventana
  toggleMaximize() {
    this.isMaximized.update(v => !v);
  }

  toggleMinimize() {
    this.isMinimized.update(v => !v);
  }

  startDragging(event: MouseEvent) {
    if (!this.isMaximized()) {
      this.isDragging = true;
      this.initialPosition = {
        x: event.clientX,
        y: event.clientY
      };
    }
  }

  // Controles adicionales
  toggleRepeat() {
    this.isRepeatActive.update(v => !v);
    this.audioService.setRepeat(this.isRepeatActive());
  }

  toggleShuffle() {
    this.isShuffleActive.update(v => !v);
  }

  // Utilidades
  formatTime(seconds: number | undefined): string {
    if (!seconds) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  shouldScroll(text: string): boolean {
    return text.length > 30;
  }

  handleVolumeChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.setVolume(Number(input.value));
  }

  handleKeyboardControls(event: KeyboardEvent) {
    switch(event.code) {
      case 'Space':
        event.preventDefault();
        this.togglePlay();
        break;
      case 'ArrowRight':
        this.playNext();
        break;
      case 'ArrowLeft':
        this.playPrevious();
        break;
      case 'ArrowUp':
        this.volume.update(v => Math.min(v + 5, 100));
        this.audioService.setVolume(this.volume() / 100);
        break;
      case 'ArrowDown':
        this.volume.update(v => Math.max(v - 5, 0));
        this.audioService.setVolume(this.volume() / 100);
        break;
    }
  }

  toggleMute() {
    this.audioService.toggleMute();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}