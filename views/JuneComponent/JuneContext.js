import React, {useState, createContext, useContext, useEffect} from 'react';
const { get_metadata, get_chat_db_stat, submit_feedback, 
  on_message_received, send_message_server} = require('@connector/june')
import {useGlobalStatus} from '../GlobalStatusContext';

const JuneContext = createContext({});

export const JuneContextProvider = ({ children }) => {
  const {fetchMetadataMapping, startIncomingMessageListener ,...restJuneObject} =
    useJuneService({});

  useEffect(() => {
    fetchMetadataMapping();
  }, []);

  useEffect(startIncomingMessageListener, []);

  return (
    <JuneContext.Provider value={restJuneObject}>
      {children}
    </JuneContext.Provider>
  );
};

const useJuneService = ({}) => {
  const [systemPromptTabList, setSystemPromptTabList] = useState([]);
  const [modelList, setModelList] = useState([]);
  const [systemPromptMessages, setSystemPromptMessages] = useState({});
  const [isSystemPromptWaitingResponse, setIsSystemPromptWaitingResponse] = useState({});
  const [systemPromptStatusMapping, setSystemPromptStatusMapping] = useState({});
  const [chatDBStats, setChatDBStats] = useState("");
  const [selectedSystemPrompt, setSelectedSystemPrompt] = useState({});
  const globalStatus = useGlobalStatus();

  const [inputParameter, setInputParameters] = useState({});
  const possibleKeys = ["context", "model", "temperature", "top_p", "n", "presence_penalty", "frequency_penalty"];
  const setInputParams = (system_prompt_name, key, value) => {
    if (!possibleKeys.includes(key.trim())) {
      console.error("Invalid Key: " + key);
      throw Error("Invalid Input Param key.")
    }
    setInputParameters(currentState => {
      const currentParams = currentState?.[system_prompt_name] || {};
      currentParams[key] = value;
      return {...currentState, [system_prompt_name]: currentParams}
    });
  }

  const setStatusState = (system_prompt_name, statusMessage) => {
    setSystemPromptStatusMapping(currentState => ({...currentState, [system_prompt_name]: statusMessage}));
  }

  const setWaitingResponseState = (system_prompt_name, isWaiting) => {
    setIsSystemPromptWaitingResponse(currentState => ({...currentState, [system_prompt_name]: isWaiting}));
  }

  const addMessage = (system_prompt_name, content, role) =>
    setSystemPromptMessages(currentSystemPromptsMessages => ({
    ...currentSystemPromptsMessages,
    [system_prompt_name]: [
      ...(currentSystemPromptsMessages[system_prompt_name] || []),
      { role, content }
    ],
  }));

  const clearMessages = (system_prompt_name) =>
    setSystemPromptMessages(currentSystemPromptsMessages => ({
      ...currentSystemPromptsMessages,
      [system_prompt_name]: []
    }));

  const addUserMessage = (system_prompt_name, content) => addMessage(system_prompt_name, content, 'user');
  const addAssistantMessage = (system_prompt_name, content) => addMessage(system_prompt_name, content, 'assistant');

  const send_message = async (system_prompt_name, message) => {
    try {
      setWaitingResponseState(system_prompt_name, true);
      setStatusState(system_prompt_name, "Sending Message...");
      addUserMessage(system_prompt_name, message);

      const response_text = await send_message_server({
        system_prompt_name: system_prompt_name,
        isNewSession: !systemPromptMessages.hasOwnProperty(system_prompt_name)
          || systemPromptMessages[system_prompt_name].length <= 1,
        message: message,
        inputParams: inputParameter[system_prompt_name]
      });
      setStatusState(system_prompt_name, response_text)
    } catch (error) {
      console.error('Failed to send message:', error);
      setStatusState(system_prompt_name, "Failed to send message");
    }
  }

  const send_feedback = async (system_prompt_name, assistantMessageIndex, isOk) => {
    try {
      setStatusState(system_prompt_name, "Sending Feedback...");
      const response_text = await submit_feedback({
        isOk,
        user_message: systemPromptMessages[system_prompt_name][assistantMessageIndex].content,
        assistant_message: systemPromptMessages[system_prompt_name][assistantMessageIndex - 1].content
      });
      setStatusState(system_prompt_name, response_text)
    } catch (error) {
      console.error('Failed to send feedback:', error);
      setStatusState(system_prompt_name, "Failed to send feedback");
    }
  }

  const startIncomingMessageListener = () => {
    on_message_received(messageObject => {
      addAssistantMessage(messageObject.system_prompt_name, messageObject.content);
      setWaitingResponseState(messageObject.system_prompt_name, false);
      setStatusState(messageObject.system_prompt_name, "Message Received.");
    })

    return () => {
      globalStatus.showSnackbar('info', 'Connection closed .');
    };
  }

  const fetchMetadataMapping = () => {
    try {
      console.log('Fetching system prompt metadata...');
      const response_json = get_metadata();
      setSystemPromptTabList(response_json.tab_contexts);
      setSelectedSystemPrompt(response_json.tab_contexts.find(tab => tab.system_prompt_name === 'no_prompt')); //default tab
      setStatusState('no_prompt', "Default Prompt loaded.");
      setModelList(response_json.models);
      setInputParameters(response_json.tab_contexts.reduce((result, tab) => {
        result[tab.system_prompt_name.trim()] = {
          context: tab?.context === 'true' || response_json.defaultInputParams.context,
          model: tab?.model || response_json.defaultInputParams.model,
          temperature: parseFloat(tab?.temperature) || response_json.defaultInputParams.temperature,
          top_p: parseFloat(tab?.top_p) || response_json.defaultInputParams.top_p,
          n: parseFloat(tab?.n) || response_json.defaultInputParams.n,
          presence_penalty: parseFloat(tab?.presence_penalty) || response_json.defaultInputParams.presence_penalty,
          frequency_penalty: parseFloat(tab?.frequency_penalty) || response_json.defaultInputParams.frequency_penalty
        };
        return result;
      }, response_json.defaultInputParams));
      console.log('Fetching system prompt completed');
    } catch (error) {
      console.error('Failed to fetch system prompt metadata:', error);
    }
  }

  const fetchChatDBState = () => {
    try {
      const response_json = get_chat_db_stat();
      setChatDBStats(Object.keys(response_json).map(client => {
        return Object.keys(response_json[client]).map((system_prompt, key) => {
          const contentStats = response_json[client][system_prompt];
          return ` ${key === 0 ? client : ''} ${system_prompt} ${contentStats.lines} ${contentStats.words} ${contentStats.chars}`;
        }).join("/n")
      }).join("/n"));

      console.log('Fetching chat db state completed.');
    } catch (error) {
      console.error('Failed to fetch chat DB state:', error);
    }
  }

  return {systemPromptTabList, modelList, fetchMetadataMapping, selectedSystemPrompt,setSelectedSystemPrompt,
    systemPromptMessages, clearMessages, send_message, startIncomingMessageListener,
    inputParameter, setInputParams,
    isSystemPromptWaitingResponse, systemPromptStatusMapping,
     chatDBStats ,
    fetchChatDBState, send_feedback
  };
}

export const useJune = () => useContext(JuneContext)
