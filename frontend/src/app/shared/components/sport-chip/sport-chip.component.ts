import { Component, Input } from '@angular/core';
import { NgClass, NgStyle } from '@angular/common';

@Component({
  selector: 'app-sport-chip',
  standalone: true,
  imports: [NgClass, NgStyle],
  template: `
    <span class="sport-chip" [ngClass]="{ 'sport-chip-active': active }">
      <span class="live-dot" [ngStyle]="{ 'background-color': color }"></span>
      {{ label }}
    </span>
  `,
  styleUrl: './sport-chip.component.scss',
})
export class SportChipComponent {
  @Input() label = '';
  @Input() active = false;
  @Input() color = '#888888';
}
