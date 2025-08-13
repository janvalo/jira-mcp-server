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
export declare class JiraClient {
    private client;
    constructor(config: JiraConfig);
    createTask(args: CreateTaskArgs): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    updateTaskStatus(args: UpdateStatusArgs): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    updateTaskProgress(args: UpdateProgressArgs): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    getTask(args: GetTaskArgs): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    listTasks(args: ListTasksArgs): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    private getErrorMessage;
}
export {};
//# sourceMappingURL=jira-client.d.ts.map