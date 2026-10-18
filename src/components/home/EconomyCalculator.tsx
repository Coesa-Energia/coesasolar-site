"use client";

import { useState, useMemo } from 'react';
import { ChevronDown, ExternalLink } from 'lucide-react';
import { useEconomyCalculator, CalculoResult, TipoInstalacao } from '@/hooks/useEconomyCalculator';
import { PUBLIC_DISCOUNT_LABEL, PUBLIC_DISCOUNT_PERCENT } from '@/lib/public-discount';

export function EconomyCalculator() {
  const { config, concessionarias, loading, calcular, getWhatsAppLink } = useEconomyCalculator();
  
  // Main inputs
  const [valorConta, setValorConta] = useState<string>('');
  const [valorNumerico, setValorNumerico] = useState<number>(0);
  const [cipCustom, setCipCustom] = useState('');
  const [tipoInstalacao, setTipoInstalacao] = useState<TipoInstalacao>('Bifásico');
  const [distribuidora, setDistribuidora] = useState('CEMIG-D');
  const cipNormalizada = cipCustom.includes(',') ? cipCustom.replace(/\./g, '').replace(',', '.') : cipCustom;
  const cipNumerica = cipCustom.trim() ? Number(cipNormalizada) : undefined;
  const cipInvalida = cipNumerica !== undefined && (!Number.isFinite(cipNumerica) || cipNumerica < 0);
  const tarifaSelecionada = useMemo(() => {
    return concessionarias.find(c => c.nome === distribuidora)?.tarifa || config.tarifaFallback;
  }, [concessionarias, config.tarifaFallback, distribuidora]);

  // Calculate result with custom params
  const resultado: CalculoResult | null = useMemo(() => {
    if (valorNumerico <= 0 || cipInvalida) return null;
    
    return calcular(valorNumerico, PUBLIC_DISCOUNT_PERCENT, cipNumerica, tipoInstalacao, tarifaSelecionada);
  }, [valorNumerico, cipNumerica, cipInvalida, tipoInstalacao, tarifaSelecionada, calcular]);

  // Handle input change with currency mask
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    const numValue = parseInt(raw, 10) / 100;
    
    if (isNaN(numValue)) {
      setValorConta('');
      setValorNumerico(0);
      return;
    }

    setValorNumerico(numValue);
    setValorConta(
      numValue.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-2">
      <div className="space-y-2">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <label htmlFor="valor-conta-simulacao" className="block text-sm font-medium text-[#425547]">Quanto você paga de luz por mês?</label>
          <span className="text-xs text-[#345d3f]">{PUBLIC_DISCOUNT_LABEL} na energia compensada</span>
        </div>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-[#5e6b5f]">R$</span>
          <input
            id="valor-conta-simulacao"
            type="text"
            inputMode="decimal"
            value={valorConta}
            onChange={handleInputChange}
            placeholder="0,00"
            aria-invalid={valorNumerico > 0 && !resultado}
            aria-describedby={resultado ? undefined : 'simulacao-elegibilidade'}
            className="w-full rounded-md border border-[#b9c8ba] bg-white py-2.5 pl-14 pr-4 text-2xl font-medium tracking-[-0.04em] text-[#172019] outline-none transition focus:border-[#3b6948] focus:ring-2 focus:ring-[#3b6948]/20"
          />
        </div>
      </div>

      <details className="group border-t border-[#ded8ca] pt-2">
        <summary className="flex cursor-pointer list-none items-center justify-between py-2 text-sm font-medium text-[#425547] [&::-webkit-details-marker]:hidden">
          Ajustar dados da fatura <ChevronDown aria-hidden="true" className="h-4 w-4 transition-transform group-open:rotate-180" />
        </summary>
        <div className="grid gap-3 pb-3 sm:grid-cols-3">
          <div>
            <label htmlFor="cip-simulacao" className="block text-xs text-[#425547]">Iluminação pública (R$)</label>
            <input id="cip-simulacao" type="text" inputMode="decimal" value={cipCustom} onChange={(event) => setCipCustom(event.target.value.replace(/[^\d,.]/g, ''))} placeholder={String(config.cipDefault)} aria-invalid={cipInvalida} aria-describedby={cipInvalida ? 'cip-simulacao-erro' : undefined} className="mt-1 w-full rounded-md border border-[#b9c8ba] bg-white px-3 py-2 text-sm text-[#172019]" />
            {cipInvalida && <p id="cip-simulacao-erro" className="mt-1 text-xs text-red-700">Informe um valor válido para iluminação pública.</p>}
          </div>
          <div>
            <label htmlFor="instalacao-simulacao" className="block text-xs text-[#425547]">Tipo de instalação</label>
            <select id="instalacao-simulacao" aria-label="Tipo de instalação" value={tipoInstalacao} onChange={(event) => setTipoInstalacao(event.target.value as TipoInstalacao)} className="mt-1 w-full rounded-md border border-[#b9c8ba] bg-white px-3 py-2 text-sm text-[#172019]">
              <option>Monofásico</option><option>Bifásico</option><option>Trifásico</option>
            </select>
          </div>
          <div>
            <label htmlFor="distribuidora-simulacao" className="block text-xs text-[#425547]">Distribuidora</label>
            <select id="distribuidora-simulacao" aria-label="Distribuidora" value={distribuidora} onChange={(event) => setDistribuidora(event.target.value)} className="mt-1 w-full rounded-md border border-[#b9c8ba] bg-white px-3 py-2 text-sm text-[#172019]">
              {concessionarias.map((item) => <option key={item.id} value={item.nome}>{item.nome}{item.uf ? ` (${item.uf})` : ''}</option>)}
            </select>
          </div>
        </div>
        <p className="pb-3 text-xs text-[#6b7168]">CIP padrão: R$ {config.cipDefault}. Tarifa usada: R$ {tarifaSelecionada.toFixed(4)}/kWh.</p>
      </details>

      {resultado ? (
        <div aria-live="polite" className="border-t border-[#ded8ca] pt-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#617366]">Economia mensal estimada</p>
              <strong className="mt-1 block text-[clamp(2.7rem,4vw,4rem)] font-medium leading-none tracking-[-0.07em] text-[#203b2b]">{formatCurrency(resultado.economiaMensal)}</strong>
            </div>
            <span className="pb-1 text-sm text-[#345d3f]">{resultado.economiaPercentual.toFixed(1)}% da fatura total</span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-[#6b7168]">O desconto incide na energia compensada. Encargos, tributos e consumo mínimo reduzem a economia sobre a fatura total.</p>

          <div className="mt-3 grid grid-cols-2 gap-x-5 border-t border-[#ded8ca] py-3">
            <div><span className="block text-xs text-[#6b7168]">Conta atual</span><strong className="mt-1 block text-lg font-medium tracking-[-0.03em]">{formatCurrency(resultado.valorAtual)}</strong></div>
            <div><span className="block text-xs text-[#6b7168]">Com COESA</span><strong className="mt-1 block text-lg font-medium tracking-[-0.03em] text-[#345d3f]">{formatCurrency(resultado.valorComCoesa)}</strong></div>
          </div>
          <div className="grid grid-cols-2 gap-x-5 border-t border-[#ded8ca] py-3">
            <div><span className="block text-xs text-[#6b7168]">Em 12 meses</span><strong className="mt-1 block text-base font-medium">{formatCurrency(resultado.economiaAnual)}</strong></div>
            <div><span className="block text-xs text-[#6b7168]">Em {resultado.fidelidadeAnos} {resultado.fidelidadeAnos === 1 ? 'ano' : 'anos'}</span><strong className="mt-1 block text-base font-medium">{formatCurrency(resultado.economiaAcumulada)}</strong></div>
          </div>

          <div className="flex flex-wrap justify-between gap-x-3 gap-y-1 border-t border-[#ded8ca] pt-2 text-xs text-[#6b7168]">
            <span>Consumo estimado</span>
            <span>~{resultado.consumoEstimado} kWh/mês · {resultado.tipoInstalacao}</span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-[#6b7168]">Valores simulados com médias de mercado. Uma proposta personalizada considera sua fatura real.</p>
          <a
            href={getWhatsAppLink('Simulei minha economia no site e queria uma proposta inicial, sofIA!')}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center justify-between rounded-md bg-[#172019] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#345d3f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#345d3f]"
          >
            Solicitar proposta pelo WhatsApp
            <ExternalLink aria-hidden="true" className="h-4 w-4" />
          </a>
        </div>
      ) : (
        <div id="simulacao-elegibilidade" aria-live="polite" className="border-t border-[#ded8ca] pt-4 text-sm text-[#6b7168]">
          {cipInvalida
            ? 'Corrija o valor da iluminação pública para simular.'
            : valorNumerico === 0
            ? 'Para simular: conta a partir de R$ 300/mês e consumo estimado de 300 kWh/mês.'
            : valorNumerico < 300
              ? 'A conta precisa ser de pelo menos R$ 300,00 por mês para simular.'
              : 'O consumo estimado ficou abaixo de 300 kWh/mês. Informe uma conta maior para simular.'}
        </div>
      )}
    </div>
  );
}
