import { NextRequest, NextResponse } from "next/server";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import OpenAI from "openai";

interface McpTool {
  name: string;
  description?: string;
  inputSchema: Record<string, unknown>;
}

interface ChatMessage {
  sender: "user" | "bot";
  text?: string;
  content?: string;
}

async function getMcpClient() {
  const client = new Client(
    {
      name: "inveniq-frontend-client",
      version: "1.0.0",
    },
    {
      capabilities: {},
    }
  );
  
  const transport = new SSEClientTransport(new URL("http://127.0.0.1:8001/sse"));
  await client.connect(transport);
  return client;
}

function mapMessages(messages: ChatMessage[]): OpenAI.ChatCompletionMessageParam[] {
  return messages.map((m) => {
    if (m.sender === "user") {
      return {
        role: "user" as const,
        content: m.text || m.content || "",
      };
    } else {
      return {
        role: "assistant" as const,
        content: m.text || m.content || "",
      };
    }
  });
}

export async function POST(req: NextRequest) {
  let client: Client | null = null;
  let provider = "groq";
  try {
    const { messages } = (await req.json()) as { messages: ChatMessage[] };

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages array." }, { status: 400 });
    }

    // 1. Resolve LLM provider configuration (supporting NEXT_PUBLIC_, NEXT_ prefix, and standard fallbacks, defaulting to groq)
    provider = process.env.NEXT_PUBLIC_LLM_PROVIDER || process.env.NEXT_LLM_PROVIDER || process.env.LLM_PROVIDER || "groq";
    let openaiClient: OpenAI;
    let modelName: string;

    if (provider === "groq") {
      const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY || process.env.NEXT_GROQ_API_KEY || process.env.GROQ_API_KEY;
      if (!apiKey) {
        return NextResponse.json({
          error: "Groq API Key is missing. Please set the NEXT_PUBLIC_GROQ_API_KEY or GROQ_API_KEY environment variable.",
        }, { status: 400 });
      }
      openaiClient = new OpenAI({
        apiKey,
        baseURL: "https://api.groq.com/openai/v1/",
      });
      modelName = process.env.NEXT_PUBLIC_GROQ_MODEL || process.env.NEXT_GROQ_MODEL || process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
    } else if (provider === "gemini") {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.NEXT_GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY || process.env.NEXT_GOOGLE_API_KEY || process.env.GOOGLE_API_KEY;
      if (!apiKey) {
        return NextResponse.json({
          error: "Gemini API Key is missing. Please set the NEXT_PUBLIC_GEMINI_API_KEY or NEXT_GEMINI_API_KEY environment variable.",
        }, { status: 400 });
      }
      openaiClient = new OpenAI({
        apiKey,
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
      });
      modelName = process.env.NEXT_PUBLIC_GEMINI_MODEL || process.env.NEXT_GEMINI_MODEL || process.env.GEMINI_MODEL || "gemini-2.5-flash";
    } else {
      const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.NEXT_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return NextResponse.json({
          error: "OpenAI API Key is missing. Please set the NEXT_PUBLIC_OPENAI_API_KEY or NEXT_OPENAI_API_KEY environment variable.",
        }, { status: 400 });
      }
      openaiClient = new OpenAI({ apiKey });
      modelName = process.env.NEXT_PUBLIC_OPENAI_MODEL || process.env.NEXT_OPENAI_MODEL || process.env.OPENAI_MODEL || "gpt-4o-mini";
    }

    // 2. Connect to standalone MCP server using official JS SDK
    let mcpTools: McpTool[] = [];
    try {
      client = await getMcpClient();
      const mcpToolsResponse = await client.listTools();
      mcpTools = (mcpToolsResponse.tools || []) as McpTool[];
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Unknown error";
      console.error("Failed to connect or list tools from independent MCP server:", err);
      if (client) {
        await client.close().catch(() => {});
      }
      return NextResponse.json({
        error: `Failed to connect to independent MCP server: ${errMsg}. Ensure the python MCP server is running on http://127.0.0.1:8001`,
      }, { status: 500 });
    }

    // 3. Format MCP tools to OpenAI tool specification format
    const openAiTools = mcpTools.map((tool: McpTool) => ({
      type: "function" as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.inputSchema,
      },
    }));

    const systemInstruction: OpenAI.ChatCompletionSystemMessageParam = {
      role: "system" as const,
      content: `You are the InvenIQ Intelligent Inventory Assistant. Your sole purpose is to assist users with their inventory, stock, branches, sales, suppliers, customers, and orders within the InvenIQ system.
Strictly adhere to the following guidelines:
1. Boundary: Only answer questions or perform tasks related to the InvenIQ project (products, stock levels, sales, suppliers, customers, forecasts, branches). Politely refuse any unrelated, general-knowledge, or out-of-scope requests.
2. No Fabrications/Assumptions: Never assume, make up, or extrapolate any figures, quantities, or details. Do not lie or guess. If information is missing, always ask the user. Ground all statements strictly on data returned by the tools.
3. Product Lookup: When asked about a product without a SKU, always use the \`search_products\` tool first. If there are multiple matches or ambiguity, list the possible products and ask the user to clarify before calling other tools.`
    };

    // 4. Initiate Chat Completion call with streaming enabled
    const responseStream = await openaiClient.chat.completions.create({
      model: modelName,
      messages: [
        systemInstruction,
        ...mapMessages(messages)
      ],
      tools: openAiTools.length > 0 ? openAiTools : undefined,
      stream: true,
    });

    // 5. Construct a ReadableStream to stream completion chunks back to the client
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          let isToolCall = false;
          let toolCallId = "";
          let toolName = "";
          let toolArgsAccumulated = "";

          for await (const chunk of responseStream) {
            const choice = chunk.choices[0];
            if (!choice) continue;
            const delta = choice.delta;

            if (delta.tool_calls && delta.tool_calls.length > 0) {
              isToolCall = true;
              const tc = delta.tool_calls[0];
              if (tc.id) toolCallId = tc.id;
              if (tc.function?.name) toolName = tc.function.name;
              if (tc.function?.arguments) toolArgsAccumulated += tc.function.arguments;
            } else if (delta.content) {
              controller.enqueue(encoder.encode(delta.content));
            }
          }

          // If the model chose to execute a tool, we run it and call the LLM again, streaming the final output
          if (isToolCall && client) {
            const toolArgs = JSON.parse(toolArgsAccumulated) as Record<string, unknown>;
            console.log(`LLM (${provider}) requesting tool execution: ${toolName} with args:`, toolArgs);

            let toolResult: unknown;
            try {
              const mcpCallResult = (await client.callTool({
                name: toolName,
                arguments: toolArgs,
              })) as { content?: { text?: string }[] };

              if (mcpCallResult.content && Array.isArray(mcpCallResult.content) && mcpCallResult.content[0]) {
                const rawText = mcpCallResult.content[0].text || "";
                try {
                  toolResult = JSON.parse(rawText);
                } catch {
                  toolResult = rawText;
                }
              } else {
                toolResult = mcpCallResult;
              }
            } catch (err) {
              const errMsg = err instanceof Error ? err.message : "Unknown error";
              console.error(`Failed to execute MCP tool ${toolName}:`, err);
              toolResult = { error: `Failed to execute tool: ${errMsg}` };
            }

            const assistantMessage: OpenAI.ChatCompletionAssistantMessageParam = {
              role: "assistant" as const,
              content: null,
              tool_calls: [
                {
                  id: toolCallId,
                  type: "function" as const,
                  function: {
                    name: toolName,
                    arguments: toolArgsAccumulated,
                  }
                }
              ]
            };

            const secondResponseStream = await openaiClient.chat.completions.create({
              model: modelName,
              messages: [
                systemInstruction,
                ...mapMessages(messages),
                assistantMessage,
                {
                  role: "tool" as const,
                  tool_call_id: toolCallId,
                  content: JSON.stringify(toolResult),
                },
              ],
              stream: true,
            });

            for await (const chunk of secondResponseStream) {
              const choice = chunk.choices[0];
              if (!choice) continue;
              const delta = choice.delta;
              if (delta.content) {
                controller.enqueue(encoder.encode(delta.content));
              }
            }
          }

          controller.close();
        } catch (err) {
          let errMsg = err instanceof Error ? err.message : "Stream error";
          const isRateLimit = 
            errMsg.includes("429") || 
            errMsg.toLowerCase().includes("quota") || 
            errMsg.toLowerCase().includes("rate limit") ||
            (err && typeof err === "object" && "status" in err && err.status === 429);
          if (isRateLimit) {
            if (provider === "groq") {
              errMsg = "You have exceeded the rate limit or quota for your Groq API key. Please wait before retrying or upgrade your plan in the Groq console.";
            } else if (provider === "gemini") {
              errMsg = "You have exceeded the daily rate limit/quota for your Gemini API key (20 requests per day on the free tier for gemini-2.5-flash). Please wait before retrying or upgrade your plan in Google AI Studio.";
            } else {
              errMsg = `You have exceeded the daily rate limit/quota for your ${provider} API key. Please wait before retrying or upgrade your plan.`;
            }
          }
          controller.error(new Error(errMsg));
        } finally {
          // Gracefully release client resources
          if (client) {
            try {
              await client.close();
            } catch (err) {
              console.error("Failed to close MCP client connection in stream finally:", err);
            }
            client = null;
          }
        }
      },
      cancel() {
        if (client) {
          client.close().catch((err) => console.error("Failed to close MCP client in stream cancel:", err));
          client = null;
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (err) {
    if (client) {
      await client.close().catch(() => {});
    }
    let errMsg = err instanceof Error ? err.message : "An unexpected error occurred.";
    let status = 500;

    const isRateLimit = 
      errMsg.includes("429") || 
      errMsg.toLowerCase().includes("quota") || 
      errMsg.toLowerCase().includes("rate limit") ||
      (err && typeof err === "object" && "status" in err && err.status === 429);

    if (isRateLimit) {
      if (provider === "groq") {
        errMsg = "You have exceeded the rate limit or quota for your Groq API key. Please wait before retrying or upgrade your plan in the Groq console.";
      } else if (provider === "gemini") {
        errMsg = "You have exceeded the daily rate limit/quota for your Gemini API key (20 requests per day on the free tier for gemini-2.5-flash). Please wait before retrying or upgrade your plan in Google AI Studio.";
      } else {
        errMsg = `You have exceeded the rate limit/quota for your ${provider} API key. Please wait before retrying or upgrade your plan.`;
      }
      status = 429;
    }

    console.error("Chat API route error:", err);
    return NextResponse.json({ error: errMsg }, { status });
  }
}
