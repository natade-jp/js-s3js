import S3GLMaterial from "./S3GLMaterial.js";
import S3GLArray from "./S3GLArray.js";
import S3Model from "../basic/S3Model.js";

/**
 * WebGL描画用のモデル（Model）クラス。
 * 基本のS3Modelを拡張し、WebGL向けuniformデータの生成（getUniforms）機能を追加します。
 * モデルごとの材質（マテリアル）情報をuniformデータとしてまとめ、GLSLシェーダに渡せる形に整形します。
 */
export default class S3GLModel extends S3Model {
	/**
	 * モデル情報を初期化します。
	 * 位置・スケール・回転・形状メッシュ等はS3Model準拠です。
	 */
	constructor() {
		super();
	}

	/**
	 * モデルに関連するWebGL向けuniformデータを生成し返します。
	 * モデルが参照するメッシュ内の最大4つまでのマテリアル情報をGLSLシェーダ向けデータにまとめます。
	 * 各マテリアルのGLデータをuniform変数名でまとめ、GLへのバインド処理を簡略化します。
	 *
	 * - uniforms: uniform変数名→データ配列（各マテリアルの属性ごとに配列化）
	 *
	 * @returns {{
	 *   uniforms: Object<string, Array<any>>
	 * }}
	 */
	getUniforms() {
		/**
		 * @type {{[key: string]: Array<S3GLArray | WebGLTexture>}}
		 */
		let uniforms = {};
		const MATELIAL_MAX = 4;
		/**
		 * @type {Array<S3GLMaterial>}
		 */
		const material_array = /** @type {Array<S3GLMaterial>} */ (this.getMesh().getMaterialArray());
		const materialLength = Math.min(material_array.length, MATELIAL_MAX);
		for (let i = 0; i < materialLength; i++) {
			const data = material_array[i].getGLData();
			for (const key in data) {
				if (!uniforms[key]) {
					/**
					 * @type {Array<S3GLArray | WebGLTexture>}
					 */
					uniforms[key] = [];
				}
				uniforms[key].push(data[key]);
			}
		}
		const ret = {};
		ret.uniforms = uniforms;
		return ret;
	}
}
