/**
 * In memory representation of the entered line(s) including a cursor position to facilitate cursor based editing.
 */
export class LineBuffer {
  private lines: string;
  private insertionPoint: number;

  constructor() {
    this.lines = '';
    this.insertionPoint = 0;
  }

  /**
   * Create a line buffer instance
   */
  static new(): LineBuffer {
    return new LineBuffer();
  }

  /**
   * Create a line buffer from a string
   */
  static from(input: string): LineBuffer {
    const lineBuffer = new LineBuffer();
    lineBuffer.insertStr(input);
    return lineBuffer;
  }

  /**
   * Check to see if the line buffer is empty
   */
  isEmpty(): boolean {
    return this.lines.length === 0;
  }

  /**
   * Check if the line buffer is valid utf-8 and the cursor sits on a valid grapheme boundary
   */
  isValid(): boolean {
    // Check if insertion point is at a valid character boundary
    if (this.insertionPoint > this.lines.length) {
      return false;
    }

    // Check if we're at a valid grapheme boundary
    const graphemeIndices = this.getGraphemeIndices();
    const isValidGraphemeBoundary = graphemeIndices.some(
      (index) => index === this.insertionPoint
    ) || this.insertionPoint === this.lines.length;

    return isValidGraphemeBoundary;
  }

  /**
   * Gets the current edit position
   */
  getInsertionPoint(): number {
    return this.insertionPoint;
  }

  /**
   * Sets the current edit position
   * @param offset The new insertion point position
   */
  setInsertionPoint(offset: number): void {
    this.insertionPoint = offset;
  }

  /**
   * Output the current line in the multiline buffer
   */
  getBuffer(): string {
    return this.lines;
  }

  /**
   * Set to a single line of `buffer` and reset the `InsertionPoint` cursor to the end
   */
  setBuffer(buffer: string): void {
    this.lines = buffer;
    this.insertionPoint = this.lines.length;
  }

  /**
   * Calculates the current line the user is on
   * Zero-based index
   */
  line(): number {
    return this.lines.substring(0, this.insertionPoint).split('\n').length - 1;
  }

  /**
   * Counts the number of lines in the buffer
   */
  numLines(): number {
    return this.lines.split('\n').length;
  }

  /**
   * Checks to see if the buffer ends with a given character
   */
  endsWith(c: string): boolean {
    return this.lines.endsWith(c);
  }

  /**
   * Reset the insertion point to the start of the buffer
   */
  moveToStart(): void {
    this.insertionPoint = 0;
  }

  /**
   * Move the cursor before the first character of the line
   */
  moveToLineStart(): void {
    const beforeCursor = this.lines.substring(0, this.insertionPoint);
    const lastNewline = beforeCursor.lastIndexOf('\n');
    this.insertionPoint = lastNewline === -1 ? 0 : lastNewline + 1;
  }

  /**
   * Move cursor position to the end of the line
   * Insertion will append to the line.
   * Cursor on top of the potential `\n` or `\r` of `\r\n`
   */
  moveToLineEnd(): void {
    this.insertionPoint = this.findCurrentLineEnd();
  }

  /**
   * Set the insertion point *behind* the last character.
   */
  moveToEnd(): void {
    this.insertionPoint = this.lines.length;
  }

  /**
   * Get the length of the buffer
   */
  len(): number {
    return this.lines.length;
  }

  /**
   * Returns where the current line terminates
   * Either:
   * - end of buffer (`len()`)
   * - `\n` or `\r\n` (on the first byte)
   */
  findCurrentLineEnd(): number {
    const fromCursor = this.lines.substring(this.insertionPoint);
    const newlineIndex = fromCursor.indexOf('\n');
    
    if (newlineIndex === -1) {
      return this.lines.length;
    }

    const absoluteIndex = newlineIndex + this.insertionPoint;
    if (absoluteIndex > 0 && this.lines.charCodeAt(absoluteIndex - 1) === 13) { // '\r'
      return absoluteIndex - 1;
    } else {
      return absoluteIndex;
    }
  }

