# oxlint `no-unnecessary-type-assertion` false positives with `typeAware: true`

Minimal reproducible examples for false positives in oxlint's `typescript/no-unnecessary-type-assertion` rule when `typeAware` is enabled.

**Root cause**: oxlint resolves generic type parameters from the `as` assertion target, rather than using the declared default. This causes it to conclude the expression "already has" the asserted type.

## Cases

Each case is a self-contained project with its own dependencies.

### [`cases/querySelector`](./cases/querySelector)

`querySelector<E extends Element = Element>()` — assertion to a subtype like `HTMLCanvasElement | null` is flagged as unnecessary.

- **Status**: Fixed in `oxlint-tsgolint` 0.17.2 (see [oxc#20656](https://github.com/oxc-project/oxc/issues/20656))
- **Reproduces on**: `oxlint-tsgolint` 0.17.1

### [`cases/generic-default-param`](./cases/generic-default-param)

`load<T = unknown>()` — assertion from `unknown` to `Record<string, unknown>` is flagged as unnecessary.

- **Status**: Open
- **Reproduces on**: `oxlint-tsgolint` 0.17.2

## Reproduce

```bash
cd cases/<case-name>
pnpm install
pnpm run lint
```
