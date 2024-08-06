const { exec } = require('child_process');
const path = require('path');

// Path to your Inno Setup script
const scriptPath = path.join('D:', 'FPT POLYTECHNIC', 'Du An Tot Nghiep (PRO2112)', 'installer', 'scripts.iss');

// Command to run the Inno Setup script
const command = `"C:\\Program Files (x86)\\Inno Setup 5\\Compil32.exe" /cc "${scriptPath}"`; // replace with your inno setup path

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error executing Inno Setup script: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
});