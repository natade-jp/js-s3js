import NTFile from "ntfile";

NTFile.exec("npx tsc -p ./scripts/tsconfig.json");
NTFile.copy("./build/type/Lumi3D.d.ts", "./build/cjs/Lumi3D.min.d.ts");
NTFile.copy("./build/type/Lumi3D.d.ts", "./build/umd/Lumi3D.min.d.ts");
NTFile.copy("./build/type/Lumi3D.d.ts", "./build/esm/Lumi3D.min.d.ts");
