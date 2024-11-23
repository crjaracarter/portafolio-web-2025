import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AboutComponent } from './components/about/about.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { ContactComponent } from './components/contact/contact.component';
import { MusicComponent } from './components/music/music.component';
export const routes: Routes = [
  { path: '', component: HomeComponent,
    data: { animation: 'home' }
   },
  { path: 'about', component: AboutComponent,
    data: { animation: 'about' }
   },
  { path: 'projects', component: ProjectsComponent,
    data: { animation: 'projects' }
   },
  { path: 'contact', component: ContactComponent,
    data: { animation: 'contact' }
   },
   { 
    path: 'music', 
    component: MusicComponent,
    data: { animation: 'music' }
  },
  { path: '**', redirectTo: '' },

];
