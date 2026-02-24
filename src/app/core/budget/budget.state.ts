import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { BudgetLine, MonthBudget } from './budget.models';
import { BudgetService } from './budget.service';
import { catchError, tap, throwError } from 'rxjs';
import { LoadMonthBudget, PatchLineLocal, SetCurrentMonth, FlushMonth, DuplicateFromPrevious, ResetFromTemplate, AddLineLocal, DeleteLineLocal } from './budget.actions';

export interface BudgetMonthCache {
    monthKey: string;
    createdFrom: 'template' | 'duplicate' | 'manual';
    lines: BudgetLine[];
    loading: boolean;
    error: string | null;
    dirty: boolean;
    saving: boolean;
}

export interface BudgetStateModel {
    currentMonthKey: string | null;
    months: Record<string, BudgetMonthCache>;
}

@State<BudgetStateModel>({
    name: 'budget',
    defaults: { currentMonthKey: null, months: {} },
})
@Injectable()
export class BudgetState {
    constructor(private api: BudgetService) { }

    private ensureMonth(s: BudgetStateModel, monthKey: string): BudgetMonthCache {
        return (
            s?.months[monthKey] ?? {
                monthKey,
                createdFrom: 'template',
                lines: [],
                loading: false,
                error: null,
                dirty: false,
            }
        );
    }

    @Selector()
    static currentMonth(s: BudgetStateModel): BudgetMonthCache | null {
        const k = s.currentMonthKey;
        return k ? s.months[k] ?? null : null;
    }

    @Selector() static lines(s: BudgetStateModel) { return BudgetState.currentMonth(s)?.lines ?? []; }
    @Selector() static loading(s: BudgetStateModel) { return BudgetState.currentMonth(s)?.loading ?? false; }
    @Selector() static error(s: BudgetStateModel) { return BudgetState.currentMonth(s)?.error ?? null; }
    @Selector() static createdFrom(s: BudgetStateModel) { return BudgetState.currentMonth(s)?.createdFrom ?? 'template'; }
    @Selector() static dirty(s: BudgetStateModel) { return BudgetState.currentMonth(s)?.dirty ?? false; }
    @Selector() static currentMonthKey(s: BudgetStateModel) { return s.currentMonthKey; }
    @Selector()
    static saving(s: BudgetStateModel) {
        return BudgetState.currentMonth(s)?.saving ?? false;
    }

    @Action(SetCurrentMonth)
    setCurrent(ctx: StateContext<BudgetStateModel>, { monthKey }: SetCurrentMonth) {
        const s = ctx.getState();
        const m = this.ensureMonth(s, monthKey);
        ctx.patchState({
            currentMonthKey: monthKey,
            months: { ...s.months, [monthKey]: m },
        });
    }

    @Action(LoadMonthBudget)
    load(ctx: StateContext<BudgetStateModel>, { monthKey }: LoadMonthBudget) {
        ctx.dispatch(new SetCurrentMonth(monthKey));

        const s0 = ctx.getState();
        const cached = this.ensureMonth(s0, monthKey);

        // ✅ si on a déjà des lignes en cache, on ne refetch pas (comportement zip)
       // if (cached.lines.length > 0) return;

        ctx.patchState({
            months: {
                ...s0.months,
                [monthKey]: { ...cached, loading: true, error: null },
            },
        });

        return this.api.getMonth(monthKey).pipe(
            tap((m: MonthBudget) => {
                const s = ctx.getState();
                ctx.patchState({
                    months: {
                        ...s.months,
                        [monthKey]: {
                            monthKey,
                            createdFrom: m.createdFrom,
                            lines: m.lines,
                            loading: false,
                            error: null,
                            dirty: false,
                            saving: false,
                        },
                    },
                });
            }),
            catchError((err) => {
                if (err?.status === 404) {
                    return this.api.seedFromTemplate(monthKey).pipe(
                        tap((m: MonthBudget) => {
                            const s = ctx.getState();
                            ctx.patchState({
                                months: {
                                    ...s.months,
                                    [monthKey]: {
                                        monthKey,
                                        createdFrom: m.createdFrom,
                                        lines: m.lines,
                                        loading: false,
                                        error: null,
                                        dirty: false,
                                        saving: false
                                    },
                                },
                            });
                        }),
                    );
                }

                const s = ctx.getState();
                const cur = this.ensureMonth(s, monthKey);
                ctx.patchState({
                    months: {
                        ...s.months,
                        [monthKey]: { ...cur, loading: false, error: 'Impossible de charger le budget.' },
                    },
                });
                return throwError(() => err);
            }),
        );
    }

