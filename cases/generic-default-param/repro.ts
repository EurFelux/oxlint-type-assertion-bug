// Generic function with default type parameter T = unknown
declare function load<T = unknown>(): Promise<T>

// BUG: oxlint says "This expression already has the type 'Record<string, unknown>'"
// Expected: no error — `load()` without explicit type arg returns Promise<unknown>,
// so `await load()` is `unknown`. The assertion to Record<string, unknown> is required.
// Without it, `...actual` causes TS2698: "Spread types may only be created from object types."
export async function main() {
  const actual = (await load()) as Record<string, unknown>
  return { ...actual }
}
