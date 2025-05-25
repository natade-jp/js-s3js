import S3Math from "../math/S3Math.js";
import S3Vector from "../math/S3Vector.js";
import S3Matrix from "../math/S3Matrix.js";
import S3System from "./S3System.js";

/**
 * 3DCGシーンのカメラ（視点）情報を管理するクラス
 * 視点座標、注視点、視野角、描画範囲、各種行列演算などを保持・操作します。
 */
export default class S3Camera {
	/**
	 * カメラを作成します。
	 * @param {S3System} s3system S3Systemインスタンス
	 */
	constructor(s3system) {
		/**
		 * システムインスタンス
		 * @type {S3System}
		 */
		this.sys = s3system;
		this.init();
	}

	/**
	 * カメラの状態を初期化します（初期パラメータにリセット）。
	 */
	init() {
		/**
		 * 上下方向の視野角（度単位）
		 * @type {number}
		 */
		this.fovY = 45;

		/**
		 * 視点（カメラの位置ベクトル）
		 * @type {S3Vector}
		 */
		this.eye = new S3Vector(0, 0, 0);

		/**
		 * 注視点（カメラが見ている位置ベクトル）
		 * @type {S3Vector}
		 */
		this.at = new S3Vector(0, 0, 1);

		/**
		 * 描画範囲の最近接面（ニアクリップ）
		 * @type {number}
		 */
		this.near = 1;

		/**
		 * 描画範囲の最遠面（ファークリップ）
		 * @type {number}
		 */
		this.far = 1000;
	}

	/**
	 * カメラを破棄します（プロパティを初期化）。
	 */
	dispose() {
		this.sys = null;
		this.fovY = 0;
		this.eye = null;
		this.at = null;
		this.near = 0;
		this.far = 0;
	}

	/**
	 * このカメラのクローン（複製）を作成します。
	 * @returns {S3Camera} 複製されたS3Cameraインスタンス
	 */
	clone() {
		const camera = new S3Camera(this.sys);
		camera.fovY = this.fovY;
		camera.eye = this.eye;
		camera.at = this.at;
		camera.near = this.near;
		camera.far = this.far;
		return camera;
	}

	/**
	 * カメラのビュー・プロジェクション・ビューポート行列情報をまとめた型
	 *
	 * - LookAt: ビュー変換行列
	 * - aspect: アスペクト比（canvas幅 / 高さ）
	 * - PerspectiveFov: パースペクティブ射影行列
	 * - Viewport: ビューポート変換行列
	 *
	 * @typedef {Object} S3VPSMatrix
	 * @property {S3Matrix} LookAt         ビュー（LookAt）変換行列
	 * @property {number} aspect           アスペクト比
	 * @property {S3Matrix} PerspectiveFov パースペクティブ射影行列
	 * @property {S3Matrix} Viewport       ビューポート変換行列
	 */

	/**
	 * カメラのビュー・プロジェクション・ビューポート行列（VPS）をまとめて取得します。
	 * 通常は描画や座標変換時の各種行列一式の取得に使います。
	 *
	 * @param {HTMLCanvasElement} canvas 描画先となるcanvas要素
	 * @returns {S3VPSMatrix}
	 */
	getVPSMatrix(canvas) {
		const x = S3System.calcAspect(canvas.width, canvas.height);
		// ビューイング変換行列を作成する
		const V = this.sys.getMatrixLookAt(this.eye, this.at);
		// 射影トランスフォーム行列
		const P = this.sys.getMatrixPerspectiveFov(this.fovY, x, this.near, this.far);
		// ビューポート行列
		const S = this.sys.getMatrixViewport(0, 0, canvas.width, canvas.height);
		return { LookAt: V, aspect: x, PerspectiveFov: P, Viewport: S };
	}

	/**
	 * 描画範囲（ニア・ファー）を設定します。
	 * @param {number} near 最近接面
	 * @param {number} far 最遠面
	 */
	setDrawRange(near, far) {
		this.near = near;
		this.far = far;
	}

	/**
	 * 上下方向の視野角を設定します（度単位）。
	 * @param {number} fovY 視野角
	 */
	setFovY(fovY) {
		this.fovY = fovY;
	}

	/**
	 * 視点（eye）を設定します。
	 * @param {S3Vector} eye 新しい視点ベクトル
	 */
	setEye(eye) {
		this.eye = eye.clone();
	}

