/**
 * Core types and enums for the reedline TypeScript port
 * Ported from reedline/src/enums.rs
 */

/**
 * Valid ways how `Reedline::read_line()` can return
 */
export type Signal = 
  | { type: 'Success'; content: string }
  | { type: 'CtrlC' }
  | { type: 'CtrlD' };

/**
 * Helper functions for creating Signal instances
 */
export const Signal = {
  Success: (content: string): Signal => ({ type: 'Success', content }),
  CtrlC: (): Signal => ({ type: 'CtrlC' }),
  CtrlD: (): Signal => ({ type: 'CtrlD' }),
} as const;

/**
 * Cursor movement commands
 */
export type EditType = 
  | { type: 'MoveCursor'; select: boolean }
  | { type: 'UndoRedo' }
  | { type: 'EditText' }
  | { type: 'NoOp' };

/**
 * Undo behavior tracking
 */
export type UndoBehavior = 
  | { type: 'InsertCharacter'; character: string }
  | { type: 'Backspace'; character?: string }
  | { type: 'Delete'; character?: string }
  | { type: 'MoveCursor' }
  | { type: 'HistoryNavigation' }
  | { type: 'CreateUndoPoint' }
  | { type: 'UndoRedo' };

/**
 * Editing actions which can be mapped to key bindings.
 * Executed by `Reedline::run_edit_commands()`
 */
export type EditCommand = 
  // Movement commands
  | { type: 'MoveToStart'; select: boolean }
  | { type: 'MoveToLineStart'; select: boolean }
  | { type: 'MoveToEnd'; select: boolean }
  | { type: 'MoveToLineEnd'; select: boolean }
  | { type: 'MoveLeft'; select: boolean }
  | { type: 'MoveRight'; select: boolean }
  | { type: 'MoveWordLeft'; select: boolean }
  | { type: 'MoveBigWordLeft'; select: boolean }
  | { type: 'MoveWordRight'; select: boolean }
  | { type: 'MoveWordRightStart'; select: boolean }
  | { type: 'MoveBigWordRightStart'; select: boolean }
  | { type: 'MoveWordRightEnd'; select: boolean }
  | { type: 'MoveBigWordRightEnd'; select: boolean }
  | { type: 'MoveToPosition'; position: number; select: boolean }
  
  // Insertion commands
  | { type: 'InsertChar'; character: string }
  | { type: 'InsertString'; string: string }
  | { type: 'InsertNewline' }
  | { type: 'ReplaceChar'; character: string }
  | { type: 'ReplaceChars'; count: number; string: string }
  
  // Deletion commands
  | { type: 'Backspace' }
  | { type: 'Delete' }
  | { type: 'CutChar' }
  | { type: 'BackspaceWord' }
  | { type: 'DeleteWord' }
  | { type: 'Clear' }
  | { type: 'ClearToLineEnd' }
  
  // Completion
  | { type: 'Complete' }
  
  // Cut commands
  | { type: 'CutCurrentLine' }
  | { type: 'CutFromStart' }
  | { type: 'CutFromLineStart' }
  | { type: 'CutToEnd' }
  | { type: 'CutToLineEnd' }
  | { type: 'KillLine' }
  | { type: 'CutWordLeft' }
  | { type: 'CutBigWordLeft' }
  | { type: 'CutWordRight' }
  | { type: 'CutBigWordRight' }
  | { type: 'CutWordRightToNext' }
  | { type: 'CutBigWordRightToNext' }
  
  // Paste commands
  | { type: 'PasteCutBufferBefore' }
  | { type: 'PasteCutBufferAfter' }
  
  // Case manipulation
  | { type: 'UppercaseWord' }
  | { type: 'LowercaseWord' }
  | { type: 'CapitalizeChar' }
  | { type: 'SwitchcaseChar' }
  
  // Swap commands
  | { type: 'SwapWords' }
  | { type: 'SwapGraphemes' }
  
  // Undo/Redo
  | { type: 'Undo' }
  | { type: 'Redo' }
  
  // Cut until/before commands
  | { type: 'CutRightUntil'; character: string }
  | { type: 'CutRightBefore'; character: string }
  | { type: 'CutLeftUntil'; character: string }
  | { type: 'CutLeftBefore'; character: string }
  
  // Move until/before commands
  | { type: 'MoveRightUntil'; character: string; select: boolean }
  | { type: 'MoveRightBefore'; character: string; select: boolean }
  | { type: 'MoveLeftUntil'; character: string; select: boolean }
  | { type: 'MoveLeftBefore'; character: string; select: boolean }
  
  // Selection commands
  | { type: 'SelectAll' }
  | { type: 'CutSelection' }
  | { type: 'CopySelection' }
  | { type: 'Paste' }
  
  // Copy commands
  | { type: 'CopyFromStart' }
  | { type: 'CopyFromLineStart' }
  | { type: 'CopyToEnd' }
  | { type: 'CopyToLineEnd' }
  | { type: 'CopyCurrentLine' }
  | { type: 'CopyWordLeft' }
  | { type: 'CopyBigWordLeft' }
  | { type: 'CopyWordRight' }
  | { type: 'CopyBigWordRight' }
  | { type: 'CopyWordRightToNext' }
  | { type: 'CopyBigWordRightToNext' }
  | { type: 'CopyLeft' }
  | { type: 'CopyRight' }
  | { type: 'CopyRightUntil'; character: string }
  | { type: 'CopyRightBefore'; character: string }
  | { type: 'CopyLeftUntil'; character: string }
  | { type: 'CopyLeftBefore'; character: string }
  
  // Cursor/Anchor
  | { type: 'SwapCursorAndAnchor' }
  
  // System clipboard (optional feature)
  | { type: 'CutSelectionSystem' }
  | { type: 'CopySelectionSystem' }
  | { type: 'PasteSystem' }
  
  // Cut/Copy inside matching characters
  | { type: 'CutInside'; left: string; right: string }
  | { type: 'YankInside'; left: string; right: string };

