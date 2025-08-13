import axios, { AxiosInstance } from "axios";

interface JiraConfig {
  baseUrl: string;
  email: string;
  apiToken: string;
}

interface CreateTaskArgs {
  projectKey: string;
  summary: string;
  description?: string;
  issueType?: string;
  priority?: string;
  assignee?: string;
}

interface UpdateStatusArgs {
  issueKey: string;
  status: string;
  comment?: string;
}

interface UpdateProgressArgs {
  issueKey: string;
  progressPercent: number;
  comment?: string;
}

interface GetTaskArgs {
  issueKey: string;
}

interface ListTasksArgs {
  projectKey?: string;
  status?: string;
  assignee?: string;
  maxResults?: number;
}

export class JiraClient {
  private client: AxiosInstance;

  constructor(config: JiraConfig) {
    this.client = axios.create({
      baseURL: config.baseUrl,
      auth: {
        username: config.email,
        password: config.apiToken,
      },
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
  }

  async createTask(args: CreateTaskArgs) {
    const payload = {
      fields: {
        project: {
          key: args.projectKey,
        },
        summary: args.summary,
        description: args.description
          ? {
              type: "doc",
              version: 1,
              content: [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: args.description,
                    },
                  ],
                },
              ],
            }
          : "",
        issuetype: {
          name: args.issueType || "Task",
        },
        priority: {
          name: args.priority || "Medium",
        },
        ...(args.assignee && {
          assignee: {
            name: args.assignee,
          },
        }),
      },
    };

