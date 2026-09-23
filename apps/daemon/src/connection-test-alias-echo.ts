/**
 * Alias-routing gateways (OmniRoute, LiteLLM, OpenRouter) echo the resolved
 * upstream model id in `response.model`, not the requested alias. For loopback
 * OpenAI-compatible endpoints, existence is already checked against `/models`
 * (validateLocalOpenAiModel), so a mismatched echo on an otherwise valid
 * completion is reported as detail instead of `not_found_model`.
 * Returns null when this rule does not apply, so the caller falls through.
 */
export function inspectAliasRoutedOpenAiCompletion(
  protocol: string,
  data: unknown,
  requestedModel: string,
  enforceResponseModel: boolean,
): { valid: true; sample: string; detail: string } | null {
  if (protocol !== 'openai' || !enforceResponseModel || !requestedModel) return null;
  const obj = data && typeof data === 'object' ? data as Record<string, unknown> : null;
  if (!obj) return null;
  const responseModel = typeof obj.model === 'string' ? obj.model : '';
  if (!responseModel || responseModel === requestedModel) return null;
  const choices = obj.choices;
  if (!Array.isArray(choices) || choices.length === 0) return null;
  const first = choices[0] as { finish_reason?: unknown } | undefined;
  const finishReason =
    typeof first?.finish_reason === 'string' ? first.finish_reason : '';
  return {
    valid: true,
    sample: finishReason
      ? `valid completion (${finishReason})`
      : 'valid completion',
    detail: `Served by "${responseModel}" (requested "${requestedModel}").`,
  };
}
