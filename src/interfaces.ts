/**
 * TypeScript interfaces for Reedline data structures
 * Ported from Rust structs and traits
 */

import { UndoBehavior, Signal } from './types';

// ============================================================================
// Core Editor Interfaces
// ============================================================================

/**
 * In memory representation of the entered line(s) including a cursor position
 * to facilitate cursor based editing.
 * 
 * Ported from `LineBuffer` struct in `core_editor/line_buffer.rs`
 */
export interface LineBuffer {
  /** The text content of the buffer */
  lines: string;
  /** Current cursor position (insertion point) */
  insertionPoint: number;
}

/**
 * Generic edit stack for undo/redo functionality
 * 
 * Ported from `EditStack<T>` struct in `core_editor/edit_stack.rs`
 */
export interface EditStack<T> {
  /** Internal list of states */
  internalList: T[];
  /** Current index in the stack */
  index: number;
}

/**
 * Stateful editor executing changes to the underlying LineBuffer
 * 
 * Ported from `Editor` struct in `core_editor/editor.rs`
 */
export interface Editor {
  /** The current line buffer */
  lineBuffer: LineBuffer;
  /** Local clipboard for cut/copy operations */
  cutBuffer: Clipboard;
  /** System clipboard (optional) */
  systemClipboard?: Clipboard;
  /** Undo/redo stack */
  editStack: EditStack<LineBuffer>;
  /** Last undo behavior */
  lastUndoBehavior: UndoBehavior;
  /** Selection anchor for text selection */
  selectionAnchor?: number;
}

// ============================================================================
// Clipboard Interfaces
// ============================================================================

/**
 * Determines how the content in the clipboard should be inserted
 * 
 * Ported from `ClipboardMode` enum in `core_editor/clip_buffer.rs`
 */
export enum ClipboardMode {
  /** As direct content at the current cursor position */
  Normal = 'Normal',
  /** As new lines below or above */
  Lines = 'Lines',
}

/**
 * Interface for clipboard operations
 * 
 * Ported from `Clipboard` trait in `core_editor/clip_buffer.rs`
 */
export interface Clipboard {
  /** Set content in the clipboard */
  set(content: string, mode: ClipboardMode): void;
  /** Get content from the clipboard */
  get(): [string, ClipboardMode];
  /** Clear the clipboard */
  clear(): void;
  /** Get the length of clipboard content */
  length(): number;
}

/**
 * Simple buffer that provides a clipboard only usable within the application
 * 
 * Ported from `LocalClipboard` struct in `core_editor/clip_buffer.rs`
 */
export interface LocalClipboard {
  /** The clipboard content */
  content: string;
  /** The clipboard mode */
  mode: ClipboardMode;
}

/**
 * System clipboard wrapper
 * 
 * Ported from `SystemClipboard` struct in `core_editor/clip_buffer.rs`
 */
export interface SystemClipboard {
  /** Local copy of clipboard content */
  localCopy: string;
  /** The clipboard mode */
  mode: ClipboardMode;
}

// ============================================================================
// History Interfaces
// ============================================================================

/**
 * Unique identifier for a history item
 * 
 * Ported from `HistoryItemId` type alias
 */
export type HistoryItemId = number;

/**
 * Unique identifier for a history session
 * 
 * Ported from `HistorySessionId` type alias
 */
export type HistorySessionId = number;

/**
 * Represents a single history entry
 * 
 * Ported from `HistoryItem` struct
 */
