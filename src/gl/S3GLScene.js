import S3Scene from "../basic/S3Scene.js";
import S3GLLight from "./S3GLLight.js";
import S3GLArray from "./S3GLArray.js";

/**
 * WebGL描画用のシーン（Scene）クラス。
 * 基本のS3Sceneを拡張し、WebGL用のuniformデータ生成（getUniforms）などの機能を追加します。
 * カメラやライト情報をGLSLシェーダ向けにuniform変数としてまとめて提供します。
 */
export default class S3GLScene extends S3Scene {
	/**
	 * シーンを初期化します。
	 * モデル・カメラ・ライトの配列等はS3Sceneに準拠します。
	 */
	constructor() {
		super();
	}

	/**
	 * シーン全体のWebGL向けuniformデータを生成して返します。
	 * カメラの視線ベクトルや、最大4つまでのライト情報をuniform用データにまとめます。
	 * 各値はS3GLArrayやGLSLと連携しやすい形式で返されます。
	 *
	 * - uniforms: uniform変数名→データ（カメラ方向ベクトル、ライト属性配列など）
	 * @returns {{[key: string]: S3GLArray}}
	 */
	getUniforms() {
		/**
		 * @type {{[key: string]: S3GLArray}}
		 */
		const uniforms = {};
		// カメラ情報もUniformで送る
		{
			uniforms.eyeWorldDirection = this.getCamera().getDirection();
		}
		// ライト情報はUniformで送る
		{
			const LIGHTS_MAX = 4;
			/**
			 * @type {Array<S3GLLight>}
			 */
			const light_array = /** @type {Array<S3GLLight>} */ (this.getLights());
			const lightsLength = Math.min(light_array.length, LIGHTS_MAX);
			uniforms.lightsLength = new S3GLArray(lightsLength, 1, S3GLArray.datatype.Int32Array);
			for (let i = 0; i < lightsLength; i++) {
				const data = light_array[i].getGLData();
				for (const key in data) {
					if (!uniforms[key]) {
						uniforms[key] = [];
					}
					uniforms[key].push(data[key]);
				}
			}
		}
		const ret = {};
		ret.uniforms = uniforms;
		return ret;
	}
}
