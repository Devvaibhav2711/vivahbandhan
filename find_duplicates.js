const fs = require('fs');
try {
  const content = fs.readFileSync('src/contexts/LanguageContext.tsx', 'utf8');
  const lines = content.split('\n');
  const keys = [];
  lines.forEach((line, index) => {
    // Match keys like 'some.key':
    const match = line.match(/^\s*'([^']+)'\s*:/);
    if (match) {
      keys.push({ key: match[1], line: index + 1 });
    }
  });

  const duplicates = keys.filter((item, index) => 
    keys.findIndex(k => k.key === item.key) !== index
  );
  
  if (duplicates.length > 0) {
    console.log('Duplicates found:');
    duplicates.forEach(d => console.log(`${d.key} at line ${d.line}`));
  } else {
    console.log('No duplicates found.');
  }
} catch (e) {
  console.error(e);
}
