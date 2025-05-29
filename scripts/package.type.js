import NTFile from "ntfile";

NTFile.exec("npx tsc -p ./scripts/tsconfig.json");

const targets = ["cjs", "umd", "esm"];
const src = "./build/type/S3.d.ts";

for (const target of targets) {
	NTFile.copy(src, `./build/${target}/S3.min.d.ts`);
}
