const fs = require('fs');
let content = fs.readFileSync('src/app/resume/[id]/ResumeEditorClient.tsx', 'utf8');

const start = content.indexOf('id="resume-preview"');
const end = content.indexOf('{/* ATS Score Modal */}');

if(start === -1 || end === -1) { 
  console.log('not found'); 
  process.exit(1); 
}

let before = content.substring(0, start);
let after = content.substring(end);
let target = content.substring(start, end);

target = target.replace(/bg-surface-bright/g, 'bg-white');
target = target.replace(/text-on-surface-variant/g, 'text-gray-600');
target = target.replace(/text-on-surface/g, 'text-gray-900');
target = target.replace(/border-outline/g, 'border-gray-300');
target = target.replace(/text-primary/g, 'text-indigo-600');

fs.writeFileSync('src/app/resume/[id]/ResumeEditorClient.tsx', before + target + after);
console.log('Replaced successfully');
