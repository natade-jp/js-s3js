import NTFile from "ntfile";

NTFile.exec('npx rollup -c "./scripts/rollup.config.js"');

const targets = ["cjs", "esm", "umd"];
const files = ["S3GL.frag", "S3GL.vert"];

for (const target of targets) {
	for (const file of files) {
		NTFile.copy(`./src/gl/${file}`, `./build/${target}/${file}`);
	}
}
