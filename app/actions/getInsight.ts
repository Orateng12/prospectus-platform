'use server';

import { requireAuth } from '@/lib/supabase/requireAuth';
import { generateInsight } from './generateInsight';
import type { InsightContext } from '@/lib/types';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 h

export async function getInsight(
  context: InsightContext,
  force = false,
): Promise<{ text: string; id?: string } | { error: string }> {
  const auth = await requireAuth();
  if (!auth.ok) return { error: auth.error };
  const { user, supabase } = auth;

  if (!force) {
    const cutoff = new Date(Date.now() - CACHE_TTL_MS).toISOString();
    const { data: cached } = await supabase
      .from('ai_insights')
      .select('id, body')
      .eq('user_id', user.id)
      .eq('type', context.type)
      .eq('dismissed', false)
      .gte('created_at', cutoff)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (cached?.body) return { text: cached.body as string, id: cached.id as string };
  }

  const result = await generateInsight(context);
  if ('error' in result) return result;

  // Only persist Claude-generated insights — not the static fallback copy
  let insightId: string | undefined;
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const { data } = await supabase
        .from('ai_insights')
        .insert({
          user_id:         user.id,
          type:            context.type,
          title:           `${context.type} insight`,
          body:            result.text,
          confidence:      0.8,
          action_required: false,
          dismissed:       false,
          acted_upon:      false,
        })
        .select('id')
        .single();
      insightId = (data as { id: string } | null)?.id;
    } catch {
      // Non-blocking — insight still returned even if persistence fails
    }
  }

  return { text: result.text, id: insightId };
}
