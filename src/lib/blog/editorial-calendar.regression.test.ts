// REGRESSÃO: calendário editorial — pauta planejada vence o seed; pauta enriquece o prompt.
import { describe, it, expect, vi } from 'vitest';
import { getServiceClient } from '@/lib/blog/supabase-blog';
import { pickPlannedKeyword, buildEditorialBriefSection, getAvailableEditorialReserves, type EditorialBrief } from './editorial-calendar';

vi.mock('@/lib/blog/supabase-blog', async importOriginal => ({
  ...await importOriginal<typeof import('@/lib/blog/supabase-blog')>(),
  getServiceClient: vi.fn(),
}));

describe('REGRESSÃO: calendário editorial', () => {
  describe('pickPlannedKeyword', () => {
    const rows = [
      { keyword: 'pauta futura', scheduled_date: '2026-09-01', status: 'planned' },
      { keyword: 'pauta de hoje', scheduled_date: '2026-08-19', status: 'planned' },
      { keyword: 'pauta atrasada', scheduled_date: '2026-08-15', status: 'planned' },
      { keyword: 'já publicada', scheduled_date: '2026-08-18', status: 'published' },
      { keyword: 'pulada', scheduled_date: '2026-08-18', status: 'skipped' },
      { keyword: 'sem data', scheduled_date: null, status: 'planned' },
    ];
    const today = '2026-08-19';

    it('escolhe a pauta com a data mais antiga entre as elegíveis', () => {
      expect(pickPlannedKeyword(rows, today)).toBe('pauta atrasada');
    });

    it('ignora pautas publicadas e puladas', () => {
      const onlyPublished = [
        { keyword: 'x', scheduled_date: '2026-08-01', status: 'published' },
        { keyword: 'y', scheduled_date: '2026-08-01', status: 'skipped' },
      ];
      expect(pickPlannedKeyword(onlyPublished, today)).toBeNull();
    });

    it('ignora pauta com data futura', () => {
      const future = [
        { keyword: 'amanhã', scheduled_date: '2026-08-20', status: 'planned' },
      ];
      expect(pickPlannedKeyword(future, today)).toBeNull();
    });

    it('aceita pauta sem data (publica na próxima janela do cron)', () => {
      const undated = [
        { keyword: 'livre', scheduled_date: null, status: 'planned' },
      ];
      expect(pickPlannedKeyword(undated, today)).toBe('livre');
    });

    it('retorna null quando não há pauta planejada', () => {
      expect(pickPlannedKeyword([], today)).toBeNull();
    });
  });

  describe('buildEditorialBriefSection', () => {
    it('renderiza keywords relacionadas, concorrentes e pontos de atenção', () => {
      const brief: EditorialBrief = {
        relatedKeywords: ['custo de solução b2b', 'contrato b2b'],
        competitors: ['site-competidor.com'],
        attentionPoints: 'Citar o estudo de 2026 sobre reajuste de contratos.',
      };
      const section = buildEditorialBriefSection(brief);
      expect(section).toContain('## PAUTA DO CALENDÁRIO');
      expect(section).toContain('custo de solução b2b');
      expect(section).toContain('site-competidor.com');
      expect(section).toContain('reajuste de contratos');
    });

    it('omite campos vazios mas mantém os preenchidos', () => {
      const section = buildEditorialBriefSection({
        relatedKeywords: [],
        competitors: [],
        attentionPoints: 'Priorizar FAQ no fechamento.',
      });
      expect(section).toContain('Priorizar FAQ no fechamento');
      expect(section).not.toContain('Keywords relacionadas');
      expect(section).not.toContain('Concorrentes');
    });

    it('retorna vazio para brief nulo (keyword do seed)', () => {
      expect(buildEditorialBriefSection(null)).toBe('');
    });
  });
});

describe('reserva editorial', () => {
  function calendarQuery(...results: unknown[]) {
    const query = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn(),
    };
    for (const result of results) query.range.mockResolvedValueOnce(result);
    const from = vi.fn().mockReturnValue(query);
    vi.mocked(getServiceClient).mockReturnValue({ from } as unknown as ReturnType<typeof getServiceClient>);
    return { from, ...query };
  }

  it('lê reservas disponíveis, ignora publicadas e deduplica pautas mantendo o briefing', async () => {
    const row = { related_keywords: ['cliente b2b'], competitors: [], attention_points: 'Dados oficiais' };
    const query = calendarQuery({ data: [
      { ...row, keyword: ' Já Publicada ' },
      { ...row, keyword: 'Pauta inédita' },
      { ...row, keyword: ' pauta inédita ' },
      { ...row, keyword: '  ' },
    ], count: 4, error: null });

    await expect(getAvailableEditorialReserves(['já publicada'])).resolves.toEqual([{
      keyword: 'Pauta inédita', relatedKeywords: ['cliente b2b'], competitors: [], attentionPoints: 'Dados oficiais',
    }]);
    expect(query.from).toHaveBeenCalledWith('coesa_editorial_calendar');
    expect(query.eq).toHaveBeenCalledExactlyOnceWith('status', 'reserve');
    expect(query.or).toHaveBeenCalledExactlyOnceWith(`scheduled_date.is.null,scheduled_date.lte.${new Date().toISOString().slice(0, 10)}`);
  });

  it('distingue falha de leitura de estoque vazio', async () => {
    calendarQuery({ data: null, count: null, error: { message: 'consulta indisponível' } });
    await expect(getAvailableEditorialReserves([])).rejects.toThrow('editorial_reserve_unavailable');
  });

  it('conta reservas elegíveis posteriores ao limite da primeira página', async () => {
    const row = { related_keywords: [], competitors: [], attention_points: null };
    const query = calendarQuery(
      { data: [{ ...row, keyword: 'já publicada' }], count: 2, error: null },
      { data: [{ ...row, keyword: 'reserva da segunda página' }], count: 2, error: null },
    );

    expect((await getAvailableEditorialReserves(['já publicada'])).map(entry => entry.keyword)).toEqual([
      'reserva da segunda página',
    ]);
    expect(query.range.mock.calls.map(([from]) => from)).toEqual([0, 1]);
  });
});
