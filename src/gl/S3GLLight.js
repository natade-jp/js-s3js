import S3Vector from "../math/S3Vector.js";
import S3Light from "../basic/S3Light.js";
import S3GLArray from "./S3GLArray.js";

/**
 * WebGLレンダリング用のライト（照明）クラス。
 * 基本のS3Lightを拡張し、GL用データ生成や一意ハッシュ生成などのメソッドを提供します。
 *
 * @class
 * @extends S3Light
 * @module S3
 */
export default class S3GLLight extends S3Light {
	/**
	 * ライト情報のインスタンスを作成します。
	 * 各種パラメータはS3Lightのデフォルト値がセットされます。
	 */
	constructor() {
		super();
	}

	/**
	 * このライトのクローン（複製）を作成します。
	 * すべてのプロパティがコピーされたS3GLLightインスタンスを返します。
	 * @returns {S3GLLight} 複製されたインスタンス
	 */
	clone() {
		// @ts-ignore
		return super.clone(S3GLLight);
	}

	/**
	 * ライトのGL用一意ハッシュ文字列を返します。
	 * 各種パラメータ（モード・パワー・レンジ・位置・方向・色）をもとに生成されます。
	 * @returns {string} ライトの一意な識別用ハッシュ
	 */
	getGLHash() {
		return (
			"" +
			this.mode +
			this.power +
			this.range +
			this.position.toString(3) +
			this.direction.toString(3) +
			this.color.toString(3)
		);
	}

	/**
	 * @typedef {Object} S3GLLightGLData
	 * @property {S3GLArray} lightsData1 モード・レンジ・方向or位置 (vec4)
	 * @property {S3GLArray} lightsData2 方向or位置Z成分＋カラー情報 (vec4)
	 */

	/**
	 * ライト情報をWebGL用に変換し、GLSLのuniform用データ形式で返します。
	 * 面光源/点光源で内容（direction or position）が切り替わります。
	 * 各種値はS3GLArrayでラップされ、シェーダ変数名（例: lightsData1, lightsData2）に対応しています。
	 * @returns {S3GLLightGLData} GL用のライトデータ
	 */
	getGLData() {
		const lightsColor = this.color.mul(this.power);
		let lightsVector = new S3Vector(0, 0, 0);
		// uniform 節約のためにライト用のベクトルは用途によって入れる値を変更する
		if (this.mode === S3Light.MODE.DIRECTIONAL_LIGHT) {
			lightsVector = this.direction;
		} else if (this.mode === S3Light.MODE.POINT_LIGHT) {
			lightsVector = this.position;
		}
		// uniform 節約のために最終的に渡すデータをまとめる
		return {
			lightsData1: new S3GLArray(
				[this.mode, this.range, lightsVector.x, lightsVector.y],
				4,
				S3GLArray.datatype.Float32Array
			),
			lightsData2: new S3GLArray(
				[lightsVector.z, lightsColor.x, lightsColor.y, lightsColor.z],
				4,
				S3GLArray.datatype.Float32Array
			)
		};
	}
}
