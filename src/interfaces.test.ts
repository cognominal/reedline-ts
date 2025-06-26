/**
 * Unit tests for TypeScript interfaces
 */

import { describe, it, expect } from 'vitest';
import type {
  LineBuffer,
  EditStack,
  Editor,
  Clipboard,
  LocalClipboard,
  SystemClipboard,
  HistoryItemId,
  HistorySessionId,
  HistoryItem,
  HistoryNavigationQuery,
  CommandLineSearch,
  SearchFilter,
  SearchQuery,
  History,
  HistoryCursor,
  Span,
  Suggestion,
  Completer,
  ParseResult,
  Style,
  Color,
  StyledText,
  Prompt,
  Range,
  Result,
  ReedlineConfig,
  ReedlineEvent,
  MouseEvent,
  Highlighter,
  Hinter,
  Validator,
  ValidationResult,
} from './interfaces';
import { ClipboardMode, SearchDirection, ParseAction } from './interfaces';
import { Signal, UndoBehavior } from './types';

describe('Core Editor Interfaces', () => {
  describe('LineBuffer', () => {
    it('should have correct structure', () => {
      const buffer: LineBuffer = {
        lines: 'Hello, World!',
        insertionPoint: 5,
      };

      expect(buffer.lines).toBe('Hello, World!');
      expect(buffer.insertionPoint).toBe(5);
    });

    it('should allow empty buffer', () => {
      const buffer: LineBuffer = {
        lines: '',
        insertionPoint: 0,
      };

      expect(buffer.lines).toBe('');
      expect(buffer.insertionPoint).toBe(0);
    });
  });

  describe('EditStack', () => {
    it('should have correct generic structure', () => {
      const stack: EditStack<string> = {
        internalList: ['state1', 'state2', 'state3'],
        index: 1,
      };

      expect(stack.internalList).toEqual(['state1', 'state2', 'state3']);
      expect(stack.index).toBe(1);
    });

    it('should work with LineBuffer type', () => {
      const lineBuffer: LineBuffer = {
        lines: 'test',
        insertionPoint: 2,
      };

      const stack: EditStack<LineBuffer> = {
        internalList: [lineBuffer],
        index: 0,
      };

      expect(stack.internalList[0]).toEqual(lineBuffer);
      expect(stack.index).toBe(0);
    });
  });

  describe('Editor', () => {
    it('should have correct structure', () => {
      const mockClipboard: Clipboard = {
        set: () => {},
        get: () => ['', ClipboardMode.Normal],
        clear: () => {},
        length: () => 0,
      };

      const editor: Editor = {
        lineBuffer: {
          lines: 'Hello',
          insertionPoint: 3,
        },
        cutBuffer: mockClipboard,
        editStack: {
          internalList: [],
          index: 0,
        },
        lastUndoBehavior: UndoBehavior.CreateUndoPoint(),
      };

      expect(editor.lineBuffer.lines).toBe('Hello');
      expect(editor.cutBuffer).toBe(mockClipboard);
      expect(editor.selectionAnchor).toBeUndefined();
    });

    it('should allow optional system clipboard', () => {
      const mockClipboard: Clipboard = {
        set: () => {},
        get: () => ['', ClipboardMode.Normal],
        clear: () => {},
        length: () => 0,
      };

      const editor: Editor = {
        lineBuffer: {
          lines: 'Hello',
          insertionPoint: 3,
        },
        cutBuffer: mockClipboard,
        systemClipboard: mockClipboard,
        editStack: {
          internalList: [],
          index: 0,
        },
        lastUndoBehavior: UndoBehavior.CreateUndoPoint(),
      };

      expect(editor.systemClipboard).toBeDefined();
    });
  });
});

