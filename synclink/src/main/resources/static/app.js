const conversationList = document.getElementById("conversationList");
const newChatButton = document.getElementById("newChatButton");
const chatSearch = document.getElementById("chatSearch");

const chatTitle = document.getElementById("chatTitle");
const chatStatus = document.getElementById("chatStatus");
const headerAvatar = document.getElementById("headerAvatar");

const messagesContainer = document.getElementById("messages");
const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");
const chatInfoButton = document.getElementById("chatInfoButton");

// Demo user IDs
const CURRENT_USER_ID = 1;
const OTHER_USER_ID = 2;

const chatData = {
    "Alex Johnson": {
        status: "Online",
        color: "avatar-blue",
        preview: "Hey! How are you?",
        messages: []
    },

    "Team Sync": {
        status: "Group conversation (Demo)",
        color: "avatar-green",
        preview: "Meeting at 5 PM",
        messages: [
            { text: "Meeting at 5 PM", type: "received" }
        ]
    }
};

let activeChat = "Alex Johnson";

function createConversation(name) {
    const conversation = document.createElement("div");
    conversation.className = "conversation";
    conversation.dataset.chatName = name;

    const avatar = document.createElement("div");
    avatar.className = `avatar ${chatData[name].color}`;
    avatar.textContent = name.charAt(0).toUpperCase();

    const info = document.createElement("div");
    info.className = "conversation-info";

    const top = document.createElement("div");
    top.className = "conversation-top";

    const heading = document.createElement("h3");
    heading.textContent = name;

    const preview = document.createElement("p");
    preview.textContent =
        chatData[name].preview || "Start a conversation";

    top.appendChild(heading);
    info.append(top, preview);
    conversation.append(avatar, info);

    conversation.addEventListener("click", function () {
        openChat(name);
    });

    conversationList.appendChild(conversation);

    return conversation;
}

function updateConversationPreview(name) {
    const conversation = Array.from(
        conversationList.querySelectorAll(".conversation")
    ).find(function (item) {
        return item.dataset.chatName === name;
    });

    if (!conversation) return;

    const preview = conversation.querySelector(".conversation-info p");

    if (preview) {
        preview.textContent =
            chatData[name].preview || "Start a conversation";
    }
}

async function loadMessages(senderId, receiverId) {
    try {
        const response = await fetch(
            `/api/messages/${senderId}/${receiverId}`
        );

        if (!response.ok) {
            throw new Error("Could not load messages");
        }

        return await response.json();
    } catch (error) {
        console.error("Error loading messages:", error);
        return [];
    }
}

function showEmptyState(name) {
    const emptyState = document.createElement("div");
    emptyState.className = "empty-state";

    const title = document.createElement("strong");
    title.textContent = `Start chatting with ${name}`;

    const description = document.createElement("span");
    description.textContent = "Send a message to begin the conversation.";

    emptyState.append(title, description);
    messagesContainer.appendChild(emptyState);
}

