// Minimal reproduction: no-unnecessary-type-assertion false positive in type-aware mode
//
// When typeAware is enabled, oxlint incorrectly infers the generic type parameter
// of querySelector from the `as` assertion target, then concludes the assertion
// is unnecessary because "the expression already has that type."
//
// querySelector signature: querySelector<E extends Element = Element>(selectors: string): E | null
// Without `as`, the return type defaults to Element | null.
// Asserting to a subtype (e.g. HTMLCanvasElement | null) IS a real narrowing.

// BUG: oxlint says "This expression already has the type 'HTMLCanvasElement | null'"
// Expected: no error (this assertion narrows Element | null → HTMLCanvasElement | null)
export const a = document.querySelector('.foo') as HTMLCanvasElement | null

// BUG: oxlint says "This expression already has the type 'Element | null'"
// This one IS actually unnecessary (Element | null → Element | null), so flagging
// it is correct — but it's flagged for the wrong reason (tsgolint resolves E=Element
// from the assertion, not from the default).
export const b = document.querySelector('.foo') as Element | null
