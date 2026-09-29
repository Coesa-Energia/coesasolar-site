import type { Database, Json } from '@/integrations/supabase/types';
import type { TriageConfig } from '@/components/ai-gym/AgentTriageConfig';
import type { ToolConfig } from '@/components/ai-gym/AgentToolsManager';
import type { KBSource } from '@/components/ai-gym/KnowledgeBaseManager';
import type { CollectionRules } from '@/components/ai-gym/CollectionRulesEditor';

type AIAgentRow = Database['public']['Tables']['ai_agents']['Row'];

type JsonObject = { [key: string]: Json | undefined };

type AgentPersona = JsonObject & {
  greeting?: string;
  llm_api_key_configured?: boolean;
  llm_custom_base_url?: string;
  llm_custom_model_id?: string;
  llm_custom_provider?: string;
  llm_model?: string;
  personality?: string;
  style?: string;
  tone?: JsonObject & { allowed?: string[]; default?: string };
  voice_config?: AgentVoiceConfig;
};

type AgentVoiceConfig = JsonObject & {
  greeting?: string;
  inbound?: JsonObject & { greeting_template?: string };
  outbound?: JsonObject;
};

type AgentGuardrails = JsonObject & {
  handoff_triggers?: string[];
  never_do?: string[];
  supervisor_nome?: string;
  supervisor_telefone?: string;
};

export type AIAgent = Omit<
  AIAgentRow,
  | 'avatar_emoji'
  | 'channels'
  | 'collection_rules'
  | 'description'
  | 'guardrails'
  | 'intents'
  | 'kb_sources'
  | 'persona'
  | 'tests'
  | 'tools_config'
  | 'triage_config'
  | 'voice_config'
> & {
  avatar_emoji: string;
  channels: string[];
  collection_rules: CollectionRules | null;
  description: string;
  guardrails: AgentGuardrails | null;
  intents: Array<JsonObject & { id?: string; steps?: string[] }> | null;
  kb_sources: KBSource[] | null;
  persona: AgentPersona | null;
  tests: unknown[] | null;
  tools_config: ToolConfig[] | null;
  triage_config: TriageConfig | null;
  voice_config: AgentVoiceConfig | null;
  agent_type?: string;
  display_order?: number;
};

export function normalizeAIAgent(agent: AIAgentRow): AIAgent {
  return {
    ...agent,
    avatar_emoji: agent.avatar_emoji ?? '🤖',
    channels: agent.channels ?? [],
    collection_rules: asJsonObject(agent.collection_rules) as CollectionRules,
    description: agent.description ?? '',
    guardrails: asJsonObject(agent.guardrails) as AgentGuardrails,
    intents: asJsonArray(agent.intents) as AIAgent['intents'],
    kb_sources: asJsonArray(agent.kb_sources) as KBSource[],
    persona: asJsonObject(agent.persona) as AgentPersona,
    tests: asJsonArray(agent.tests),
    tools_config: asJsonArray(agent.tools_config) as ToolConfig[],
    triage_config: asJsonObject(agent.triage_config) as unknown as TriageConfig,
    voice_config: asJsonObject(agent.voice_config) as AgentVoiceConfig,
  };
}

export function asJsonObject(value: Json | null): Record<string, Json | undefined> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function asJsonArray(value: Json | null): unknown[] {
  return Array.isArray(value) ? value : [];
}