  /**
   * Cursor position *behind* the next unicode grapheme to the right
   */
  graphemeRightIndex(): number {
    const graphemeIndices = this.getGraphemeIndices();
    const currentIndex = graphemeIndices.findIndex(index => index === this.insertionPoint);
    
    if (currentIndex === -1 || currentIndex + 1 >= graphemeIndices.length) {
      return this.lines.length;
    }
    
    return graphemeIndices[currentIndex + 1];
  }

  /**
   * Cursor position *in front of* the next unicode grapheme to the left
   */
  graphemeLeftIndex(): number {
    const graphemeIndices = this.getGraphemeIndices();
    const currentIndex = graphemeIndices.findIndex(index => index === this.insertionPoint);
    
    if (currentIndex <= 0) {
      return 0;
    }
    
    return graphemeIndices[currentIndex - 1];
  }

  /**
   * Cursor position *behind* the next unicode grapheme to the right from the given position
   */
  graphemeRightIndexFromPos(pos: number): number {
    const graphemeIndices = this.getGraphemeIndices();
    const currentIndex = graphemeIndices.findIndex(index => index === pos);
    
    if (currentIndex === -1 || currentIndex + 1 >= graphemeIndices.length) {
      return this.lines.length;
    }
    
    return graphemeIndices[currentIndex + 1];
  }

  /**
   * Cursor position *behind* the next word to the right
   */
  wordRightIndex(): number {
    const fromCursor = this.lines.substring(this.insertionPoint);
    const words = this.splitWordBoundaries(fromCursor);
    
    for (const [index, word] of words) {
      if (!this.isWhitespaceStr(word)) {
        return this.insertionPoint + index + word.length;
      }
    }
    
    return this.lines.length;
  }

  /**
   * Cursor position *behind* the next WORD to the right
   */
  bigWordRightIndex(): number {
    const fromCursor = this.lines.substring(this.insertionPoint);
    const words = this.splitWordBoundaries(fromCursor);
    let foundWs = false;

    for (const [index, word] of words) {
      foundWs = foundWs || this.isWhitespaceStr(word);
      if (foundWs && !this.isWhitespaceStr(word)) {
        return this.insertionPoint + index + word.length;
      }
    }
    
    return this.lines.length;
  }

  /**
   * Cursor position *behind* the next word to the right (end of word)
   */
  wordRightEndIndex(): number {
    const fromCursor = this.lines.substring(this.insertionPoint);
    const words = this.splitWordBoundaries(fromCursor);
    let foundNonWs = false;

    for (const [index, word] of words) {
      if (!this.isWhitespaceStr(word)) {
        foundNonWs = true;
      } else if (foundNonWs) {
        return this.insertionPoint + index;
      }
    }
    
    return this.lines.length;
  }

  /**
   * Cursor position *behind* the next WORD to the right (end of word)
   */
  bigWordRightEndIndex(): number {
    const fromCursor = this.lines.substring(this.insertionPoint);
    const words = this.splitWordBoundaries(fromCursor);
    let foundNonWs = false;

    for (const [index, word] of words) {
      if (!this.isWhitespaceStr(word)) {
        foundNonWs = true;
      } else if (foundNonWs) {
        return this.insertionPoint + index;
      }
    }
    
    return this.lines.length;
  }

  /**
   * Cursor position *at the start* of the next word to the right
   */
  wordRightStartIndex(): number {
    const fromCursor = this.lines.substring(this.insertionPoint);
    const words = this.splitWordBoundaries(fromCursor);
    
    for (const [index, word] of words) {
      if (!this.isWhitespaceStr(word)) {
        return this.insertionPoint + index;
      }
    }
    
    return this.lines.length;
  }

  /**
   * Cursor position *at the start* of the next WORD to the right
   */
  bigWordRightStartIndex(): number {
    const fromCursor = this.lines.substring(this.insertionPoint);
    const words = this.splitWordBoundaries(fromCursor);
    let foundWs = false;

    for (const [index, word] of words) {
      foundWs = foundWs || this.isWhitespaceStr(word);
      if (foundWs && !this.isWhitespaceStr(word)) {
        return this.insertionPoint + index;
      }
    }
    
    return this.lines.length;
  }