    @Action(PatchLineLocal)
    patchLocal(ctx: StateContext<BudgetStateModel>, { id, patch }: PatchLineLocal) {
        const s = ctx.getState();
        const k = s.currentMonthKey;
        if (!k) return;
        const m = this.ensureMonth(s, k);

        ctx.patchState({
            months: {
                ...s.months,
                [k]: {
                    ...m,
                    lines: m.lines.map((l) => (l.id === id ? { ...l, ...patch } : l)),
                    dirty: true,
                },
            },
        });
    }

    // ✅ batch flush (debounce / navigation / unload)
    @Action(FlushMonth)
    flush(ctx: StateContext<BudgetStateModel>, { monthKey }: FlushMonth) {
        const s = ctx.getState();
        const m = this.ensureMonth(s, monthKey);
        if (!m.dirty) return;

        // ✅ ne pas mettre loading=true (sinon flicker)
        ctx.patchState({
            months: {
                ...(s.months ?? {}),
                [monthKey]: { ...m, saving: true, error: null },
            },
        });

        return this.api.replaceMonth(monthKey, { lines: m.lines, createdFrom: 'manual' }).pipe(
            tap((saved) => {
                const s2 = ctx.getState();
                const mm = this.ensureMonth(s2, monthKey);

                ctx.patchState({
                    months: {
                        ...(s2.months ?? {}),
                        [monthKey]: {
                            ...mm,
                            createdFrom: saved.createdFrom,
                            // ✅ on garde les lines locales pour éviter tout jump
                            saving: false,
                            dirty: false,
                            error: null,
                        },
                    },
                });
            }),
            catchError((err) => {
                const s2 = ctx.getState();
                const mm = this.ensureMonth(s2, monthKey);

                ctx.patchState({
                    months: {
                        ...(s2.months ?? {}),
                        [monthKey]: {
                            ...mm,
                            saving: false,
                            error: 'Sauvegarde impossible.',
                        },
                    },
                });
                return throwError(() => err);
            }),
        );
    }


    @Action(DuplicateFromPrevious)
    duplicate(ctx: StateContext<BudgetStateModel>, { fromKey, toKey }: DuplicateFromPrevious) {
        ctx.dispatch(new SetCurrentMonth(toKey));

        const s0 = ctx.getState();
        const target = this.ensureMonth(s0, toKey);

        ctx.patchState({
            months: { ...s0.months, [toKey]: { ...target, loading: true, error: null } },
        });

        return this.api.duplicate(fromKey, toKey).pipe(
            tap((m) => {
                const s = ctx.getState();
                ctx.patchState({
                    months: {
                        ...s.months,
                        [toKey]: {
                            monthKey: toKey,
                            createdFrom: m.createdFrom,
                            lines: m.lines,
                            loading: false,
                            error: null,
                            dirty: false,
                            saving: false
                        },
                    },
                });
            }),
        );
    }

    @Action(ResetFromTemplate)
    reset(ctx: StateContext<BudgetStateModel>, { monthKey }: ResetFromTemplate) {
        const s0 = ctx.getState();
        const cur = this.ensureMonth(s0, monthKey);

        ctx.patchState({
            months: { ...s0.months, [monthKey]: { ...cur, loading: true, error: null } },
        });

        return this.api.resetFromTemplate(monthKey).pipe(
            tap((m) => {
                const s = ctx.getState();
                ctx.patchState({
                    months: {
                        ...s.months,
                        [monthKey]: {
                            monthKey,
                            createdFrom: m.createdFrom,
                            lines: m.lines,
                            loading: false,
                            error: null,
                            dirty: false,
                            saving: false
                        },
                    },
                });
            }),
        );
    }
    @Action(AddLineLocal)
    addLineLocal(ctx: StateContext<BudgetStateModel>, { line }: AddLineLocal) {
        const s = ctx.getState();
        const k = s.currentMonthKey;
        if (!k) return;

        const m = this.ensureMonth(s, k);
        ctx.patchState({
            months: {
                ...(s.months ?? {}),
                [k]: {
                    ...m,
                    lines:
                        line.type === 'income'
                            ? [line, ...m.lines]     // revenus en haut
                            : [...m.lines, line],    // dépenses en bas
                    dirty: true,
                },
            },
        });
    }
    @Action(DeleteLineLocal)
deleteLineLocal(ctx: StateContext<BudgetStateModel>, { id }: DeleteLineLocal) {
  const s = ctx.getState();
  const k = s.currentMonthKey;
  if (!k) return;

  const m = this.ensureMonth(s, k);
  ctx.patchState({
    months: {
      ...(s.months ?? {}),
      [k]: {
        ...m,
        lines: m.lines.filter(l => l.id !== id),
        dirty: true,
      },
    },
  });
}
}
