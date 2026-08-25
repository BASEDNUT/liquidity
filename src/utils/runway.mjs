/**
 * Contract: describeRunway
 * Inputs: treasury, grossBurn, acpIncome (finite non-negative numbers)
 * Outputs: an immutable display-state object for local calculator rendering
 * Error modes: invalid inputs return the empty state; no side effects
 * Performance: constant time and memory
 */
export function describeRunway(treasury, grossBurn, acpIncome) {
  const values = [treasury, grossBurn, acpIncome];
  if (!values.every((value) => Number.isFinite(value) && value >= 0)) {
    return { kind: 'empty', message: 'Enter values → runway' };
  }

  const netBurn = Math.max(0, grossBurn - acpIncome);
  if (treasury > 0 && grossBurn > 0 && netBurn === 0) {
    return { kind: 'self-funding', message: '∞ operating runway at current ACP income' };
  }
  if (treasury > 0 && netBurn > 0) {
    const days = treasury / netBurn;
    return {
      kind: 'finite',
      days,
      netBurn,
      message: `${days.toFixed(days < 100 ? 1 : 0)} days · net burn /day`,
    };
  }
  return { kind: 'empty', message: 'Enter values → runway' };
}
