import { Injectable } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { AddTransactionDialogComponent, TxDialogData, TxDialogResult } from '../../shared/dialogs/add-transaction-dialog/add-transaction-dialog.component';
import { ConfirmSheetComponent, ConfirmSheetData } from '../../shared/dialogs/confirm-sheet/confirm-sheet.component';

@Injectable({ providedIn: 'root' })
export class UiDialogService {
    constructor(private dialog: MatDialog, private bo: BreakpointObserver) { }

    /**
     * Ouvre la sheet transaction :
     * - Mobile (<= 720px) : bottom sheet (92vh)
     * - Desktop : panel à droite (420px)
     */
    openTransactionSheet(data: TxDialogData): Observable<TxDialogResult | undefined> {
        const isMobile = this.bo.isMatched('(max-width: 720px)');

        const ref = this.dialog.open<AddTransactionDialogComponent, TxDialogData, TxDialogResult>(
            AddTransactionDialogComponent,
            {
                panelClass: 'sheet-dialog',
                hasBackdrop: true,

                width: isMobile ? '100vw' : '420px',
                height: isMobile ? '92vh' : '100vh',
                maxWidth: isMobile ? '100vw' : '420px',

                position: isMobile ? { bottom: '0', left: '0' } : { top: '0', right: '0' },

                autoFocus: false, // évite scroll jump sur mobile
                restoreFocus: false,

                data,
            }
        );

        return ref.afterClosed();
    }

    // (Bonus) helper confirm simple (tu peux l’utiliser plus tard)
    confirm(message: string): boolean {
        return confirm(message);
    }

    openConfirmSheet(data: ConfirmSheetData) {
        const isMobile = this.bo.isMatched('(max-width: 720px)');

        const ref = this.dialog.open(ConfirmSheetComponent, {
            panelClass: 'sheet-dialog',
            hasBackdrop: true,

            width: isMobile ? '100vw' : '420px',
            height: isMobile ? '92vh' : '100vh',
            maxWidth: isMobile ? '100vw' : '420px',
            position: isMobile ? { bottom: '0', left: '0' } : { top: '0', right: '0' },

            autoFocus: false,
            restoreFocus: false,
            data
        });

        return ref.afterClosed(); // -> { confirmed: boolean }
    }

}
