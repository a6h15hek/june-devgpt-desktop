const axios = require('axios');
const {GPT_MODELS, GPT_INTERACTIVE_VALUES, validateArguments} = require('@services/gpt_constant');

// we set interactive to FALSE when we don't want extra context to go in
const gpt_chat_http = async (
  message,
  inputParams = {},
  model = GPT_MODELS[0],
  interactive = GPT_INTERACTIVE_VALUES[1]
) => {
  validateArguments(message, model, interactive);

  // Log the length of the message content in a single line
  const messageLengths = '[' + message.map((msg, i) => `${msg.role}=${msg.content.length}`).join(', ') + ']';
  console.log(`gpt.js -> gpt_http(): Message content lengths: ${messageLengths}`);
  console.log(`gpt.js -> gpt_http(): input params: `, inputParams);

  const requestData = {
    model,
    messages: message,
    temperature: 0.0,
    top_p: 0.0,
    n: 1,
    stream: false,
    presence_penalty: 0.0,
    frequency_penalty: 0.0,
    projects: [],
    repos: ["projects"],
    ...inputParams
  };

  try {
    const response = await axios.post(
      `${process.env.GPT_DEFAULT_API_URL}/v1/gpt_plugin/${interactive}`,
      requestData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GPT_API_KEY}`
        },
      },
    );

    response.data.choices.forEach(choice => {
      console.log(`gpt.js -> gpt_http():  Successful request - Message length: [${choice.message.role}=${choice.message.content.length}]`);
    })

    return response;
  } catch (error) {
    console.error(`gpt.js -> gpt_http(): Failed request - Error: ${error.message}`);
    throw error;
  }
};


const gpt_submit_feedback = async (feedback, user_message, assistant_message) => {
  if (!feedback || !user_message || !assistant_message) {
    console.error('Error: All arguments must be provided.');
    return false;
  }

  if (!(feedback === 'Y' || feedback === 'N')) {
    console.error('Error: Feedback value invalid. It should be either "Y" or "N".');
    return false;
  }

  const newUrl = `${process.env.GPT_DEFAULT_API_URL}/v1/save_feedbacke`;
  const requestBody = {
    feedback: feedback, //"N", "Y"
    prompt: user_message,
    message: assistant_message
  }

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${process.env.GPT_API_KEY}`
  };

  try {
    const response = await axios.post(newUrl, requestBody, { headers });
    if(response.status === 200){
      console.log('Feedback submitted successfully');
      return true;
    }else{
      throw new Error(`Request failed with status code ${response.status}`);
    }
  } catch (error) {
    console.error(`Failed to submit feedback: ${error.message}`);
  }
  return false;
};

module.exports = {gpt_submit_feedback, gpt_chat_http};