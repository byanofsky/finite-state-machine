const DEFAULT_TRANSITION = Symbol();

type Transitions = {
  [curState: string]: {
    [key: string]: [string, Function];
    [DEFAULT_TRANSITION]: [string, Function];
  };
};

class FiniteStateMachine {
  private state: string;

  constructor(
    readonly initialState: string,
    readonly transitions: Transitions
  ) {
    this.state = initialState;
  }

  handle(key: string) {
    const curState = this.state;
    const curStateTransitions = this.transitions[curState];
    if (!curStateTransitions) {
      throw new Error(
        `Transitions not defined for curState: ${curState}. key: ${key}.`
      );
    }
    const [nextState, action] =
      curStateTransitions[key] || curStateTransitions[DEFAULT_TRANSITION];
    this.state = nextState;
    action(key);
  }
}

enum State {
  NotInString = "NotInString,",
  InString = "InString,",
  Escape = "Escape,",
}

const testString = `Not string, "but this is a string \\"and escaped\\" string" but again not a string`;

const stringExtractor = (str: string) => {
  let currentString: string[] = [];

  const transitions: Transitions = {
    [State.NotInString]: {
      '"': [State.InString, () => {}],
      [DEFAULT_TRANSITION]: [State.NotInString, () => {}],
    },
    [State.InString]: {
      '"': [
        State.NotInString,
        () => {
          console.log(currentString.join(""));
          currentString = [];
        },
      ],
      "\\": [State.Escape, () => {}],
      [DEFAULT_TRANSITION]: [
        State.InString,
        (char: string) => {
          currentString.push(char);
        },
      ],
    },
    [State.Escape]: {
      [DEFAULT_TRANSITION]: [
        State.InString,
        (char: string) => {
          currentString.push(char);
        },
      ],
    },
  };

  const stringFSM = new FiniteStateMachine(State.NotInString, transitions);

  for (const c of str) {
    stringFSM.handle(c);
  }
};

stringExtractor(testString);
