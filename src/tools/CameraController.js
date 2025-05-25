import InputDetect from "inputdetect";
import S3Vector from "../math/S3Vector.js";
import S3Camera from "../basic/S3Camera.js";

/**
 * カメラ操作用コントローラー
 * タッチ操作やマウス操作を用いて3DCGシーンのカメラの移動・回転・ズームイン/アウトなどを制御するクラスです。
 * InputDetect の入力情報をもとに、カメラの移動・回転・距離変更（ズーム）を自動で計算します。
 */
export default class CameraController {
	/**
	 * CameraControllerのインスタンスを生成します。
	 * マウス／タッチ用の入力管理や、各種移動パラメータも初期化します。
	 */
	constructor() {
		/**
		 * タッチ・マウス入力管理オブジェクト
		 * @type {InputDetect}
		 */
		this.mouse = InputDetect.create();

		/**
		 * ズーム時の移動量の係数
		 * @type {number}
		 */
		this.moveDistance = 4.0;

		/**
		 * カメラ回転時の角度変更係数（度／ピクセル）
		 * @type {number}
		 */
		this.moveRotate = 0.5;

		/**
		 * カメラ移動時の移動量の係数（ピクセル単位から変換）
		 * @type {number}
		 */
		this.moveTranslateRelative = 0.1;
	}

	/**
	 * カメラコントローラで操作するcanvas要素を登録し、入力イベントを設定します。
	 * @param {HTMLElement} element 対象となるcanvas要素など
	 */
	setCanvas(element) {
		this.mouse.setListenerOnElement(element);
	}

	/**
	 * 操作対象となるカメラをセットします（cloneで複製して保持）。
	 * @param {S3Camera} camera 操作対象のカメラ
	 */
	setCamera(camera) {
		this.camera = camera.clone();
	}

	/**
	 * 現在のカメラを取得し、入力に基づく移動・回転・ズームなどを反映して返します。
	 *
	 * 毎フレーム呼び出すことで、ユーザー操作を自動で反映したカメラインスタンスが得られます。
	 * @returns {S3Camera} 現在のカメラ状態
	 */
	getCamera() {
		const data = this.mouse.pickInput();

		// 左ドラッグ：平行移動
		this.camera.translateRelative(
			new S3Vector(
				-data.left.dragged.x * this.moveTranslateRelative,
				data.left.dragged.y * this.moveTranslateRelative,
				0
			)
		);

		// 右ドラッグ：カメラ回転（Y軸・X軸）
		this.camera.addRotateY(data.right.dragged.x * this.moveRotate);
		this.camera.addRotateX(-data.right.dragged.y * this.moveRotate);

		// ホイール操作：カメラズームイン・ズームアウト
		let distance = this.camera.getDistance();
		const l = data.wheelrotation;
		distance -= l * this.moveDistance * Math.log(distance);
		this.camera.setDistance(distance);

		return this.camera;
	}
}