/**
 * Reedline events that can be triggered by user input or system events
 */
export type ReedlineEvent = 
  | { type: 'None' }
  | { type: 'HistoryHintComplete' }
  | { type: 'HistoryHintWordComplete' }
  | { type: 'CtrlD' }
  | { type: 'CtrlC' }
  | { type: 'ClearScreen' }
  | { type: 'ClearScrollback' }
  | { type: 'Enter' }
  | { type: 'Submit' }
  | { type: 'SubmitOrNewline' }
  | { type: 'Esc' }
  | { type: 'Mouse' }
  | { type: 'Resize'; width: number; height: number }
  | { type: 'Edit'; commands: EditCommand[] }
  | { type: 'Repaint' }
  | { type: 'PreviousHistory' }
  | { type: 'Up' }
  | { type: 'Down' }
  | { type: 'Right' }
  | { type: 'Left' }
  | { type: 'NextHistory' }
  | { type: 'SearchHistory' }
  | { type: 'Multiple'; events: ReedlineEvent[] }
  | { type: 'UntilFound'; events: ReedlineEvent[] }
  | { type: 'Menu'; name: string }
  | { type: 'MenuNext' }
  | { type: 'MenuPrevious' }
  | { type: 'MenuUp' }
  | { type: 'MenuDown' }
  | { type: 'MenuLeft' }
  | { type: 'MenuRight' }
  | { type: 'MenuPageNext' }
  | { type: 'MenuPagePrevious' }
  | { type: 'ExecuteHostCommand'; command: string }
  | { type: 'OpenEditor' };

/**
 * Event status for handling events
 */
export type EventStatus = 
  | { type: 'Handled' }
  | { type: 'Inapplicable' }
  | { type: 'Exits'; signal: Signal };

/**
 * Raw event wrapper
 */
export interface ReedlineRawEvent {
  readonly event: unknown; // Will be typed based on the terminal library used
}

/**
 * Helper functions for creating EditCommand instances
 */
