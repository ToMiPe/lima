const { writeFileSync, mkdir } = require('fs');
require('dotenv').config();

const targetPath = './src/environments/environment.ts';

const envFileContent = `
export const environment = {
  PRODUCTION: '${process.env['PRODUCTION']}',
  URL: '${process.env['URL']}',
  URLMAIL: '${process.env['URLMAIL']}',
  MAPBOX_KEY: '${process.env['MAPBOX_KEY']}',
  SYSTEM_ID: '${process.env['SYSTEM_ID']}',
  VERSION: '${process.env['VERSION']}',
};`;

mkdir('./src/environments', { recursive: true, override: true }, (err) => {
  if (err) {
    console.error(err);
  } else {
    writeFileSync(targetPath, envFileContent);
  }
});
