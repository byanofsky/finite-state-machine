const DEFAULT = Symbol();

type Action = (char?: string) => void;

type State = string;

type Transitions = {
  [curState: State]: {
    [key: string]: [State, Action];
    [DEFAULT]: [State, Action];
  };
};

class FiniteStateMachine {
  private state: State;

  constructor(readonly initialState: State, readonly transitions: Transitions) {
    this.state = initialState;
  }

  handle(key: string) {
    const curState = this.state;
    const curStateTransitions = this.transitions[curState];
    if (!curStateTransitions) {
      throw new Error(`Transitions not defined for curState: ${curState}.`);
    }
    const [nextState, action] =
      curStateTransitions[key] || curStateTransitions[DEFAULT];
    this.state = nextState;
    action(key);
  }
}

enum StringState {
  LookForString = "LookForString",
  InString = "InString",
  CopyNextChar = "CopyNextChar",
}

const testString = `Not string, "but this is a string \\"and escaped\\" string" but again not a string`;

const stringExtractor = (str: string) => {
  let currentString: string[] = [];

  const noop = () => {};
  const startNewString = () => {
    currentString = [];
  };
  const appendToString = (char?: string) => {
    char && currentString.push(char);
  };
  const printString = () => {
    console.log(currentString.join(""));
  };

  const transitions: Transitions = {
    [StringState.LookForString]: {
      '"': [StringState.InString, startNewString],
      [DEFAULT]: [StringState.LookForString, noop],
    },
    [StringState.InString]: {
      '"': [StringState.LookForString, printString],
      "\\": [StringState.CopyNextChar, noop],
      [DEFAULT]: [StringState.InString, appendToString],
    },
    [StringState.CopyNextChar]: {
      [DEFAULT]: [StringState.InString, appendToString],
    },
  };

  const stringFSM = new FiniteStateMachine(
    StringState.LookForString,
    transitions
  );

  for (const c of str) {
    stringFSM.handle(c);
  }
};

stringExtractor(testString);
