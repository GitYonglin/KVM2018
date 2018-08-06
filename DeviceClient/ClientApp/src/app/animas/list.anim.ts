import { trigger, state, transition, style, animate, keyframes, query, stagger } from '@angular/animations';
import { Optional } from '@angular/core';

export const listAnim = trigger('list', [
  transition('* => *', [
    query(':enter', style({opacity: 0}), {optional: true}),
    query(':enter', stagger(10, [
      animate('.5s', style({opacity: 1}))
    ]), {optional: true}),
    query(':leave', style({opacity: 1}), {optional: true}),
    query(':leave', stagger(1, [
      animate('.5s', style({opacity: 0}))
    ]), {optional: true}),
  ]),
]);
