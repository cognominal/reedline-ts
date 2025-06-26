import { describe, it, expect } from 'vitest';
import {
  Signal,
  EditCommand,
  ReedlineEvent,
  EditType,
  UndoBehavior,
  EventStatus,
  type Signal as SignalType,
  type EditCommand as EditCommandType,
  type ReedlineEvent as ReedlineEventType,
} from './types';

describe('Signal', () => {
  it('should create Success signal', () => {
    const signal = Signal.Success('test content');
    expect(signal).toEqual({ type: 'Success', content: 'test content' });
    expect(signal.type).toBe('Success');
    expect(signal.content).toBe('test content');
  });

  it('should create CtrlC signal', () => {
    const signal = Signal.CtrlC();
    expect(signal).toEqual({ type: 'CtrlC' });
    expect(signal.type).toBe('CtrlC');
  });

  it('should create CtrlD signal', () => {
    const signal = Signal.CtrlD();
    expect(signal).toEqual({ type: 'CtrlD' });
    expect(signal.type).toBe('CtrlD');
  });
});

describe('EditCommand', () => {
  it('should create movement commands', () => {
    const moveLeft = EditCommand.MoveLeft();
    expect(moveLeft).toEqual({ type: 'MoveLeft', select: false });
    expect(moveLeft.type).toBe('MoveLeft');

    const moveRightWithSelect = EditCommand.MoveRight(true);
    expect(moveRightWithSelect).toEqual({ type: 'MoveRight', select: true });
  });

  it('should create insertion commands', () => {
    const insertChar = EditCommand.InsertChar('a');
    expect(insertChar).toEqual({ type: 'InsertChar', character: 'a' });

    const insertString = EditCommand.InsertString('hello');
    expect(insertString).toEqual({ type: 'InsertString', string: 'hello' });

    const insertNewline = EditCommand.InsertNewline();
    expect(insertNewline).toEqual({ type: 'InsertNewline' });
  });

  it('should create deletion commands', () => {
    const backspace = EditCommand.Backspace();
    expect(backspace).toEqual({ type: 'Backspace' });

    const deleteCmd = EditCommand.Delete();
    expect(deleteCmd).toEqual({ type: 'Delete' });

    const clear = EditCommand.Clear();
    expect(clear).toEqual({ type: 'Clear' });
  });

  it('should create cut commands', () => {
    const cutCurrentLine = EditCommand.CutCurrentLine();
    expect(cutCurrentLine).toEqual({ type: 'CutCurrentLine' });

    const cutWordLeft = EditCommand.CutWordLeft();
    expect(cutWordLeft).toEqual({ type: 'CutWordLeft' });
  });

  it('should create paste commands', () => {
    const pasteBefore = EditCommand.PasteCutBufferBefore();
    expect(pasteBefore).toEqual({ type: 'PasteCutBufferBefore' });

    const pasteAfter = EditCommand.PasteCutBufferAfter();
    expect(pasteAfter).toEqual({ type: 'PasteCutBufferAfter' });
  });

  it('should create case manipulation commands', () => {
    const uppercase = EditCommand.UppercaseWord();
    expect(uppercase).toEqual({ type: 'UppercaseWord' });

    const lowercase = EditCommand.LowercaseWord();
    expect(lowercase).toEqual({ type: 'LowercaseWord' });

    const capitalize = EditCommand.CapitalizeChar();
    expect(capitalize).toEqual({ type: 'CapitalizeChar' });
  });

  it('should create undo/redo commands', () => {
    const undo = EditCommand.Undo();
    expect(undo).toEqual({ type: 'Undo' });

    const redo = EditCommand.Redo();
    expect(redo).toEqual({ type: 'Redo' });
  });

  it('should create cut until/before commands', () => {
    const cutUntil = EditCommand.CutRightUntil('x');
    expect(cutUntil).toEqual({ type: 'CutRightUntil', character: 'x' });

    const cutBefore = EditCommand.CutRightBefore('y');
    expect(cutBefore).toEqual({ type: 'CutRightBefore', character: 'y' });
  });

  it('should create move until/before commands', () => {
    const moveUntil = EditCommand.MoveRightUntil('x', true);
    expect(moveUntil).toEqual({ type: 'MoveRightUntil', character: 'x', select: true });

    const moveBefore = EditCommand.MoveLeftBefore('y');
    expect(moveBefore).toEqual({ type: 'MoveLeftBefore', character: 'y', select: false });
  });

  it('should create selection commands', () => {
    const selectAll = EditCommand.SelectAll();
    expect(selectAll).toEqual({ type: 'SelectAll' });

    const cutSelection = EditCommand.CutSelection();
    expect(cutSelection).toEqual({ type: 'CutSelection' });
  });

  it('should create copy commands', () => {
    const copyFromStart = EditCommand.CopyFromStart();
    expect(copyFromStart).toEqual({ type: 'CopyFromStart' });

    const copyWordLeft = EditCommand.CopyWordLeft();
    expect(copyWordLeft).toEqual({ type: 'CopyWordLeft' });
  });

  it('should create system clipboard commands', () => {
    const cutSystem = EditCommand.CutSelectionSystem();
    expect(cutSystem).toEqual({ type: 'CutSelectionSystem' });

    const copySystem = EditCommand.CopySelectionSystem();
    expect(copySystem).toEqual({ type: 'CopySelectionSystem' });
  });

  it('should create cut/copy inside commands', () => {
    const cutInside = EditCommand.CutInside('(', ')');
    expect(cutInside).toEqual({ type: 'CutInside', left: '(', right: ')' });

    const yankInside = EditCommand.YankInside('[', ']');
    expect(yankInside).toEqual({ type: 'YankInside', left: '[', right: ']' });
  });
});

