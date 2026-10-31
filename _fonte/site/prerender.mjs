// Gera o HTML da página no build, para o texto aparecer antes do JavaScript carregar.
import fs from "node:fs";
import { render } from "./dist-ssr/entry-server.js";

const file = "dist/index.html";
const html = fs.readFileSync(file, "utf8").replace("<!--app-->", render());
fs.writeFileSync(file, html);
console.log("pré-renderizado:", (html.length / 1024).toFixed(1), "KB");