  /**
   * Cursor position *at the start* of the word to the left
   */
  wordLeftIndex(): number {
    const beforeCursor = this.lines.substring(0, this.insertionPoint);
    const words = this.splitWordBoundaries(beforeCursor);
    
    for (let i = words.length - 1; i >= 0; i--) {
      const [index, word] = words[i];
      if (!this.isWhitespaceStr(word)) {
        return index;
      }
    }
    
    return 0;
  }

  /**
   * Cursor position *at the start* of the WORD to the left
   */
  bigWordLeftIndex(): number {
    const beforeCursor = this.lines.substring(0, this.insertionPoint);
    const words = this.splitWordBoundaries(beforeCursor);
    let foundWs = false;

    for (let i = words.length - 1; i >= 0; i--) {
      const [index, word] = words[i];
      foundWs = foundWs || this.isWhitespaceStr(word);
      if (foundWs && !this.isWhitespaceStr(word)) {
        return index;
      }
    }
    
    return 0;
  }

  /**
   * Find the next whitespace position from the current insertion point
   */
  nextWhitespace(): number {
    const fromCursor = this.lines.substring(this.insertionPoint);
    const whitespaceIndex = fromCursor.search(/\s/);
    return whitespaceIndex === -1 
      ? this.lines.length 
      : this.insertionPoint + whitespaceIndex;
  }

  /**
   * Move the cursor one grapheme to the right
   */
  moveRight(): void {
    this.insertionPoint = this.graphemeRightIndex();
  }

  /**
   * Move the cursor one grapheme to the left
   */
  moveLeft(): void {
    this.insertionPoint = this.graphemeLeftIndex();
  }

  /**
   * Move the cursor one word to the left
   */
  moveWordLeft(): void {
    this.insertionPoint = this.wordLeftIndex();
  }

  /**
   * Move the cursor one WORD to the left
   */
  moveBigWordLeft(): void {
    this.insertionPoint = this.bigWordLeftIndex();
  }

  /**
   * Move the cursor one word to the right
   */
  moveWordRight(): void {
    this.insertionPoint = this.wordRightIndex();
  }

  /**
   * Move the cursor to the start of the next word
   */
  moveWordRightStart(): void {
    this.insertionPoint = this.wordRightStartIndex();
  }

  /**
   * Move the cursor to the start of the next WORD
   */
  moveBigWordRightStart(): void {
    this.insertionPoint = this.bigWordRightStartIndex();
  }

  /**
   * Move the cursor to the end of the next word
   */
  moveWordRightEnd(): void {
    this.insertionPoint = this.wordRightEndIndex();
  }

  /**
   * Move the cursor to the end of the next WORD
   */
  moveBigWordRightEnd(): void {
    this.insertionPoint = this.bigWordRightEndIndex();
  }

  /**
   * Insert a character at the current insertion point
   */
  insertChar(c: string): void {
    this.lines = this.lines.substring(0, this.insertionPoint) + 
                 c + 
                 this.lines.substring(this.insertionPoint);
    this.insertionPoint += c.length;
  }

  /**
   * Insert a string at the current insertion point
   */
  insertStr(string: string): void {
    this.lines = this.lines.substring(0, this.insertionPoint) + 
                 string + 
                 this.lines.substring(this.insertionPoint);
    this.insertionPoint += string.length;
  }

  /**
   * Insert a newline at the current insertion point
   */
  insertNewline(): void {
    this.insertChar('\n');
  }

  /**
   * Clear the entire buffer and reset insertion point
   */
  clear(): void {
    this.lines = '';
    this.insertionPoint = 0;
  }

  /**
   * Clear from insertion point to end of buffer
   */
  clearToEnd(): void {
    this.lines = this.lines.substring(0, this.insertionPoint);
  }

  /**
   * Clear from insertion point to end of current line
   */
  clearToLineEnd(): void {
    const lineEnd = this.findCurrentLineEnd();
    this.lines = this.lines.substring(0, this.insertionPoint) + 
                 this.lines.substring(lineEnd);
  }

  /**
   * Clear from start of buffer to insertion point
   */
  clearToInsertionPoint(): void {
    this.lines = this.lines.substring(this.insertionPoint);
    this.insertionPoint = 0;
  }

