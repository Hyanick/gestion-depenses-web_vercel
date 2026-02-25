import { BudgetLine } from './budget.models';

export class SetCurrentMonth {
    static readonly type = '[Budget] Set Current Month';
    constructor(public monthKey: string) { }
}

export class LoadMonthBudget {
    static readonly type = '[Budget] Load Month';
    constructor(public monthKey: string) { }
}

export class PatchLineLocal {
    static readonly type = '[Budget] Patch Line Local';
    constructor(public id: string, public patch: Partial<BudgetLine>) { }
}

export class FlushMonth {
    static readonly type = '[Budget] Flush Month';
    constructor(public monthKey: string) { }
}

export class DuplicateFromPrevious {
    static readonly type = '[Budget] Duplicate From Previous';
    constructor(public fromKey: string, public toKey: string) { }
}

export class ResetFromTemplate {
    static readonly type = '[Budget] Reset From Template';
    constructor(public monthKey: string) { }
}

export class AddLineLocal {
    static readonly type = '[Budget] Add Line Local';
    constructor(public line: BudgetLine) { }
}
export class DeleteLineLocal {
    static readonly type = '[Budget] Delete Line Local';
    constructor(public id: string) { }
}
export class GlobalReinit {
    static readonly type = '[app] Global Reinitialisation Action'
}