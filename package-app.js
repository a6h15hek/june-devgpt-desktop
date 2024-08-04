const { exec } = require('child_process');
const { version } = require('./package.json');

const platform = process.argv[2]; // 'darwin' or 'win32'
const appName = platform === 'darwin' ? `JuneDevGPT_MACOS_${version}` : `JuneDevGPT_WIN_${version}`;

const command = `electron-packager . ${appName} --platform=${platform} --arch=x64 --out=dist/`;

exec(command, (err, stdout, stderr) => {
    if (err) {
        console.error(`Error: ${stderr}`);
        process.exit(1);
    }
    console.log(stdout);
});