export const EditCommand = {
  // Movement commands
  MoveToStart: (select: boolean = false): EditCommand => ({ type: 'MoveToStart', select }),
  MoveToLineStart: (select: boolean = false): EditCommand => ({ type: 'MoveToLineStart', select }),
  MoveToEnd: (select: boolean = false): EditCommand => ({ type: 'MoveToEnd', select }),
  MoveToLineEnd: (select: boolean = false): EditCommand => ({ type: 'MoveToLineEnd', select }),
  MoveLeft: (select: boolean = false): EditCommand => ({ type: 'MoveLeft', select }),
  MoveRight: (select: boolean = false): EditCommand => ({ type: 'MoveRight', select }),
  MoveWordLeft: (select: boolean = false): EditCommand => ({ type: 'MoveWordLeft', select }),
  MoveBigWordLeft: (select: boolean = false): EditCommand => ({ type: 'MoveBigWordLeft', select }),
  MoveWordRight: (select: boolean = false): EditCommand => ({ type: 'MoveWordRight', select }),
  MoveWordRightStart: (select: boolean = false): EditCommand => ({ type: 'MoveWordRightStart', select }),
  MoveBigWordRightStart: (select: boolean = false): EditCommand => ({ type: 'MoveBigWordRightStart', select }),
  MoveWordRightEnd: (select: boolean = false): EditCommand => ({ type: 'MoveWordRightEnd', select }),
  MoveBigWordRightEnd: (select: boolean = false): EditCommand => ({ type: 'MoveBigWordRightEnd', select }),
  MoveToPosition: (position: number, select: boolean = false): EditCommand => ({ type: 'MoveToPosition', position, select }),
  
  // Insertion commands
  InsertChar: (character: string): EditCommand => ({ type: 'InsertChar', character }),
  InsertString: (string: string): EditCommand => ({ type: 'InsertString', string }),
  InsertNewline: (): EditCommand => ({ type: 'InsertNewline' }),
  ReplaceChar: (character: string): EditCommand => ({ type: 'ReplaceChar', character }),
  ReplaceChars: (count: number, string: string): EditCommand => ({ type: 'ReplaceChars', count, string }),
  
  // Deletion commands
  Backspace: (): EditCommand => ({ type: 'Backspace' }),
  Delete: (): EditCommand => ({ type: 'Delete' }),
  CutChar: (): EditCommand => ({ type: 'CutChar' }),
  BackspaceWord: (): EditCommand => ({ type: 'BackspaceWord' }),
  DeleteWord: (): EditCommand => ({ type: 'DeleteWord' }),
  Clear: (): EditCommand => ({ type: 'Clear' }),
  ClearToLineEnd: (): EditCommand => ({ type: 'ClearToLineEnd' }),
  
  // Completion
  Complete: (): EditCommand => ({ type: 'Complete' }),
  
  // Cut commands
  CutCurrentLine: (): EditCommand => ({ type: 'CutCurrentLine' }),
  CutFromStart: (): EditCommand => ({ type: 'CutFromStart' }),
  CutFromLineStart: (): EditCommand => ({ type: 'CutFromLineStart' }),
  CutToEnd: (): EditCommand => ({ type: 'CutToEnd' }),
  CutToLineEnd: (): EditCommand => ({ type: 'CutToLineEnd' }),
  KillLine: (): EditCommand => ({ type: 'KillLine' }),
  CutWordLeft: (): EditCommand => ({ type: 'CutWordLeft' }),
  CutBigWordLeft: (): EditCommand => ({ type: 'CutBigWordLeft' }),
  CutWordRight: (): EditCommand => ({ type: 'CutWordRight' }),
  CutBigWordRight: (): EditCommand => ({ type: 'CutBigWordRight' }),
  CutWordRightToNext: (): EditCommand => ({ type: 'CutWordRightToNext' }),
  CutBigWordRightToNext: (): EditCommand => ({ type: 'CutBigWordRightToNext' }),
  
  // Paste commands
  PasteCutBufferBefore: (): EditCommand => ({ type: 'PasteCutBufferBefore' }),
  PasteCutBufferAfter: (): EditCommand => ({ type: 'PasteCutBufferAfter' }),
  
  // Case manipulation
  UppercaseWord: (): EditCommand => ({ type: 'UppercaseWord' }),
  LowercaseWord: (): EditCommand => ({ type: 'LowercaseWord' }),
  CapitalizeChar: (): EditCommand => ({ type: 'CapitalizeChar' }),
  SwitchcaseChar: (): EditCommand => ({ type: 'SwitchcaseChar' }),
  
  // Swap commands
  SwapWords: (): EditCommand => ({ type: 'SwapWords' }),
  SwapGraphemes: (): EditCommand => ({ type: 'SwapGraphemes' }),
  
  // Undo/Redo
  Undo: (): EditCommand => ({ type: 'Undo' }),
  Redo: (): EditCommand => ({ type: 'Redo' }),
  
  // Cut until/before commands
  CutRightUntil: (character: string): EditCommand => ({ type: 'CutRightUntil', character }),
  CutRightBefore: (character: string): EditCommand => ({ type: 'CutRightBefore', character }),
  CutLeftUntil: (character: string): EditCommand => ({ type: 'CutLeftUntil', character }),
  CutLeftBefore: (character: string): EditCommand => ({ type: 'CutLeftBefore', character }),
  
  // Move until/before commands
  MoveRightUntil: (character: string, select: boolean = false): EditCommand => ({ type: 'MoveRightUntil', character, select }),
  MoveRightBefore: (character: string, select: boolean = false): EditCommand => ({ type: 'MoveRightBefore', character, select }),
  MoveLeftUntil: (character: string, select: boolean = false): EditCommand => ({ type: 'MoveLeftUntil', character, select }),
  MoveLeftBefore: (character: string, select: boolean = false): EditCommand => ({ type: 'MoveLeftBefore', character, select }),
  
  // Selection commands
  SelectAll: (): EditCommand => ({ type: 'SelectAll' }),
  CutSelection: (): EditCommand => ({ type: 'CutSelection' }),
  CopySelection: (): EditCommand => ({ type: 'CopySelection' }),
  Paste: (): EditCommand => ({ type: 'Paste' }),
  
  // Copy commands
  CopyFromStart: (): EditCommand => ({ type: 'CopyFromStart' }),
  CopyFromLineStart: (): EditCommand => ({ type: 'CopyFromLineStart' }),
  CopyToEnd: (): EditCommand => ({ type: 'CopyToEnd' }),
  CopyToLineEnd: (): EditCommand => ({ type: 'CopyToLineEnd' }),
  CopyCurrentLine: (): EditCommand => ({ type: 'CopyCurrentLine' }),
  CopyWordLeft: (): EditCommand => ({ type: 'CopyWordLeft' }),
  CopyBigWordLeft: (): EditCommand => ({ type: 'CopyBigWordLeft' }),
  CopyWordRight: (): EditCommand => ({ type: 'CopyWordRight' }),
  CopyBigWordRight: (): EditCommand => ({ type: 'CopyBigWordRight' }),
  CopyWordRightToNext: (): EditCommand => ({ type: 'CopyWordRightToNext' }),
  CopyBigWordRightToNext: (): EditCommand => ({ type: 'CopyBigWordRightToNext' }),
  CopyLeft: (): EditCommand => ({ type: 'CopyLeft' }),
  CopyRight: (): EditCommand => ({ type: 'CopyRight' }),
  CopyRightUntil: (character: string): EditCommand => ({ type: 'CopyRightUntil', character }),
  CopyRightBefore: (character: string): EditCommand => ({ type: 'CopyRightBefore', character }),
  CopyLeftUntil: (character: string): EditCommand => ({ type: 'CopyLeftUntil', character }),
  CopyLeftBefore: (character: string): EditCommand => ({ type: 'CopyLeftBefore', character }),
  
  // Cursor/Anchor
  SwapCursorAndAnchor: (): EditCommand => ({ type: 'SwapCursorAndAnchor' }),
  
  // System clipboard (optional feature)
  CutSelectionSystem: (): EditCommand => ({ type: 'CutSelectionSystem' }),
  CopySelectionSystem: (): EditCommand => ({ type: 'CopySelectionSystem' }),
  PasteSystem: (): EditCommand => ({ type: 'PasteSystem' }),
  
  // Cut/Copy inside matching characters
  CutInside: (left: string, right: string): EditCommand => ({ type: 'CutInside', left, right }),
  YankInside: (left: string, right: string): EditCommand => ({ type: 'YankInside', left, right }),
} as const;

