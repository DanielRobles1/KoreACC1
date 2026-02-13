import { Component, OnInit } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { WsService } from './services/ws.service';
import { routeAnimations } from './shared/route-animations';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule],
  animations: [routeAnimations],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'KoreAcc';
  constructor(

    private auth: AuthService,
    private ws: WsService
  ) { }

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.ws.connect();
    }
  }

  prepareRoute(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.['animation'] ?? 'default';
  }
}