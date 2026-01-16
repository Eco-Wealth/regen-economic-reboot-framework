export type Policy = {
  finalizeAlways: boolean;
  finalizeProbability: number;
};

export function loadPolicy(): Policy {
  const finalizeAlways = (process.env.FINALIZE_ALWAYS ?? 'true').toLowerCase() === 'true';
  const finalizeProbability = Number(process.env.FINALIZE_PROBABILITY ?? '1.0');
  return {
    finalizeAlways,
    finalizeProbability: Number.isFinite(finalizeProbability) ? Math.max(0, Math.min(1, finalizeProbability)) : 1.0,
  };
}

export function shouldFinalize(p: Policy): boolean {
  if (p.finalizeAlways) return true;
  return Math.random() < p.finalizeProbability;
}
