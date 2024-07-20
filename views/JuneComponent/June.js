import React, {useEffect, useRef, useState} from 'react';
import './june.css';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import {
  Button, ButtonGroup, IconButton, Paper, styled, Table, TableBody,
  TableCell as MaterialTableCell, tableCellClasses, TableContainer,
  TableHead, TableRow as MaterialTableRow, Typography,
  Card, CardContent, NativeSelect, Slider
} from '@mui/material';

import SendIcon from '@mui/icons-material/Send';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import ClearIcon from '@mui/icons-material/Clear';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import {JuneContextProvider, useJune} from './JuneContext';
import MarkdownRenderer from '../util/MarkdownRenderer';


const TableCell = styled(MaterialTableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const TableRow = styled(MaterialTableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const contentStats = (content = "") => {
  const lines = content.split(/\r\n|\r|\n/).length;
  const words = (content.match(/\b\S+\b/g) || []).length;
  const chars = content.length;
  return {lines, words, chars};
}

const alphabetColor = {
  a: '#8B0000', b: '#808000', c: '#008080', d: '#000080', e: '#800080', f: '#B8860B',
  g: '#006400', h: '#BDB76B', i: '#8B008B', j: '#556B2F', k: '#FF8C00', l: '#9932CC',
  m: '#8B0000', n: '#E9967A', o: '#8FBC8F', p: '#483D8B', q: '#2F4F4F', r: '#00CED1',
  s: '#9400D3', t: '#FF1493', u: '#00BFFF', v: '#696969', w: '#1E90FF', x: '#B22222',
  y: '#FFFAF0', z: '#228B22'
}

const SystemPromptTabList = () => {
  const { systemPromptTabList = [] } = useJune();
  return (
    <Box sx={{flex: '0 0 25%', overflowY:'scroll', scrollbarWidth: 'none', '&::-webkit-scrollbar': {width: '0px'}}}>
      {systemPromptTabList.map((tab, key) => (
        <SystemPromptTab key={key} tabData={tab} />
      ))}
    </Box>
  );
}

const SystemPromptTab = ({ tabData }) => {
  const cardColor =  alphabetColor[tabData.name[0].toLowerCase()]
  const { selectedSystemPrompt : { system_prompt_name }, setSelectedSystemPrompt} = useJune();

  return (
    <Card
      sx={{
        margin:1,
        cursor:'pointer',
        borderLeft: (system_prompt_name === tabData.system_prompt_name ? 24 : 14) + 'px solid '+ cardColor
      }}
      elevation={4}
      onClick={() => setSelectedSystemPrompt({name: tabData.name, system_prompt_name: tabData.system_prompt_name})}
    >
      <CardContent sx={{margin: 0, padding: '6px 8px'}}>
        <Typography variant="h6" component="div">{tabData?.name}</Typography>
        <Typography variant="body2">{tabData?.description}</Typography>
      </CardContent>
    </Card>
  );
};

const ChatBoxHeader = ({}) => {
  const { selectedSystemPrompt: { system_prompt_name, name  }, systemPromptStatusMapping, modelList = [],
    inputParameter, setInputParams} = useJune();
  return (
    <TableRow>
      <TableCell  sx={{display: 'flex', justifyContent:'space-between'}}>
        <Box>{name} <i style={{fontWeight: 400}}>{systemPromptStatusMapping[system_prompt_name]
          ? '- ' + systemPromptStatusMapping[system_prompt_name] : ''}</i>
        </Box>
        <Box sx={{display: 'flex', justifyContent:'flex-end'}}>
          {modelList.length > 0 && <NativeSelect
            value={inputParameter[system_prompt_name]?.model || modelList[0]}
            onChange={e => setInputParams(system_prompt_name, 'model' ,e.target.value)}
            variant={'outlined'}
            inputProps={{
              sx:{
                margin: 0,
                padding: '0 2px'
              }
            }}
          >
            {modelList.map((name, key) => <option key={key} value={name}>{name}</option>)}
          </NativeSelect>
          }

          <NativeSelect
            value={inputParameter[system_prompt_name]?.context || false}
            onChange={e => setInputParams(system_prompt_name, 'context' ,e.target.value)}
            variant={'outlined'}
            sx={{ margin: '0 4px'}}
            inputProps={{
              sx:{
                margin: 0,
                padding: '0 1px'
              }
            }}
          >
            <option value={true}>Context:TRUE</option>
            <option value={false}>Context:FALSE</option>
          </NativeSelect>
          <b title={'Just Ultimate Neural Enchancer - Dynamic Enigma Vortex Generating Predictive Technology'}>June DevGPT++</b>
        </Box>
      </TableCell>
    </TableRow>
  );
}

const ChatBody = ({divRef}) => {
  const {systemPromptMessages = {}, selectedSystemPrompt: { system_prompt_name }, send_feedback} = useJune();

  useEffect(() => {
    if (systemPromptMessages.hasOwnProperty(system_prompt_name) && divRef?.current) {
      divRef.current.scrollTop = divRef.current.scrollHeight;
    }
  }, [systemPromptMessages?.[system_prompt_name]?.length]);

  return (
    <TableBody>
      {systemPromptMessages.hasOwnProperty(system_prompt_name) &&
        systemPromptMessages[system_prompt_name].map((messageObject, key) => {
          const isAssistant = messageObject.role === 'assistant'
          return (
          <TableRow key={key} >
            <TableCell sx={{display: 'flex', flexDirection:'row', margin: 0, padding: 0}}>
              <Box sx={{width: '3%', padding: '0 0 10px 3px'}}>
                <ButtonGroup variant="outlined" size="small" orientation="vertical" sx={{ margin: 0, padding: 0}}>
                  {isAssistant ?
                    <>
                      <IconButton sx={{fontSize: '16px', margin: 0, padding: 0}}>🤖</IconButton>
                      <IconButton
                        sx={{margin: 0, padding: 0}}
                        onClick={() => send_feedback(system_prompt_name,key, true)}
                      >
                        <ThumbUpIcon sx={{width: '18px', height: '18px'}}/>
                      </IconButton>
                      <IconButton
                        sx={{margin: 0, padding: 0}}
                        onClick={() => send_feedback(system_prompt_name,key, true)}
                      >
                        <ThumbDownIcon sx={{width: '18px', height: '18px'}}/>
                      </IconButton>
                    </>
                    : <IconButton sx={{fontSize: '16px', margin: 0, padding: 0}}>😐</IconButton>
                  }
                  <IconButton sx={{margin: 0, padding: 0}} onClick={() => {navigator.clipboard.writeText(messageObject.content)}}>
                    <ContentCopyIcon sx={{width: '18px', height: '18px'}}/>
                  </IconButton>
                </ButtonGroup>
              </Box>
              <Box sx={{ width: '97%', margin:'0 0 0 4px', whiteSpace: isAssistant ? 'normal': 'pre-line'}}>
                <MarkdownRenderer>
                  {messageObject.content}
                </MarkdownRenderer>
              </Box>
            </TableCell>
          </TableRow>)
        })
      }
    </TableBody>
  );
}

const ChatBoxInput = ({theme}) => {
  const [content, setContent] = useState("");
  const [stats, setStats] = useState({lines: 0, words: 0, chars: 0});
  const { selectedSystemPrompt: { system_prompt_name }, send_message, clearMessages, isSystemPromptWaitingResponse,
    inputParameter, setInputParams} = useJune();


  useEffect(() => setStats(contentStats(content)), [content]);

  const sendMessage = () => {
    if(content && !isSystemPromptWaitingResponse[system_prompt_name]){
      send_message(system_prompt_name, content);
      setContent("");
    }
  }

  const onKeyDownHandler = (event) => {
    // if Enter is pressed without Shift
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage()
    }
  }


  const {temperature = 0.0, top_p = 0.0, n= 1, presence_penalty=0.0,
    frequency_penalty = 0.0} = inputParameter?.[system_prompt_name] || {};
  return (
  <Box sx={{width: '100%', height: '19.5%', display: 'flex', flexDirection: 'row'}} >
    <Paper sx={{width: '80%', height: '100%', padding: '2px'}} elevation={3}>
      <textarea autoFocus rows={7}
        onKeyDown={onKeyDownHandler}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        style={{
          background: 'inherit',
          fontSize: '15px', fontWeight: 'normal',
          color: theme.palette.text.primary, height: '97%',
          width: '99%', resize: 'none',
          border: 'none', outline: 'none',
          fontFamily: "'Fira Code Medium', monospace"
      }}
      />
    </Paper>
    <Paper sx={{width: '12%', height: '100%', margin: '0 8px', padding: '2px 5px'}} elevation={3}>
      <Slider size="small" color="error" valueLabelDisplay="on"  step={0.1} marks min={0.0} max={1.0} valueLabelFormat={x => x + " R"}
         value={temperature} onChange={(e) => setInputParams(system_prompt_name, 'temperature' ,e.target.value)}/>

      <Slider size="small" color="warning" valueLabelDisplay="on" step={0.1} marks min={0.0} max={1.0} valueLabelFormat={x => x + " T"}
        sx={{marginTop: '9px'}} value={top_p} onChange={(e) => setInputParams(system_prompt_name, 'top_p' ,e.target.value)}/>

      <Slider size="small" color="info" valueLabelDisplay="on" step={1} marks min={1} max={3} valueLabelFormat={x => x + " N"}
        sx={{marginTop: '9px'}} value={n} onChange={(e) => setInputParams(system_prompt_name, 'n' ,e.target.value)}/>

      <Slider size="small" color="white " valueLabelDisplay="on" step={0.1} marks min={0.0} max={1.0} valueLabelFormat={x => x + " P"}
        sx={{marginTop: '9px'}} value={presence_penalty} onChange={(e) => setInputParams(system_prompt_name, 'presence_penalty' ,e.target.value)}/>

      <Slider size="small" color="white" valueLabelDisplay="on" step={0.1} marks min={0.0} max={1.0} valueLabelFormat={x => x + " F"}
        sx={{marginTop: '9px'}} value={frequency_penalty} onChange={(e) => setInputParams(system_prompt_name, 'frequency_penalty' ,e.target.value)}/>
    </Paper>
    <Box sx={{width: '8%'}} >
      <ButtonGroup orientation="vertical" variant="contained" fullWidth>
        <Button
          key="submit"
          color="info"
          endIcon={<SendIcon/>}
          sx={{height: '45px'}}
          onClick={sendMessage}
          disabled={!!isSystemPromptWaitingResponse[system_prompt_name] || content === ""}
        >
          {!!isSystemPromptWaitingResponse[system_prompt_name] ? 'Loading...' : 'SEND'}
        </Button>
        <Button key="clear" color="secondary" startIcon={<ClearIcon/>}
          onClick={() => setContent("")}>CLEAR</Button>

        <Button key="chat-clear" color="error" startIcon={<DeleteSweepIcon/>}
          onClick={() => clearMessages(system_prompt_name)}>CHATS</Button>
      </ButtonGroup>
      <Paper elevation={3} sx={{padding: '0px 3px', marginTop: '8px'}}>
        <Typography variant="subtitle2" gutterBottom style={{margin: '10px 0', color: 'grey', fontWeight: '900', lineHeight: 1}}>
          Chars: {stats.chars} <br/>
          Words: {stats.words}  <br/>
          Lines: {stats.lines}
        </Typography>
      </Paper>
    </Box>
  </Box>);
}

const June = () => {
  const theme = useTheme();
  const divRef = useRef(null);

  return  (
    <JuneContextProvider>
      <Box sx={{ flexGrow: 1, display: 'flex', height: '100vh', backgroundColor: theme.palette.background.default}}>
        <SystemPromptTabList />
        <Box sx={{flex: '1 1 auto'}}>
          <TableContainer component={Paper} sx={{width: '100%', height: '78%', margin: '8px 0'}} elevation={3} ref={divRef}>
            <Table stickyHeader={true}  size="small" >
              <TableHead sx={{position: 'sticky', top: '0', zIndex: 2}}>
                <ChatBoxHeader />
              </TableHead>
              <ChatBody divRef={divRef}/>
            </Table>
          </TableContainer>
          <ChatBoxInput theme={theme}/>
        </Box>
      </Box>
    </JuneContextProvider>
  );
}

export default June;
