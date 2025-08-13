#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { JiraClient } from "./jira-client.js";
import { config } from "dotenv";

// Load environment variables
config();

const server = new Server({
  name: "jira-mcp-server",
  version: "1.0.0",
});

// Initialize Jira client
const jiraClient = new JiraClient({
  baseUrl: process.env.JIRA_BASE_URL!,
  email: process.env.JIRA_EMAIL!,
  apiToken: process.env.JIRA_API_TOKEN!,
});

// Define tools
const tools: Tool[] = [
  {
    name: "create_jira_task",
    description: "Create a new Jira task/issue",
    inputSchema: {
      type: "object",
      properties: {
        projectKey: {
          type: "string",
          description: 'The project key (e.g., "PROJ")',
        },
        summary: {
          type: "string",
          description: "The task summary/title",
        },
        description: {
          type: "string",
          description: "The task description",
        },
        issueType: {
          type: "string",
          description: 'The type of issue (e.g., "Task", "Bug", "Story")',
          default: "Task",
        },
        priority: {
          type: "string",
          description: 'The priority level (e.g., "High", "Medium", "Low")',
          default: "Medium",
        },
        assignee: {
          type: "string",
          description: "The assignee email address (optional)",
        },
      },
      required: ["projectKey", "summary"],
    },
  },
  {
    name: "update_jira_task_status",
    description: "Update the status of a Jira task",
    inputSchema: {
      type: "object",
      properties: {
        issueKey: {
          type: "string",
          description: 'The issue key (e.g., "PROJ-123")',
        },
        status: {
          type: "string",
          description: 'The new status (e.g., "In Progress", "Done", "To Do")',
        },
        comment: {
          type: "string",
          description: "Optional comment to add with the status change",
        },
      },
      required: ["issueKey", "status"],
    },
  },
  {
    name: "update_jira_task_progress",
    description: "Update the progress of a Jira task",
    inputSchema: {
      type: "object",
      properties: {
        issueKey: {
          type: "string",
          description: 'The issue key (e.g., "PROJ-123")',
        },
        progressPercent: {
          type: "number",
          description: "Progress percentage (0-100)",
          minimum: 0,
          maximum: 100,
        },
        comment: {
          type: "string",
          description: "Optional comment about the progress update",
        },
      },
      required: ["issueKey", "progressPercent"],
    },
  },
  {
    name: "get_jira_task",
    description: "Get details of a Jira task",
    inputSchema: {
      type: "object",
      properties: {
        issueKey: {
          type: "string",
          description: 'The issue key (e.g., "PROJ-123")',
        },
      },
      required: ["issueKey"],
    },
  },
  {
    name: "list_jira_tasks",
    description: "List Jira tasks with optional filtering",
    inputSchema: {
      type: "object",
      properties: {
        projectKey: {
          type: "string",
          description: "The project key to filter by (optional)",
        },
        status: {
          type: "string",
          description: "Filter by status (optional)",
        },
        assignee: {
          type: "string",
          description: "Filter by assignee email (optional)",
        },
        maxResults: {
          type: "number",
          description: "Maximum number of results to return",
          default: 50,
        },
      },
    },
  },
];

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools,
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "create_jira_task":
        return await jiraClient.createTask(args as any);

      case "update_jira_task_status":
        return await jiraClient.updateTaskStatus(args as any);

      case "update_jira_task_progress":
        return await jiraClient.updateTaskProgress(args as any);

      case "get_jira_task":
        return await jiraClient.getTask(args as any);

      case "list_jira_tasks":
        return await jiraClient.listTasks(args as any);

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      ],
    };
  }
});

// Start the server
const transport = new StdioServerTransport();
await server.connect(transport);

console.error("Jira MCP server started");