/**
 * Helper functions for creating ReedlineEvent instances
 */
export const ReedlineEvent = {
  None: (): ReedlineEvent => ({ type: 'None' }),
  HistoryHintComplete: (): ReedlineEvent => ({ type: 'HistoryHintComplete' }),
  HistoryHintWordComplete: (): ReedlineEvent => ({ type: 'HistoryHintWordComplete' }),
  CtrlD: (): ReedlineEvent => ({ type: 'CtrlD' }),
  CtrlC: (): ReedlineEvent => ({ type: 'CtrlC' }),
  ClearScreen: (): ReedlineEvent => ({ type: 'ClearScreen' }),
  ClearScrollback: (): ReedlineEvent => ({ type: 'ClearScrollback' }),
  Enter: (): ReedlineEvent => ({ type: 'Enter' }),
  Submit: (): ReedlineEvent => ({ type: 'Submit' }),
  SubmitOrNewline: (): ReedlineEvent => ({ type: 'SubmitOrNewline' }),
  Esc: (): ReedlineEvent => ({ type: 'Esc' }),
  Mouse: (): ReedlineEvent => ({ type: 'Mouse' }),
  Resize: (width: number, height: number): ReedlineEvent => ({ type: 'Resize', width, height }),
  Edit: (commands: EditCommand[]): ReedlineEvent => ({ type: 'Edit', commands }),
  Repaint: (): ReedlineEvent => ({ type: 'Repaint' }),
  PreviousHistory: (): ReedlineEvent => ({ type: 'PreviousHistory' }),
  Up: (): ReedlineEvent => ({ type: 'Up' }),
  Down: (): ReedlineEvent => ({ type: 'Down' }),
  Right: (): ReedlineEvent => ({ type: 'Right' }),
  Left: (): ReedlineEvent => ({ type: 'Left' }),
  NextHistory: (): ReedlineEvent => ({ type: 'NextHistory' }),
  SearchHistory: (): ReedlineEvent => ({ type: 'SearchHistory' }),
  Multiple: (events: ReedlineEvent[]): ReedlineEvent => ({ type: 'Multiple', events }),
  UntilFound: (events: ReedlineEvent[]): ReedlineEvent => ({ type: 'UntilFound', events }),
  Menu: (name: string): ReedlineEvent => ({ type: 'Menu', name }),
  MenuNext: (): ReedlineEvent => ({ type: 'MenuNext' }),
  MenuPrevious: (): ReedlineEvent => ({ type: 'MenuPrevious' }),
  MenuUp: (): ReedlineEvent => ({ type: 'MenuUp' }),
  MenuDown: (): ReedlineEvent => ({ type: 'MenuDown' }),
  MenuLeft: (): ReedlineEvent => ({ type: 'MenuLeft' }),
  MenuRight: (): ReedlineEvent => ({ type: 'MenuRight' }),
  MenuPageNext: (): ReedlineEvent => ({ type: 'MenuPageNext' }),
  MenuPagePrevious: (): ReedlineEvent => ({ type: 'MenuPagePrevious' }),
  ExecuteHostCommand: (command: string): ReedlineEvent => ({ type: 'ExecuteHostCommand', command }),
  OpenEditor: (): ReedlineEvent => ({ type: 'OpenEditor' }),
} as const;

