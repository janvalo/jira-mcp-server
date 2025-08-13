# MCP Jira Server

A Model Context Protocol (MCP) server that provides tools for creating and managing Jira tasks. This server allows AI assistants to interact with Jira through a standardized interface.

## Features

- **Create Jira Tasks**: Create new issues with customizable fields
- **Update Task Status**: Change the status of existing tasks with **auto-assignment**
- **Update Task Progress**: Track progress with percentage and comments
- **Get Task Details**: Retrieve comprehensive information about specific tasks
- **List Tasks**: Search and filter tasks with various criteria

### 🚀 Auto-Assignment Feature

When you update a task status to work-in-progress statuses ("In Progress", "Scoping", "To Do"), the task will automatically be assigned to you if it's not already assigned. This helps track who is working on each task and streamlines the workflow.

## Prerequisites

- Node.js 18+
- A Jira instance (Cloud or Server)
- Jira API token

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the example environment file and configure your Jira settings:

```bash
cp env.example .env
```

Edit `.env` with your Jira configuration:

```env
# Jira Configuration
JIRA_BASE_URL=https://your-domain.atlassian.net
JIRA_EMAIL=your-email@example.com
JIRA_API_TOKEN=your-api-token

# MCP Server Configuration
MCP_SERVER_PORT=3000
```

### 3. Get Your Jira API Token

1. Go to [Atlassian Account Settings](https://id.atlassian.com/manage-profile/security/api-tokens)
2. Click "Create API token"
3. Give it a name (e.g., "MCP Server")
4. Copy the generated token to your `.env` file

### 4. Build the Project

```bash
npm run build
```

## Usage

### Running the Server

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

### Available Tools

#### 1. Create Jira Task

Creates a new Jira issue with the specified details.

**Parameters:**

- `projectKey` (required): The project key (e.g., "PROJ")
- `summary` (required): The task summary/title
- `description` (optional): The task description
- `issueType` (optional): The type of issue (e.g., "Task", "Bug", "Story")
- `priority` (optional): The priority level (e.g., "High", "Medium", "Low")
- `assignee` (optional): The assignee email address

**Example:**

```json
{
  "projectKey": "PROJ",
  "summary": "Implement user authentication",
  "description": "Add OAuth2 authentication to the web application",
  "issueType": "Task",
  "priority": "High",
  "assignee": "developer@example.com"
}
```

#### 2. Update Task Status

Changes the status of an existing Jira task.

**Parameters:**

- `issueKey` (required): The issue key (e.g., "PROJ-123")
- `status` (required): The new status (e.g., "In Progress", "Done", "To Do")
- `comment` (optional): Comment to add with the status change

**Example:**

```json
{
  "issueKey": "PROJ-123",
  "status": "In Progress",
  "comment": "Starting implementation"
}
```

#### 3. Update Task Progress

Updates the progress of a Jira task with a percentage and optional comment.

**Parameters:**

- `issueKey` (required): The issue key (e.g., "PROJ-123")
- `progressPercent` (required): Progress percentage (0-100)
- `comment` (optional): Comment about the progress update

**Example:**

```json
{
  "issueKey": "PROJ-123",
  "progressPercent": 75,
  "comment": "Core functionality complete, working on edge cases"
}
```

#### 4. Get Task Details

Retrieves comprehensive information about a specific Jira task.

**Parameters:**

- `issueKey` (required): The issue key (e.g., "PROJ-123")

**Example:**

```json
{
  "issueKey": "PROJ-123"
}
```

#### 5. List Tasks

Searches and lists Jira tasks with optional filtering.

**Parameters:**

- `projectKey` (optional): Filter by project key
- `status` (optional): Filter by status
- `assignee` (optional): Filter by assignee email
- `maxResults` (optional): Maximum number of results (default: 50)

**Example:**

```json
{
  "projectKey": "PROJ",
  "status": "In Progress",
  "maxResults": 10
}
```

## Integration with MCP Clients

### Claude Desktop

Add this to your `claude_desktop_config.json`:

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

### Other MCP Clients

The server uses stdio transport, so it can be integrated with any MCP-compatible client by specifying the command and arguments.

## Error Handling

The server provides detailed error messages for common issues:

- **Authentication errors**: Check your email and API token
- **Invalid project key**: Verify the project exists and you have access
- **Invalid status**: The server will show available statuses for the task
- **Permission errors**: Ensure you have the necessary permissions in Jira

## Development

### Project Structure

```
src/
├── index.ts          # Main MCP server entry point
├── jira-client.ts    # Jira API client implementation
└── types.ts          # TypeScript type definitions
```

### Testing

```bash
npm test
```

### Building

```bash
npm run build
```

## Troubleshooting

### Common Issues

1. **"Invalid credentials" error**

   - Verify your email and API token in the `.env` file
   - Ensure the API token hasn't expired

2. **"Project not found" error**

   - Check that the project key is correct
   - Verify you have access to the project

3. **"Status not available" error**

   - The server will show available statuses for the task
   - Some status transitions may require specific permissions

4. **"Permission denied" error**
   - Check your Jira permissions for the project
   - Some operations may require admin privileges

### Debug Mode

For debugging, you can run the server with additional logging:

```bash
DEBUG=* npm run dev
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
