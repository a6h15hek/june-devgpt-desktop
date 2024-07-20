const events = require('events');
const { GPT_MODELS, GPT_ROLES, GPT_INTERACTIVE_VALUES } = require('@services/gpt_constant');
const { getMessage, getNoContextMessage, addSystemMessage, addUserMessage, addAssistantMessage, deleteSystemPrompt, getState } = require('@utils/gpt_user_chat_store');
const { gpt_chat_http, gpt_submit_feedback } = require('@services/gpt_http');

const { metadataMapping, promptMapping } = require('@static/generated/gpt_metadata.json');

const metadata = {
  tab_contexts: metadataMapping,
  models: GPT_MODELS,
  interactive: GPT_INTERACTIVE_VALUES,
  role: GPT_ROLES,
  defaultInputParams: {
    context: false,
    model: GPT_MODELS[0],
    temperature: 0.0,
    top_p: 0.0,
    n: 1,
    presence_penalty: 0.0,
    frequency_penalty: 0.0
  }
};

function get_metadata() {
  return metadata;
}

const sseEmitter = new events.EventEmitter();
const MESSAGE_QUEUE_NAME = 'incoming-chat-response';

const processMessage = async (system_prompt_name, inputParams = {}) => {
  const { context = false } = inputParams;
  try {
    const { data: { choices } } = await gpt_chat_http(context ? getMessage(system_prompt_name) : getNoContextMessage(system_prompt_name), inputParams);

    choices?.forEach(choice => {
      addAssistantMessage(system_prompt_name, choice.message.content);
      sseEmitter.emit(MESSAGE_QUEUE_NAME, { system_prompt_name, content: choice.message.content });
    });
  } catch (error) {
    console.error('Failed to process message:', error);
  }
};

async function send_message_server(request_args) {
  try {
    const { system_prompt_name, isNewSession = true, message, inputParams } = request_args;

    if (!system_prompt_name || !message) {
      console.warn('Incomplete data received: Both system_prompt_name and message are required.');
      return  'Incomplete data received.';
    }

    const promptMappingObject = promptMapping?.[system_prompt_name];
    if (isNewSession) {
      deleteSystemPrompt(system_prompt_name);
      if (promptMappingObject?.system_prompt) {
        addSystemMessage(system_prompt_name, promptMappingObject?.system_prompt);
      }
    }

    if (promptMappingObject?.user_prompt.includes('@user_input_message@')) {
      addUserMessage(system_prompt_name, promptMappingObject?.user_prompt.replace('@user_input_message@', message));
    } else {
      addUserMessage(system_prompt_name, message);
    }
    processMessage(system_prompt_name, inputParams);
    return 'Message added to queue: Processing...';
  } catch (error) {
    console.error('Error occurred while processing POST request:', error);
    return 'Internal server error.';
  }
}

function on_message_received(callback) {
  const listener = (data) => {
    callback(data);
    console.debug('Response sent');
  };

  sseEmitter.on(MESSAGE_QUEUE_NAME, listener);
}

function get_chat_db_stat() {
  return getState();
}

async function submit_feedback(feedback_argument) {
  try {
    const { isOk = true, user_message, assistant_message } = feedback_argument;
    const isSuccess = await gpt_submit_feedback(isOk ? 'Y' : 'N', user_message, assistant_message);
    if (isSuccess) {
      return 'Feedback submitted successfully.';
    } else {
      return 'Feedback submission failed.';
    }
  } catch (error) {
    console.error('Error occurred while processing POST request:', error);
    return 'Internal server error.';
  }
}

module.exports = { get_metadata, submit_feedback, get_chat_db_stat, on_message_received, send_message_server };
