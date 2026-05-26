const fs = require('fs');

function replaceIt(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/rounded-sm/g, 'rounded-none');
  fs.writeFileSync(file, content);
}

replaceIt('./components/MapComponent.tsx');
replaceIt('./components/PageContent.tsx');
console.log('Replaced successfully.');
