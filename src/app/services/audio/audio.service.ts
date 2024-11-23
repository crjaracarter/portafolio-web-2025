import { Injectable, signal } from '@angular/core';
import { Song } from '../../models/song.interface';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private audio = new Audio();

  // Signals
  private _currentSong = signal<Song | null>(null);
  private _isPlaying = signal(false);
  private _currentTime = signal(0);
  private _duration = signal(0);
  private _volume = signal(1);
  private _isMuted = signal(false);

  private repeatEnabled = false;

  // BehaviorSubjects para reactividad
  private currentSongSubject = new BehaviorSubject<Song | null>(null);
  private isPlayingSubject = new BehaviorSubject<boolean>(false);
  private currentTimeSubject = new BehaviorSubject<number>(0);
  private durationSubject = new BehaviorSubject<number>(0);
  private volumeSubject = new BehaviorSubject<number>(1);
  private errorSubject = new BehaviorSubject<string | null>(null);

  // Observables públicos
  currentSong$ = this.currentSongSubject.asObservable();
  isPlaying$ = this.isPlayingSubject.asObservable();
  currentTime$ = this.currentTimeSubject.asObservable();
  duration$ = this.durationSubject.asObservable();
  volume$ = this.volumeSubject.asObservable();
  error$ = this.errorSubject.asObservable();

  // Estado adicional
  private repeatMode: 'none' | 'one' | 'all' = 'none';
  private shuffleEnabled = false;
  private previousVolume = 1;

  private playlist: Song[] = [
    {
      id: 1,
      title: 'Trauma',
      artist: 'Aligns',
      path: 'assets/audio/Aligns - Trauma.mp3'
    },
    {
      id: 2,
      title: 'Sick!!!',
      artist: 'Machine Girl',
      path: 'assets/audio/Machine Girl - Sick!!!.mp3'
    },
    {
      id: 3,
      title: 'Overthrow (Club Version)',
      artist: 'Boys Noize',
      path: 'assets/audio/Boys Noize - Overthrow (Club Version).mp3'
    },
    {
      id: 4,
      title: "I Won't Let You Go",
      artist: 'Converge',
      path: "assets/audio/Converge - I Won't Let You Go.mp3"
    },
    {
      id: 5,
      title: 'Crimewave',
      artist: 'Crystal Castles',
      path: 'assets/audio/Crystal Castles - Crimewave.mp3'
    },
    {
      id: 6,
      title: 'Vanished',
      artist: 'Crystal Castles',
      path: 'assets/audio/Crystal Castles - Vanished.mp3'
    },
    {
      id: 7,
      title: 'Hacker',
      artist: 'Death Grips',
      path: 'assets/audio/Death Grips - Hacker.mp3'
    },
    {
      id: 8,
      title: 'Sustain_Decay',
      artist: 'Drivealone',
      path: 'assets/audio/Drivealone - Sustain_Decay.mp3'
    },
    {
      id: 9,
      title: 'Devolution',
      artist: 'Formshift',
      path: 'assets/audio/Formshift - Devolution.mp3'
    },
    {
      id: 10,
      title: 'Opr',
      artist: 'Gesaffelstein',
      path: 'assets/audio/Gesaffelstein - Opr.mp3'
    },
    {
      id: 11,
      title: 'Allure',
      artist: 'Infekt',
      path: 'assets/audio/Infekt - Allure.mp3'
    },
    {
      id: 12,
      title: 'Justice',
      artist: 'Kaiju',
      path: 'assets/audio/Kaiju - Justice.mp3'
    },
    {
      id: 13,
      title: 'The Fatman',
      artist: 'Truth',
      path: 'assets/audio/Truth - The Fatman.mp3'
    },
    {
      id: 14,
      title: 'Focker',
      artist: 'Late Of The Pier',
      path: 'assets/audio/Late Of The Pier - Focker.mp3'
    },
    {
      id: 15,
      title: 'Completely Clueless',
      artist: 'Machine Girl',
      path: 'assets/audio/Machine Girl - Completely Clueless.mp3'
    },
    {
      id: 16,
      title: 'Where Is My Mind?',
      artist: 'Pixies',
      path: 'assets/audio/Pixies - Where Is My Mind_.mp3'
    },
    {
      id: 17,
      title: 'Come Close',
      artist: 'Sebastian Robertson',
      path: 'assets/audio/Sebastian Robertson - Come Close.mp3'
    },
    {
      id: 18,
      title: 'Money',
      artist: 'The Drums',
      path: 'assets/audio/The Drums - Money.mp3'
    },
    {
      id: 19,
      title: 'Roi',
      artist: 'Videoclub',
      path: 'assets/audio/Videoclub - Roi.mp3'
    }
  ];

  async loadSongDuration(song: Song): Promise<void> {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.src = song.path;
      
      audio.addEventListener('loadedmetadata', () => {
        song.duration = audio.duration;
        resolve();
      });

      audio.addEventListener('error', () => {
        song.duration = 0;
        resolve();
      });
    });
  }

  constructor() {
    this.initializeAudioEvents();
    this.loadLastVolume();
    void this.loadAllSongDurations();
  }
  private async loadAllSongDurations() {
    for (const song of this.playlist) {
      if (!song.duration) {
        await this.loadSongDuration(song);
      }
    }
  }
  

  private initializeAudioEvents() {
    this.audio.addEventListener('timeupdate', () => {
      const currentTime = this.audio.currentTime;
      console.log('Current Time:', currentTime); // Para debug
      this._currentTime.set(currentTime);
      this.currentTimeSubject.next(currentTime);
    });

    this.audio.addEventListener('loadedmetadata', () => {
      const duration = this.audio.duration;
      console.log('Duration:', duration); // Para debug
      this._duration.set(duration);
      this.durationSubject.next(duration);
    });

    this.audio.addEventListener('error', (e) => {
      const error = `Error loading audio: ${e}`;
      this.errorSubject.next(error);
      console.error(error);
    });
    this.audio.addEventListener('playing', () => {
      this._isPlaying.set(true);
      this.isPlayingSubject.next(true);
    });
    this.audio.addEventListener('pause', () => {
      this._isPlaying.set(false);
      this.isPlayingSubject.next(false);
    });
  }

  private handleSongEnd() {
    switch (this.repeatMode) {
      case 'one':
        this.audio.currentTime = 0;
        void this.audio.play();
        break;
      case 'all':
        this.playNext();
        break;
      case 'none':
        if (this.getCurrentSongIndex() < this.playlist.length - 1) {
          this.playNext();
        } else {
          this._isPlaying.set(false);
          this.isPlayingSubject.next(false);
        }
        break;
    }
  }

  // Getters públicos
  getCurrentSongIndex(): number {
    return this.playlist.findIndex(song => song.id === this._currentSong()?.id);
  }

  // Getters
  currentSong() { return this._currentSong(); }
  isPlaying() { return this._isPlaying(); }
  currentTime() { return this._currentTime(); }
  duration() { return this._duration(); }
  volume() { return this._volume(); }
  isMuted() { return this._isMuted(); }

  // Métodos de control de reproducción
  async playSong(song: Song): Promise<void> {
    try {
      if (!song.duration) {
        await this.loadSongDuration(song);
      }

      if (this._currentSong()?.id === song.id) {
        await this.togglePlay();
        return;
      }

      this._currentSong.set(song);
      this.currentSongSubject.next(song);
      this.audio.src = song.path;
      this.audio.load();
      await this.audio.play();
      this.addToHistory(song);
    } catch (error) {
      const errorMsg = `Error playing ${song.title}: ${error}`;
      this.errorSubject.next(errorMsg);
      console.error(errorMsg);
    }
  }

  async togglePlay(): Promise<void> {
    try {
      if (this.audio.paused) {
        await this.audio.play();
      } else {
        this.audio.pause();
      }
    } catch (error) {
      const errorMsg = `Error toggling playback: ${error}`;
      this.errorSubject.next(errorMsg);
      console.error(errorMsg);
    }
  }

  playNext(): void {
    if (this.shuffleEnabled) {
      this.playRandomSong();
      return;
    }

    const currentIndex = this.getCurrentSongIndex();
    const nextIndex = (currentIndex + 1) % this.playlist.length;
    void this.playSong(this.playlist[nextIndex]);
  }

  playPrevious(): void {
    const currentIndex = this.getCurrentSongIndex();
    const previousIndex = currentIndex === 0 ? this.playlist.length - 1 : currentIndex - 1;
    void this.playSong(this.playlist[previousIndex]);
  }

  playRandomSong(): void {
    const currentIndex = this.getCurrentSongIndex();
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * this.playlist.length);
    } while (randomIndex === currentIndex && this.playlist.length > 1);
    
    void this.playSong(this.playlist[randomIndex]);
  }

  // Control de progreso y volumen
  seek(time: number): void {
    if (time >= 0 && time <= this.duration()) {
      this.audio.currentTime = time;
      this._currentTime.set(time);
      this.currentTimeSubject.next(time);
    }
  }

  setVolume(value: number): void {
    const volume = Math.max(0, Math.min(1, value));
    this.audio.volume = volume;
    this._volume.set(volume);
    this.volumeSubject.next(volume);
    this.previousVolume = volume;
    localStorage.setItem('audioVolume', volume.toString());
  }

  toggleMute(): void {
    if (this.audio.volume > 0) {
      this.previousVolume = this.audio.volume;
      this.setVolume(0);
      this._isMuted.set(true);
    } else {
      this.setVolume(this.previousVolume);
      this._isMuted.set(false);
    }
  }

  // Control de repetición y shuffle
  toggleRepeatMode(): 'none' | 'one' | 'all' {
    switch (this.repeatMode) {
      case 'none': this.repeatMode = 'one'; break;
      case 'one': this.repeatMode = 'all'; break;
      case 'all': this.repeatMode = 'none'; break;
    }
    return this.repeatMode;
  }

  toggleShuffle(): boolean {
    this.shuffleEnabled = !this.shuffleEnabled;
    return this.shuffleEnabled;
  }

  // Gestión de playlist
  getPlaylist(): Song[] {
    return [...this.playlist];
  }

  addToHistory(song: Song): void {
    const history = JSON.parse(localStorage.getItem('playHistory') || '[]');
    history.unshift({ ...song, timestamp: new Date().toISOString() });
    localStorage.setItem('playHistory', JSON.stringify(history.slice(0, 50)));
  }

  private loadLastVolume(): void {
    const savedVolume = localStorage.getItem('audioVolume');
    if (savedVolume !== null) {
      this.setVolume(Number(savedVolume));
    }
  }


  // Control de repetición
  setRepeat(enabled: boolean) {
    this.repeatEnabled = enabled;
  }


  // Limpieza
  destroy(): void {
    this.audio.pause();
    this.audio.src = '';
    this.audio.load();
  }
}