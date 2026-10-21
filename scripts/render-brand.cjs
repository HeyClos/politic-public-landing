#!/usr/bin/env node
// npm install sharp, or set NODE_PATH to a runtime that includes sharp.
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'assets/brand');
async function png(source, destination, width, height=width) {
  await sharp(path.join(out,source),{density:300}).resize(width,height).png().toFile(path.join(out,destination));
}
(async()=>{
  for(const n of [16,32,48]) await png('favicon.svg',`favicon-${n}.png`,n);
  await png('apple-touch-icon.svg','apple-touch-icon.png',180);
  await png('social-card.svg','social-card.png',1200,630);
  for(const name of ['mark','mark-paper','mark-gold']) await png(name+'.svg',name+'.png',1800);
  for(const name of ['logo-ink','logo-paper','logo-gold','logo-green']) await png(name+'.svg',name+'.png',1700,700);
  // ICO accepts PNG entries; retain native 16/32/48 pixel representations.
  const sizes=[16,32,48];
  const images=sizes.map(n=>fs.readFileSync(path.join(out,`favicon-${n}.png`)));
  const header=Buffer.alloc(6+16*sizes.length);header.writeUInt16LE(1,2);header.writeUInt16LE(sizes.length,4);
  let offset=header.length;
  images.forEach((data,i)=>{const p=6+16*i;header[p]=sizes[i];header[p+1]=sizes[i];header.writeUInt16LE(1,p+4);header.writeUInt16LE(32,p+6);header.writeUInt32LE(data.length,p+8);header.writeUInt32LE(offset,p+12);offset+=data.length;});
  fs.writeFileSync(path.join(out,'favicon.ico'),Buffer.concat([header,...images]));
  fs.copyFileSync(path.join(out,'favicon.ico'),path.join(root,'favicon.ico'));
  console.log('Exported transparent PNG artwork, social image, PNG favicons, ICO, and touch icon.');
})().catch(error=>{console.error(error);process.exit(1);});