describe('Clipboard Interfaces', () => {
  describe('ClipboardMode', () => {
    it('should have correct enum values', () => {
      expect(ClipboardMode.Normal).toBe('Normal');
      expect(ClipboardMode.Lines).toBe('Lines');
    });
  });

  describe('Clipboard', () => {
    it('should define required methods', () => {
      const clipboard: Clipboard = {
        set: () => {},
        get: () => ['test', ClipboardMode.Normal],
        clear: () => {},
        length: () => 4,
      };

      expect(typeof clipboard.set).toBe('function');
      expect(typeof clipboard.get).toBe('function');
      expect(typeof clipboard.clear).toBe('function');
      expect(typeof clipboard.length).toBe('function');
    });
  });

  describe('LocalClipboard', () => {
    it('should have correct structure', () => {
      const localClipboard: LocalClipboard = {
        content: 'test content',
        mode: ClipboardMode.Normal,
      };

      expect(localClipboard.content).toBe('test content');
      expect(localClipboard.mode).toBe(ClipboardMode.Normal);
    });
  });

  describe('SystemClipboard', () => {
    it('should have correct structure', () => {
      const systemClipboard: SystemClipboard = {
        localCopy: 'system content',
        mode: ClipboardMode.Lines,
      };

      expect(systemClipboard.localCopy).toBe('system content');
      expect(systemClipboard.mode).toBe(ClipboardMode.Lines);
    });
  });
});

describe('History Interfaces', () => {
  describe('HistoryItemId and HistorySessionId', () => {
    it('should be number types', () => {
      const id: HistoryItemId = 123;
      const sessionId: HistorySessionId = 456;

      expect(typeof id).toBe('number');
      expect(typeof sessionId).toBe('number');
    });
  });

  describe('HistoryItem', () => {
    it('should have correct structure', () => {
      const item: HistoryItem = {
        id: 1,
        commandLine: 'ls -la',
        session: 1,
        startTimestamp: new Date('2023-01-01'),
        endTimestamp: new Date('2023-01-01T00:00:01'),
        exitStatus: 0,
        cwd: '/home/user',
        hostname: 'localhost',
        metadata: { key: 'value' },
      };

      expect(item.id).toBe(1);
      expect(item.commandLine).toBe('ls -la');
      expect(item.session).toBe(1);
      expect(item.exitStatus).toBe(0);
      expect(item.cwd).toBe('/home/user');
    });

    it('should allow optional fields', () => {
      const item: HistoryItem = {
        commandLine: 'echo hello',
        session: 1,
        startTimestamp: new Date(),
      };

      expect(item.id).toBeUndefined();
      expect(item.endTimestamp).toBeUndefined();
      expect(item.exitStatus).toBeUndefined();
    });
  });

  describe('HistoryNavigationQuery', () => {
    it('should support Normal type', () => {
      const query: HistoryNavigationQuery = {
        type: 'Normal',
        lineBuffer: {
          lines: 'test',
          insertionPoint: 2,
        },
      };

      expect(query.type).toBe('Normal');
      expect(query.lineBuffer.lines).toBe('test');
    });

    it('should support PrefixSearch type', () => {
      const query: HistoryNavigationQuery = {
        type: 'PrefixSearch',
        prefix: 'ls',
      };

      expect(query.type).toBe('PrefixSearch');
      expect(query.prefix).toBe('ls');
    });

    it('should support SubstringSearch type', () => {
      const query: HistoryNavigationQuery = {
        type: 'SubstringSearch',
        substring: 'test',
      };

      expect(query.type).toBe('SubstringSearch');
      expect(query.substring).toBe('test');
    });
  });

  describe('CommandLineSearch', () => {
    it('should support Prefix type', () => {
      const search: CommandLineSearch = {
        type: 'Prefix',
        prefix: 'ls',
      };

      expect(search.type).toBe('Prefix');
      expect(search.prefix).toBe('ls');
    });

    it('should support Substring type', () => {
      const search: CommandLineSearch = {
        type: 'Substring',
        substring: 'test',
      };

      expect(search.type).toBe('Substring');
      expect(search.substring).toBe('test');
    });

    it('should support Exact type', () => {
      const search: CommandLineSearch = {
        type: 'Exact',
        exact: 'ls -la',
      };

      expect(search.type).toBe('Exact');
      expect(search.exact).toBe('ls -la');
    });
  });

  describe('SearchDirection', () => {
    it('should have correct enum values', () => {
      expect(SearchDirection.Backward).toBe('Backward');
      expect(SearchDirection.Forward).toBe('Forward');
    });
  });

  describe('SearchFilter', () => {
    it('should have correct structure', () => {
      const filter: SearchFilter = {
        commandLine: { type: 'Prefix', prefix: 'ls' },
        notCommandLine: 'current',
        hostname: 'localhost',
        cwdExact: '/home/user',
        cwdPrefix: '/home',
        exitSuccessful: true,
        session: 1,
      };

      expect(filter.commandLine?.type).toBe('Prefix');
      expect(filter.hostname).toBe('localhost');
      expect(filter.exitSuccessful).toBe(true);
    });

    it('should allow optional fields', () => {
      const filter: SearchFilter = {};

      expect(filter.commandLine).toBeUndefined();
      expect(filter.hostname).toBeUndefined();
    });
  });

  describe('SearchQuery', () => {
    it('should have correct structure', () => {
      const query: SearchQuery = {
        direction: SearchDirection.Backward,
        startTime: new Date('2023-01-01'),
        endTime: new Date('2023-01-02'),
        startId: 1,
        endId: 100,
        limit: 50,
        filter: {
          commandLine: { type: 'Prefix', prefix: 'ls' },
        },
      };

      expect(query.direction).toBe(SearchDirection.Backward);
      expect(query.limit).toBe(50);
      expect(query.filter.commandLine?.type).toBe('Prefix');
    });
  });

  describe('History', () => {
    it('should define required methods', () => {
      const history: History = {
        save: async () => ({ commandLine: 'test', session: 1, startTimestamp: new Date() }),
        load: async () => ({ commandLine: 'test', session: 1, startTimestamp: new Date() }),
        count: async () => 10,
        countAll: async () => 100,
        search: async () => [],
        update: async () => {},
        clear: async () => {},
        delete: async () => {},
        sync: async () => {},
        session: () => 1,
      };

      expect(typeof history.save).toBe('function');
      expect(typeof history.load).toBe('function');
      expect(typeof history.search).toBe('function');
    });
  });

  describe('HistoryCursor', () => {
    it('should have correct structure', () => {
      const cursor: HistoryCursor = {
        query: { type: 'Normal', lineBuffer: { lines: '', insertionPoint: 0 } },
        current: {
          commandLine: 'ls -la',
          session: 1,
          startTimestamp: new Date(),
        },
        skipDupes: true,
        session: 1,
      };

      expect(cursor.query.type).toBe('Normal');
      expect(cursor.skipDupes).toBe(true);
      expect(cursor.current?.commandLine).toBe('ls -la');
    });
  });
});