/**
 * Helper functions for creating EditType instances
 */
export const EditType = {
  MoveCursor: (select: boolean): EditType => ({ type: 'MoveCursor', select }),
  UndoRedo: (): EditType => ({ type: 'UndoRedo' }),
  EditText: (): EditType => ({ type: 'EditText' }),
  NoOp: (): EditType => ({ type: 'NoOp' }),
} as const;

/**
 * Helper functions for creating UndoBehavior instances
 */
export const UndoBehavior = {
  InsertCharacter: (character: string): UndoBehavior => ({ type: 'InsertCharacter', character }),
  Backspace: (character?: string): UndoBehavior => ({ type: 'Backspace', character }),
  Delete: (character?: string): UndoBehavior => ({ type: 'Delete', character }),
  MoveCursor: (): UndoBehavior => ({ type: 'MoveCursor' }),
  HistoryNavigation: (): UndoBehavior => ({ type: 'HistoryNavigation' }),
  CreateUndoPoint: (): UndoBehavior => ({ type: 'CreateUndoPoint' }),
  UndoRedo: (): UndoBehavior => ({ type: 'UndoRedo' }),
} as const;

/**
 * Helper functions for creating EventStatus instances
 */
export const EventStatus = {
  Handled: (): EventStatus => ({ type: 'Handled' }),
  Inapplicable: (): EventStatus => ({ type: 'Inapplicable' }),
  Exits: (signal: Signal): EventStatus => ({ type: 'Exits', signal }),
} as const; 