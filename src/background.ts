import {getHost} from "./lib/utils";

const HOST = getHost();

chrome.runtime.onInstalled.addListener(() => {
    console.log('Fast AI Rewrite extension installed');
});

// Check cookies
function getSessionToken(callback: any) {
    chrome.cookies.get({
        url: HOST,
        name: 'next-auth.session-token'
    }, (cookie) => {
        if (cookie) {
            console.log('Session token found', cookie.value);
            callback(cookie.value);
        } else {
            chrome.cookies.get({
                url: HOST,
                name: '__Secure-next-auth.session-token'
            }, (secureCookie) => {
                if (secureCookie) {
                    console.log('Secure session token found', secureCookie.value);
                    callback(secureCookie.value);
                } else {
                    console.log('No session token found');
                    callback(null);
                }
            });
        }
    });
}

// Pass token for the client script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getToken") {
        getSessionToken((token: any) => {
            if (token) {
                sendResponse({token: token});
            } else {
                sendResponse({error: "Token not found"});
            }
        });
        return true;  // Indicates we wish to send a response asynchronously
    }
});