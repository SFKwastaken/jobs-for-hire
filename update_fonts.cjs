const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\asus\\Documents\\websites\\JobsForHire\\src\\components\\Resume\\templates';

const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

const replacements = [
  { regex: /text-\[([0-9.]+)px\]/g, replace: 'text-[calc($1px*var(--font-scale,1))]' },
  { regex: /\btext-xs\b/g, replace: 'text-[calc(0.75rem*var(--font-scale,1))]' },
  { regex: /\btext-sm\b/g, replace: 'text-[calc(0.875rem*var(--font-scale,1))]' },
  { regex: /\btext-base\b/g, replace: 'text-[calc(1rem*var(--font-scale,1))]' },
  { regex: /\btext-lg\b/g, replace: 'text-[calc(1.125rem*var(--font-scale,1))]' },
  { regex: /\btext-xl\b/g, replace: 'text-[calc(1.25rem*var(--font-scale,1))]' },
  { regex: /\btext-2xl\b/g, replace: 'text-[calc(1.5rem*var(--font-scale,1))]' },
  { regex: /\btext-3xl\b/g, replace: 'text-[calc(1.875rem*var(--font-scale,1))]' },
  { regex: /\btext-4xl\b/g, replace: 'text-[calc(2.25rem*var(--font-scale,1))]' },
  { regex: /\btext-5xl\b/g, replace: 'text-[calc(3rem*var(--font-scale,1))]' }
];

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  for (const { regex, replace } of replacements) {
    content = content.replace(regex, replace);
  }
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${file}`);
}
