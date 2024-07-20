const { GPT_ROLES } = require('@services/gpt_constant');

let chat_database = {};

const getMessage = (system_prompt_name) => {
  if (chat_database[system_prompt_name]) {
    return chat_database[system_prompt_name];
  }
  throw Error("Database integrity failed.");
}

const getNoContextMessage = (system_prompt_name) => {
  const chatData = chat_database?.[system_prompt_name];
  if (chatData) {
    if (chatData.length > 1 && chatData[0].role === 'system') {
      return [chatData[0], chatData[chatData.length - 1]];
    } else {
      return [chatData[chatData.length - 1]];
    }
  }
  throw Error("Database integrity failed.");
}

const addMessage = (system_prompt_name, message, role) => {
  const currentMessages = chat_database[system_prompt_name] ?? [];
  chat_database[system_prompt_name] = [
    ...currentMessages,
    {
      content: message,
      role: role
    }
  ];
}

const addSystemMessage = (system_prompt_name, message) =>
  addMessage(system_prompt_name, message, GPT_ROLES.SYSTEM_ROLE);
const addUserMessage = (system_prompt_name, message) =>
  addMessage(system_prompt_name, message, GPT_ROLES.USER_ROLE);
const addAssistantMessage = (system_prompt_name, message) =>
  addMessage(system_prompt_name, message, GPT_ROLES.ASSISTANT_ROLE);

const removeMessage = (system_prompt_name, message) => {
  const messageIndex = chat_database[system_prompt_name].findIndex(chat => chat.content === message);

  if (messageIndex >= 0) {
    chat_database[system_prompt_name].splice(messageIndex, 1);
  }
}

const deleteSystemPrompt = (system_prompt_name) => {
  if (chat_database[system_prompt_name]) {
    delete chat_database[system_prompt_name];
  }
}

const deleteClient = () => {
  chat_database = {};
}

function getState() {
  let result = {};
  for (let system_prompt in chat_database) {
    let words = 0, chars = 0, lines = 0;
    chat_database[system_prompt].forEach(conversation => {
      if (conversation.role === 'system') {
        words += conversation.content.split(' ').length;
        chars += conversation.content.length;
        lines += conversation.content.split('\n').length;
      }
    });
    result[system_prompt] = { words, chars, lines };
  }
  return result;
}

module.exports = { getMessage, getNoContextMessage, addSystemMessage, addUserMessage, addAssistantMessage, deleteSystemPrompt, deleteClient, getState };