describe('Completion Interfaces', () => {
  describe('Span', () => {
    it('should have correct structure', () => {
      const span: Span = {
        start: 0,
        end: 10,
      };

      expect(span.start).toBe(0);
      expect(span.end).toBe(10);
    });
  });

  describe('Suggestion', () => {
    it('should have correct structure', () => {
      const suggestion: Suggestion = {
        value: 'ls -la',
        description: 'List all files',
        style: { bold: true },
        extra: ['ls -l', 'ls -a'],
        span: { start: 0, end: 2 },
        appendWhitespace: true,
      };

      expect(suggestion.value).toBe('ls -la');
      expect(suggestion.description).toBe('List all files');
      expect(suggestion.appendWhitespace).toBe(true);
    });

    it('should allow optional fields', () => {
      const suggestion: Suggestion = {
        value: 'test',
        span: { start: 0, end: 4 },
        appendWhitespace: false,
      };

      expect(suggestion.description).toBeUndefined();
      expect(suggestion.style).toBeUndefined();
    });
  });

  describe('Completer', () => {
    it('should define required methods', () => {
      const completer: Completer = {
        complete: () => [],
        completeWithBaseRanges: () => [[], []],
        partialComplete: () => [],
        totalCompletions: () => 0,
      };

      expect(typeof completer.complete).toBe('function');
      expect(typeof completer.completeWithBaseRanges).toBe('function');
      expect(typeof completer.totalCompletions).toBe('function');
    });
  });
});

describe('Menu Interfaces', () => {
  describe('ParseResult', () => {
    it('should have correct structure', () => {
      const result: ParseResult = {
        remainder: 'test',
        index: 10,
        marker: '!10',
        action: ParseAction.ForwardSearch,
        prefix: 'test',
      };

      expect(result.remainder).toBe('test');
      expect(result.index).toBe(10);
      expect(result.action).toBe(ParseAction.ForwardSearch);
    });

    it('should allow optional fields', () => {
      const result: ParseResult = {
        remainder: 'test',
        action: ParseAction.ForwardSearch,
      };

      expect(result.index).toBeUndefined();
      expect(result.marker).toBeUndefined();
    });
  });

  describe('ParseAction', () => {
    it('should have correct enum values', () => {
      expect(ParseAction.ForwardSearch).toBe('ForwardSearch');
      expect(ParseAction.BackwardSearch).toBe('BackwardSearch');
      expect(ParseAction.LastToken).toBe('LastToken');
      expect(ParseAction.LastCommand).toBe('LastCommand');
      expect(ParseAction.BackwardPrefixSearch).toBe('BackwardPrefixSearch');
    });
  });
});

