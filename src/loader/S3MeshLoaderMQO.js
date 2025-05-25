import S3System from "../basic/S3System.js";
import S3Mesh from "../basic/S3Mesh.js";
import S3Vector from "../math/S3Vector.js";

/**
 * パス名操作・ファイルパスの解決用ヘルパークラス
 *
 * - MQOファイル内や外部ファイルへの参照（テクスチャパス等）を絶対パスに変換するために利用されます。
 * - `getAbsolutePath()` でファイルの絶対パスを計算し、`getParent()` で親ディレクトリのパスも取得できます。
 * - 内部的にパスの区切りを正規化（バックスラッシュ→スラッシュ）します。
 */
class File {
	/**
	 * ファイルインスタンスを生成します。
	 * @param {string} pathname ファイルパスやURL
	 */
	constructor(pathname) {
		/**
		 * 正規化済みパス
		 * @type {string}
		 */
		this.pathname = pathname.replace(/\\/g, "/");
	}

	/**
	 * ファイルの絶対パスを取得します。
	 * - http(s)の場合はそのまま
	 * - 相対パスの場合は現在のURLから解決
	 *
	 * @returns {string} 絶対パス（URL形式）
	 */
	getAbsolutePath() {
		if (/$http/.test(this.pathname)) {
			return this.pathname;
		}
		let name = window.location.toString();
		if (!/\/$/.test(name)) {
			name = name.match(/.*\//)[0];
		}
		const namelist = this.pathname.split("/");
		for (let i = 0; i < namelist.length; i++) {
			if (namelist[i] === "" || namelist[i] === ".") {
				continue;
			}
			if (namelist[i] === "..") {
				name = name.substring(0, name.length - 1).match(/.*\//)[0];
				continue;
			}
			name += namelist[i];
			if (i !== namelist.length - 1) {
				name += "/";
			}
		}
		return name;
	}

	/**
	 * 親ディレクトリのパスを取得します。
	 * @returns {string} 親ディレクトリの絶対パス
	 */
	getParent() {
		const x = this.getAbsolutePath().match(/.*\//)[0];
		return x.substring(0, x.length - 1);
	}
}

/**
 * Metasequoia（MQO）形式による3DCGメッシュデータの入出力ユーティリティ
 *
 * - S3MeshLoader.TYPE.MQO として S3MeshLoader から利用されます。
 * - メタセコイア（*.mqo）フォーマットのテキストをS3Meshに変換（インポート）、またはS3Meshからテキスト出力（エクスポート）します。
 * - 標準的なMQOの構文に加え、一部簡易パース（手動修正を要する場合もあり）。
 *
 * ※ テクスチャやUV、マテリアルの色・強度なども一部対応しています。
 */
const S3MeshLoaderMQO = {
	/**
	 * メッシュデータの入出力形式名
	 * @type {string}
	 */
	name: "MQO",

	/**
	 * Metasequoia（MQO）形式のテキストをS3Meshインスタンスに変換します（インポート）。
	 * ただしある程度手動で修正しないといけません。
	 *
	 * - MQO形式のテキスト（またはURL経由でダウンロード済みのテキスト）を解析し、
	 *   頂点・三角形面・マテリアル等をS3Meshに格納します。
	 * - テクスチャ名・UV座標・マテリアル強度・色・発光・反射等にも部分的に対応しています。
	 * - ファイル内の階層（オブジェクトブロック）・面（face）・材質（Material）を検出してパースします。
	 *
	 * @param {S3System} sys S3Systemインスタンス
	 * @param {S3Mesh} mesh メッシュインスタンス（空の状態で渡される）
	 * @param {string} text MQOファイル内容（テキスト）
	 * @param {string} [url] オプション: ファイルURLやパス
	 * @returns {boolean} パース成功時はtrue
	 *
	 * @example
	 * S3MeshLoaderMQO.input(sys, mesh, mqotext);
	 */
	input: function (sys, mesh, text, url) {
		let mqofile = null;
		let parent_dir = "./";
		if (url) {
			mqofile = new File(url);
			parent_dir = mqofile.getParent() + "/";
		}

		const lines = text.split("\n");
		const block_stack = [];
		let block_type = "none";
		let block_level = 0;
		let vertex_offset = 0;
		let vertex_point = 0;
		let face_offset = 0;
		let face_point = 0;
		/**
		 * 半角スペース区切りの文字列数値を数値型配列に変換します。
		 *
		 * @param {string} text 変換対象の文字列（例："1.0 2.5 3.14"）
		 * @returns {Array<number>} 数値型の配列
		 */
		const toNumberArray = function (text) {
			const x = text.split(" "),
				out = [];
			for (let i = 0; i < x.length; i++) {
				out[i] = parseFloat(x[i]);
			}
			return out;
		};

		/**
		 * "func(XXX)" の形式から、指定パラメータ名 parameter の括弧内の値を抜き出します。
		 *
		 * @param {string} text 対象となる1行分のテキスト
		 * @param {string} parameter 抜き出したいパラメータ名
		 * @returns {string} パラメータの中身
		 */
		const getValueFromPrm = function (text, parameter) {
			const x = text.split(" " + parameter + "(");
			if (x.length === 1) {
				return null; // パラメータが見つからない場合はnullを返す
			}
			return x[1].split(")")[0];
		};

		/**
		 * "func(XXX)" の形式から、数値パラメータを配列として取得します。
		 *
		 * @param {string} text 対象となる1行分のテキスト
		 * @param {string} parameter 抜き出したいパラメータ名
		 * @returns {Array<number>} 数値型配列（見つからなければ空配列）
		 */
		const getNumberFromPrm = function (text, parameter) {
			const value = getValueFromPrm(text, parameter);
			if (value === null) {
				return [];
			}
			return toNumberArray(value);
		};

		/**
		 * "func(XXX)" の形式から、ダブルクォート囲みのURLやファイル名を抽出します。
		 *
		 * @param {string} text 対象となる1行分のテキスト
		 * @param {string} parameter 抜き出したいパラメータ名
		 * @returns {string|null} 抜き出したURL文字列、またはnull（見つからなければ）
		 */
		const getURLFromPrm = function (text, parameter) {
			const value = getValueFromPrm(text, parameter);
			if (value === null) {
				return null;
			}
			const x = value.split('"');
			if (x.length !== 3) {
				return null;
			}
			return x[1];
		};
		// メインのパース処理
		for (let i = 0; i < lines.length; i++) {
			const trim_line = lines[i].replace(/^\s+|\s+$/g, "");
			const first = trim_line.split(" ")[0];
			if (trim_line.indexOf("{") !== -1) {
				if (first === "Object") {
					vertex_offset += vertex_point;
					face_offset += face_point;
					vertex_point = 0;
					face_point = 0;
				}
				// 階層に入る前の位置を保存
				block_stack.push(block_type);
				block_type = first;
				block_level++;
				continue;
			} else if (trim_line.indexOf("}") !== -1) {
				block_type = block_stack.pop();
				block_level--;
				continue;
			}
			if (block_type === "Thumbnail" || block_type === "none") {
				continue;
			}
			if (block_type === "Material") {
				const material_name = first.replace(/"/g, "");
				const material = sys.createMaterial();
				material.setName(material_name);
				let val;
				val = getNumberFromPrm(trim_line, "col");
				if (val.length !== 0) {
					material.setColor(new S3Vector(val[0], val[1], val[2], val[3]));
				}
				val = getNumberFromPrm(trim_line, "dif");
				if (val.length !== 0) {
					material.setDiffuse(val[0]);
				}
				val = getNumberFromPrm(trim_line, "amb");
				if (val.length !== 0) {
					material.setAmbient(new S3Vector(val[0], val[0], val[0]));
				}
				val = getNumberFromPrm(trim_line, "amb_col");
				if (val.length !== 0) {
					material.setAmbient(new S3Vector(val[0], val[1], val[2]));
				}
				val = getNumberFromPrm(trim_line, "emi");
				if (val.length !== 0) {
					material.setEmission(new S3Vector(val[0], val[0], val[0]));
				}
				val = getNumberFromPrm(trim_line, "emi_col");
				if (val.length !== 0) {
					material.setEmission(new S3Vector(val[0], val[1], val[2]));
				}
				val = getNumberFromPrm(trim_line, "spc");
				if (val.length !== 0) {
					material.setSpecular(new S3Vector(val[0], val[0], val[0]));
				}
				val = getNumberFromPrm(trim_line, "spc_col");
				if (val.length !== 0) {
					material.setSpecular(new S3Vector(val[0], val[1], val[2]));
				}
				val = getNumberFromPrm(trim_line, "power");
				if (val.length !== 0) {
					material.setPower(val[0]);
				}
				val = getNumberFromPrm(trim_line, "reflect");
				if (val.length !== 0) {
					material.setReflect(val[0]);
				}
				val = getURLFromPrm(trim_line, "tex");
				if (val) {
					material.setTextureColor(parent_dir + val);
				}
				val = getURLFromPrm(trim_line, "bump");
				if (val) {
					material.setTextureNormal(parent_dir + val);
				}
				mesh.addMaterial(material);
			} else if (block_type === "vertex") {
				const words = toNumberArray(trim_line);
				const vector = new S3Vector(words[0], words[1], words[2]);
				const vertex = sys.createVertex(vector);
				mesh.addVertex(vertex);
				vertex_point++;
			} else if (block_type === "face") {
				const facenum = parseInt(first);
				const v = getNumberFromPrm(trim_line, "V");
				const uv_a = getNumberFromPrm(trim_line, "UV");
				const uv = [];
				const material_array = getNumberFromPrm(trim_line, "M");
				const material = material_array.length === 0 ? 0 : material_array[0];
				if (uv_a.length !== 0) {
					for (let j = 0; j < facenum; j++) {
						uv[j] = new S3Vector(uv_a[j * 2], uv_a[j * 2 + 1], 0);
					}
				}
				for (let j = 0; j < facenum - 2; j++) {
					const ti =
						j % 2 === 0
							? sys.createTriangleIndex(j, j + 1, j + 2, v, material, uv)
							: sys.createTriangleIndex(j - 1, j + 1, j + 2, v, material, uv);
					mesh.addTriangleIndex(ti);
					face_point++;
				}
			}
		}
		return true;
	},

	/**
	 * S3MeshインスタンスをMetasequoia（MQO）形式のテキストに変換します（エクスポート）。
	 * ただしある程度手動で修正しないといけません。
	 *
	 * - MQO形式に従い、頂点座標・面情報・マテリアル情報等を出力します。
	 * - テクスチャやUV・発光などの追加情報も一部対応。
	 * - 出力後のテキストは、必要に応じて手動修正で他のソフトへインポート可能です。
	 *
	 * @param {S3Mesh} mesh 出力対象のメッシュ
	 * @returns {string} MQOフォーマットのテキストデータ
	 *
	 * @example
	 * const mqotext = S3MeshLoaderMQO.output(mesh);
	 */
	output: function (mesh) {
		const output = [];
		const vertex = mesh.getVertexArray();
		const triangleindex = mesh.getTriangleIndexArray();
		const material = mesh.getMaterialArray();

		// ヘッダ
		output.push("Metasequoia Document");
		output.push("Format Text Ver 1.0");
		output.push("");
		output.push("Scene {");
		output.push("	pos 0 0 1500");
		output.push("	lookat 0 0 0");
		output.push("	head -0.5236");
		output.push("	pich 0.5236");
		output.push("	ortho 0");
		output.push("	zoom2 5.0000");
		output.push("	amb 0.250 0.250 0.250");
		output.push("}");

		// 材質の出力
		output.push("Material " + material.length + " {");
		for (let i = 0; i < material.length; i++) {
			const mv = material[i];
			//  こんな感じにする必要がある・・・
			// "mat" shader(3) col(1.000 1.000 1.000 0.138) dif(0.213) amb(0.884) emi(0.301) spc(0.141) power(38.75) amb_col(1.000 0.996 0.000) emi_col(1.000 0.000 0.016) spc_col(0.090 0.000 1.000) reflect(0.338) refract(2.450)
			output.push(
				'\t"' +
					mv.name +
					'" col(1.000 1.000 1.000 1.000) dif(0.800) amb(0.600) emi(0.000) spc(0.000) power(5.00)'
			);
		}
		output.push("}");

		// オブジェクトの出力
		output.push('Object "obj1" {');
		{
			// 頂点の出力
			output.push("\tvertex " + vertex.length + " {");
			for (let i = 0; i < vertex.length; i++) {
				const vp = vertex[i].position;
				output.push("\t\t" + vp.x + " " + vp.y + " " + vp.z);
			}
			output.push("}");

			// 面の定義
			output.push("\tface " + triangleindex.length + " {");
			for (let i = 0; i < triangleindex.length; i++) {
				const ti = triangleindex[i];
				let line = "\t\t3";
				// 座標と材質は必ずある
				line += " V(" + ti.index[0] + " " + ti.index[1] + " " + ti.index[2] + ")";
				line += " M(" + ti.materialIndex + ")";
				// UVはないかもしれないので、条件を付ける
				if (ti.uv !== undefined && ti.uv[0] !== null) {
					line +=
						" UV(" +
						ti.uv[0].x +
						" " +
						ti.uv[0].y +
						" " +
						ti.uv[1].x +
						" " +
						ti.uv[1].y +
						" " +
						ti.uv[2].x +
						" " +
						ti.uv[2].y +
						")";
				}
				output.push(line);
			}
		}
		output.push("\t}");

		output.push("}");

		// End
		output.push("Eof\n");
		return output.join("\n");
	}
};

export default S3MeshLoaderMQO;
