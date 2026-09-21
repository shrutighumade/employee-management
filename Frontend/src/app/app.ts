import { Component, ChangeDetectionStrategy } from '@angular/core';
import { LayoutComponent } from './core/components/layout/layout';

@Component({
  selector: 'app-root',
  imports: [LayoutComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {}