describe('Painting & Styling Interfaces', () => {
  describe('Color', () => {
    it('should support basic colors', () => {
      const black: Color = { type: 'Black' };
      const red: Color = { type: 'Red' };
      const green: Color = { type: 'Green' };

      expect(black.type).toBe('Black');
      expect(red.type).toBe('Red');
      expect(green.type).toBe('Green');
    });

    it('should support bright colors', () => {
      const brightRed: Color = { type: 'BrightRed' };
      const brightBlue: Color = { type: 'BrightBlue' };

      expect(brightRed.type).toBe('BrightRed');
      expect(brightBlue.type).toBe('BrightBlue');
    });

    it('should support fixed colors', () => {
      const fixed: Color = { type: 'Fixed', color: 255 };

      expect(fixed.type).toBe('Fixed');
      expect(fixed.color).toBe(255);
    });

    it('should support RGB colors', () => {
      const rgb: Color = { type: 'Rgb', r: 255, g: 128, b: 64 };

      expect(rgb.type).toBe('Rgb');
      expect(rgb.r).toBe(255);
      expect(rgb.g).toBe(128);
      expect(rgb.b).toBe(64);
    });
  });

  describe('Style', () => {
    it('should have correct structure', () => {
      const style: Style = {
        foreground: { type: 'Red' },
        background: { type: 'Black' },
        bold: true,
        italic: false,
        underline: true,
        dimmed: false,
        reverse: true,
        hidden: false,
        strikethrough: true,
      };

      expect(style.foreground?.type).toBe('Red');
      expect(style.bold).toBe(true);
      expect(style.italic).toBe(false);
    });

    it('should allow partial styling', () => {
      const style: Style = {
        bold: true,
      };

      expect(style.bold).toBe(true);
      expect(style.foreground).toBeUndefined();
    });
  });

  describe('StyledText', () => {
    it('should have correct structure', () => {
      const styledText: StyledText = {
        buffer: [
          [{ bold: true }, 'Hello'],
          [{ foreground: { type: 'Red' } }, ' World'],
        ],
      };

      expect(styledText.buffer).toHaveLength(2);
      expect(styledText.buffer[0][1]).toBe('Hello');
      expect(styledText.buffer[1][0].foreground?.type).toBe('Red');
    });
  });
});

describe('Prompt Interfaces', () => {
  describe('Prompt', () => {
    it('should define required methods', () => {
      const prompt: Prompt = {
        renderPrompt: () => '> ',
        renderPromptMultilineIndicator: () => '... ',
        getPromptMultilineColor: () => ({ type: 'Blue' }),
      };

      expect(typeof prompt.renderPrompt).toBe('function');
      expect(typeof prompt.renderPromptMultilineIndicator).toBe('function');
      expect(typeof prompt.getPromptMultilineColor).toBe('function');
    });
  });
});

describe('Utility Types', () => {
  describe('Range', () => {
    it('should have correct structure', () => {
      const range: Range<number> = {
        start: 0,
        end: 10,
      };

      expect(range.start).toBe(0);
      expect(range.end).toBe(10);
    });

    it('should work with string type', () => {
      const range: Range<string> = {
        start: 'a',
        end: 'z',
      };

      expect(range.start).toBe('a');
      expect(range.end).toBe('z');
    });
  });

  describe('Result', () => {
    it('should support success case', () => {
      const result: Result<string> = 'success';

      expect(result).toBe('success');
    });

    it('should support error case', () => {
      const result: Result<string, Error> = new Error('error');

      expect(result).toBeInstanceOf(Error);
    });
  });

  describe('ReedlineConfig', () => {
    it('should have correct structure', () => {
      const config: ReedlineConfig = {
        systemClipboard: true,
        history: {
          maxSize: 1000,
          ignoreDuplicates: true,
          filePath: '/tmp/history',
        },
        completion: {
          enabled: true,
          maxSuggestions: 50,
        },
        menu: {
          type: 'columnar',
          maxHeight: 20,
        },
        styling: {
          useAnsiColors: true,
          defaultStyle: { bold: true },
        },
      };

      expect(config.systemClipboard).toBe(true);
      expect(config.history?.maxSize).toBe(1000);
      expect(config.completion?.enabled).toBe(true);
      expect(config.menu?.type).toBe('columnar');
    });

    it('should allow partial configuration', () => {
      const config: ReedlineConfig = {
        systemClipboard: false,
      };

      expect(config.systemClipboard).toBe(false);
      expect(config.history).toBeUndefined();
    });
  });
});

