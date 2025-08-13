# Quick Start Guide

Get your MCP Jira server up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- A Jira instance (Cloud or Server)
- Jira API token

## Step 1: Setup

Run the setup script:

```bash
./setup.sh
```

This will:

- Install dependencies
- Create a `.env` file
- Build the project

## Step 2: Configure Jira

1. Get your Jira API token:

   - Go to [Atlassian Account Settings](https://id.atlassian.com/manage-profile/security/api-tokens)
   - Click "Create API token"
   - Copy the token

2. Edit `.env` file:
   ```env
   JIRA_BASE_URL=https://your-domain.atlassian.net
   JIRA_EMAIL=your-email@example.com
   JIRA_API_TOKEN=your-api-token
   ```

## Step 3: Test

Test the connection:

```bash
npm run dev
```

## Step 4: Integrate

Add to your MCP client configuration (e.g., Claude Desktop):

```json
{
  "mcpServers": {
    "jira": {
      "command": "node",
      "args": ["/path/to/your/mcp-jira-server/dist/index.js"],
      "env": {
        "JIRA_BASE_URL": "https://your-domain.atlassian.net",
        "JIRA_EMAIL": "your-email@example.com",
        "JIRA_API_TOKEN": "your-api-token"
      }
    }
  }
}
```

## Available Commands

Once integrated, you can use these commands:

- **Create task**: "Create a new Jira task for implementing user authentication"
- **Update status**: "Move PROJ-123 to In Progress"
- **Update progress**: "Update PROJ-123 progress to 75%"
- **Get task**: "Show me details for PROJ-123"
- **List tasks**: "Show me all tasks in the PROJ project"

## Troubleshooting

- **"Invalid credentials"**: Check your email and API token
- **"Project not found"**: Verify the project key exists
- **"Status not available"**: The server will show available statuses

Need help? Check the full [README.md](README.md) for detailed documentation.