async function renderMessages(name) {
    messagesContainer.replaceChildren();

    const dateDivider = document.createElement("div");
    dateDivider.className = "date-divider";

    const dateLabel = document.createElement("span");
    dateLabel.textContent = "Today";

    dateDivider.appendChild(dateLabel);
    messagesContainer.appendChild(dateDivider);

    let messages = [];

    try {
        if (name === "Alex Johnson") {
            messages = await loadMessages(
                CURRENT_USER_ID,
                OTHER_USER_ID
            );
        } else if (name === "Team Sync") {
            const response = await fetch("/api/messages/group");

            if (!response.ok) {
                throw new Error("Could not load group messages");
            }

            messages = await response.json();
        } else {
            messages = chatData[name].messages.map(function (item) {
                return {
                    senderId: item.type === "sent"
                        ? CURRENT_USER_ID
                        : OTHER_USER_ID,
                    content: item.text
                };
            });
        }
    } catch (error) {
        console.error("Error loading conversation:", error);

        if (activeChat === name) {
            messagesContainer.replaceChildren();
            showEmptyState(name);
        }

        return;
    }

    // Prevent messages from appearing in a chat that is no longer open.
    if (activeChat !== name) return;

    if (messages.length === 0) {
        showEmptyState(name);
        return;
    }

    messages.forEach(function (item) {
        const message = document.createElement("div");

        message.classList.add(
            "message",
            Number(item.senderId) === CURRENT_USER_ID
                ? "sent"
                : "received"
        );

        message.textContent = item.content;
        messagesContainer.appendChild(message);
    });

    chatData[name].preview =
        messages[messages.length - 1].content;

    updateConversationPreview(name);

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function openChat(name) {
    if (!Object.prototype.hasOwnProperty.call(chatData, name)) {
        return;
    }

    activeChat = name;

    chatTitle.textContent = name;
    chatStatus.textContent = chatData[name].status;

    headerAvatar.className = `avatar ${chatData[name].color}`;
    headerAvatar.textContent = name.charAt(0).toUpperCase();

    conversationList.querySelectorAll(".conversation").forEach(
        function (conversation) {
            conversation.classList.toggle(
                "active",
                conversation.dataset.chatName === name
            );
        }
    );

    renderMessages(name);
    messageInput.focus();
}

// Initial conversations
conversationList.replaceChildren();

Object.keys(chatData).forEach(function (name) {
    createConversation(name);
});

// New Chat
newChatButton.addEventListener("click", function () {
    const inputName = prompt("Enter the person's name:");

    if (inputName === null) return;

    const name = inputName.trim();

    if (!name) {
        alert("Please enter a name.");
        return;
    }

    const existingName = Object.keys(chatData).find(
        function (savedName) {
            return savedName.toLowerCase() === name.toLowerCase();
        }
    );

    if (existingName) {
        alert("This conversation already exists.");
        openChat(existingName);
        return;
    }

    chatData[name] = {
        status: "New conversation (Demo)",
        color: "avatar-purple",
        preview: "Start a conversation",
        messages: []
    };

    createConversation(name);
    openChat(name);

    chatSearch.value = "";
    filterConversations("");
});

// Send message
messageForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const text = messageInput.value.trim();

    if (!text || !chatData[activeChat]) {
        return;
    }

    const chatAtSendTime = activeChat;

    try {
        let response;

        if (chatAtSendTime === "Team Sync") {
            response = await fetch("/api/messages/group/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    senderId: CURRENT_USER_ID,
                    receiverId: OTHER_USER_ID,
                    content: text,
                    conversationType: "GROUP"
                })
            });
        } else if (chatAtSendTime === "Alex Johnson") {
            response = await fetch("/api/messages/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    senderId: CURRENT_USER_ID,
                    receiverId: OTHER_USER_ID,
                    content: text,
                    conversationType: "PRIVATE"
                })
            });
        } else {
            // Newly created chats remain local demos for now.
            chatData[chatAtSendTime].messages.push({
                text: text,
                type: "sent"
            });

            chatData[chatAtSendTime].preview = text;
            updateConversationPreview(chatAtSendTime);
            messageInput.value = "";

            await renderMessages(chatAtSendTime);
            return;
        }

        if (!response.ok) {
            throw new Error("Message could not be saved");
        }

        const savedMessage = await response.json();

        chatData[chatAtSendTime].preview = savedMessage.content;
        updateConversationPreview(chatAtSendTime);

        messageInput.value = "";

        if (activeChat === chatAtSendTime) {
            await renderMessages(chatAtSendTime);
            messageInput.focus();
        }
    } catch (error) {
        console.error("Message send error:", error);
        alert("Message save nahi hua. Spring Boot console check karo.");
    }
});

// Search conversations
function filterConversations(query) {
    const searchTerm = query.trim().toLowerCase();

    conversationList.querySelectorAll(".conversation").forEach(
        function (conversation) {
            const name = conversation.dataset.chatName || "";

            conversation.style.display =
                name.toLowerCase().includes(searchTerm) ? "flex" : "none";
        }
    );
}

chatSearch.addEventListener("input", function () {
    filterConversations(chatSearch.value);
});

// Chat information
chatInfoButton.addEventListener("click", function () {
    alert(
        "Chat: " + activeChat +
        "\nStatus: " + chatData[activeChat].status +
        "\nMessages: " + chatData[activeChat].messages.length
    );
});

// Open default conversation
openChat(activeChat);