const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'index.html');
let content = fs.readFileSync(indexPath, 'utf8');

// 1. Extract CSS
const styleStartStr = '<style>';
const styleEndStr = '</style>';
const styleStartIdx = content.indexOf(styleStartStr);
const styleEndIdx = content.indexOf(styleEndStr);

if (styleStartIdx !== -1 && styleEndIdx !== -1) {
    const cssContent = content.substring(styleStartIdx + styleStartStr.length, styleEndIdx).trim();
    fs.writeFileSync(path.join(__dirname, 'styles.css'), cssContent, 'utf8');
    
    content = content.substring(0, styleStartIdx) + 
              '<link rel="stylesheet" href="styles.css" />' + 
              content.substring(styleEndIdx + styleEndStr.length);
    console.log('Successfully extracted styles.css');
} else {
    console.log('Could not find <style> block.');
}

// 2. Extract JS
// We assume the main application logic is in the LAST <script> block before </body>.
// The file has multiple scripts, e.g. <script src="..."></script>. We want the inline one.

const scriptEndStr = '</script>';
const scriptStartStr = '<script>';

// Find the last </script>
const lastScriptEndIdx = content.lastIndexOf(scriptEndStr);
// Find the <script> before that
const lastScriptStartIdx = content.lastIndexOf(scriptStartStr, lastScriptEndIdx);

if (lastScriptStartIdx !== -1 && lastScriptEndIdx !== -1) {
    // Check if it's an inline script by ensuring it doesn't have a 'src' attribute immediately
    const scriptTag = content.substring(lastScriptStartIdx, lastScriptStartIdx + 50);
    if (scriptTag.includes('src=')) {
         console.log('The last script tag has a src attribute. Make sure to target the inline script.');
    } else {
        // Find the actual end of the <script> opening tag (in case of attributes like type="module")
        const scriptTagEndIdx = content.indexOf('>', lastScriptStartIdx);
        const jsContent = content.substring(scriptTagEndIdx + 1, lastScriptEndIdx).trim();
        fs.writeFileSync(path.join(__dirname, 'main.js'), jsContent, 'utf8');
        
        content = content.substring(0, lastScriptStartIdx) + 
                  '<script src="main.js"></script>' + 
                  content.substring(lastScriptEndIdx + scriptEndStr.length);
        console.log('Successfully extracted main.js');
    }
} else {
    console.log('Could not find main <script> block.');
}

// Write the minified index.html back
fs.writeFileSync(indexPath, content, 'utf8');
console.log('Updated index.html length:', content.length, 'bytes');
