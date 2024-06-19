export default function gridReducer(state, action) {
  switch (action.type) {
    case 'set':
      return action.newGrid;
    case 'fill': {
      let { r, c, num, validCond } = action;
      state[r][c].value = num;
      return state.map((row, r) => row.map((cell, c) => ({
        ...cell,
        valid: validCond[r][c]
      })));
    }

    default:
      break;
  }
}