    try {
      const response = await this.client.post("/rest/api/3/issue", payload);
      const issue = response.data;

      return {
        content: [
          {
            type: "text",
            text: `✅ Successfully created Jira task: ${
              issue.key
            }\n\n**Summary:** ${args.summary}\n**Project:** ${
              args.projectKey
            }\n**Type:** ${args.issueType || "Task"}\n**Priority:** ${
              args.priority || "Medium"
            }\n\nView at: ${this.client.defaults.baseURL}/browse/${issue.key}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(
        `Failed to create Jira task: ${this.getErrorMessage(error)}`
      );
    }
  }

  async updateTaskStatus(args: UpdateStatusArgs) {
    try {
      // First, get the available transitions for this issue
      const transitionsResponse = await this.client.get(
        `/rest/api/3/issue/${args.issueKey}/transitions`
      );
      const transitions = transitionsResponse.data.transitions;

      // Find the transition that matches the target status
      const targetTransition = transitions.find(
        (t: any) => t.to.name.toLowerCase() === args.status.toLowerCase()
      );

      if (!targetTransition) {
        const availableStatuses = transitions
          .map((t: any) => t.to.name)
          .join(", ");
        throw new Error(
          `Status "${args.status}" not available. Available statuses: ${availableStatuses}`
        );
      }

      // Check if we need to auto-assign when moving to work-in-progress statuses
      let shouldAutoAssign = false;
      const workInProgressStatuses = ["in progress", "scoping", "to do"];
      if (workInProgressStatuses.includes(args.status.toLowerCase())) {
        // Get current issue to check if it's already assigned
        const issueResponse = await this.client.get(
          `/rest/api/3/issue/${args.issueKey}`
        );
        const currentAssignee = issueResponse.data.fields.assignee;
        if (!currentAssignee) {
          shouldAutoAssign = true;
        }
      }

      // Perform the transition
      const transitionPayload = {
        transition: {
          id: targetTransition.id,
        },
        ...(args.comment && {
          update: {
            comment: [
              {
                add: {
                  body: {
                    type: "doc",
                    version: 1,
                    content: [
                      {
                        type: "paragraph",
                        content: [
                          {
                            type: "text",
                            text: args.comment,
                          },
                        ],
                      },
                    ],
                  },
                },
              },
            ],
          },
        }),
      };

      await this.client.post(
        `/rest/api/3/issue/${args.issueKey}/transitions`,
        transitionPayload
      );

      // Auto-assign if moving to "In Progress" and not already assigned
      if (shouldAutoAssign) {
        try {
          // Get the current user's accountId for assignment
          const userResponse = await this.client.get(
            `/rest/api/3/user/search?query=${process.env.JIRA_EMAIL}`
          );
          const user = userResponse.data[0];

          if (user && user.accountId) {
            const assignPayload = {
              accountId: user.accountId,
            };

            await this.client.put(
              `/rest/api/3/issue/${args.issueKey}/assignee`,
              assignPayload
            );
          }
        } catch (assignError) {
          console.error(
            "Failed to auto-assign task:",
            assignError instanceof Error
              ? assignError.message
              : String(assignError)
          );
        }
      }

      return {
        content: [
          {
            type: "text",
            text: `✅ Successfully updated status of ${args.issueKey} to "${
              args.status
            }"${args.comment ? `\n\n**Comment:** ${args.comment}` : ""}${
              shouldAutoAssign
                ? `\n\n**Auto-assigned to:** ${process.env.JIRA_EMAIL}`
                : ""
            }\n\nView at: ${this.client.defaults.baseURL}/browse/${
              args.issueKey
            }`,
          },
        ],
      };
    } catch (error) {
      throw new Error(
        `Failed to update task status: ${this.getErrorMessage(error)}`
      );
    }
  }

  async updateTaskProgress(args: UpdateProgressArgs) {
    try {
      // Update the progress field (if available) or add a comment
      const commentPayload = {
        body: {
          type: "doc",
          version: 1,
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: `Progress updated to ${args.progressPercent}%${
                    args.comment ? ` - ${args.comment}` : ""
                  }`,
                },
              ],
            },
          ],
        },
      };

      await this.client.post(
        `/rest/api/3/issue/${args.issueKey}/comment`,
        commentPayload
      );

      return {
        content: [
          {
            type: "text",
            text: `✅ Successfully updated progress of ${args.issueKey} to ${
              args.progressPercent
            }%${
              args.comment ? `\n\n**Comment:** ${args.comment}` : ""
            }\n\nView at: ${this.client.defaults.baseURL}/browse/${
              args.issueKey
            }`,
          },
        ],
      };
    } catch (error) {
      throw new Error(
        `Failed to update task progress: ${this.getErrorMessage(error)}`
      );
    }
  }

  async getTask(args: GetTaskArgs) {
    try {
      const response = await this.client.get(
        `/rest/api/3/issue/${args.issueKey}`
      );
      const issue = response.data;

      const fields = issue.fields;
      const status = fields.status?.name || "Unknown";
      const assignee = fields.assignee?.displayName || "Unassigned";
      const priority = fields.priority?.name || "Not set";
      const progress = fields.progress?.percent || 0;

      return {
        content: [
          {
            type: "text",
            text: `**${issue.key}**: ${
              fields.summary
            }\n\n**Status:** ${status}\n**Assignee:** ${assignee}\n**Priority:** ${priority}\n**Progress:** ${progress}%\n**Type:** ${
              fields.issuetype?.name
            }\n**Project:** ${fields.project?.name}\n\n**Description:**\n${
              fields.description || "No description provided"
            }\n\nView at: ${this.client.defaults.baseURL}/browse/${issue.key}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to get task: ${this.getErrorMessage(error)}`);
    }
  }

  async listTasks(args: ListTasksArgs) {
    try {
      let jql = "ORDER BY updated DESC";

      if (args.projectKey) {
        jql = `project = ${args.projectKey} AND ${jql}`;
      }

      if (args.status) {
        jql = `status = "${args.status}" AND ${jql}`;
      }

      if (args.assignee) {
        jql = `assignee = ${args.assignee} AND ${jql}`;
      }

      const response = await this.client.get("/rest/api/3/search", {
        params: {
          jql,
          maxResults: args.maxResults || 50,
          fields: "summary,status,assignee,priority,issuetype,project,updated",
        },
      });

      const issues = response.data.issues;

      if (issues.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "No tasks found matching the criteria.",
            },
          ],
        };
      }

      const taskList = issues
        .map((issue: any) => {
          const fields = issue.fields;
          return `• **${issue.key}**: ${fields.summary}\n  Status: ${
            fields.status?.name
          }, Assignee: ${fields.assignee?.displayName || "Unassigned"}`;
        })
        .join("\n\n");

      return {
        content: [
          {
            type: "text",
            text: `Found ${
              issues.length
            } task(s):\n\n${taskList}\n\nView all at: ${
              this.client.defaults.baseURL
            }/issues/?jql=${encodeURIComponent(jql)}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to list tasks: ${this.getErrorMessage(error)}`);
    }
  }

  private getErrorMessage(error: any): string {
    if (error.response?.data?.errorMessages) {
      return error.response.data.errorMessages.join(", ");
    }
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.message) {
      return error.message;
    }
    return "Unknown error occurred";
  }
}
