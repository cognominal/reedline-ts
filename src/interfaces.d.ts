/**
 * @fileoverview TypeScript interfaces for Reedline data structures
 * 
 * This file contains comprehensive TypeScript interfaces that mirror the Rust
 * structs and traits from the original reedline codebase. These interfaces
 * provide type safety and documentation for the TypeScript port.
 * 
 * @module interfaces
 */

import { EditCommand, EditType, UndoBehavior, Signal } from './types';

// ============================================================================
// Core Editor Interfaces
// ============================================================================

/**
 * In memory representation of the entered line(s) including a cursor position
 * to facilitate cursor based editing.
 * 
 * This interface represents the core text buffer that stores the user's input
 * and tracks the current cursor position. It's the foundation for all text
 * editing operations.
 * 
 * @example
 * ```typescript
 * const buffer: LineBuffer = {
 *   lines: "Hello, World!",
 *   insertionPoint: 5
 * };
 * ```
 * 
 * @see {@link https://github.com/nushell/reedline/blob/main/src/core_editor/line_buffer.rs | Rust LineBuffer}
 */
export interface LineBuffer {
  /** The text content of the buffer */
  lines: string;
  /** Current cursor position (insertion point) in characters */
  insertionPoint: number;
}

/**
 * Generic edit stack for undo/redo functionality.
 * 
 * This interface provides a generic stack structure that can store any type
 * of state for undo/redo operations. It maintains an internal list of states
 * and tracks the current position in the stack.
 * 
 * @template T - The type of state to store in the stack
 * 
 * @example
 * ```typescript
 * const stack: EditStack<LineBuffer> = {
 *   internalList: [buffer1, buffer2, buffer3],
 *   index: 1
 * };
 * ```
 * 
 * @see {@link https://github.com/nushell/reedline/blob/main/src/core_editor/edit_stack.rs | Rust EditStack}
 */
export interface EditStack<T> {
  /** Internal list of states for undo/redo */
  internalList: T[];
  /** Current index in the stack */
  index: number;
}

/**
 * Stateful editor executing changes to the underlying LineBuffer.
 * 
 * The Editor interface represents the main editor component that manages
 * the line buffer, clipboard operations, undo/redo functionality, and
 * text selection. It's the central coordinator for all editing operations.
 * 
 * @example
 * ```typescript
 * const editor: Editor = {
 *   lineBuffer: { lines: "Hello", insertionPoint: 3 },
 *   cutBuffer: localClipboard,
 *   editStack: { internalList: [], index: 0 },
 *   lastUndoBehavior: "CreateUndoPoint"
 * };
 * ```
 * 
 * @see {@link https://github.com/nushell/reedline/blob/main/src/core_editor/editor.rs | Rust Editor}
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
 * Determines how the content in the clipboard should be inserted.
 * 
 * This enum controls the behavior when pasting clipboard content,
 * whether it should be inserted as normal text or as separate lines.
 * 
 * @example
 * ```typescript
 * clipboard.set("content", ClipboardMode.Normal);  // Insert as text
 * clipboard.set("line1\nline2", ClipboardMode.Lines);  // Insert as lines
 * ```
 * 
 * @see {@link https://github.com/nushell/reedline/blob/main/src/core_editor/clip_buffer.rs | Rust ClipboardMode}
 */
export enum ClipboardMode {
  /** As direct content at the current cursor position */
  Normal = 'Normal',
  /** As new lines below or above */
  Lines = 'Lines',
}

