import { 
    trigger, 
    transition, 
    style, 
    query, 
    animate, 
    group
  } from '@angular/animations';
  
  export const routeAnimations = trigger('routeAnimations', [
    transition('* <=> *', [
      query(':enter, :leave', [
        style({
          position: 'absolute',
          width: '100%',
          height: '100%',
          opacity: 0
        })
      ], { optional: true }),
      
      query(':leave', [
        style({ opacity: 1 }),
        animate('0.3s ease-out', style({
          opacity: 0,
          transform: 'translateY(-20px)'
        }))
      ], { optional: true }),
      
      query(':enter', [
        style({
          opacity: 0,
          transform: 'translateY(20px)'
        }),
        animate('0.3s ease-out', style({
          opacity: 1,
          transform: 'translateY(0)'
        }))
      ], { optional: true })
    ])
  ]);