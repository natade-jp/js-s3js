import S3Camera from "./S3Camera.js";
import S3Model from "./S3Model.js";
import S3Light from "./S3Light.js";

/**
 * 3DCGシーン（描画シーン）の管理クラス
 * モデル・ライト・カメラなどシーン構成要素を一括管理します。
 */
export default class S3Scene {
	/**
	 * シーンを作成します。モデル・ライト・カメラを初期化します。
	 */
	constructor() {
		this._init();
	}

	/**
	 * シーン構成要素を初期化します。
	 * カメラは新規作成、モデル・ライトは空配列となります。
	 */
	_init() {
		/**
		 * シーン全体のカメラ
		 * @type {S3Camera}
		 */
		this.camera = null;
		/**
		 * シーン内の3Dモデル配列
		 * @type {Array<S3Model>}
		 */
		this.model = [];
		/**
		 * シーン内のライト配列
		 * @type {Array<S3Light>}
		 */
		this.light = [];
	}

	/**
	 * シーン内のモデル・ライトをすべて削除します（カメラは保持）。
	 */
	empty() {
		this.model = [];
		this.light = [];
	}

	/**
	 * シーンのカメラを設定します（ディープコピー）。
	 * @param {S3Camera} camera 設定するカメラ
	 */
	setCamera(camera) {
		this.camera = camera.clone();
	}

	/**
	 * シーンにモデルを追加します。
	 * @param {S3Model} model 追加する3Dモデル（型はS3Model等を想定）
	 */
	addModel(model) {
		this.model[this.model.length] = model;
	}

	/**
	 * シーンにライトを追加します。
	 * @param {S3Light} light 追加するライト（型はS3Light等を想定）
	 */
	addLight(light) {
		this.light[this.light.length] = light;
	}

	/**
	 * 現在のカメラを取得します。
	 * @returns {S3Camera} シーンのカメラ
	 */
	getCamera() {
		return this.camera;
	}

	/**
	 * シーン内の全モデルを取得します。
	 * @returns {Array<S3Model>} モデル配列
	 */
	getModels() {
		return this.model;
	}

	/**
	 * シーン内の全ライトを取得します。
	 * @returns {Array<S3Light>} ライト配列
	 */
	getLights() {
		return this.light;
	}
}
