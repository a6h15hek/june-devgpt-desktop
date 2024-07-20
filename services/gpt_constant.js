const GPT_ROLES = {
  SYSTEM_ROLE: process.env.GPT_SYSTEM_ROLE,
  ASSISTANT_ROLE: process.env.GPT_ASSISTANT_ROLE,
  USER_ROLE: process.env.GPT_USER_ROLE
};
const GPT_MODELS = process.env.GPT_AVAILABLE_MODELS.split(",");
const GPT_INTERACTIVE_VALUES = process.env.GPT_AVAILABLE_INTERACTIVE_OPTIONS.split(",");

const validateArguments = (message, model, interactive) => {
  if (!Array.isArray(message)) {
    throw new Error("Message argument is not an array");
  }

  for (const msg of message) {
    if (typeof msg !== 'object') {
      throw new Error("Invalid message item type, should be an object");
    }
    if (!msg.hasOwnProperty('content')) {
      throw new Error("Missing 'content' field in a message item");
    }
    if (!msg.hasOwnProperty('role')) {
      throw new Error("Missing 'role' field in a message item");
    }
    if (typeof msg.content !== 'string' || msg.content.trim().length === 0) {
      throw new Error("The 'content' field in a message item must be a non-empty string");
    }
    if (!Object.values(GPT_ROLES).includes(msg.role)) {
      throw new Error("Invalid 'role' value in a message item");
    }
  }

  if (!GPT_MODELS.includes(model)) {
    throw new Error("Invalid model argument");
  }

  if (!GPT_INTERACTIVE_VALUES.includes(interactive)) {
    throw new Error("Invalid interactive argument");
  }
};

module.exports = { GPT_ROLES, GPT_MODELS, GPT_INTERACTIVE_VALUES, validateArguments };
