import S3Scene from "../basic/S3Scene.js";
import S3GLLight from "./S3GLLight.js";
import S3GLArray from "./S3GLArray.js";
import S3Vector from "../math/S3Vector.js";

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
	 * @typedef {Object} S3GLSceneUniform
	 * @property {S3Vector} eyeWorldDirection カメラ情報
	 * @property {S3GLArray} lightsLength ライトの数
	 * @property {S3GLArray[]} lightsData1 モード・レンジ・方向or位置 (vec4)
	 * @property {S3GLArray[]} lightsData2 方向or位置Z成分＋カラー情報 (vec4)
	 */

	/**
	 * @typedef {Object} S3GLProgramUniforms
	 * @property {S3GLSceneUniform} uniforms
	 */

	/**
	 * シーン全体のWebGL向けuniformデータを生成して返します。
	 * カメラの視線ベクトルや、最大4つまでのライト情報をuniform用データにまとめます。
	 * 各値はS3GLArrayやGLSLと連携しやすい形式で返されます。
	 *
	 * - uniforms: uniform変数名→データ（カメラ方向ベクトル、ライト属性配列など）
	 * @returns {S3GLProgramUniforms}
	 */
	getUniforms() {
		const LIGHTS_MAX = 4;
		/**
		 * @type {Array<S3GLLight>}
		 */
		const light_array = /** @type {Array<S3GLLight>} */ (this.getLights());
		const lightsLength = Math.min(light_array.length, LIGHTS_MAX);

		/**
		 * @type {S3GLSceneUniform}
		 */
		const uniforms = {
			eyeWorldDirection: this.getCamera().getDirection(),
			lightsLength: new S3GLArray(lightsLength, 1, S3GLArray.datatype.Int32Array),
			lightsData1: [],
			lightsData2: []
		};

		for (let i = 0; i < lightsLength; i++) {
			const data = light_array[i].getGLData();
			uniforms.lightsData1.push(data.lightsData1);
			uniforms.lightsData2.push(data.lightsData2);
		}

		const ret = { uniforms: uniforms };
		return ret;
	}
}
