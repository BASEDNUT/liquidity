/**
 * Contract: deriveCarbonMetrics
 * Inputs: issuer object with Scope 1/2 tonnes and optional USD financial snapshots;
 *         pricePerT positive USD benchmark.
 * Outputs: immutable derived operational-emissions metrics; unavailable values are null.
 * Error modes: invalid/missing Scope 1 or non-positive benchmark returns null model values.
 * Performance: O(1), no I/O.
 * Side effects: none; issuer is never mutated.
 */
export function deriveCarbonMetrics(issuer, pricePerT) {
  const scope1T = issuer?.scope1T;
  const scope2T = issuer?.scope2T == null ? 0 : issuer.scope2T;
  const validScope1 = Number.isFinite(scope1T) && scope1T >= 0;
  const validScope2 = Number.isFinite(scope2T) && scope2T >= 0;
  const validPrice = Number.isFinite(pricePerT) && pricePerT > 0;

  if (!validScope1 || !validScope2) {
    return {
      scope12T: null,
      annualBurdenUsd: null,
      burdenToRevenue: null,
      burdenToMarketCap: null,
    };
  }

  const scope12T = scope1T + scope2T;
  const annualBurdenUsd = validPrice ? scope12T * pricePerT : null;
  const denominator = (value) => Number.isFinite(value) && value > 0 ? value : null;
  const revenueUsd = denominator(issuer?.revenueUsd);
  const marketCapUsd = denominator(issuer?.marketCapUsd);

  return {
    scope12T,
    annualBurdenUsd,
    burdenToRevenue: annualBurdenUsd != null && revenueUsd != null ? annualBurdenUsd / revenueUsd : null,
    burdenToMarketCap: annualBurdenUsd != null && marketCapUsd != null ? annualBurdenUsd / marketCapUsd : null,
  };
}
