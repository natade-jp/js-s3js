import S3Vector from "../math/S3Vector.js";

/**
 * 三角形ポリゴンのインデックス情報を保持するクラス（immutable）
 * 各ポリゴン面を構成する頂点インデックスやUV座標、マテリアルインデックスを管理します。
 *
 * @class
 * @module S3
 */
export default class S3TriangleIndex {
	/**
	 * ABCの頂点を囲む三角形ポリゴンを作成します。
	 * @param {number} i1 配列内の頂点Aのインデックス
	 * @param {number} i2 配列内の頂点Bのインデックス
	 * @param {number} i3 配列内の頂点Cのインデックス
	 * @param {Array<number>} indexlist 頂点インデックス配列
	 * @param {number} [materialIndex] 使用するマテリアルのインデックス（省略時や負値の場合は0）
	 * @param {Array<S3Vector>} [uvlist] UV座標配列（S3Vector配列、なくても可）
	 */
	constructor(i1, i2, i3, indexlist, materialIndex, uvlist) {
		this._init(i1, i2, i3, indexlist, materialIndex, uvlist);
	}

	/**
	 * 三角形ポリゴン情報を初期化します。
	 * @private
	 * @param {number} i1 頂点Aのインデックス
	 * @param {number} i2 頂点Bのインデックス
	 * @param {number} i3 頂点Cのインデックス
	 * @param {Array<number>} indexlist 頂点インデックス配列
	 * @param {number} [materialIndex] マテリアルインデックス
	 * @param {Array<S3Vector>} [uvlist] UV座標配列
	 */
	_init(i1, i2, i3, indexlist, materialIndex, uvlist) {
		/**
		 * 頂点インデックス配列（各頂点のインデックスを3つ持つ）
		 * @type {Array<number>}
		 */
		this.index = null;

		/**
		 * 各頂点のUV座標配列（3つのS3Vector、またはnull）
		 * @type {Array<S3Vector|null>}
		 */
		this.uv = null;
		/**
		 * 面のマテリアルインデックス（0以上の整数）
		 * @type {number}
		 */
		this.materialIndex = null;

		if (indexlist instanceof Array && indexlist.length > 0) {
			this.index = [indexlist[i1], indexlist[i2], indexlist[i3]];
		} else {
			throw "IllegalArgumentException";
		}
		if (uvlist !== undefined && uvlist instanceof Array && uvlist.length > 0 && uvlist[0] instanceof S3Vector) {
			this.uv = [uvlist[i1], uvlist[i2], uvlist[i3]];
		} else {
			this.uv = [null, null, null];
		}
		materialIndex = materialIndex ? materialIndex : 0;
		materialIndex = materialIndex >= 0 ? materialIndex : 0;
		this.materialIndex = materialIndex;
	}

	/**
	 * この三角形インデックスのクローンを作成します。
	 * @param {typeof S3TriangleIndex} [Instance] クローン時のクラス指定（省略時はS3TriangleIndex）
	 * @returns {S3TriangleIndex} 複製されたインスタンス
	 */
	clone(Instance) {
		if (!Instance) {
			Instance = S3TriangleIndex;
		}
		return new Instance(0, 1, 2, this.index, this.materialIndex, this.uv);
	}

	/**
	 * 頂点A/B/Cの順序を逆転させた三角形インデックスを返します。
	 * 通常カリングモードに応じて表裏を反転させたい場合に利用します。
	 * @param {typeof S3TriangleIndex} [Instance] 反転時のクラス指定（省略時はS3TriangleIndex）
	 * @returns {S3TriangleIndex} 反転された三角形インデックス
	 */
	inverseTriangle(Instance) {
		if (!Instance) {
			Instance = S3TriangleIndex;
		}
		return new Instance(2, 1, 0, this.index, this.materialIndex, this.uv);
	}
}