/**
 * Interface for clipboard operations.
 * 
 * This interface defines the contract for clipboard implementations,
 * whether they're local (in-memory) or system-wide (OS clipboard).
 * 
 * @example
 * ```typescript
 * const clipboard: Clipboard = {
 *   set: (content, mode) => { /* implementation */ },
 *   get: () => ["content", ClipboardMode.Normal],
 *   clear: () => { /* implementation */ },
 *   length: () => 7
 * };
 * ```
 * 
 * @see {@link https://github.com/nushell/reedline/blob/main/src/core_editor/clip_buffer.rs | Rust Clipboard trait}
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
 * Simple buffer that provides a clipboard only usable within the application.
 * 
 * This interface represents an in-memory clipboard that persists only
 * for the duration of the application session.
 * 
 * @example
 * ```typescript
 * const localClipboard: LocalClipboard = {
 *   content: "copied text",
 *   mode: ClipboardMode.Normal
 * };
 * ```
 * 
 * @see {@link https://github.com/nushell/reedline/blob/main/src/core_editor/clip_buffer.rs | Rust LocalClipboard}
 */
export interface LocalClipboard {
  /** The clipboard content */
  content: string;
  /** The clipboard mode */
  mode: ClipboardMode;
}

/**
 * System clipboard wrapper.
 * 
 * This interface represents a wrapper around the system clipboard,
 * with a local copy to track changes and maintain mode information.
 * 
 * @example
 * ```typescript
 * const systemClipboard: SystemClipboard = {
 *   localCopy: "system content",
 *   mode: ClipboardMode.Lines
 * };
 * ```
 * 
 * @see {@link https://github.com/nushell/reedline/blob/main/src/core_editor/clip_buffer.rs | Rust SystemClipboard}
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
 * Unique identifier for a history item.
 * 
 * @example
 * ```typescript
 * const id: HistoryItemId = 123;
 * ```
 */
export type HistoryItemId = number;

/**
 * Unique identifier for a history session.
 * 
 * @example
 * ```typescript
 * const sessionId: HistorySessionId = 456;
 * ```
 */
export type HistorySessionId = number;

/**
 * Represents a single history entry.
 * 
 * This interface defines the structure of a history item, including
 * the command that was executed, timestamps, exit status, and metadata.
 * 
 * @example
 * ```typescript
 * const item: HistoryItem = {
 *   id: 1,
 *   commandLine: "ls -la",
 *   session: 1,
 *   startTimestamp: new Date("2023-01-01"),
 *   endTimestamp: new Date("2023-01-01T00:00:01"),
 *   exitStatus: 0,
 *   cwd: "/home/user",
 *   hostname: "localhost"
 * };
 * ```
 * 
 * @see {@link https://github.com/nushell/reedline/blob/main/src/history/mod.rs | Rust HistoryItem}
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
 * Browsing modes for history navigation.
 * 
 * This union type defines different ways to navigate through history,
 * including normal browsing, prefix search, and substring search.
 * 
 * @example
 * ```typescript
 * // Normal browsing
 * const normalQuery: HistoryNavigationQuery = {
 *   type: "Normal",
 *   lineBuffer: { lines: "", insertionPoint: 0 }
 * };
 * 
 * // Prefix search
 * const prefixQuery: HistoryNavigationQuery = {
 *   type: "PrefixSearch",
 *   prefix: "ls"
 * };
 * ```
 * 
 * @see {@link https://github.com/nushell/reedline/blob/main/src/history/base.rs | Rust HistoryNavigationQuery}
 */
export type HistoryNavigationQuery = 
  | { type: 'Normal'; lineBuffer: LineBuffer }
  | { type: 'PrefixSearch'; prefix: string }
  | { type: 'SubstringSearch'; substring: string };

/**
 * Ways to search for a particular command line in the history.
 * 
 * This union type defines different search strategies for finding
 * commands in the history.
 * 
 * @example
 * ```typescript
 * // Prefix search
 * const prefixSearch: CommandLineSearch = {
 *   type: "Prefix",
 *   prefix: "ls"
 * };
 * 
 * // Exact match
 * const exactSearch: CommandLineSearch = {
 *   type: "Exact",
 *   exact: "ls -la"
 * };
 * ```
 * 
 * @see {@link https://github.com/nushell/reedline/blob/main/src/history/base.rs | Rust CommandLineSearch}
 */
export type CommandLineSearch = 
  | { type: 'Prefix'; prefix: string }
  | { type: 'Substring'; substring: string }
  | { type: 'Exact'; exact: string };

/**
 * Direction to traverse the history.
 * 
 * @example
 * ```typescript
 * // Search backward (most recent first)
 * const backward: SearchDirection = SearchDirection.Backward;
 * 
 * // Search forward (oldest first)
 * const forward: SearchDirection = SearchDirection.Forward;
 * ```
 * 
 * @see {@link https://github.com/nushell/reedline/blob/main/src/history/base.rs | Rust SearchDirection}
 */
export enum SearchDirection {
  /** From the most recent entry backward */
  Backward = 'Backward',
  /** From the least recent entry forward */
  Forward = 'Forward',
}

/**
 * Additional filters for querying the history.
 * 
 * This interface provides various filtering options for history queries,
 * including command line content, working directory, hostname, and more.
 * 
 * @example
 * ```typescript
 * const filter: SearchFilter = {
 *   commandLine: { type: "Prefix", prefix: "ls" },
 *   hostname: "localhost",
 *   cwdExact: "/home/user",
 *   exitSuccessful: true
 * };
 * ```
 * 
 * @see {@link https://github.com/nushell/reedline/blob/main/src/history/base.rs | Rust SearchFilter}
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
 * Query for search in the potentially rich history.
 * 
 * This interface defines a complete search query with direction,
 * time ranges, ID ranges, limits, and filters.
 * 
 * @example
 * ```typescript
 * const query: SearchQuery = {
 *   direction: SearchDirection.Backward,
 *   startTime: new Date("2023-01-01"),
 *   endTime: new Date("2023-01-02"),
 *   limit: 50,
 *   filter: {
 *     commandLine: { type: "Prefix", prefix: "ls" }
 *   }
 * };
 * ```
 * 
 * @see {@link https://github.com/nushell/reedline/blob/main/src/history/base.rs | Rust SearchQuery}
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
 * Interface for history storage and retrieval.
 * 
 * This interface defines the contract for history implementations,
 * whether they're file-based, database-based, or in-memory.
 * 
 * @example
 * ```typescript
 * const history: History = {
 *   save: async (item) => { /* implementation */ },
 *   load: async (id) => { /* implementation */ },
 *   search: async (query) => { /* implementation */ },
 *   // ... other methods
 * };
 * ```
 * 
 * @see {@link https://github.com/nushell/reedline/blob/main/src/history/base.rs | Rust History trait}
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
 * Stateful navigation via HistoryNavigationQuery.
 * 
 * This interface represents a cursor that can navigate through history
 * based on a specific query and maintains its current position.
 * 
 * @example
 * ```typescript
 * const cursor: HistoryCursor = {
 *   query: { type: "Normal", lineBuffer: { lines: "", insertionPoint: 0 } },
 *   current: historyItem,
 *   skipDupes: true,
 *   session: 1
 * };
 * ```
 * 
 * @see {@link https://github.com/nushell/reedline/blob/main/src/history/cursor.rs | Rust HistoryCursor}
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
 * A span of source code, with positions in bytes.
 * 
 * This interface represents a range of text in the buffer, used for
 * completion suggestions and text replacements.
 * 
 * @example
 * ```typescript
 * const span: Span = {
 *   start: 0,
 *   end: 10
 * };
 * ```
 * 
 * @see {@link https://github.com/nushell/reedline/blob/main/src/completion/base.rs | Rust Span}
 */
export interface Span {
  /** The starting position of the span, in bytes */
  start: number;
  /** The ending position of the span, in bytes */
  end: number;
}

/**
 * Suggestion returned by the Completer.
 * 
 * This interface defines the structure of a completion suggestion,
 * including the replacement text, description, styling, and metadata.
 * 
 * @example
 * ```typescript
 * const suggestion: Suggestion = {
 *   value: "ls -la",
 *   description: "List all files",
 *   style: { bold: true },
 *   extra: ["ls -l", "ls -a"],
 *   span: { start: 0, end: 2 },
 *   appendWhitespace: true
 * };
 * ```
 * 
 * @see {@link https://github.com/nushell/reedline/blob/main/src/completion/base.rs | Rust Suggestion}
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
 * Interface for completion functionality.
 * 
 * This interface defines the contract for completion implementations,
 * which can provide suggestions based on the current text and cursor position.
 * 
 * @example
 * ```typescript
 * const completer: Completer = {
 *   complete: (line, pos) => [/* suggestions */],
 *   completeWithBaseRanges: (line, pos) => [/* suggestions */, /* ranges */],
 *   partialComplete: (line, pos, start, offset) => [/* suggestions */],
 *   totalCompletions: (line, pos) => 10
 * };
 * ```
 * 
 * @see {@link https://github.com/nushell/reedline/blob/main/src/completion/base.rs | Rust Completer trait}
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
 * Index result obtained from parsing a string with an index marker.
 * 
 * This interface represents the result of parsing a string that contains
 * special markers for menu navigation and selection.
 * 
 * @example
 * ```typescript
 * const result: ParseResult = {
 *   remainder: "test",
 *   index: 10,
 *   marker: "!10",
 *   action: ParseAction.ForwardSearch,
 *   prefix: "test"
 * };
 * ```
 * 
 * @see {@link https://github.com/nushell/reedline/blob/main/src/menu/menu_functions.rs | Rust ParseResult}
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
 * Direction of the index found in the string.
 * 
 * @example
 * ```typescript
 * const action: ParseAction = ParseAction.ForwardSearch;
 * ```
 * 
 * @see {@link https://github.com/nushell/reedline/blob/main/src/menu/menu_functions.rs | Rust ParseAction}
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
 * ANSI style for text formatting.
 * 
 * This interface defines text styling options including colors,
 * text effects, and formatting attributes.
 * 
 * @example
 * ```typescript
 * const style: Style = {
 *   foreground: { type: "Red" },
 *   background: { type: "Black" },
 *   bold: true,
 *   italic: false,
 *   underline: true
 * };
 * ```
 * 
 * @see {@link https://docs.rs/nu-ansi-term/latest/nu_ansi_term/struct.Style.html | nu-ansi-term Style}
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
 * ANSI color representation.
 * 
 * This union type supports various color formats including
 * basic colors, bright colors, fixed colors, and RGB colors.
 * 
 * @example
 * ```typescript
 * // Basic colors
 * const red: Color = { type: "Red" };
 * 
 * // Bright colors
 * const brightRed: Color = { type: "BrightRed" };
 * 
 * // Fixed colors
 * const fixed: Color = { type: "Fixed", color: 255 };
 * 
 * // RGB colors
 * const rgb: Color = { type: "Rgb", r: 255, g: 128, b: 64 };
 * ```
 * 
 * @see {@link https://docs.rs/nu-ansi-term/latest/nu_ansi_term/enum.Color.html | nu-ansi-term Color}
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
 * A representation of a buffer with styling, used for syntax highlighting.
 * 
 * This interface represents text that has been styled with different
 * formatting options, typically used for syntax highlighting.
 * 
 * @example
 * ```typescript
 * const styledText: StyledText = {
 *   buffer: [
 *     [{ bold: true }, "Hello"],
 *     [{ foreground: { type: "Red" } }, " World"]
 *   ]
 * };
 * ```
 * 
 * @see {@link https://github.com/nushell/reedline/blob/main/src/painting/styled_text.rs | Rust StyledText}
 */
export interface StyledText {
  /** The component, styled parts of the text */
  buffer: [Style, string][];
}

// ============================================================================
// Prompt Interfaces
// ============================================================================

/**
 * Interface for prompt rendering.
 * 
 * This interface defines the contract for prompt implementations,
 * which can render different types of prompts and multiline indicators.
 * 
 * @example
 * ```typescript
 * const prompt: Prompt = {
 *   renderPrompt: () => "> ",
 *   renderPromptMultilineIndicator: () => "... ",
 *   getPromptMultilineColor: () => ({ type: "Blue" })
 * };
 * ```
 * 
 * @see {@link https://github.com/nushell/reedline/blob/main/src/prompt/base.rs | Rust Prompt trait}
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
 * Range type for TypeScript.
 * 
 * @template T - The type of the range values
 * 
 * @example
 * ```typescript
 * const range: Range<number> = { start: 0, end: 10 };
 * const charRange: Range<string> = { start: "a", end: "z" };
 * ```
 */
export interface Range<T> {
  start: T;
  end: T;
}

/**
 * Result type for operations that can fail.
 * 
 * @template T - The success type
 * @template E - The error type (defaults to Error)
 * 
 * @example
 * ```typescript
 * const success: Result<string> = "success";
 * const error: Result<string, Error> = new Error("error");
 * ```
 */
export type Result<T, E = Error> = T | E;

/**
 * Configuration options for Reedline.
 * 
 * This interface defines all the configuration options available
 * for customizing Reedline's behavior.
 * 
 * @example
 * ```typescript
 * const config: ReedlineConfig = {
 *   systemClipboard: true,
 *   history: {
 *     maxSize: 1000,
 *     ignoreDuplicates: true,
 *     filePath: "/tmp/history"
 *   },
 *   completion: {
 *     enabled: true,
 *     maxSuggestions: 50
 *   },
 *   menu: {
 *     type: "columnar",
 *     maxHeight: 20
 *   },
 *   styling: {
 *     useAnsiColors: true,
 *     defaultStyle: { bold: true }
 *   }
 * };
 * ```
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
 * Event that can be sent to Reedline.
 * 
 * This union type defines all the different types of events that
 * can be sent to Reedline for processing.
 * 
 * @example
 * ```typescript
 * // Key press event
 * const keyEvent: ReedlineEvent = {
 *   type: "KeyPress",
 *   key: "a",
 *   modifiers: ["Ctrl"]
 * };
 * 
 * // Mouse event
 * const mouseEvent: ReedlineEvent = {
 *   type: "Mouse",
 *   event: { button: 1, x: 10, y: 20, ctrl: false, shift: true, alt: false }
 * };
 * 
 * // Signal event
 * const signalEvent: ReedlineEvent = {
 *   type: "Signal",
 *   signal: "CtrlC"
 * };
 * ```
 * 
 * @see {@link https://github.com/nushell/reedline/blob/main/src/enums.rs | Rust ReedlineEvent}
 */
export type ReedlineEvent = 
  | { type: 'KeyPress'; key: string; modifiers?: string[] }
  | { type: 'Mouse'; event: MouseEvent }
  | { type: 'Paste'; content: string }
  | { type: 'Resize'; width: number; height: number }
  | { type: 'Signal'; signal: Signal };

/**
 * Mouse event for terminal input.
 * 
 * This interface defines the structure of mouse events that can
 * be sent to Reedline for processing.
 * 
 * @example
 * ```typescript
 * const mouseEvent: MouseEvent = {
 *   button: 1,
 *   x: 10,
 *   y: 20,
 *   ctrl: true,
 *   shift: false,
 *   alt: true
 * };
 * ```
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
 * Interface for syntax highlighting.
 * 
 * This interface defines the contract for syntax highlighter implementations,
 * which can apply styling to text based on its content and context.
 * 
 * @example
 * ```typescript
 * const highlighter: Highlighter = {
 *   highlight: (line, insertionPoint) => ({
 *     buffer: [[{ bold: true }, line]]
 *   })
 * };
 * ```
 * 
 * @see {@link https://github.com/nushell/reedline/blob/main/src/highlighter/mod.rs | Rust Highlighter traits}
 */
export interface Highlighter {
  /** Highlight the given text */
  highlight(line: string, insertionPoint: number): StyledText;
}

// ============================================================================
// Hinter Interfaces
// ============================================================================

/**
 * Interface for history hints.
 * 
 * This interface defines the contract for hinter implementations,
 * which can provide hints based on history and context.
 * 
 * @example
 * ```typescript
 * const hinter: Hinter = {
 *   hint: (line, insertionPoint) => "suggestion"
 * };
 * ```
 * 
 * @see {@link https://github.com/nushell/reedline/blob/main/src/hinter/mod.rs | Rust Hinter traits}
 */
export interface Hinter {
  /** Get hint for the given text */
  hint(line: string, insertionPoint: number): string | undefined;
}

// ============================================================================
// Validator Interfaces
// ============================================================================

/**
 * Interface for input validation.
 * 
 * This interface defines the contract for validator implementations,
 * which can validate user input and provide feedback.
 * 
 * @example
 * ```typescript
 * const validator: Validator = {
 *   validate: (line) => ({
 *     isValid: true,
 *     error: undefined,
 *     warning: undefined
 *   })
 * };
 * ```
 * 
 * @see {@link https://github.com/nushell/reedline/blob/main/src/validator/mod.rs | Rust Validator traits}
 */
export interface Validator {
  /** Validate the given input */
  validate(line: string): ValidationResult;
}

/**
 * Result of validation.
 * 
 * This interface defines the structure of validation results,
 * including whether the input is valid and any error or warning messages.
 * 
 * @example
 * ```typescript
 * // Valid result
 * const validResult: ValidationResult = {
 *   isValid: true
 * };
 * 
 * // Invalid result with error
 * const invalidResult: ValidationResult = {
 *   isValid: false,
 *   error: "Invalid input",
 *   warning: "Consider using quotes"
 * };
 * ```
 */
export interface ValidationResult {
  /** Whether the input is valid */
  isValid: boolean;
  /** Error message if invalid */
  error?: string;
  /** Warning message */
  warning?: string;
} 