  /**
   * Clear a range of characters safely
   */
  clearRangeSafe(start: number, end: number): void {
    if (start > end) {
      [start, end] = [end, start];
    }
    
    if (start >= this.lines.length) {
      return;
    }
    
    end = Math.min(end, this.lines.length);
    
    this.lines = this.lines.substring(0, start) + this.lines.substring(end);
    
    if (this.insertionPoint > start) {
      if (this.insertionPoint > end) {
        this.insertionPoint -= (end - start);
      } else {
        this.insertionPoint = start;
      }
    }
  }

  /**
   * Replace a range of characters
   */
  replaceRange(start: number, end: number, replaceWith: string): void {
    if (start > end) {
      [start, end] = [end, start];
    }
    
    if (start >= this.lines.length) {
      return;
    }
    
    end = Math.min(end, this.lines.length);
    
    this.lines = this.lines.substring(0, start) + 
                 replaceWith + 
                 this.lines.substring(end);
    
    if (this.insertionPoint > start) {
      if (this.insertionPoint > end) {
        this.insertionPoint = start + replaceWith.length + (this.insertionPoint - end);
      } else {
        this.insertionPoint = start + replaceWith.length;
      }
    }
  }

  /**
   * Check if the cursor is on whitespace
   */
  onWhitespace(): boolean {
    if (this.insertionPoint >= this.lines.length) {
      return false;
    }
    return /\s/.test(this.lines[this.insertionPoint]);
  }

  /**
   * Get the grapheme to the right of the cursor
   */
  graphemeRight(): string {
    const rightIndex = this.graphemeRightIndex();
    return this.lines.substring(this.insertionPoint, rightIndex);
  }

  /**
   * Get the grapheme to the left of the cursor
   */
  graphemeLeft(): string {
    const leftIndex = this.graphemeLeftIndex();
    return this.lines.substring(leftIndex, this.insertionPoint);
  }

  /**
   * Get the range of the current word
   */
  currentWordRange(): [number, number] {
    const start = this.wordLeftIndex();
    const end = this.wordRightIndex();
    return [start, end];
  }

  /**
   * Get the range of the current line
   */
  currentLineRange(): [number, number] {
    const beforeCursor = this.lines.substring(0, this.insertionPoint);
    const lineStart = beforeCursor.lastIndexOf('\n') + 1;
    const lineEnd = this.findCurrentLineEnd();
    return [lineStart, lineEnd];
  }

  /**
   * Convert the current word to uppercase
   */
  uppercaseWord(): void {
    const [start, end] = this.currentWordRange();
    const word = this.lines.substring(start, end);
    this.replaceRange(start, end, word.toUpperCase());
  }

  /**
   * Convert the current word to lowercase
   */
  lowercaseWord(): void {
    const [start, end] = this.currentWordRange();
    const word = this.lines.substring(start, end);
    this.replaceRange(start, end, word.toLowerCase());
  }

  /**
   * Switch the case of the character at the cursor
   */
  switchcaseChar(): void {
    if (this.insertionPoint >= this.lines.length) {
      return;
    }
    
    const char = this.lines[this.insertionPoint];
    const newChar = char === char.toUpperCase() 
      ? char.toLowerCase() 
      : char.toUpperCase();
    
    this.replaceRange(this.insertionPoint, this.insertionPoint + 1, newChar);
  }

  /**
   * Capitalize the character at the cursor
   */
  capitalizeChar(): void {
    if (this.insertionPoint >= this.lines.length) {
      return;
    }
    
    const char = this.lines[this.insertionPoint];
    const newChar = char.toUpperCase();
    
    this.replaceRange(this.insertionPoint, this.insertionPoint + 1, newChar);
    this.moveRight();
  }

  /**
   * Delete the grapheme to the left of the cursor
   */
  deleteLeftGrapheme(): void {
    const leftIndex = this.graphemeLeftIndex();
    this.clearRangeSafe(leftIndex, this.insertionPoint);
  }

  /**
   * Delete the grapheme to the right of the cursor
   */
  deleteRightGrapheme(): void {
    const rightIndex = this.graphemeRightIndex();
    this.clearRangeSafe(this.insertionPoint, rightIndex);
  }