export interface HistoryItem {
  /** Unique identifier */
  id?: HistoryItemId;
  /** The command line text */
  commandLine: string;
  /** Session identifier */
  session: HistorySessionId;
  /** Timestamp when the command was executed */
  startTimestamp: Date;
  /** Timestamp when the command finished */
  endTimestamp?: Date;
  /** Exit status of the command */
  exitStatus?: number;
  /** Working directory when command was executed */
  cwd?: string;
  /** Hostname where command was executed */
  hostname?: string;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Browsing modes for history navigation
 * 
 * Ported from `HistoryNavigationQuery` enum in `history/base.rs`
 */
export type HistoryNavigationQuery = 
  | { type: 'Normal'; lineBuffer: LineBuffer }
  | { type: 'PrefixSearch'; prefix: string }
  | { type: 'SubstringSearch'; substring: string };

/**
 * Ways to search for a particular command line in the history
 * 
 * Ported from `CommandLineSearch` enum in `history/base.rs`
 */
export type CommandLineSearch = 
  | { type: 'Prefix'; prefix: string }
  | { type: 'Substring'; substring: string }
  | { type: 'Exact'; exact: string };

/**
 * Direction to traverse the history
 * 
 * Ported from `SearchDirection` enum in `history/base.rs`
 */
export enum SearchDirection {
  /** From the most recent entry backward */
  Backward = 'Backward',
  /** From the least recent entry forward */
  Forward = 'Forward',
}

/**
 * Additional filters for querying the history
 * 
 * Ported from `SearchFilter` struct in `history/base.rs`
 */
export interface SearchFilter {
  /** Query for the command line content */
  commandLine?: CommandLineSearch;
  /** Skip the currently shown value in up-arrow navigation */
  notCommandLine?: string;
  /** Filter based on the executing system's hostname */
  hostname?: string;
  /** Exact filter for the working directory */
  cwdExact?: string;
  /** Prefix filter for the working directory */
  cwdPrefix?: string;
  /** Filter whether the command completed successfully */
  exitSuccessful?: boolean;
  /** Filter on the session id */
  session?: HistorySessionId;
}

/**
 * Query for search in the potentially rich history
 * 
 * Ported from `SearchQuery` struct in `history/base.rs`
 */
export interface SearchQuery {
  /** Direction to search in */
  direction: SearchDirection;
  /** If given, only get results after/before this time (depending on direction) */
  startTime?: Date;
  /** If given, only get results after/before this time (depending on direction) */
  endTime?: Date;
  /** If given, only get results after/before this id (depending on direction) */
  startId?: HistoryItemId;
  /** If given, only get results after/before this id (depending on direction) */
  endId?: HistoryItemId;
  /** How many results to get */
  limit?: number;
  /** Additional filters */
  filter: SearchFilter;
}

/**
 * Interface for history storage and retrieval
 * 
 * Ported from `History` trait in `history/base.rs`
 */
export interface History {
  /** Save a history item to the database */
  save(item: HistoryItem): Promise<HistoryItem>;
  /** Load a history item by its id */
  load(id: HistoryItemId): Promise<HistoryItem>;
  /** Count the results of a query */
  count(query: SearchQuery): Promise<number>;
  /** Return the total number of history items */
  countAll(): Promise<number>;
  /** Return the results of a query */
  search(query: SearchQuery): Promise<HistoryItem[]>;
  /** Update an item atomically */
  update(id: HistoryItemId, updater: (item: HistoryItem) => HistoryItem): Promise<void>;
  /** Clear all history */
  clear(): Promise<void>;
  /** Remove an item from this history */
  delete(id: HistoryItemId): Promise<void>;
  /** Ensure that this history is written to disk */
  sync(): Promise<void>;
  /** Get the history session id */
  session(): HistorySessionId | undefined;
}

/**
 * Stateful navigation via HistoryNavigationQuery
 * 
 * Ported from `HistoryCursor` struct in `history/cursor.rs`
 */
export interface HistoryCursor {
  /** The current navigation query */
  query: HistoryNavigationQuery;
  /** Current history item */
  current?: HistoryItem;
  /** Whether to skip duplicate entries */
  skipDupes: boolean;
  /** Session identifier */
  session?: HistorySessionId;
}

// ============================================================================
// Completion Interfaces
// ============================================================================

/**
 * A span of source code, with positions in bytes
 * 
 * Ported from `Span` struct in `completion/base.rs`
 */
export interface Span {
  /** The starting position of the span, in bytes */
  start: number;
  /** The ending position of the span, in bytes */
  end: number;
}

/**
 * Suggestion returned by the Completer
 * 
 * Ported from `Suggestion` struct in `completion/base.rs`
 */
export interface Suggestion {
  /** String replacement that will be introduced to the buffer */
  value: string;
  /** Optional description for the replacement */
  description?: string;
  /** Optional style for the replacement */
  style?: Style;
  /** Optional vector of strings in the suggestion */
  extra?: string[];
  /** Replacement span in the buffer */
  span: Span;
  /** Whether to append a space after selecting this suggestion */
  appendWhitespace: boolean;
}

/**
 * Interface for completion functionality
 * 
 * Ported from `Completer` trait in `completion/base.rs`
 */
export interface Completer {
  /** Convert text and position to a list of potential completions */
  complete(line: string, pos: number): Suggestion[];
  /** Same as complete but returns base ranges as well */
  completeWithBaseRanges(line: string, pos: number): [Suggestion[], Range<number>[]];
  /** Return a partial section of available completions */
  partialComplete(line: string, pos: number, start: number, offset: number): Suggestion[];
  /** Number of available completions */
  totalCompletions(line: string, pos: number): number;
}

// ============================================================================
// Menu Interfaces
// ============================================================================

/**
 * Index result obtained from parsing a string with an index marker
 * 
 * Ported from `ParseResult` struct in `menu/menu_functions.rs`
 */
export interface ParseResult {
  /** Text before the marker */
  remainder: string;
  /** Parsed value from the marker */
  index?: number;
  /** Marker representation as string */
  marker?: string;
  /** Direction of the search based on the marker */
  action: ParseAction;
  /** Prefix to search for */
  prefix?: string;
}

/**
 * Direction of the index found in the string
 * 
 * Ported from `ParseAction` enum in `menu/menu_functions.rs`
 */
export enum ParseAction {
  /** Forward index search */
  ForwardSearch = 'ForwardSearch',
  /** Backward index search */
  BackwardSearch = 'BackwardSearch',
  /** Last token */
  LastToken = 'LastToken',
  /** Last executed command */
  LastCommand = 'LastCommand',
  /** Backward search for a prefix */
  BackwardPrefixSearch = 'BackwardPrefixSearch',
}

// ============================================================================
// Painting & Styling Interfaces
// ============================================================================

/**
 * ANSI style for text formatting
 * 
 * Ported from `nu_ansi_term::Style`
 */
export interface Style {
  /** Foreground color */
  foreground?: Color;
  /** Background color */
  background?: Color;
  /** Whether text is bold */
  bold?: boolean;
  /** Whether text is italic */
  italic?: boolean;
  /** Whether text is underlined */
  underline?: boolean;
  /** Whether text is dimmed */
  dimmed?: boolean;
  /** Whether text is reversed */
  reverse?: boolean;
  /** Whether text is hidden */
  hidden?: boolean;
  /** Whether text is strikethrough */
  strikethrough?: boolean;
}

/**
 * ANSI color representation
 * 
 * Ported from `nu_ansi_term::Color`
 */
export type Color = 
  | { type: 'Black' }
  | { type: 'Red' }
  | { type: 'Green' }
  | { type: 'Yellow' }
  | { type: 'Blue' }
  | { type: 'Purple' }
  | { type: 'Cyan' }
  | { type: 'White' }
  | { type: 'BrightBlack' }
  | { type: 'BrightRed' }
  | { type: 'BrightGreen' }
  | { type: 'BrightYellow' }
  | { type: 'BrightBlue' }
  | { type: 'BrightPurple' }
  | { type: 'BrightCyan' }
  | { type: 'BrightWhite' }
  | { type: 'Fixed'; color: number }
  | { type: 'Rgb'; r: number; g: number; b: number };

/**
 * A representation of a buffer with styling, used for syntax highlighting
 * 
 * Ported from `StyledText` struct in `painting/styled_text.rs`
 */
export interface StyledText {
  /** The component, styled parts of the text */
  buffer: [Style, string][];
}

// ============================================================================
// Prompt Interfaces
// ============================================================================

/**
 * Interface for prompt rendering
 * 
 * Ported from `Prompt` trait
 */
export interface Prompt {
  /** Render the main prompt */
  renderPrompt(): string;
  /** Render the multiline continuation prompt */
  renderPromptMultilineIndicator(): string;
  /** Get the color for multiline prompt */
  getPromptMultilineColor(): Color;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Range type for TypeScript
 */
export interface Range<T> {
  start: T;
  end: T;
}

/**
 * Result type for operations that can fail
 */
export type Result<T, E = Error> = T | E;

/**
 * Configuration options for Reedline
 */
export interface ReedlineConfig {
  /** Whether to enable system clipboard */
  systemClipboard?: boolean;
  /** History configuration */
  history?: {
    /** Maximum number of history entries */
    maxSize?: number;
    /** Whether to ignore duplicates */
    ignoreDuplicates?: boolean;
    /** History file path */
    filePath?: string;
  };
  /** Completion configuration */
  completion?: {
    /** Whether to enable completion */
    enabled?: boolean;
    /** Maximum number of suggestions */
    maxSuggestions?: number;
  };
  /** Menu configuration */
  menu?: {
    /** Menu type to use */
    type?: 'columnar' | 'ide' | 'list';
    /** Maximum menu height */
    maxHeight?: number;
  };
  /** Styling configuration */
  styling?: {
    /** Whether to use ANSI colors */
    useAnsiColors?: boolean;
    /** Default text style */
    defaultStyle?: Style;
  };
}

// ============================================================================
// Event Interfaces
// ============================================================================

/**
 * Event that can be sent to Reedline
 * 
 * Ported from `ReedlineEvent` enum
 */
export type ReedlineEvent = 
  | { type: 'KeyPress'; key: string; modifiers?: string[] }
  | { type: 'Mouse'; event: MouseEvent }
  | { type: 'Paste'; content: string }
  | { type: 'Resize'; width: number; height: number }
  | { type: 'Signal'; signal: Signal };

/**
 * Mouse event for terminal input
 */
export interface MouseEvent {
  /** Mouse button */
  button: number;
  /** X coordinate */
  x: number;
  /** Y coordinate */
  y: number;
  /** Whether control is pressed */
  ctrl: boolean;
  /** Whether shift is pressed */
  shift: boolean;
  /** Whether alt is pressed */
  alt: boolean;
}

// ============================================================================
// Highlighter Interfaces
// ============================================================================

/**
 * Interface for syntax highlighting
 * 
 * Ported from highlighter traits
 */
export interface Highlighter {
  /** Highlight the given text */
  highlight(line: string, insertionPoint: number): StyledText;
}

// ============================================================================
// Hinter Interfaces
// ============================================================================

/**
 * Interface for history hints
 * 
 * Ported from hinter traits
 */
export interface Hinter {
  /** Get hint for the given text */
  hint(line: string, insertionPoint: number): string | undefined;
}

// ============================================================================
// Validator Interfaces
// ============================================================================

/**
 * Interface for input validation
 * 
 * Ported from validator traits
 */
export interface Validator {
  /** Validate the given input */
  validate(line: string): ValidationResult;
}

/**
 * Result of validation
 */
export interface ValidationResult {
  /** Whether the input is valid */
  isValid: boolean;
  /** Error message if invalid */
  error?: string;
  /** Warning message */
  warning?: string;
} 