describe('ReedlineEvent', () => {
  it('should create basic events', () => {
    const none = ReedlineEvent.None();
    expect(none).toEqual({ type: 'None' });

    const enter = ReedlineEvent.Enter();
    expect(enter).toEqual({ type: 'Enter' });

    const esc = ReedlineEvent.Esc();
    expect(esc).toEqual({ type: 'Esc' });
  });

  it('should create control events', () => {
    const ctrlC = ReedlineEvent.CtrlC();
    expect(ctrlC).toEqual({ type: 'CtrlC' });

    const ctrlD = ReedlineEvent.CtrlD();
    expect(ctrlD).toEqual({ type: 'CtrlD' });
  });

  it('should create screen events', () => {
    const clearScreen = ReedlineEvent.ClearScreen();
    expect(clearScreen).toEqual({ type: 'ClearScreen' });

    const clearScrollback = ReedlineEvent.ClearScrollback();
    expect(clearScrollback).toEqual({ type: 'ClearScrollback' });
  });

  it('should create submit events', () => {
    const submit = ReedlineEvent.Submit();
    expect(submit).toEqual({ type: 'Submit' });

    const submitOrNewline = ReedlineEvent.SubmitOrNewline();
    expect(submitOrNewline).toEqual({ type: 'SubmitOrNewline' });
  });

  it('should create resize event', () => {
    const resize = ReedlineEvent.Resize(80, 24);
    expect(resize).toEqual({ type: 'Resize', width: 80, height: 24 });
  });

  it('should create edit event', () => {
    const commands = [EditCommand.MoveLeft(), EditCommand.InsertChar('a')];
    const edit = ReedlineEvent.Edit(commands);
    expect(edit).toEqual({ type: 'Edit', commands });
  });

  it('should create navigation events', () => {
    const up = ReedlineEvent.Up();
    expect(up).toEqual({ type: 'Up' });

    const down = ReedlineEvent.Down();
    expect(down).toEqual({ type: 'Down' });

    const left = ReedlineEvent.Left();
    expect(left).toEqual({ type: 'Left' });

    const right = ReedlineEvent.Right();
    expect(right).toEqual({ type: 'Right' });
  });

  it('should create history events', () => {
    const previousHistory = ReedlineEvent.PreviousHistory();
    expect(previousHistory).toEqual({ type: 'PreviousHistory' });

    const nextHistory = ReedlineEvent.NextHistory();
    expect(nextHistory).toEqual({ type: 'NextHistory' });

    const searchHistory = ReedlineEvent.SearchHistory();
    expect(searchHistory).toEqual({ type: 'SearchHistory' });
  });

  it('should create menu events', () => {
    const menu = ReedlineEvent.Menu('completion');
    expect(menu).toEqual({ type: 'Menu', name: 'completion' });

    const menuNext = ReedlineEvent.MenuNext();
    expect(menuNext).toEqual({ type: 'MenuNext' });

    const menuUp = ReedlineEvent.MenuUp();
    expect(menuUp).toEqual({ type: 'MenuUp' });
  });

  it('should create complex events', () => {
    const events = [ReedlineEvent.Up(), ReedlineEvent.Down()];
    const multiple = ReedlineEvent.Multiple(events);
    expect(multiple).toEqual({ type: 'Multiple', events });

    const untilFound = ReedlineEvent.UntilFound(events);
    expect(untilFound).toEqual({ type: 'UntilFound', events });
  });

  it('should create command events', () => {
    const executeCommand = ReedlineEvent.ExecuteHostCommand('ls -la');
    expect(executeCommand).toEqual({ type: 'ExecuteHostCommand', command: 'ls -la' });

    const openEditor = ReedlineEvent.OpenEditor();
    expect(openEditor).toEqual({ type: 'OpenEditor' });
  });
});

