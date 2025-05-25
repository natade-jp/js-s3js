/**
 * The script is part of SenkoJS.
 *
 * AUTHOR:
 *  natade (http://twitter.com/natadea)
 *
 * LICENSE:
 *  The MIT license https://opensource.org/licenses/MIT
 */

import S3Vertex from "../basic/S3Vertex.js";
import S3Vector from "../math/S3Vector.js";
import S3GLArray from "./S3GLArray.js";

/**
 * WebGL描画用の頂点（バーテックス）クラス。
 * S3Vertexを拡張し、GL用データ生成やハッシュ化などを提供します。
 * 頂点情報（位置）をGL向け形式に変換し、バーテックスシェーダのattributeと連携できます。
 */
export default class S3GLVertex extends S3Vertex {
	/**
	 * S3GLVertexのインスタンスを生成します。
	 * @param {S3Vector} position 頂点の3次元位置ベクトル
	 */
	constructor(position) {
		super(position);
	}

	/**
	 * この頂点のクローン（複製）を作成します。
	 * @returns {S3GLVertex} 複製されたS3GLVertexインスタンス
	 */
	clone() {
		// @ts-ignore
		return super.clone(S3GLVertex);
	}

	/**
	 * WebGL用の一意なハッシュ値を返します。
	 * 頂点座標情報から3進数文字列で算出されます。
	 * 頂点共有やVBO再利用の判定等で用います。
	 * @returns {string} 頂点を識別するハッシュ文字列
	 */
	getGLHash() {
		return this.position.toString(3);
	}

	/**
	 * 頂点情報をWebGL用データ形式（attribute変数用）で返します。
	 * GLSLバーテックスシェーダの「vertexPosition」属性と対応します。
	 *
	 * - vertexPosition: 頂点の位置情報（vec3/Float32ArrayとしてGLに渡す）
	 * @returns {{[key: string]: S3GLArray}}
	 */
	getGLData() {
		return {
			vertexPosition: new S3GLArray(this.position, 3, S3GLArray.datatype.Float32Array)
		};
	}
}
