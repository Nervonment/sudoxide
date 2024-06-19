export default function gridReducer(state, action) {
    switch (action.type) {
        case 'set':
            return action.newGrid;
        case 'fill': {
            let { r, c, num, validity } = action;
            state[r][c].value = num;
            return state.map((row) => row.map((cell) => ({
                ...cell,
                valid: validity,
            })));
        }

        default:
            break;
    }
}