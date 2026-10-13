import { execFileSync } from 'node:child_process';
import { mkdtempSync, copyFileSync, rmSync, statSync, existsSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const source=resolve('assets/app-icon.svg');
const destination='ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png';
if(process.argv.includes('--if-needed') && existsSync(destination) && existsSync('ios/App/App/Assets.xcassets/AppIcon.appiconset/.svg-source') && statSync(source).mtimeMs <= statSync(destination).mtimeMs) {
  console.log('iPhone icon is current; preserving the native PNG.');
  process.exit(0);
}
// Rasterize the dedicated app icon; in-app branding uses the Satisampasanya PNG.
const output=mkdtempSync(join(tmpdir(),'sati-icon-'));
try {
  execFileSync('qlmanage',['-t','-s','1024','-o',output,source],{stdio:'pipe'});
  const png=join(output,'app-icon.svg.png');
  execFileSync('sips',['-z','1024','1024',png],{stdio:'pipe'});
  // Xcode's app icon must be opaque; Quick Look emits an alpha channel.
  const opaque=join(output,'opaque.jpg');
  const final=join(output,'AppIcon.png');
  execFileSync('sips',['-s','format','jpeg','-s','formatOptions','100',png,'--out',opaque],{stdio:'pipe'});
  execFileSync('sips',['-s','format','png',opaque,'--out',final],{stdio:'pipe'});
  copyFileSync(final,destination);
  writeFileSync('ios/App/App/Assets.xcassets/AppIcon.appiconset/.svg-source','assets/app-icon.svg\n');
  console.log('Updated the iPhone icon from assets/app-icon.svg. Rebuild the native app to see it.');
} finally {rmSync(output,{recursive:true,force:true});}
