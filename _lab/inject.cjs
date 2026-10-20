// CI 用：在 index.html 的 </body> 前插入 _lab/boot.js 引用（幂等）。
const fs=require("fs");
const p="index.html";
let h=fs.readFileSync(p,"utf8");
if(h.includes("_lab/boot.js")){console.log("already injected");process.exit(0);}
if(!h.includes("</body>")){console.error("no </body>");process.exit(1);}
const tag='<script src="_lab/boot.js"></script>';
h=h.replace("</body>",tag+"</body>");
fs.writeFileSync(p,h);
console.log("injected");
