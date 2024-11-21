import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [
    trigger('linkHover', [
      transition(':enter', [
        style({ width: 0 }),
        animate('300ms ease', style({ width: '100%' }))
      ])
    ])
  ]
})
export class HeaderComponent {
  constructor() {}
}