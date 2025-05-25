import NTFile from "ntfile";

NTFile.exec("npx tsc -p ./scripts/tsconfig.json");
NTFile.copy("./build/type/S3.d.ts", "./build/cjs/S3.min.d.ts");
NTFile.copy("./build/type/S3.d.ts", "./build/umd/S3.min.d.ts");
NTFile.copy("./build/type/S3.d.ts", "./build/esm/S3.min.d.ts");
