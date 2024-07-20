

import React from 'react';
import Markdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coldarkDark as editorTheme  } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import Box from '@mui/material/Box';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {IconButton} from '@mui/material';


const codeEditorStyle = {
  lineHeight: '1',
  fontWeight: '600',
  padding: 0,
  margin: 0
}

const MarkdownRenderer = ({ children }) => {
  const markdown = children?.replace(/`/g, "~");
  return (
    <Markdown
      className={'chat-font'}
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');

          return <>
            {
              !inline && match ? (
                <SyntaxHighlighter
                  style={editorTheme}
                  customStyle={codeEditorStyle}
                  PreTag="div"
                  language={match[1]}
                  showLineNumbers={true}
                  lineNumberStyle={{width: '3px !important'}}
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code className={className} {...props}
                  style={{
                    background: editorTheme["pre[class*=\"language-\"]"].background,
                    display: 'block',
                    paddingTop: '4px',
                    paddingLeft: '10px',
                    width: '100% !important',
                    ...codeEditorStyle
                  }}
                >
                  {children}
                </code>
              )
            }
            <Box
              sx={{
                margin: '0',
                background: editorTheme["pre[class*=\"language-\"]"].background,
                display: 'flex', justifyContent:'flex-end', padding: '1px 10px 10px 0'
              }}
            >
              <IconButton
                sx={{margin: 0, padding: 0}}
                onClick={() => {navigator.clipboard.writeText(children)}}
              >
                <ContentCopyIcon sx={{width: '18px', height: '18px', color:'white'}}/>
              </IconButton>
            </Box>
          </>;
        }
      }}
    >
      {markdown}
    </Markdown>
  );
};

export default MarkdownRenderer;
