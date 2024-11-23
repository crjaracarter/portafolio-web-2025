export interface Song {
  id: number;
  title: string;
  artist: string;
  duration?: number; // Agregamos duration como opcional
  path: string;
  currentTime?: number;
}
