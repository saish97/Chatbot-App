const chatMessages = document.querySelector(".chat-messages");
const button = document.querySelector("button");
const input = document.querySelector("input");

const systemMessage = "Hello! How can I help you today?";
const context = `The assistant is a well-informed AI trained to help and coach users with the principles within Liz Wiseman's Multipliers book. It is knowledgeable, respectful and acts like a coach that asks questions instead of giving answers.`;

let conversationHistory = [];

function appendMessage(message, sender) {
    const messageWrapper = document.createElement("div");
    messageWrapper.className = "message-wrapper " + sender;

    const messageContent = document.createElement("div");
    messageContent.className = "message-content";

    const prefix = sender === "user" ? "Saish: " : "BizGPT: ";
    const prefixElement = document.createElement("span");
    prefixElement.className = "message-prefix";
    prefixElement.innerText = prefix;

    messageContent.appendChild(prefixElement);
    messageContent.appendChild(document.createTextNode(message));

    messageWrapper.appendChild(messageContent);
    chatMessages.appendChild(messageWrapper);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function callOpenAIAPI(message) {
    const apiKey = "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";
    const orgId = "org-hcxBiOzsFDUTkhdB7FwqaX2N";
    const url = "https://api.openai.com/v1/chat/completions";
    conversationHistory.push({ role: "user", content: message });
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
                "X-Organization": orgId,
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{
                        role: "system",
                        content: context
                    },
                    {
                        role: "user",
                        content: message
                    },
                    ...conversationHistory
                ],
                max_tokens: 1500, //MAX_TOKENS
                temperature: 0.4,
            }),
        });

        //console.log("Raw API Response:", response);

        const data = await response.json();

        // console.log("API Response Data:", data);

        if (data.choices && data.choices.length > 0 && data.choices[0].message.content) {
            conversationHistory.push({ role: "assistant", content: data.choices[0].message.content.trim() });
            return data.choices[0].message.content.trim();
        } else {
            return "Sorry, I am unable to generate a response.";
        }
    } catch (error) {
        console.error("Error calling OpenAI API:", error);
        return "An error occurred while processing your request.";
    }
}

function appendTypingIndicator() {
    const messageWrapper = document.createElement("div");
    messageWrapper.className = "message-wrapper bot typing-indicator-wrapper";

    const messageContent = document.createElement("div");
    messageContent.className = "message-content";

    let typingIndicatorDot = document.createElement("span");
    typingIndicatorDot.className = "typing-indicator-dot";
    messageContent.appendChild(typingIndicatorDot);
    typingIndicatorDot = document.createElement("span");
    typingIndicatorDot.className = "typing-indicator-dot";
    messageContent.appendChild(typingIndicatorDot);
    typingIndicatorDot = document.createElement("span");
    typingIndicatorDot.className = "typing-indicator-dot";
    messageContent.appendChild(typingIndicatorDot);

    messageWrapper.appendChild(messageContent);
    chatMessages.appendChild(messageWrapper);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    return messageWrapper;
}


async function getResponseFromAssistant(message) {

    conversationHistory.push({ role: "user", content: message });

    const typingIndicatorElement = appendTypingIndicator();
    const response = await callOpenAIAPI(message);
    chatMessages.removeChild(typingIndicatorElement);

    conversationHistory.push({ role: "assistant", content: response });

    appendMessage(response, "assistant");
}

function sendMessage() {
    const message = input.value.trim();

    if (message !== "") {
        appendMessage(message, "user");
        input.value = "";
        getResponseFromAssistant(message);
    }
}

function clearChat() {
    chatMessages.innerHTML = "";
}

button.addEventListener("click", sendMessage);
input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        sendMessage();
    }
});

document.getElementById("clear-chat").addEventListener("click", clearChat);

document.addEventListener("DOMContentLoaded", () => {
    appendMessage(systemMessage, "assistant");
    conversationHistory.push({ role: "assistant", content: systemMessage });
});