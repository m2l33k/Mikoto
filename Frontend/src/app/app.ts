import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Overlays } from './ui/overlays';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Overlays],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
