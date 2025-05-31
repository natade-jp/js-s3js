import S3TriangleIndex from "../basic/S3TriangleIndex.js";
import S3GLTriangleIndexData from "./S3GLTriangleIndexData.js";
import S3Vector from "../math/S3Vector.js";

/**
 * WebGL描画用の三角形インデックスクラス。
 * 基本のS3TriangleIndexを拡張し、GL用属性データ生成（S3GLTriangleIndexData化）などを追加しています。
 * 頂点インデックス・マテリアル番号・UV座標などの情報を持ち、WebGL向け処理の土台となります。
 *
 * @class
 * @extends S3TriangleIndex
 * @module S3
 */
export default class S3GLTriangleIndex extends S3TriangleIndex {
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
		super(i1, i2, i3, indexlist, materialIndex, uvlist);
	}

	/**
	 * この三角形インデックスのクローン（複製）を作成します。
	 * @returns {S3GLTriangleIndex} 複製されたS3GLTriangleIndexインスタンス
	 */
	clone() {
		// @ts-ignore
		return super.clone(S3GLTriangleIndex);
	}

	/**
	 * 三角形の頂点順序を反転した新しいインスタンスを作成します。
	 * モデルの表裏を逆転したい場合などに利用します。
	 * @returns {S3GLTriangleIndex} 頂点順序を逆にした新しい三角形インデックス
	 */
	inverseTriangle() {
		// @ts-ignore
		return super.inverseTriangle(S3GLTriangleIndex);
	}
	/**
	 * この三角形の情報をWebGL用属性データ（S3GLTriangleIndexData）として生成します。
	 * 法線・UV・接線等も含めた拡張情報付きで返します。
	 * @returns {S3GLTriangleIndexData} WebGL向け属性データ
	 */
	createGLTriangleIndexData() {
		return new S3GLTriangleIndexData(this);
	}
}