describe('EditType', () => {
  it('should create edit types', () => {
    const moveCursor = EditType.MoveCursor(true);
    expect(moveCursor).toEqual({ type: 'MoveCursor', select: true });

    const undoRedo = EditType.UndoRedo();
    expect(undoRedo).toEqual({ type: 'UndoRedo' });

    const editText = EditType.EditText();
    expect(editText).toEqual({ type: 'EditText' });

    const noOp = EditType.NoOp();
    expect(noOp).toEqual({ type: 'NoOp' });
  });
});

describe('UndoBehavior', () => {
  it('should create undo behaviors', () => {
    const insertChar = UndoBehavior.InsertCharacter('a');
    expect(insertChar).toEqual({ type: 'InsertCharacter', character: 'a' });

    const backspace = UndoBehavior.Backspace('b');
    expect(backspace).toEqual({ type: 'Backspace', character: 'b' });

    const deleteCmd = UndoBehavior.Delete();
    expect(deleteCmd).toEqual({ type: 'Delete', character: undefined });

    const moveCursor = UndoBehavior.MoveCursor();
    expect(moveCursor).toEqual({ type: 'MoveCursor' });
  });
});

describe('EventStatus', () => {
  it('should create event statuses', () => {
    const handled = EventStatus.Handled();
    expect(handled).toEqual({ type: 'Handled' });

    const inapplicable = EventStatus.Inapplicable();
    expect(inapplicable).toEqual({ type: 'Inapplicable' });

    const exits = EventStatus.Exits(Signal.CtrlC());
    expect(exits).toEqual({ type: 'Exits', signal: { type: 'CtrlC' } });
  });
});

describe('Type safety', () => {
  it('should enforce type safety for Signal', () => {
    const signal: SignalType = Signal.Success('test');
    expect(signal.type).toBe('Success');
    
    // TypeScript should prevent this at compile time:
    // const invalid: SignalType = { type: 'Invalid' };
  });

  it('should enforce type safety for EditCommand', () => {
    const command: EditCommandType = EditCommand.MoveLeft();
    expect(command.type).toBe('MoveLeft');
    
    // TypeScript should prevent this at compile time:
    // const invalid: EditCommandType = { type: 'Invalid' };
  });

  it('should enforce type safety for ReedlineEvent', () => {
    const event: ReedlineEventType = ReedlineEvent.Enter();
    expect(event.type).toBe('Enter');
    
    // TypeScript should prevent this at compile time:
    // const invalid: ReedlineEventType = { type: 'Invalid' };
  });
}); 