import { JiraClient } from "./jira-client.js";
import { config } from "dotenv";
// Load environment variables
config();
async function testJiraClient() {
    const client = new JiraClient({
        baseUrl: process.env.JIRA_BASE_URL,
        email: process.env.JIRA_EMAIL,
        apiToken: process.env.JIRA_API_TOKEN,
    });
    try {
        console.log("Testing Jira client...");
        // Test listing tasks
        console.log("\n1. Testing list tasks...");
        const listResult = await client.listTasks({ maxResults: 5 });
        console.log("List result:", listResult);
        // Test getting a specific task (if you have one)
        // console.log('\n2. Testing get task...');
        // const getResult = await client.getTask({ issueKey: 'PROJ-123' });
        // console.log('Get result:', getResult);
        console.log("\n✅ All tests completed successfully!");
    }
    catch (error) {
        console.error("❌ Test failed:", error);
    }
}
// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    testJiraClient();
}
//# sourceMappingURL=test.js.map