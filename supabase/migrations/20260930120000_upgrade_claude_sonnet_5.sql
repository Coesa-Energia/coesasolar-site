UPDATE configuracoes_sistema
SET valor = replace(valor, 'anthropic/claude-sonnet-4-5', 'anthropic/claude-sonnet-5'),
    updated_at = NOW()
WHERE chave IN ('model_router_complex_model', 'llm_default_models')
  AND valor LIKE '%anthropic/claude-sonnet-4-5%';

