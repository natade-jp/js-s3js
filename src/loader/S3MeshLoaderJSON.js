import S3System from "../basic/S3System.js";
import S3Mesh from "../basic/S3Mesh.js";
import S3Material from "../basic/S3Material.js";
import S3Vector from "../math/S3Vector.js";

/*
	次のようなデータを入出力できます。
	const sample = {
		Indexes:{
			body:[
				[ 0, 1, 2],
				[ 3, 1, 0],
				[ 3, 0, 2],
				[ 3, 2, 1]
			]
		},
		Vertices:[
			[  0,  0,  -5],
			[  0, 20,  -5],
			[ 10,  0,  -5],
			[  0,  0, -20]
		]
	};
*/

const S3MeshLoaderJSON = {
	/**
	 * メッシュデータの入出力形式名
	 * @type {string}
	 */
	name: "JSON",

	/**
	 * JSONデータをS3Meshへ変換（インポート）します。
	 *
	 * - 頂点配列（Vertices）、面インデックス配列（Indexes）を含むJSONデータを解析し
	 *   S3Meshオブジェクトへ詰め替えます。
	 * - 文字列型なら自動的にJSON.parseします。
	 *
	 * @param {S3System} sys S3Systemインスタンス
	 * @param {S3Mesh} mesh メッシュインスタンス（初期化済み/空状態で渡される）
	 * @param {string|Object} json JSON文字列またはそのオブジェクト
	 * @returns {boolean} パースが成功した場合はtrue
	 *
	 * @example
	 * // 文字列からの直接インポート
	 * S3MeshLoaderJSON.input(sys, mesh, '{"Vertices":[[0,0,0]],"Indexes":{"mat1":[[0,0,0]]}}');
	 */
	input: function (sys, mesh, json) {
		let meshdata;
		if (typeof json === "string") {
			meshdata = JSON.parse(json);
		} else {
			meshdata = json;
		}
		let material = 0;
		// 材質名とインデックスを取得
		for (const materialname in meshdata.Indexes) {
			mesh.addMaterial(sys.createMaterial(materialname));
			const materialindexlist = meshdata.Indexes[materialname];
			for (let i = 0; i < materialindexlist.length; i++) {
				const list = materialindexlist[i];
				for (let j = 0; j < list.length - 2; j++) {
					// 3角形と4角形に対応
					const ti =
						j % 2 === 0
							? sys.createTriangleIndex(j, j + 1, j + 2, list, material)
							: sys.createTriangleIndex(j - 1, j + 1, j + 2, list, material);
					mesh.addTriangleIndex(ti);
				}
			}
			material++;
		}
		// 頂点座標を取得
		for (let i = 0; i < meshdata.Vertices.length; i++) {
			const vector = new S3Vector(meshdata.Vertices[i][0], meshdata.Vertices[i][1], meshdata.Vertices[i][2]);
			const vertex = sys.createVertex(vector);
			mesh.addVertex(vertex);
		}
		return true;
	},

	/**
	 * S3MeshインスタンスをシンプルなJSONオブジェクトに変換（エクスポート）します。
	 *
	 * - 頂点配列・面インデックス配列・マテリアル名などを全てJSONオブジェクト形式で返します。
	 * - マテリアルごとのインデックスリストも整理されます。
	 *
	 * @param {S3Mesh} mesh 出力対象のメッシュ
	 * @returns {string} JSON形式のテキストデータ
	 *
	 * @example
	 * const json = S3MeshLoaderJSON.output(mesh);
	 * // → ファイル保存やエディタ表示などに活用できます
	 */
	output: function (mesh) {
		const vertex = mesh.getVertexArray();
		const triangleindex = mesh.getTriangleIndexArray();
		const material = mesh.getMaterialArray();

		/**
		 * デフォルトのマテリアル情報（必要時に参照される）
		 *
		 * @typedef {Object} S3MeshLoaderMaterial
		 * @property {string} name 名前
		 * @property {S3Vector} color 拡散反射色
		 * @property {number} diffuse 拡散係数
		 * @property {S3Vector} emission 自己照明色
		 * @property {S3Vector} specular 鏡面反射色
		 * @property {number} power 鏡面反射強度
		 * @property {S3Vector} ambient 環境光色
		 * @property {number} reflect 環境マッピング反射率
		 * @property {null} textureColor 拡散テクスチャ
		 * @property {null} textureNormal 法線マップ
		 */

		/**
		 * @typedef {Object} S3MeshLoaderMaterialListEntry
		 * @property {S3MeshLoaderMaterial|S3Material} material マテリアル情報（S3Material型またはDefaultMaterialオブジェクト）
		 * @property {Array<Array<number>>} list そのマテリアルに属する三角形インデックス配列
		 */

		/**
		 * @type {S3MeshLoaderMaterial}
		 */
		const DefaultMaterial = {
			name: "s3default",
			color: new S3Vector(1.0, 1.0, 1.0, 1.0),
			diffuse: 0.8,
			emission: new S3Vector(0.0, 0.0, 0.0),
			specular: new S3Vector(0.0, 0.0, 0.0),
			power: 5.0,
			ambient: new S3Vector(0.6, 0.6, 0.6),
			reflect: 0.0,
			textureColor: null,
			textureNormal: null
		};

		/**
		 * @type {Array<S3MeshLoaderMaterialListEntry>}
		 */
		const material_vertexlist = [];
		const material_length = material.length !== 0 ? material.length : 1;
		const default_material = DefaultMaterial;
		// 材質リストを取得
		for (let i = 0; i < material_length; i++) {
			material_vertexlist[i] = {
				material: material[i] ? material[i] : default_material,
				list: []
			};
		}
		// 材質名に合わせて、インデックスリストを取得
		for (let i = 0; i < triangleindex.length; i++) {
			const ti = triangleindex[i];
			material_vertexlist[ti.materialIndex].list.push(ti.index);
		}
		const output = [];
		output.push("{");
		output.push("\tIndexes:{");
		for (let i = 0; i < material_vertexlist.length; i++) {
			const mv = material_vertexlist[i];
			output.push("\t\t" + mv.material.name + ":[");
			for (let j = 0; j < mv.list.length; j++) {
				const vi = mv.list[j];
				output.push(
					"\t\t\t[" + vi[0] + " " + vi[1] + " " + vi[2] + "]" + (j === mv.list.length - 1 ? "" : ",")
				);
			}
			output.push("\t\t]" + (i === material_vertexlist.length - 1 ? "" : ","));
		}
		output.push("\t},");
		output.push("\tVertices:[");
		for (let i = 0; i < vertex.length; i++) {
			const vp = vertex[i].position;
			output.push("\t\t[" + vp.x + " " + vp.y + " " + vp.z + "]" + (i === vertex.length - 1 ? "" : ","));
		}
		output.push("\t]");
		output.push("}");
		return output.join("\n");
	}
};

export default S3MeshLoaderJSON;
