﻿import NTFile from "ntfile";

const batch = function () {
	const target_file = "./node_modules/docdash/tmpl/layout.tmpl";
	const target_file_org = target_file + "_org";
	if (NTFile.isExist(target_file_org)) {
		return;
	}
	if (!NTFile.isExist(target_file)) {
		return;
	}
	NTFile.copy(target_file, target_file_org);
	const text = NTFile.loadTextFile(target_file).split(/[\r\n]/);
	for (let i = 0; i < text.length; i++) {
		const line = text[i];
		if (/"Documentation"/.test(line)) {
			text[i] = line.replace(/"Documentation"/, '"S3js"');
			break;
		}
	}
	NTFile.saveTextFile(target_file, text.join("\n"));
};

batch();

NTFile.exec('npx jsdoc -R "./README.md" -c "./scripts/jsdoc.config.json"');

NTFile.copy("./build/esm/S3.min.js", "./docs/demo/libs/S3.min.js");
NTFile.copy("./build/esm/S3.min.d.ts", "./docs/demo/libs/S3.min.d.ts");
