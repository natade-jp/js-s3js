import S3Vector from "../math/S3Vector.js";
import S3GLArray from "./S3GLArray.js";
import S3GLVertex from "./S3GLVertex.js";

/**
 * @typedef {Object} S3GLTriangleIndex
 * @property {number[]} index - 頂点インデックス配列（各頂点のインデックスを3つ持つ）
 * @property {(S3Vector|null)[]} uv - 各頂点のUV座標配列（3つのS3Vector、またはnull）
 * @property {number} materialIndex - 面のマテリアルインデックス（0以上の整数）
 */

/**
 * WebGL描画用の三角形インデックス・属性データ格納クラス。
 * 三角形ごとの頂点インデックス・UV・法線・接線・従法線などを保持し、
 * WebGL（GLSL）用に最適化されたデータ生成やハッシュ作成も担います。
 */
export default class S3GLTriangleIndexData {
	/**
	 * 三角形インデックス情報からGL用データ構造を生成します。
	 * @param {S3GLTriangleIndex} triangle_index S3GLTriangleIndexなどの三角形インデックス情報
	 */
	constructor(triangle_index) {
		/**
		 * 各頂点を示すインデックス配列
		 * @type {number[]}
		 */
		this.index = triangle_index.index;

		/**
		 * 面が使用するマテリアル番号
		 * @type {number}
		 */
		this.materialIndex = triangle_index.materialIndex;

		/**
		 * 各頂点のUV座標（S3Vectorの配列）
		 * @type {Array<S3Vector>}
		 */
		this.uv = triangle_index.uv;

		/**
		 * UV情報が有効かどうか
		 * @type {boolean}
		 */
		this._isEnabledTexture = triangle_index.uv[0] !== null;

		/**
		 * 面（フェース）単位の属性情報型。
		 * S3Vector.getTangentVector で計算された面の法線・接線・従法線（すべてS3Vector型またはnull）。
		 *
		 * @typedef {Object} S3GLFaceAttribute
		 * @property {?S3Vector} normal   面の法線ベクトル
		 * @property {?S3Vector} tangent  面の接線ベクトル
		 * @property {?S3Vector} binormal 面の従法線ベクトル
		 */

		/**
		 * 頂点単位の属性情報型。
		 * 各頂点（3つ）の法線・接線・従法線（いずれもS3Vector型またはnull）の配列。
		 *
		 * @typedef {Object} S3GLVertexAttribute
		 * @property {Array<?S3Vector>} normal   各頂点の法線ベクトル [0], [1], [2]
		 * @property {Array<?S3Vector>} tangent  各頂点の接線ベクトル [0], [1], [2]
		 * @property {Array<?S3Vector>} binormal 各頂点の従法線ベクトル [0], [1], [2]
		 */

		/**
		 * 面の法線・接線・従法線
		 * @type {S3GLFaceAttribute}
		 */
		this.face = {
			normal: null,
			tangent: null,
			binormal: null
		};

		/**
		 * 各頂点（3つ）の法線・接線・従法線の配列
		 * @type {S3GLVertexAttribute}
		 */
		this.vertex = {
			normal: [null, null, null],
			tangent: [null, null, null],
			binormal: [null, null, null]
		};
	}

	/**
	 * この三角形の、指定頂点（number番目）についてWebGL用一意ハッシュ値を生成します。
	 * 頂点情報・UV・法線などを元にGLバッファのキャッシュや識別に使えます。
	 * @param {number} number 三角形の頂点番号（0, 1, 2）
	 * @param {Array<S3GLVertex>} vertexList 全頂点配列
	 * @returns {string} 頂点＋属性を加味したハッシュ文字列
	 */
	getGLHash(number, vertexList) {
		const uvdata = this._isEnabledTexture
			? this.uv[number].toString(2) + this.face.binormal.toString(2) + this.face.tangent.toString(2)
			: "";
		const vertex = vertexList[this.index[number]].getGLHash();
		return vertex + this.materialIndex + uvdata + this.vertex.normal[number].toString(3);
	}

	/**
	 * 指定頂点のWebGL向け頂点属性データ（GLSL用attribute名に合わせたデータ群）を返します。
	 * 位置・マテリアル番号・UV・法線・接線・従法線などがGLArray形式で格納されます。
	 *
	 * - vertexPosition: 頂点位置(vec3)
	 * - vertexTextureCoord: UV座標(vec2)
	 * - vertexMaterialFloat: マテリアル番号(float)
	 * - vertexNormal: 法線ベクトル(vec3)
	 * - vertexBinormal: 従法線ベクトル(vec3)
	 * - vertexTangent: 接線ベクトル(vec3)
	 *
	 * @param {number} number 三角形内の何番目の頂点データを取得するか（0, 1, 2）
	 * @param {Array<S3GLVertex>} vertexList 頂点の配列
	 * @returns {{[key: string]: S3GLArray}}
	 */
	getGLData(number, vertexList) {
		/**
		 * @type {{[key: string]: S3GLArray}}
		 */
		const vertex = {};
		const vertexdata_list = vertexList[this.index[number]].getGLData();
		for (const key in vertexdata_list) {
			vertex[key] = vertexdata_list[key];
		}
		const uvdata = this._isEnabledTexture ? this.uv[number] : new S3Vector(0.0, 0.0);
		vertex.vertexTextureCoord = new S3GLArray(uvdata, 2, S3GLArray.datatype.Float32Array);
		vertex.vertexMaterialFloat = new S3GLArray(this.materialIndex, 1, S3GLArray.datatype.Float32Array);
		vertex.vertexNormal = new S3GLArray(this.vertex.normal[number], 3, S3GLArray.datatype.Float32Array);
		vertex.vertexBinormal = new S3GLArray(this.vertex.binormal[number], 3, S3GLArray.datatype.Float32Array);
		vertex.vertexTangent = new S3GLArray(this.vertex.tangent[number], 3, S3GLArray.datatype.Float32Array);
		return vertex;
	}
}
