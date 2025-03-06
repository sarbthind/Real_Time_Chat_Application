const path = require('path');
console.log("DIR:"+__dirname);
console.log("FILE:"+__filename);

console.log("RESOLVED:"+path.resolve(__dirname, ".."));
console.log(":FINISHED");
const __dirname1=path.resolve(__dirname, "..");
console.log(path.resolve(__dirname1, "frontend", "dist", "index.html"));

