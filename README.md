# oxlint `no-unnecessary-type-assertion` false positive with `typeAware: true`

## Bug Summary

When `"options": { "typeAware": true }` is enabled in `.oxlintrc.json`, the `typescript/no-unnecessary-type-assertion` rule incorrectly flags type assertions on `querySelector()` calls as unnecessary.

The root cause: in type-aware mode (`tsgolint`), oxlint resolves the generic type parameter `E` of `querySelector<E extends Element = Element>(selectors: string): E | null` by using the `as` assertion target type as `E`, rather than using the default (`Element`). This causes it to conclude the expression "already has" the asserted type, making the assertion appear unnecessary.

## Reproduction

```bash
npm install
npx oxlint --tsconfig tsconfig.json repro.ts
```

### Expected Output

Only `export const b` (line 19) should be flagged — it asserts `Element | null` to `Element | null`, which is genuinely unnecessary.

`export const a` (line 13) should NOT be flagged — it narrows `Element | null` to `HTMLCanvasElement | null`.

### Actual Output

Both lines are flagged:

```
  x typescript-eslint(no-unnecessary-type-assertion): ...
   ,-[repro.ts:13:49]
 13 | export const a = document.querySelector('.foo') as HTMLCanvasElement | null
    :                  ... This expression already has the type 'HTMLCanvasElement | null'
    `----

  x typescript-eslint(no-unnecessary-type-assertion): ...
   ,-[repro.ts:19:49]
 19 | export const b = document.querySelector('.foo') as Element | null
    :                  ... This expression already has the type 'Element | null'
    `----
```

## Root Cause Analysis

`querySelector` has multiple overloads in `lib.dom.d.ts`:

```typescript
querySelector<K extends keyof HTMLElementTagNameMap>(selectors: K): HTMLElementTagNameMap[K] | null;
querySelector<K extends keyof SVGElementTagNameMap>(selectors: K): SVGElementTagNameMap[K] | null;
querySelector<E extends Element = Element>(selectors: string): E | null;
```

For a call like `document.querySelector('.foo')`, only overload 3 matches (since `'.foo'` is not a key in any tag name map). The default for `E` is `Element`, so the return type should be `Element | null`.

However, when tsgolint encounters `querySelector('.foo') as HTMLCanvasElement | null`, it appears to:
1. See the `as HTMLCanvasElement` assertion
2. Infer `E = HTMLCanvasElement` from the assertion context
3. Resolve the return type as `HTMLCanvasElement | null`
4. Conclude the assertion is unnecessary (same type → same type)

This is incorrect — the assertion context should not influence the generic parameter resolution for the *pre-assertion* expression type.

## Impact

- `querySelector()` is one of the most commonly asserted DOM APIs
- `--fix` will **silently remove necessary type assertions**, causing TypeScript compilation errors downstream
- After removal, `querySelector('.foo')` returns `Element`, losing access to `.style`, `.focus()`, `.value`, `.classList`, etc.
- **Any generic function** with a default type parameter is affected, not just `querySelector`

## Workaround

Disable the rule or avoid `--fix` until this is resolved. Alternatively, use explicit generic syntax instead of assertions:

```typescript
// Instead of:
document.querySelector('.foo') as HTMLCanvasElement | null

// Use:
document.querySelector<HTMLCanvasElement>('.foo')
```

## Environment

- oxlint: 1.56.0
- oxlint-tsgolint: (latest)
- TypeScript: 5.8.3
- OS: macOS (Darwin)
- Requires: `"options": { "typeAware": true }` in `.oxlintrc.json`