  /**
   * Delete the word to the left of the cursor
   */
  deleteWordLeft(): void {
    const leftIndex = this.wordLeftIndex();
    this.clearRangeSafe(leftIndex, this.insertionPoint);
  }

  /**
   * Delete the word to the right of the cursor
   */
  deleteWordRight(): void {
    const rightIndex = this.wordRightIndex();
    this.clearRangeSafe(this.insertionPoint, rightIndex);
  }

  /**
   * Swap the current word with the next word
   */
  swapWords(): void {
    const [currentStart, currentEnd] = this.currentWordRange();
    const currentWord = this.lines.substring(currentStart, currentEnd);
    
    const nextWordStart = this.wordRightStartIndex();
    const nextWordEnd = this.wordRightIndex();
    const nextWord = this.lines.substring(nextWordStart, nextWordEnd);
    
    if (nextWordStart < this.lines.length) {
      this.replaceRange(nextWordStart, nextWordEnd, currentWord);
      this.replaceRange(currentStart, currentEnd, nextWord);
    }
  }

  /**
   * Swap the grapheme at cursor with the one to the right
   */
  swapGraphemes(): void {
    const rightIndex = this.graphemeRightIndex();
    if (rightIndex >= this.lines.length) {
      return;
    }
    
    const leftGrapheme = this.graphemeLeft();
    const rightGrapheme = this.graphemeRight();
    
    if (leftGrapheme && rightGrapheme) {
      const leftIndex = this.graphemeLeftIndex();
      this.replaceRange(leftIndex, this.insertionPoint, rightGrapheme);
      this.replaceRange(this.insertionPoint, rightIndex, leftGrapheme);
    }
  }

  /**
   * Move the cursor up one line
   */
  moveLineUp(): void {
    const beforeCursor = this.lines.substring(0, this.insertionPoint);
    const lines = beforeCursor.split('\n');
    
    if (lines.length <= 1) {
      return;
    }
    
    const currentLineIndex = lines.length - 1;
    const currentLineStart = beforeCursor.lastIndexOf('\n') + 1;
    const currentLineOffset = this.insertionPoint - currentLineStart;
    
    const targetLine = lines[currentLineIndex - 1];
    const targetLineStart = beforeCursor.lastIndexOf('\n', currentLineStart - 2) + 1;
    
    const newOffset = Math.min(currentLineOffset, targetLine.length);
    this.insertionPoint = targetLineStart + newOffset;
  }

  /**
   * Move the cursor down one line
   */
  moveLineDown(): void {
    const afterCursor = this.lines.substring(this.insertionPoint);
    const lines = afterCursor.split('\n');
    
    if (lines.length <= 1) {
      return;
    }
    
    const beforeCursor = this.lines.substring(0, this.insertionPoint);
    const currentLineStart = beforeCursor.lastIndexOf('\n') + 1;
    const currentLineOffset = this.insertionPoint - currentLineStart;
    
    const nextLineStart = this.insertionPoint + lines[0].length + 1;
    const nextLine = lines[1];
    
    const newOffset = Math.min(currentLineOffset, nextLine.length);
    this.insertionPoint = nextLineStart + newOffset;
  }

  /**
   * Check if cursor is at the first line
   */
  isCursorAtFirstLine(): boolean {
    return this.line() === 0;
  }

  /**
   * Check if cursor is at the last line
   */
  isCursorAtLastLine(): boolean {
    return this.line() === this.numLines() - 1;
  }

  /**
   * Find a character to the right of the cursor
   */
  findCharRight(c: string, currentLine: boolean): number | null {
    const searchStart = this.insertionPoint;
    const searchEnd = currentLine ? this.findCurrentLineEnd() : this.lines.length;
    const searchText = this.lines.substring(searchStart, searchEnd);
    const index = searchText.indexOf(c);
    
    return index === -1 ? null : searchStart + index;
  }

  /**
   * Find a character to the left of the cursor
   */
  findCharLeft(c: string, currentLine: boolean): number | null {
    const searchEnd = this.insertionPoint;
    const searchStart = currentLine ? this.lines.substring(0, this.insertionPoint).lastIndexOf('\n') + 1 : 0;
    const searchText = this.lines.substring(searchStart, searchEnd);
    const index = searchText.lastIndexOf(c);
    
    return index === -1 ? null : searchStart + index;
  }

