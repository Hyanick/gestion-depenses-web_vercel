import { Component, inject } from '@angular/core';
import { MatButton } from "@angular/material/button";
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
  imports: [RouterModule, MatIconModule, MatButton]
})
export class ShellComponent {
  private readonly authService = inject(AuthService);

  logout() {
    this.authService.logout();
  }

}
