import { describe, expect, it } from 'vitest';
import { SEED_KEYWORDS } from './seed-keywords';
import { getSeedSkippingPublished, pickTopEligibleGscKeyword } from './gsc';

const LEGACY_SEEDS = [
  'energia solar por assinatura como funciona',
  'economizar na conta de luz sem instalação',
  'geração distribuída compartilhada vale a pena',
  'quanto economiza energia solar por assinatura',
  'energia solar sem investimento inicial',
  'desconto na conta de luz Minas Gerais',
];

describe('REGRESSÃO 11/09/2026: fallback não recicla pauta publicada', () => {
  it('retorna undefined quando todo o catálogo já foi publicado', () => {
    expect(getSeedSkippingPublished(SEED_KEYWORDS, 0)).toBeUndefined();
  });

  it('mantém pauta-reserva quando as seis seeds originais já foram publicadas', () => {
    expect(getSeedSkippingPublished(LEGACY_SEEDS, 0)).toBeTruthy();
  });
});

describe('REGRESSÃO 21/10/2026: GSC não exige cinco opções para resolver uma pauta', () => {
  it('usa a única consulta inédita elegível', () => {
    expect(pickTopEligibleGscKeyword([
      { keys: ['já publicada'], position: 8, impressions: 100 },
      { keys: ['energia solar para comércio'], position: 12, impressions: 40 },
    ], ['já publicada'])).toBe('energia solar para comércio');
  });

  it('prioriza impressões sem aceitar posição fora de 4–30', () => {
    expect(pickTopEligibleGscKeyword([
      { keys: ['posição ruim'], position: 31, impressions: 1000 },
      { keys: ['melhor oportunidade'], position: 20, impressions: 30 },
      { keys: ['segunda oportunidade'], position: 10, impressions: 20 },
    ], [])).toBe('melhor oportunidade');
  });
});
