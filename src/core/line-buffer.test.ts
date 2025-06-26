import { describe, it, expect } from 'vitest';
import { LineBuffer } from './line-buffer';

describe('LineBuffer', () => {
  function bufferWith(content: string): LineBuffer {
    const lineBuffer = LineBuffer.new();
    lineBuffer.insertStr(content);
    return lineBuffer;
  }

  describe('Basic functionality', () => {
    it('new buffer is empty', () => {
      const lineBuffer = LineBuffer.new();
      expect(lineBuffer.isEmpty()).toBe(true);
      lineBuffer.assertValid();
    });

    it('clearing line buffer resets buffer and insertion point', () => {
      const lineBuffer = bufferWith('this is a command');
      lineBuffer.clear();
      const emptyBuffer = LineBuffer.new();

      expect(lineBuffer.getBuffer()).toBe(emptyBuffer.getBuffer());
      expect(lineBuffer.getInsertionPoint()).toBe(emptyBuffer.getInsertionPoint());
      lineBuffer.assertValid();
    });

    it('insertStr updates insertion point correctly', () => {
      const lineBuffer = LineBuffer.new();
      lineBuffer.insertStr('this is a command');

      const expectedUpdatedInsertionPoint = 17;

      expect(lineBuffer.getInsertionPoint()).toBe(expectedUpdatedInsertionPoint);
      lineBuffer.assertValid();
    });

    it('insertChar updates insertion point correctly', () => {
      const lineBuffer = LineBuffer.new();
      lineBuffer.insertChar('c');

      const expectedUpdatedInsertionPoint = 1;

      expect(lineBuffer.getInsertionPoint()).toBe(expectedUpdatedInsertionPoint);
      lineBuffer.assertValid();
    });

    it('setBuffer updates insertion point to new buffer length', () => {
      const lineBuffer = bufferWith('test string');
      const beforeOperationLocation = 11;
      expect(lineBuffer.getInsertionPoint()).toBe(beforeOperationLocation);

      lineBuffer.setBuffer('new string');

      expect(lineBuffer.getInsertionPoint()).toBe(10);
      lineBuffer.assertValid();
    });

    it('setBuffer with multiline updates insertion point correctly', () => {
      const lineBuffer = bufferWith('test string');
      lineBuffer.setBuffer('new line1\nnew line 2');

      expect(lineBuffer.getInsertionPoint()).toBe(20);
      lineBuffer.assertValid();
    });
  });

  describe('Deletion operations', () => {
    it.each([
      ['This is a test', 'This is a tes'],
      ['This is a test 😊', 'This is a test '],
      ['', ''],
    ])('deleteLeftGrapheme works with %s', (input: string, expected: string) => {
      const lineBuffer = bufferWith(input);
      lineBuffer.deleteLeftGrapheme();

      const expectedLineBuffer = bufferWith(expected);

      expect(lineBuffer.getBuffer()).toBe(expectedLineBuffer.getBuffer());
      expect(lineBuffer.getInsertionPoint()).toBe(expectedLineBuffer.getInsertionPoint());
      lineBuffer.assertValid();
    });

    it.each([
      ['This is a test', 'This is a tes'],
      ['This is a test 😊', 'This is a test '],
      ['', ''],
    ])('deleteRightGrapheme works with %s', (input: string, expected: string) => {
      const lineBuffer = bufferWith(input);
      lineBuffer.moveLeft();
      lineBuffer.deleteRightGrapheme();

      const expectedLineBuffer = bufferWith(expected);

      expect(lineBuffer.getBuffer()).toBe(expectedLineBuffer.getBuffer());
      expect(lineBuffer.getInsertionPoint()).toBe(expectedLineBuffer.getInsertionPoint());
      lineBuffer.assertValid();
    });

    it('deleteWordLeft works', () => {
      const lineBuffer = bufferWith('This is a test');
      lineBuffer.deleteWordLeft();

      const expectedLineBuffer = bufferWith('This is a ');

      expect(lineBuffer.getBuffer()).toBe(expectedLineBuffer.getBuffer());
      expect(lineBuffer.getInsertionPoint()).toBe(expectedLineBuffer.getInsertionPoint());
      lineBuffer.assertValid();
    });

    it('deleteWordRight works', () => {
      const lineBuffer = bufferWith('This is a test');
      lineBuffer.moveWordLeft();
      lineBuffer.deleteWordRight();

      const expectedLineBuffer = bufferWith('This is a ');

      expect(lineBuffer.getBuffer()).toBe(expectedLineBuffer.getBuffer());
      expect(lineBuffer.getInsertionPoint()).toBe(expectedLineBuffer.getInsertionPoint());
      lineBuffer.assertValid();
    });
  });

  describe('Word movement', () => {
    it.each([
      ['', 0, 0], // Basecase
      ['word', 0, 3], // Cursor on top of the last grapheme of the word
      ['word and another one', 0, 3],
      ['word and another one', 3, 7], // repeat calling will move
      ['word and another one', 4, 7], // Starting from whitespace works
      ['word\nline two', 0, 3], // Multiline...
      ['word\nline two', 3, 8], // ... continues to next word end
      ['weirdö characters', 0, 5], // Multibyte unicode at the word end
      ['weirdö characters', 5, 17], // continue with unicode
      ['weirdö', 0, 5], // Multibyte unicode at the buffer end is fine as well
      ['weirdö', 5, 5], // Multibyte unicode at the buffer end is fine as well
      ['word😇 with emoji', 0, 3], // (Emojis are a separate word)
      ['word😇 with emoji', 3, 4], // Moves to end of "emoji word" as it is one grapheme
      ['😇', 0, 0], // More UTF-8 shenanigans
    ])('moveWordRightEnd with %s at position %i should move to %i', 
       (input: string, inLocation: number, expected: number) => {
      const lineBuffer = bufferWith(input);
      lineBuffer.setInsertionPoint(inLocation);

      lineBuffer.moveWordRightEnd();

      expect(lineBuffer.getInsertionPoint()).toBe(expected);
      lineBuffer.assertValid();
    });
  });

  describe('Case operations', () => {
    it.each([
      ['This is a test', 13, 'This is a tesT', 14],
      ['This is a test', 10, 'This is a Test', 11],
      ['This is a test', 9, 'This is a Test', 11],
    ])('capitalizeChar works with %s at position %i should produce %s at position %i',
       (input: string, inLocation: number, output: string, outLocation: number) => {
      const lineBuffer = bufferWith(input);
      lineBuffer.setInsertionPoint(inLocation);
      lineBuffer.capitalizeChar();

      const expected = bufferWith(output);
      expected.setInsertionPoint(outLocation);

      expect(lineBuffer.getBuffer()).toBe(expected.getBuffer());
      expect(lineBuffer.getInsertionPoint()).toBe(expected.getInsertionPoint());
      lineBuffer.assertValid();
    });

    it.each([
      ['This is a test', 13, 'This is a TEST', 14],
      ['This is a test', 10, 'This is a TEST', 14],
      ['', 0, '', 0],
      ['This', 0, 'THIS', 4],
      ['This', 4, 'THIS', 4],
    ])('uppercaseWord works with %s at position %i should produce %s at position %i',
       (input: string, inLocation: number, output: string, outLocation: number) => {
      const lineBuffer = bufferWith(input);
      lineBuffer.setInsertionPoint(inLocation);
      lineBuffer.uppercaseWord();

      const expected = bufferWith(output);
      expected.setInsertionPoint(outLocation);

      expect(lineBuffer.getBuffer()).toBe(expected.getBuffer());
      expect(lineBuffer.getInsertionPoint()).toBe(expected.getInsertionPoint());
      lineBuffer.assertValid();
    });

    it.each([
      ['This is a test', 13, 'This is a test', 14],
      ['This is a test', 10, 'This is a test', 14],
      ['', 0, '', 0],
      ['THIS', 0, 'this', 4],
      ['THIS', 4, 'this', 4],
    ])('lowercaseWord works with %s at position %i should produce %s at position %i',
       (input: string, inLocation: number, output: string, outLocation: number) => {
      const lineBuffer = bufferWith(input);
      lineBuffer.setInsertionPoint(inLocation);
      lineBuffer.lowercaseWord();

      const expected = bufferWith(output);
      expected.setInsertionPoint(outLocation);

      expect(lineBuffer.getBuffer()).toBe(expected.getBuffer());
      expect(lineBuffer.getInsertionPoint()).toBe(expected.getInsertionPoint());
      lineBuffer.assertValid();
    });

    it.each([
      ['This is a test', 13, 'This is a tesT', 14],
      ['This is a test', 10, 'This is a Test', 11],
      ['This is a test', 9, 'This is a Test', 11],
    ])('switchcaseChar works with %s at position %i should produce %s at position %i',
       (input: string, inLocation: number, output: string, outLocation: number) => {
      const lineBuffer = bufferWith(input);
      lineBuffer.setInsertionPoint(inLocation);
      lineBuffer.switchcaseChar();

      const expected = bufferWith(output);
      expected.setInsertionPoint(outLocation);

      expect(lineBuffer.getBuffer()).toBe(expected.getBuffer());
      expect(lineBuffer.getInsertionPoint()).toBe(expected.getInsertionPoint());
      lineBuffer.assertValid();
    });
  });

  describe('Swap operations', () => {
    it.each([
      ['ab', 0, 'ba', 1],
      ['abc', 1, 'bac', 2],
      ['a', 0, 'a', 0], // Single character, no swap possible
      ['', 0, '', 0], // Empty buffer
    ])('swapGraphemes works with %s at position %i should produce %s at position %i',
       (input: string, inLocation: number, output: string, outLocation: number) => {
      const lineBuffer = bufferWith(input);
      lineBuffer.setInsertionPoint(inLocation);
      lineBuffer.swapGraphemes();

      const expected = bufferWith(output);
      expected.setInsertionPoint(outLocation);

      expect(lineBuffer.getBuffer()).toBe(expected.getBuffer());
      expect(lineBuffer.getInsertionPoint()).toBe(expected.getInsertionPoint());
      lineBuffer.assertValid();
    });

    it.each([
      ['word1 word2', 0, 'word2 word1', 5],
      ['first second third', 0, 'second first third', 6],
      ['single', 0, 'single', 0], // Single word, no swap possible
    ])('swapWords works with %s at position %i should produce %s at position %i',
       (input: string, inLocation: number, output: string, outLocation: number) => {
      const lineBuffer = bufferWith(input);
      lineBuffer.setInsertionPoint(inLocation);
      lineBuffer.swapWords();

      const expected = bufferWith(output);
      expected.setInsertionPoint(outLocation);

      expect(lineBuffer.getBuffer()).toBe(expected.getBuffer());
      expect(lineBuffer.getInsertionPoint()).toBe(expected.getInsertionPoint());
      lineBuffer.assertValid();
    });
  });

  describe('Line movement', () => {
    it.each([
      ['line1\nline2\nline3', 7, 0], // Move up from line2 to line1
      ['line1\nline2\nline3', 12, 7], // Move up from line3 to line2
      ['single line', 5, 5], // Single line, no movement
    ])('moving up works with %s at position %i should move to %i',
       (input: string, inLocation: number, outLocation: number) => {
      const lineBuffer = bufferWith(input);
      lineBuffer.setInsertionPoint(inLocation);
      lineBuffer.moveLineUp();

      expect(lineBuffer.getInsertionPoint()).toBe(outLocation);
      lineBuffer.assertValid();
    });

    it.each([
      ['line1\nline2\nline3', 0, 7], // Move down from line1 to line2
      ['line1\nline2\nline3', 7, 12], // Move down from line2 to line3
      ['single line', 5, 5], // Single line, no movement
    ])('moving down works with %s at position %i should move to %i',
       (input: string, inLocation: number, outLocation: number) => {
      const lineBuffer = bufferWith(input);
      lineBuffer.setInsertionPoint(inLocation);
      lineBuffer.moveLineDown();

      expect(lineBuffer.getInsertionPoint()).toBe(outLocation);
      lineBuffer.assertValid();
    });
  });

  describe('Line detection', () => {
    it.each([
      ['line1\nline2\nline3', 0, true],
      ['line1\nline2\nline3', 7, false],
      ['line1\nline2\nline3', 12, false],
      ['single line', 5, true],
    ])('first line detection with %s at position %i should be %s',
       (input: string, inLocation: number, expected: boolean) => {
      const lineBuffer = bufferWith(input);
      lineBuffer.setInsertionPoint(inLocation);

      expect(lineBuffer.isCursorAtFirstLine()).toBe(expected);
      lineBuffer.assertValid();
    });

    it.each([
      ['line1\nline2\nline3', 0, false],
      ['line1\nline2\nline3', 7, false],
      ['line1\nline2\nline3', 12, true],
      ['single line', 5, true],
    ])('last line detection with %s at position %i should be %s',
       (input: string, inLocation: number, expected: boolean) => {
      const lineBuffer = bufferWith(input);
      lineBuffer.setInsertionPoint(inLocation);

      expect(lineBuffer.isCursorAtLastLine()).toBe(expected);
      lineBuffer.assertValid();
    });
  });

  describe('Character finding and movement', () => {
    it.each([
      ['hello world', 0, 'o', false, 4],
      ['hello world', 0, 'o', true, 4],
      ['hello\nworld', 0, 'o', false, 4],
      ['hello\nworld', 0, 'o', true, 4],
      ['hello world', 0, 'x', false, null],
    ])('findCharRight with %s at position %i looking for %s (currentLine: %s) should find %s',
       (input: string, position: number, c: string, currentLine: boolean, expected: number | null) => {
      const lineBuffer = bufferWith(input);
      lineBuffer.setInsertionPoint(position);

      const result = lineBuffer.findCharRight(c, currentLine);

      expect(result).toBe(expected);
      lineBuffer.assertValid();
    });

    it.each([
      ['hello world', 10, 'o', false, 7],
      ['hello world', 10, 'o', true, 7],
      ['hello\nworld', 10, 'o', false, 7],
      ['hello\nworld', 10, 'o', true, 7],
      ['hello world', 10, 'x', false, null],
    ])('findCharLeft with %s at position %i looking for %s (currentLine: %s) should find %s',
       (input: string, position: number, c: string, currentLine: boolean, expected: number | null) => {
      const lineBuffer = bufferWith(input);
      lineBuffer.setInsertionPoint(position);

      const result = lineBuffer.findCharLeft(c, currentLine);

      expect(result).toBe(expected);
      lineBuffer.assertValid();
    });

    it.each([
      ['hello world', 0, 'o', false, 4],
      ['hello world', 0, 'o', true, 4],
      ['hello\nworld', 0, 'o', false, 4],
      ['hello\nworld', 0, 'o', true, 4],
    ])('moveRightUntil with %s at position %i looking for %s (currentLine: %s) should move to %i',
       (input: string, position: number, c: string, currentLine: boolean, expected: number) => {
      const lineBuffer = bufferWith(input);
      lineBuffer.setInsertionPoint(position);

      const result = lineBuffer.moveRightUntil(c, currentLine);

      expect(result).toBe(expected);
      lineBuffer.assertValid();
    });

    it.each([
      ['hello world', 10, 'o', false, 7],
      ['hello world', 10, 'o', true, 7],
      ['hello\nworld', 10, 'o', false, 7],
      ['hello\nworld', 10, 'o', true, 7],
    ])('moveLeftUntil with %s at position %i looking for %s (currentLine: %s) should move to %i',
       (input: string, position: number, c: string, currentLine: boolean, expected: number) => {
      const lineBuffer = bufferWith(input);
      lineBuffer.setInsertionPoint(position);

      const result = lineBuffer.moveLeftUntil(c, currentLine);

      expect(result).toBe(expected);
      lineBuffer.assertValid();
    });
  });

  describe('Deletion until character', () => {
    it.each([
      ['hello world', 0, 'o', false, 'o world'],
      ['hello world', 0, 'o', true, 'o world'],
      ['hello\nworld', 0, 'o', false, 'o\nworld'],
      ['hello\nworld', 0, 'o', true, 'o\nworld'],
    ])('deleteRightUntilChar with %s at position %i looking for %s (currentLine: %s) should produce %s',
       (input: string, position: number, c: string, currentLine: boolean, expected: string) => {
      const lineBuffer = bufferWith(input);
      lineBuffer.setInsertionPoint(position);

      lineBuffer.deleteRightUntilChar(c, currentLine);

      expect(lineBuffer.getBuffer()).toBe(expected);
      lineBuffer.assertValid();
    });

    it.each([
      ['hello world', 10, 'o', false, 'hello w'],
      ['hello world', 10, 'o', true, 'hello w'],
      ['hello\nworld', 10, 'o', false, 'hello\nw'],
      ['hello\nworld', 10, 'o', true, 'hello\nw'],
    ])('deleteLeftUntilChar with %s at position %i looking for %s (currentLine: %s) should produce %s',
       (input: string, position: number, c: string, currentLine: boolean, expected: string) => {
      const lineBuffer = bufferWith(input);
      lineBuffer.setInsertionPoint(position);

      lineBuffer.deleteLeftUntilChar(c, currentLine);

      expect(lineBuffer.getBuffer()).toBe(expected);
      lineBuffer.assertValid();
    });
  });

  describe('Line operations', () => {
    it.each([
      ['hello world', 0, 11],
      ['hello\nworld', 0, 5],
      ['hello\nworld', 6, 11],
      ['hello\nworld\n', 6, 11],
    ])('findCurrentLineEnd with %s at position %i should return %i',
       (input: string, inLocation: number, expected: number) => {
      const lineBuffer = bufferWith(input);
      lineBuffer.setInsertionPoint(inLocation);

      const result = lineBuffer.findCurrentLineEnd();

      expect(result).toBe(expected);
      lineBuffer.assertValid();
    });

    it.each([
      ['hello world', 0, 0],
      ['hello\nworld', 0, 0],
      ['hello\nworld', 6, 1],
      ['hello\nworld\n', 6, 1],
      ['hello\nworld\n', 12, 2],
    ])('current line number with %s at position %i should be %i',
       (input: string, inLocation: number, expected: number) => {
      const lineBuffer = bufferWith(input);
      lineBuffer.setInsertionPoint(inLocation);

      const result = lineBuffer.line();

      expect(result).toBe(expected);
      lineBuffer.assertValid();
    });

    it.each([
      ['hello world', 0, 1],
      ['hello\nworld', 0, 2],
      ['hello\nworld\n', 0, 3],
    ])('number of lines with %s at position %i should be %i',
       (input: string, inLocation: number, expected: number) => {
      const lineBuffer = bufferWith(input);
      lineBuffer.setInsertionPoint(inLocation);

      const result = lineBuffer.numLines();

      expect(result).toBe(expected);
      lineBuffer.assertValid();
    });

    it.each([
      ['hello world', 0, 11],
      ['hello\nworld', 0, 5],
      ['hello\nworld', 6, 11],
    ])('moveToLineEnd with %s at position %i should move to %i',
       (input: string, inLocation: number, expected: number) => {
      const lineBuffer = bufferWith(input);
      lineBuffer.setInsertionPoint(inLocation);

      lineBuffer.moveToLineEnd();

      expect(lineBuffer.getInsertionPoint()).toBe(expected);
      lineBuffer.assertValid();
    });

    it.each([
      ['hello world', 5, 0],
      ['hello\nworld', 5, 0],
      ['hello\nworld', 8, 6],
    ])('moveToLineStart with %s at position %i should move to %i',
       (input: string, inLocation: number, expected: number) => {
      const lineBuffer = bufferWith(input);
      lineBuffer.setInsertionPoint(inLocation);

      lineBuffer.moveToLineStart();

      expect(lineBuffer.getInsertionPoint()).toBe(expected);
      lineBuffer.assertValid();
    });

    it.each([
      ['hello world', 5, [0, 11] as [number, number]],
      ['hello\nworld', 5, [0, 5] as [number, number]],
      ['hello\nworld', 8, [6, 11] as [number, number]],
    ])('current line range with %s at position %i should be %s',
       (input: string, inLocation: number, expected: [number, number]) => {
      const lineBuffer = bufferWith(input);
      lineBuffer.setInsertionPoint(inLocation);

      const result = lineBuffer.currentLineRange();

      expect(result).toEqual(expected);
      lineBuffer.assertValid();
    });

    it.each([
      ['hello world', 5, 'hello ', 0],
      ['hello\nworld', 5, 'hello\n', 0],
      ['hello\nworld', 8, 'hello\nwo', 6],
    ])('clearToLineEnd with %s at position %i should produce %s at position %i',
       (input: string, inLocation: number, output: string, outLocation: number) => {
      const lineBuffer = bufferWith(input);
      lineBuffer.setInsertionPoint(inLocation);

      lineBuffer.clearToLineEnd();

      expect(lineBuffer.getBuffer()).toBe(output);
      expect(lineBuffer.getInsertionPoint()).toBe(outLocation);
      lineBuffer.assertValid();
    });
  });

  describe('Word boundary operations', () => {
    it.each([
      ['hello world', 5, 0],
      ['hello world', 6, 0],
      ['hello world', 11, 6],
    ])('wordLeftIndex with %s at position %i should return %i',
       (input: string, position: number, expected: number) => {
      const lineBuffer = bufferWith(input);
      lineBuffer.setInsertionPoint(position);

      const result = lineBuffer.wordLeftIndex();

      expect(result).toBe(expected);
      lineBuffer.assertValid();
    });

    it.each([
      ['hello world', 5, 0],
      ['hello world', 6, 0],
      ['hello world', 11, 6],
    ])('bigWordLeftIndex with %s at position %i should return %i',
       (input: string, position: number, expected: number) => {
      const lineBuffer = bufferWith(input);
      lineBuffer.setInsertionPoint(position);

      const result = lineBuffer.bigWordLeftIndex();

      expect(result).toBe(expected);
      lineBuffer.assertValid();
    });

    it.each([
      ['hello world', 0, 0],
      ['hello world', 5, 6],
      ['hello world', 6, 6],
    ])('wordRightStartIndex with %s at position %i should return %i',
       (input: string, position: number, expected: number) => {
      const lineBuffer = bufferWith(input);
      lineBuffer.setInsertionPoint(position);

      const result = lineBuffer.wordRightStartIndex();

      expect(result).toBe(expected);
      lineBuffer.assertValid();
    });

    it.each([
      ['hello world', 0, 0],
      ['hello world', 5, 6],
      ['hello world', 6, 6],
    ])('bigWordRightStartIndex with %s at position %i should return %i',
       (input: string, position: number, expected: number) => {
      const lineBuffer = bufferWith(input);
      lineBuffer.setInsertionPoint(position);

      const result = lineBuffer.bigWordRightStartIndex();

      expect(result).toBe(expected);
      lineBuffer.assertValid();
    });

    it.each([
      ['hello world', 0, 5],
      ['hello world', 5, 11],
      ['hello world', 6, 11],
    ])('wordRightEndIndex with %s at position %i should return %i',
       (input: string, position: number, expected: number) => {
      const lineBuffer = bufferWith(input);
      lineBuffer.setInsertionPoint(position);

      const result = lineBuffer.wordRightEndIndex();

      expect(result).toBe(expected);
      lineBuffer.assertValid();
    });

    it.each([
      ['hello world', 0, 5],
      ['hello world', 5, 11],
      ['hello world', 6, 11],
    ])('bigWordRightEndIndex with %s at position %i should return %i',
       (input: string, position: number, expected: number) => {
      const lineBuffer = bufferWith(input);
      lineBuffer.setInsertionPoint(position);

      const result = lineBuffer.bigWordRightEndIndex();

      expect(result).toBe(expected);
      lineBuffer.assertValid();
    });

    it.each([
      ['hello world', 0, 5],
      ['hello world', 5, 6],
      ['hello world', 6, 11],
    ])('nextWhitespace with %s at position %i should return %i',
       (input: string, position: number, expected: number) => {
      const lineBuffer = bufferWith(input);
      lineBuffer.setInsertionPoint(position);

      const result = lineBuffer.nextWhitespace();

      expect(result).toBe(expected);
      lineBuffer.assertValid();
    });
  });

  describe('Grapheme operations', () => {
    it.each([
      ['hello', 0, 1],
      ['hello', 1, 2],
      ['hello', 4, 5],
      ['😊hello', 0, 2], // Emoji is 2 code units
      ['😊hello', 2, 3],
    ])('graphemeRightIndexFromPos with %s at position %i should return %i',
       (input: string, position: number, expected: number) => {
      const lineBuffer = bufferWith(input);

      const result = lineBuffer.graphemeRightIndexFromPos(position);

      expect(result).toBe(expected);
      lineBuffer.assertValid();
    });
  });

  describe('Matching pairs', () => {
    it.each([
      ['(hello)', 0, '(', ')', [0, 6] as [number, number]],
      ['(hello)', 6, '(', ')', [0, 6] as [number, number]],
      ['(hello)', 3, '(', ')', [0, 6] as [number, number]],
      ['(hello', 0, '(', ')', null],
      ['hello)', 0, '(', ')', null],
      ['(hello) world', 0, '(', ')', [0, 6] as [number, number]],
      ['(hello) world', 6, '(', ')', [0, 6] as [number, number]],
    ])('findMatchingPair with %s at cursor %i looking for %s/%s should find %s',
       (input: string, cursor: number, leftChar: string, rightChar: string, expected: [number, number] | null) => {
      const lineBuffer = bufferWith(input);

      const result = lineBuffer.findMatchingPair(leftChar, rightChar, cursor);

      expect(result).toEqual(expected);
      lineBuffer.assertValid();
    });
  });

  describe('Utility methods', () => {
    it('endsWith works correctly', () => {
      const lineBuffer = bufferWith('hello world');
      expect(lineBuffer.endsWith('world')).toBe(true);
      expect(lineBuffer.endsWith('hello')).toBe(false);
    });

    it('len returns correct length', () => {
      const lineBuffer = bufferWith('hello world');
      expect(lineBuffer.len()).toBe(11);
    });

    it('onWhitespace detects whitespace correctly', () => {
      const lineBuffer = bufferWith('hello world');
      expect(lineBuffer.onWhitespace()).toBe(false);
      
      lineBuffer.setInsertionPoint(5);
      expect(lineBuffer.onWhitespace()).toBe(true);
    });

    it('graphemeRight and graphemeLeft work correctly', () => {
      const lineBuffer = bufferWith('hello');
      expect(lineBuffer.graphemeRight()).toBe('h');
      expect(lineBuffer.graphemeLeft()).toBe('');
      
      lineBuffer.setInsertionPoint(1);
      expect(lineBuffer.graphemeRight()).toBe('e');
      expect(lineBuffer.graphemeLeft()).toBe('h');
    });

    it('currentWordRange returns correct range', () => {
      const lineBuffer = bufferWith('hello world');
      expect(lineBuffer.currentWordRange()).toEqual([0, 5]);
      
      lineBuffer.setInsertionPoint(6);
      expect(lineBuffer.currentWordRange()).toEqual([6, 11]);
    });

    it('currentLineRange returns correct range', () => {
      const lineBuffer = bufferWith('hello\nworld');
      expect(lineBuffer.currentLineRange()).toEqual([0, 5]);
      
      lineBuffer.setInsertionPoint(6);
      expect(lineBuffer.currentLineRange()).toEqual([6, 11]);
    });
  });

  describe('Edge cases and Unicode handling', () => {
    it('handles empty buffer correctly', () => {
      const lineBuffer = LineBuffer.new();
      expect(lineBuffer.isEmpty()).toBe(true);
      expect(lineBuffer.len()).toBe(0);
      expect(lineBuffer.getInsertionPoint()).toBe(0);
      expect(lineBuffer.isValid()).toBe(true);
    });

    it('handles single character correctly', () => {
      const lineBuffer = bufferWith('a');
      expect(lineBuffer.len()).toBe(1);
      expect(lineBuffer.getInsertionPoint()).toBe(1);
      expect(lineBuffer.isValid()).toBe(true);
    });

    it('handles Unicode characters correctly', () => {
      const lineBuffer = bufferWith('😊hello');
      expect(lineBuffer.len()).toBe(7); // 2 for emoji + 5 for hello
      expect(lineBuffer.getInsertionPoint()).toBe(7);
      expect(lineBuffer.isValid()).toBe(true);
    });

    it('handles multiline text correctly', () => {
      const lineBuffer = bufferWith('line1\nline2\nline3');
      expect(lineBuffer.numLines()).toBe(3);
      expect(lineBuffer.line()).toBe(2); // Cursor at end, so on last line
    });

    it('handles invalid insertion points gracefully', () => {
      const lineBuffer = bufferWith('hello');
      lineBuffer.setInsertionPoint(100); // Beyond buffer length
      expect(lineBuffer.isValid()).toBe(false);
    });
  });
}); 