  /**
   * Move cursor right until a character is found
   */
  moveRightUntil(c: string, currentLine: boolean): number {
    const found = this.findCharRight(c, currentLine);
    if (found !== null) {
      this.insertionPoint = found;
    }
    return this.insertionPoint;
  }

  /**
   * Move cursor right before a character
   */
  moveRightBefore(c: string, currentLine: boolean): number {
    const found = this.findCharRight(c, currentLine);
    if (found !== null) {
      this.insertionPoint = found;
    }
    return this.insertionPoint;
  }

  /**
   * Move cursor left until a character is found
   */
  moveLeftUntil(c: string, currentLine: boolean): number {
    const found = this.findCharLeft(c, currentLine);
    if (found !== null) {
      this.insertionPoint = found;
    }
    return this.insertionPoint;
  }

  /**
   * Move cursor left before a character
   */
  moveLeftBefore(c: string, currentLine: boolean): number {
    const found = this.findCharLeft(c, currentLine);
    if (found !== null) {
      this.insertionPoint = found;
    }
    return this.insertionPoint;
  }

  /**
   * Delete from cursor right until a character
   */
  deleteRightUntilChar(c: string, currentLine: boolean): void {
    const found = this.findCharRight(c, currentLine);
    if (found !== null) {
      this.clearRangeSafe(this.insertionPoint, found);
    }
  }

  /**
   * Delete from cursor right before a character
   */
  deleteRightBeforeChar(c: string, currentLine: boolean): void {
    const found = this.findCharRight(c, currentLine);
    if (found !== null) {
      this.clearRangeSafe(this.insertionPoint, found);
    }
  }

  /**
   * Delete from cursor left until a character
   */
  deleteLeftUntilChar(c: string, currentLine: boolean): void {
    const found = this.findCharLeft(c, currentLine);
    if (found !== null) {
      this.clearRangeSafe(found, this.insertionPoint);
    }
  }

  /**
   * Delete from cursor left before a character
   */
  deleteLeftBeforeChar(c: string, currentLine: boolean): void {
    const found = this.findCharLeft(c, currentLine);
    if (found !== null) {
      this.clearRangeSafe(found, this.insertionPoint);
    }
  }

  /**
   * Find matching pair of characters (brackets, quotes, etc.)
   */
  findMatchingPair(leftChar: string, rightChar: string, cursor: number): [number, number] | null {
    const stack: number[] = [];
    
    for (let i = 0; i < this.lines.length; i++) {
      const char = this.lines[i];
      
      if (char === leftChar) {
        stack.push(i);
      } else if (char === rightChar) {
        if (stack.length === 0) {
          continue;
        }
        
        const leftIndex = stack.pop()!;
        if (i === cursor) {
          return [leftIndex, i];
        } else if (leftIndex === cursor) {
          return [leftIndex, i];
        }
      }
    }
    
    return null;
  }

  // Helper methods

  /**
   * Get grapheme indices for the entire buffer
   */
  private getGraphemeIndices(): number[] {
    const indices: number[] = [0];
    
    // Use Array.from to get proper Unicode code points
    const chars = Array.from(this.lines);
    let currentIndex = 0;
    
    for (const char of chars) {
      currentIndex += char.length;
      indices.push(currentIndex);
    }
    
    return indices;
  }

  /**
   * Split text into word boundaries with indices
   */
  private splitWordBoundaries(text: string): [number, string][] {
    const result: [number, string][] = [];
    const matches = text.match(/\b\w+|\s+|[^\w\s]/g) || [];
    
    let currentIndex = 0;
    for (const match of matches) {
      result.push([currentIndex, match]);
      currentIndex += match.length;
    }
    
    return result;
  }

  /**
   * Check if a string consists only of whitespace
   */
  private isWhitespaceStr(s: string): boolean {
    return /^\s*$/.test(s);
  }

  /**
   * Assert that the buffer is valid (for testing)
   */
  assertValid(): void {
    if (!this.isValid()) {
      throw new Error('LineBuffer is not valid');
    }
  }
} 