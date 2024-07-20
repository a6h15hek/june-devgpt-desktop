const fs = require('fs');
const path = require('path');

function get_gpt_system_prompts() {
    const SOURCE_DIRECTORY = path.join(__dirname, '../static/gpt_system_prompts');
    console.log('starting system prompts mapping creation...');
    let metadataMapping = [];
    let promptMapping = {};
    let stats = {
      filesProcessed: 0,
      totalSections: 0,
      totalKeys: 0
    };
  
    try {
      const files = fs.readdirSync(SOURCE_DIRECTORY);
  
      files.forEach(file => {
        const filePath = path.join(SOURCE_DIRECTORY, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const sections = content.split('---')[1].split('\n\n');
        const yamlSection = sections[0].split('\n').slice(1);
  
        let extractedData = {};
        let currentKey = '';
  
        yamlSection.forEach(line => {
          if (line.startsWith('  ')) {
            if (currentKey && currentKey.trim() !== '') {
              const keyValue = line.trim().split(':');
              if (keyValue[0].trim() !== '') {
                extractedData[currentKey] = {
                  ...extractedData[currentKey],
                  [keyValue[0].trim()]: keyValue[1].split(',').map(s => s.trim())
                };
                stats.totalKeys++;
              }
            }
          } else {
            const splitLine = line.split(':');
            const trimmedKey = splitLine[0].trim();
            currentKey = trimmedKey.replace(':', '');
            if (trimmedKey !== '') {
              if (splitLine[1]) {
                extractedData[currentKey] = splitLine[1].trim();
                stats.totalKeys++;
              } else {
                extractedData[currentKey] = null;
              }
            }
          }
        });
  
        // append fileName to extractedData
        extractedData['system_prompt_name'] = file;
        stats.totalSections += sections.length;
        stats.filesProcessed++;
  
        metadataMapping.push(extractedData);
  
        // New logic to create promptMapping
        const systemPrompt = content.split('#system-prompt')[1]?.split('#user-prompt')[0].trim(); // safe navigation
        const userPrompt = content.split('#user-prompt')[1]?.trim(); // safe navigation
        promptMapping[file] = { system_prompt: systemPrompt, user_prompt: userPrompt };
      });
  
    } catch(err) {
      console.error(`system prompts mapping creation failed: ${err}`);
    }
  
    console.log('system prompts mapping creation completed.');
    console.info(`system prompts mapping creation stats: ${JSON.stringify(stats)}`);
  
    return { metadataMapping, promptMapping };  // Return both mappings
}


  function main() {
    const jsonObject = get_gpt_system_prompts();

    const filePath = path.join(__dirname, '../static/generated/gpt_metadata.json');

    fs.writeFile(filePath, JSON.stringify(jsonObject, null, 2), (err) => {
        if (err) {
            console.error('Error writing file:', err);
            process.exit(1);
        }
        console.log('File written successfully to', filePath);
    });
}

main();