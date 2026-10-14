import { useState, useMemo } from 'react';
import { ChevronDown, ExternalLink, HelpCircle } from 'lucide-react';
import { useEconomyCalculator, CalculoResult, TipoInstalacao } from '@/hooks/useEconomyCalculator';
import { PUBLIC_DISCOUNT_LABEL, PUBLIC_DISCOUNT_PERCENT } from '@/lib/public-discount';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import faturaCipExemplo from '@/assets/fatura-cip-exemplo.png';
import faturaTipoInstalacaoExemplo from '@/assets/fatura-tipo-instalacao-exemplo.png';
const TIPOS_INSTALACAO: { value: TipoInstalacao; label: string; kwh: number }[] = [
  { value: 'Monofásico', label: 'Monofásico', kwh: 30 },
  { value: 'Bifásico', label: 'Bifásico', kwh: 50 },
  { value: 'Trifásico', label: 'Trifásico', kwh: 100 },
];

export function EconomyCalculator() {
  const { config, concessionarias, loading, calcular, getWhatsAppLink } = useEconomyCalculator();
  
  // Main inputs
  const [valorConta, setValorConta] = useState<string>('');
  const [valorNumerico, setValorNumerico] = useState<number>(0);
  const descontoSelecionado = PUBLIC_DISCOUNT_PERCENT;
  
  // Parameters inputs (always visible)
  const [cipCustom, setCipCustom] = useState<string>('');
  const [tipoInstalacao, setTipoInstalacao] = useState<TipoInstalacao>('Bifásico');
  const [distribuidoraSelecionada, setDistribuidoraSelecionada] = useState<string>('CEMIG-D');

  // Get tariff for selected distribuidora
  const tarifaSelecionada = useMemo(() => {
    const conc = concessionarias.find(c => c.nome === distribuidoraSelecionada);
    return conc?.tarifa || config.tarifaFallback;
  }, [distribuidoraSelecionada, concessionarias, config.tarifaFallback]);

  // Calculate result with custom params
  const resultado: CalculoResult | null = useMemo(() => {
    if (valorNumerico <= 0) return null;
    
    const cipValue = cipCustom ? parseFloat(cipCustom.replace(',', '.')) : undefined;
    
    return calcular(
      valorNumerico,
      descontoSelecionado,
      cipValue,
      tipoInstalacao,
      tarifaSelecionada
    );
  }, [valorNumerico, descontoSelecionado, cipCustom, tipoInstalacao, tarifaSelecionada, calcular]);

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

      <details className="group border-b border-[#ded8ca]">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-2 text-sm font-medium text-[#425547] marker:content-none [&::-webkit-details-marker]:hidden">
          <span>Ajustar dados da fatura <span className="block pt-1 text-xs font-normal text-[#748075]">Opcional: CIP, instalação e distribuidora</span></span>
          <ChevronDown aria-hidden="true" className="h-5 w-5 shrink-0 transition-transform group-open:rotate-180" />
        </summary>
        
        <div className="grid grid-cols-1 gap-4 border-t border-[#e1dacb] py-3 sm:grid-cols-3">
          {/* CIP */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <label htmlFor="cip-simulacao" className="block text-xs font-medium text-muted-foreground">
                Contribuição de Iluminação Pública (R$)
              </label>
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" aria-label="O que é CIP?" className="text-muted-foreground/60 hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><HelpCircle className="h-3.5 w-3.5" /></button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="w-80 p-3">
                    <p className="text-xs mb-2"><strong>CIP</strong> (Contribuição para Iluminação Pública) é uma taxa municipal cobrada na sua conta de luz.</p>
                    <div className="relative rounded-md overflow-hidden border border-border group cursor-zoom-in">
                      <img 
                        src={faturaCipExemplo.src}
                        alt="Exemplo de CIP na fatura" 
                        className="w-full transition-transform duration-300 group-hover:scale-150 origin-center" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none group-hover:opacity-0 transition-opacity duration-300" />
                      <div className="absolute bottom-1 left-1 right-1 text-[10px] text-white font-medium text-center group-hover:opacity-0 transition-opacity duration-300">
                        Procure por "Contrib Ilum Publica" na sua fatura
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1.5 text-center">Passe o mouse para ampliar</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <input
              id="cip-simulacao"
              type="text"
              inputMode="decimal"
              value={cipCustom}
              onChange={(e) => setCipCustom(e.target.value.replace(/[^\d,]/g, ''))}
              placeholder={config.cipDefault.toString()}
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all outline-none"
            />
            <p className="text-[10px] text-muted-foreground">
              Se não preenchido: <span className="font-medium text-foreground">R$ {config.cipDefault}</span>
            </p>
          </div>

          {/* Disponibilidade */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <label className="block text-xs font-medium text-muted-foreground">
                Tipo de Instalação
              </label>
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" aria-label="Sobre o tipo de instalação" className="text-muted-foreground/60 hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><HelpCircle className="h-3.5 w-3.5" /></button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="w-80 p-3">
                    <p className="text-xs mb-1"><strong>Tipo de Instalação</strong> define a demanda mínima cobrada:</p>
                    <ul className="text-xs mb-2 space-y-0.5">
                      <li>• <strong>Monofásico</strong>: 30 kWh</li>
                      <li>• <strong>Bifásico</strong>: 50 kWh</li>
                      <li>• <strong>Trifásico</strong>: 100 kWh</li>
                    </ul>
                    <div className="relative rounded-md overflow-hidden border border-border group cursor-zoom-in">
                      <img 
                        src={faturaTipoInstalacaoExemplo.src}
                        alt="Exemplo de Tipo de Instalação na fatura" 
                        className="w-full transition-transform duration-300 group-hover:scale-150 origin-center" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none group-hover:opacity-0 transition-opacity duration-300" />
                      <div className="absolute bottom-1 left-1 right-1 text-[10px] text-white font-medium text-center group-hover:opacity-0 transition-opacity duration-300">
                        Veja em "Classe" na sua fatura (ex: Trifásico)
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1.5 text-center">Passe o mouse para ampliar</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <select
              aria-label="Tipo de instalação"
              value={tipoInstalacao}
              onChange={(e) => setTipoInstalacao(e.target.value as TipoInstalacao)}
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all outline-none"
            >
              {TIPOS_INSTALACAO.map((tipo) => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label} ({tipo.kwh} kWh)
                </option>
              ))}
            </select>
            <p className="text-[10px] text-muted-foreground">
              Padrão: <span className="font-medium text-foreground">Bifásico (50 kWh)</span>
            </p>
          </div>

          {/* Distribuidora */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <label className="block text-xs font-medium text-muted-foreground">
                Distribuidora
              </label>
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" aria-label="O que é distribuidora?" className="text-muted-foreground/60 hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><HelpCircle className="h-3.5 w-3.5" /></button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[220px] text-xs">
                    <p><strong>Distribuidora</strong> é a empresa que entrega a energia elétrica na sua região. Cada uma tem tarifas diferentes definidas pela ANEEL.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <select
              aria-label="Distribuidora"
              value={distribuidoraSelecionada}
              onChange={(e) => setDistribuidoraSelecionada(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all outline-none"
            >
              {concessionarias.map((c) => (
                <option key={c.id} value={c.nome}>
                  {c.nome} {c.uf ? `(${c.uf})` : ''}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-muted-foreground">
              Tarifa c/ impostos: <span className="font-medium text-foreground">R$ {tarifaSelecionada.toFixed(4)}/kWh</span>
            </p>
          </div>
        </div>
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
          <details className="mt-2 text-xs text-[#6b7168]">
            <summary className="cursor-pointer py-1 underline underline-offset-2">Ver premissas do cálculo</summary>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              <span>CIP: R$ {cipCustom ? parseFloat(cipCustom.replace(',', '.')) : config.cipDefault}</span>
              <span>Disponibilidade: {resultado.disponibilidadeKwh} kWh</span>
              <span>Tarifa c/ impostos: R$ {resultado.tarifaUtilizada.toFixed(4)}/kWh</span>
              <span>PIS/COFINS: {(config.pisCofinsAliquota * 100).toFixed(2)}%</span>
            </div>
          </details>

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
          {valorNumerico === 0
            ? 'Para simular: conta a partir de R$ 300/mês e consumo estimado de 300 kWh/mês.'
            : valorNumerico < 300
              ? 'A conta precisa ser de pelo menos R$ 300,00 por mês para simular.'
              : 'O consumo estimado ficou abaixo de 300 kWh/mês. Confira os dados da fatura.'}
        </div>
      )}
    </div>
  );
}
