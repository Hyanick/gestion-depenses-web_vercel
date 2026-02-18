import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { UiDialogService } from '../../core/ui/ui-dialog.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  imports: [MatIconModule, MatButtonModule, RouterLink, MatDialogModule],
})
export class HomeComponent {
  private readonly uiDialog = inject(UiDialogService);
  constructor() { }
  openAdd() {
    this.uiDialog.openTransactionSheet({ mode: 'add', defaultType: 'expense' })
      .subscribe((res) => {
        if (!res || res.action !== 'create') return;
        console.log('NEW TX FROM HOME', res.payload);
        // plus tard: store / API
      });
  }

}