describe('Event Interfaces', () => {
  describe('ReedlineEvent', () => {
    it('should support KeyPress type', () => {
      const event: ReedlineEvent = {
        type: 'KeyPress',
        key: 'a',
        modifiers: ['Ctrl'],
      };

      expect(event.type).toBe('KeyPress');
      expect(event.key).toBe('a');
      expect(event.modifiers).toEqual(['Ctrl']);
    });

    it('should support Mouse type', () => {
      const event: ReedlineEvent = {
        type: 'Mouse',
        event: {
          button: 1,
          x: 10,
          y: 20,
          ctrl: false,
          shift: true,
          alt: false,
        },
      };

      expect(event.type).toBe('Mouse');
      expect(event.event.x).toBe(10);
      expect(event.event.y).toBe(20);
    });

    it('should support Paste type', () => {
      const event: ReedlineEvent = {
        type: 'Paste',
        content: 'pasted text',
      };

      expect(event.type).toBe('Paste');
      expect(event.content).toBe('pasted text');
    });

    it('should support Resize type', () => {
      const event: ReedlineEvent = {
        type: 'Resize',
        width: 80,
        height: 24,
      };

      expect(event.type).toBe('Resize');
      expect(event.width).toBe(80);
      expect(event.height).toBe(24);
    });

    it('should support Signal type', () => {
      const event: ReedlineEvent = {
        type: 'Signal',
        signal: Signal.CtrlC(),
      };

      expect(event.type).toBe('Signal');
      if (event.type === 'Signal') {
        expect(event.signal).toEqual(Signal.CtrlC());
      }
    });
  });

  describe('MouseEvent', () => {
    it('should have correct structure', () => {
      const mouseEvent: MouseEvent = {
        button: 1,
        x: 10,
        y: 20,
        ctrl: true,
        shift: false,
        alt: true,
      };

      expect(mouseEvent.button).toBe(1);
      expect(mouseEvent.x).toBe(10);
      expect(mouseEvent.y).toBe(20);
      expect(mouseEvent.ctrl).toBe(true);
      expect(mouseEvent.shift).toBe(false);
      expect(mouseEvent.alt).toBe(true);
    });
  });
});

describe('Highlighter Interfaces', () => {
  describe('Highlighter', () => {
    it('should define required methods', () => {
      const highlighter: Highlighter = {
        highlight: () => ({
          buffer: [[{ bold: true }, 'test']],
        }),
      };

      expect(typeof highlighter.highlight).toBe('function');
    });
  });
});

describe('Hinter Interfaces', () => {
  describe('Hinter', () => {
    it('should define required methods', () => {
      const hinter: Hinter = {
        hint: () => 'suggestion',
      };

      expect(typeof hinter.hint).toBe('function');
    });

    it('should allow undefined hints', () => {
      const hinter: Hinter = {
        hint: () => undefined,
      };

      expect(hinter.hint('test', 0)).toBeUndefined();
    });
  });
});

describe('Validator Interfaces', () => {
  describe('Validator', () => {
    it('should define required methods', () => {
      const validator: Validator = {
        validate: () => ({
          isValid: true,
          error: undefined,
          warning: undefined,
        }),
      };

      expect(typeof validator.validate).toBe('function');
    });
  });

  describe('ValidationResult', () => {
    it('should support valid result', () => {
      const result: ValidationResult = {
        isValid: true,
      };

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should support invalid result with error', () => {
      const result: ValidationResult = {
        isValid: false,
        error: 'Invalid input',
        warning: 'Consider using quotes',
      };

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid input');
      expect(result.warning).toBe('Consider using quotes');
    });
  });
}); 