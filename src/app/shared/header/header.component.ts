import { Component, OnInit } from '@angular/core';import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { animate, style, transition, trigger } from '@angular/animations';

import { IpService } from '../../services/ip.service';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
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
export class HeaderComponent implements OnInit {
  userIp: string = '';
  loading: boolean = true;

  constructor(private ipService: IpService) {}

  ngOnInit() {
    this.ipService.getIpAddress().subscribe({
      next: (response) => {
        this.userIp = response.ip;
        this.loading = false;
      },
      error: () => {
        this.userIp = 'unknown';
        this.loading = false;
      }
    });
  }
}