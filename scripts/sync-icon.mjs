import { execFileSync } from 'node:child_process';
import { mkdtempSync, copyFileSync, rmSync, statSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const source=resolve('frontend/public/images/Satisampasanya_Logo_app.png');
const destination='ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png';
if(process.argv.includes('--if-needed') && existsSync(destination) && statSync(source).mtimeMs <= statSync(destination).mtimeMs) {
  console.log('iPhone icon is current; preserving the native PNG.');
  process.exit(0);
}
// Use the same supplied logo for the native app icon.
const output=mkdtempSync(join(tmpdir(),'sati-icon-'));
try {
  const png=join(output,'app-logo.png');
  copyFileSync(source,png);
  execFileSync('sips',['-z','1024','1024',png],{stdio:'pipe'});
  // Xcode's app icon must be opaque; Quick Look emits an alpha channel.
  const opaque=join(output,'opaque.jpg');
  const final=join(output,'AppIcon.png');
  execFileSync('sips',['-s','format','jpeg','-s','formatOptions','100',png,'--out',opaque],{stdio:'pipe'});
  execFileSync('sips',['-s','format','png',opaque,'--out',final],{stdio:'pipe'});
  copyFileSync(final,destination);
  console.log('Updated the iPhone icon from frontend/public/images/Satisampasanya_Logo_app.png. Rebuild the native app to see it.');
} finally {rmSync(output,{recursive:true,force:true});}
