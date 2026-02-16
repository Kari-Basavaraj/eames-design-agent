import { DynamicStructuredTool } from '@langchain/core/tools';
import { TavilySearch } from '@langchain/tavily';
import { z } from 'zod';
// Inline helper (previously in tools/types.ts)
function formatToolResult(data: unknown, urls?: string[]): string {
  const text = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  if (urls?.length) return `${text}\n\nSources:\n${urls.map(u => `- ${u}`).join('\n')}`;
  return text;
}

const tavilyClient = new TavilySearch({ maxResults: 5 });

export const tavilySearch = new DynamicStructuredTool({
  name: 'search_web',
  description: 'Search the web for current information on any topic. Returns relevant search results with URLs and content snippets.',
  schema: z.object({
    query: z.string().describe('The search query to look up on the web'),
  }),
  func: async (input) => {
    const result = await tavilyClient.invoke({ query: input.query });
    const parsed = typeof result === 'string' ? JSON.parse(result) : result;
    const urls = parsed.results
      ?.map((r: { url?: string }) => r.url)
      .filter((url: string | undefined): url is string => Boolean(url)) ?? [];
    return formatToolResult(parsed, urls);
  },
});