	/**
	 * 注視点（at）を設定します。
	 * @param {S3Vector} at 新しい注視点ベクトル
	 */
	setCenter(at) {
		this.at = at.clone();
	}

	/**
	 * 現在の視線ベクトル（at→eye方向の単位ベクトル）を取得します。
	 * @returns {S3Vector} 正規化済みの視線方向
	 */
	getDirection() {
		return this.eye.getDirectionNormalized(this.at);
	}

	/**
	 * カメラと注視点の距離を取得します。
	 * @returns {number} 距離
	 */
	getDistance() {
		return this.at.getDistance(this.eye);
	}

	/**
	 * 注視点から一定距離の位置に視点を設定します。
	 * @param {number} distance 距離
	 */
	setDistance(distance) {
		const direction = this.at.getDirectionNormalized(this.eye);
		this.eye = this.at.add(direction.mul(distance));
	}

	/**
	 * カメラの水平方向（Y軸回転）の角度を取得します（度単位）。
	 * @returns {number} Y軸回転角（度）
	 */
	getRotateY() {
		const ray = this.at.getDirection(this.eye);
		return S3Math.degrees(Math.atan2(ray.x, ray.z));
	}

	/**
	 * 水平方向（Y軸回転）の角度を設定します（度単位）。
	 * @param {number} deg Y軸回転角（度）
	 */
	setRotateY(deg) {
		const rad = S3Math.radius(deg);
		const ray = this.at.getDirection(this.eye);
		const length = ray.setY(0).norm();
		const cos = Math.cos(rad);
		const sin = Math.sin(rad);
		this.eye = new S3Vector(this.at.x + length * sin, this.eye.y, this.at.z + length * cos);
	}

	/**
	 * Y軸回転角を相対的に加算します（度単位）。
	 * @param {number} deg 加算する角度（度）
	 */
	addRotateY(deg) {
		this.setRotateY(this.getRotateY() + deg);
	}

	/**
	 * カメラの垂直方向（X軸回転）の角度を取得します（度単位）。
	 * @returns {number} X軸回転角（度）
	 */
	getRotateX() {
		const ray = this.at.getDirection(this.eye);
		return S3Math.degrees(Math.atan2(ray.z, ray.y));
	}

	/**
	 * 垂直方向（X軸回転）の角度を設定します（度単位）。
	 * @param {number} deg X軸回転角（度）
	 */
	setRotateX(deg) {
		const rad = S3Math.radius(deg);
		const ray = this.at.getDirection(this.eye);
		const length = ray.setX(0).norm();
		const cos = Math.cos(rad);
		const sin = Math.sin(rad);
		this.eye = new S3Vector(this.eye.x, this.at.y + length * cos, this.at.z + length * sin);
	}

	/**
	 * X軸回転角を相対的に加算します（度単位）。
	 * @param {number} deg 加算する角度（度）
	 */
	addRotateX(deg) {
		this.setRotateX(this.getRotateX() + deg);
	}

	/**
	 * ワールド座標系で絶対移動します。
	 * @param {S3Vector} v 移動ベクトル
	 */
	translateAbsolute(v) {
		this.eye = this.eye.add(v);
		this.at = this.at.add(v);
	}

	/**
	 * カメラのローカル座標系で相対移動します。
	 * @param {S3Vector} v 移動ベクトル
	 */
	translateRelative(v) {
		let X, Y, Z;
		const up = new S3Vector(0.0, 1.0, 0.0);
		// Z ベクトルの作成
		Z = this.eye.getDirectionNormalized(this.at);

		// 座標系に合わせて計算
		if (this.sys.dimensionmode === S3System.DIMENSION_MODE.RIGHT_HAND) {
			// 右手系なら反転
			Z = Z.negate();
		}
		// X, Y ベクトルの作成
		X = up.cross(Z).normalize();
		Y = Z.cross(X);
		// 移動
		X = X.mul(v.x);
		Y = Y.mul(v.y);
		Z = Z.mul(v.z);
		this.translateAbsolute(X.add(Y).add(Z));
	}

	/**
	 * カメラのパラメータを文字列で出力します。
	 * @returns {string} 視点・注視点・視野角の情報を含む文字列
	 */
	toString() {
		return "camera[\n" + "eye  :" + this.eye + ",\n" + "at   :" + this.at + ",\n" + "fovY :" + this.fovY + "]";
	}
}
