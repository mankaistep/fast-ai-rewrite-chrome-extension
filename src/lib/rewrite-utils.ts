import {sendRequest} from "./request-utils";

export async function getAgents() {
    try {
        const response = await sendRequest('/api/agents', 'GET', null, true);

        if (response == null) {
            return null;
        }

        const allAgents = await response.json();

        // Filter out agents that are not active
        return allAgents.filter((agent: any) => agent.status === "active");
    } catch (error) {
        console.error("Error fetching agents:", error);
        return null;
    }
}

export async function rewrite(agentId: number, original: string, prompt: string)  {
    const response = await sendRequest('/api/rewrite/generate', 'POST', { agentId, original, prompt }, true);

    if (response == null) {
        return null
    }

    return await response.json()
}

export async function markAsApproved(activityId: string) {
    const response = await sendRequest('/api/rewrite/mark-as-approved', 'POST', { activityId }, true);

    if (response == null) {
        return null
    }

    return await response.json()
}