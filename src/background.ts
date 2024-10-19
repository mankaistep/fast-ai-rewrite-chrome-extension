import {getHost} from "./lib/utils";

const HOST = getHost();

chrome.runtime.onInstalled.addListener(() => {
    console.log('Fast AI Rewrite extension installed');
});

// Check cookies
chrome.cookies.get({
        url: HOST,
        name: 'next-auth.session-token'
    }, (cookie) => {
        if (cookie) {
            console.log('Session token found', cookie.value);
        } else {
            console.log('Session token not found');
        }
    })

// Pass token for the client script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getToken") {
        chrome.cookies.get({
            url: HOST,  // Replace with your actual domain in production
            name: "next-auth.session-token"
        }, (cookie) => {
            if (cookie) {
                sendResponse({token: cookie.value});
            } else {
                sendResponse({error: "Token not found"});
            }
        });
        return true;  // Indicates we wish to send a response asynchronously
    }
});