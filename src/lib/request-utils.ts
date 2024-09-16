const HOST = "http://localhost:3000";

export async function sendRequest(path: string, method: string, body: any, needsAuth: boolean) {
    const request = new Request(`${HOST}/${path.replace('/', '')}`, {
        method: method,
        body: method === 'GET' || body === null ? undefined : JSON.stringify(body),
    })

    if (needsAuth) {
        // @ts-ignore
        const authToken = window.fastAiRewriteToken;

        if (authToken) {
            request.headers.set('Authorization', `Bearer ${authToken}`);
        }
        else {
            alert("Please login first to use this feature");
            return null;
        }
    }

    return await fetch(request)
}