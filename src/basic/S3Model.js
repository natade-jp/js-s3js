import S3Vector from "../math/S3Vector.js";
import S3Angles from "../math/S3Angles.js";
import S3Mesh from "./S3Mesh.js";

/**
 * 3DCGシーンに配置する「モデル」を管理するクラス (mutable)
 * 位置・回転・スケール・メッシュ（形状）などモデルの変換・配置情報を保持します。
 *
 * @class
 * @module S3
 */
export default class S3Model {
	/**
	 * モデル情報を初期化して作成します。 (mutable)
	 */
	constructor() {
		this._init();
	}

	/**
	 * モデル各種パラメータを初期化します。
	 * @private
	 */
	_init() {
		/**
		 * モデルの回転角（オイラー角）
		 * @type {S3Angles}
		 */
		this.angles = new S3Angles();

		/**
		 * モデルの拡大縮小率（スケール）
		 * @type {S3Vector}
		 */
		this.scale = new S3Vector(1, 1, 1);

		/**
		 * モデルのワールド座標系での位置
		 * @type {S3Vector}
		 */
		this.position = new S3Vector(0, 0, 0);

		/**
		 * モデルが持つメッシュ（形状データ）
		 * @type {S3Mesh}
		 */
		this.mesh = null;
	}

	/**
	 * モデルのメッシュを設定します。
	 * @param {S3Mesh} mesh 新しいメッシュ
	 */
	setMesh(mesh) {
		this.mesh = mesh;
	}

	/**
	 * モデルのメッシュを取得します。
	 * @returns {S3Mesh} 現在のメッシュ
	 */
	getMesh() {
		return this.mesh;
	}

	/**
	 * モデルのスケール（拡大縮小）を設定します。
	 * - 1引数の場合、数値なら等倍、S3Vectorならベクトル指定
	 * - 3引数の場合は(x, y, z)を個別指定
	 * @param {number|S3Vector} x Xスケール or S3Vector
	 * @param {number} [y] Yスケール
	 * @param {number} [z] Zスケール
	 */
	setScale(x, y, z) {
		if (arguments.length === 1) {
			if (typeof x === "number") {
				this.scale = new S3Vector(x, x, x);
			} else if (x instanceof S3Vector) {
				this.scale = x;
			}
		} else {
			if (typeof x === "number" && typeof y === "number" && typeof z === "number") {
				this.scale = new S3Vector(x, y, z);
			} else {
				throw new TypeError("setScale(x, y, z): All arguments must be numbers.");
			}
		}
	}

	/**
	 * モデルのスケール（拡大縮小率）を取得します。
	 * @returns {S3Vector} 現在のスケール
	 */
	getScale() {
		return this.scale;
	}

	/**
	 * モデルのワールド座標系での位置を設定します。
	 * - S3Vectorでの一括指定、またはx, y, z個別指定
	 * @param {number|S3Vector} x X座標 or S3Vector
	 * @param {number} [y] Y座標
	 * @param {number} [z] Z座標
	 */
	setPosition(x, y, z) {
		if (arguments.length === 1 && x instanceof S3Vector) {
			this.position = x;
		} else {
			if (typeof x === "number" && typeof y === "number" && typeof z === "number") {
				this.position = new S3Vector(x, y, z);
			} else {
				throw new TypeError("setPosition(x, y, z): All arguments must be numbers.");
			}
		}
	}

	/**
	 * モデルのワールド座標系での位置を取得します。
	 * @returns {S3Vector} 現在の位置
	 */
	getPosition() {
		return this.position;
	}

	/**
	 * モデルの回転角（オイラー角）を取得します。
	 * @returns {S3Angles} 現在の回転角
	 */
	getAngle() {
		return this.angles;
	}

	/**
	 * モデルの回転角（オイラー角）を設定します。
	 * @param {S3Angles} angles 新しいオイラー角
	 */
	setAngle(angles) {
		this.angles = angles;
	}

	/**
	 * X軸まわりに回転（相対値）を加えます。
	 * @param {number} x 加算する角度（度単位）
	 */
	addRotateX(x) {
		this.angles = this.angles.addRotateX(x);
	}

	/**
	 * Y軸まわりに回転（相対値）を加えます。
	 * @param {number} y 加算する角度（度単位）
	 */
	addRotateY(y) {
		this.angles = this.angles.addRotateY(y);
	}

	/**
	 * Z軸まわりに回転（相対値）を加えます。
	 * @param {number} z 加算する角度（度単位）
	 */
	addRotateZ(z) {
		this.angles = this.angles.addRotateZ(z);
	}

	/**
	 * X軸まわりの回転角を絶対値で設定します。
	 * @param {number} x 新しい角度（度単位）
	 */
	setRotateX(x) {
		this.angles = this.angles.setRotateX(x);
	}

	/**
	 * Y軸まわりの回転角を絶対値で設定します。
	 * @param {number} y 新しい角度（度単位）
	 */
	setRotateY(y) {
		this.angles = this.angles.setRotateY(y);
	}

	/**
	 * Z軸まわりの回転角を絶対値で設定します。
	 * @param {number} z 新しい角度（度単位）
	 */
	setRotateZ(z) {
		this.angles = this.angles.addRotateZ(z);
	}
}
