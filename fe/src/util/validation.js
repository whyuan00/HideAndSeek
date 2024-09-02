export function hasFalsy(...args) {
    return args.some((arg) => !arg);
}
