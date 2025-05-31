/**
 * 3DCG用のオイラー角クラス（immutable）
 * Roll（Z軸）、Pitch（X軸）、Yaw（Y軸）の順で角度を保持します。
 * 各値は常に周期的（-180～180度）に管理されます。
 *
 * @class
 * @module S3
 */
export default class S3Angles {
	/**
	 * オイラー角（ZXY順）を指定して作成します。
	 * @param {number} [z] ロール角（Z軸回転）
	 * @param {number} [x] ピッチ角（X軸回転）
	 * @param {number} [y] ヨー角（Y軸回転）
	 */
	constructor(z, x, y) {
		if (arguments.length === 3) {
			this.setRotateZXY(z, x, y);
		} else {
			/**
			 * ロール角（Z軸回転）を周期的に正規化した値
			 * @type {number}
			 */
			this.roll = 0;

			/**
			 * ピッチ角（X軸回転）を周期的に正規化した値
			 * @type {number}
			 */
			this.pitch = 0;

			/**
			 * ヨー角（Y軸回転）を周期的に正規化した値
			 * @type {number}
			 */
			this.yaw = 0;
		}
	}

	/**
	 * 角度を周期的（-PI～PI）に正規化します。内部利用のためprivateです。
	 * @private
	 * @param {number} x 任意の角度（度単位）
	 * @returns {number} 周期内（-180～180）の角度
	 */
	static _toPeriodicAngle(x) {
		if (x > S3Angles.PI) {
			return x - S3Angles.PI2 * ~~((x + S3Angles.PI) / S3Angles.PI2);
		} else if (x < -S3Angles.PI) {
			return x + S3Angles.PI2 * ~~((-x + S3Angles.PI) / S3Angles.PI2);
		}
		return x;
	}

	/**
	 * このオブジェクトのクローンを作成します。
	 * @returns {S3Angles} 複製されたオイラー角インスタンス
	 */
	clone() {
		return new S3Angles(this.roll, this.pitch, this.yaw);
	}

	/**
	 * Roll, Pitch, Yaw の順でオイラー角を再設定します。
	 * @param {number} z ロール角（Z軸回転）
	 * @param {number} x ピッチ角（X軸回転）
	 * @param {number} y ヨー角（Y軸回転）
	 */
	setRotateZXY(z, x, y) {
		this.roll = S3Angles._toPeriodicAngle(isNaN(z) ? 0.0 : z);
		this.pitch = S3Angles._toPeriodicAngle(isNaN(x) ? 0.0 : x);
		this.yaw = S3Angles._toPeriodicAngle(isNaN(y) ? 0.0 : y);
	}

	/**
	 * ピッチ角（X軸回転）を加算した新しいオイラー角を返します。
	 * @param {number} x 追加するピッチ角
	 * @returns {S3Angles} 新しいオイラー角インスタンス
	 */
	addRotateX(x) {
		return new S3Angles(this.roll, this.pitch + x, this.yaw);
	}

	/**
	 * ヨー角（Y軸回転）を加算した新しいオイラー角を返します。
	 * @param {number} y 追加するヨー角
	 * @returns {S3Angles} 新しいオイラー角インスタンス
	 */
	addRotateY(y) {
		return new S3Angles(this.roll, this.pitch, this.yaw + y);
	}

	/**
	 * ロール角（Z軸回転）を加算した新しいオイラー角を返します。
	 * @param {number} z 追加するロール角
	 * @returns {S3Angles} 新しいオイラー角インスタンス
	 */
	addRotateZ(z) {
		return new S3Angles(this.roll + z, this.pitch, this.yaw);
	}

	/**
	 * ピッチ角（X軸回転）のみを設定した新しいオイラー角を返します。
	 * @param {number} x 新しいピッチ角
	 * @returns {S3Angles} 新しいオイラー角インスタンス
	 */
	setRotateX(x) {
		return new S3Angles(this.roll, x, this.yaw);
	}

	/**
	 * ヨー角（Y軸回転）のみを設定した新しいオイラー角を返します。
	 * @param {number} y 新しいヨー角
	 * @returns {S3Angles} 新しいオイラー角インスタンス
	 */
	setRotateY(y) {
		return new S3Angles(this.roll, this.pitch, y);
	}

	/**
	 * ロール角（Z軸回転）のみを設定した新しいオイラー角を返します。
	 * @param {number} z 新しいロール角
	 * @returns {S3Angles} 新しいオイラー角インスタンス
	 */
	setRotateZ(z) {
		return new S3Angles(z, this.pitch, this.yaw);
	}

	/**
	 * オイラー角を文字列で返します。
	 * @returns {string} "angles[roll,pitch,yaw]"形式の文字列
	 */
	toString() {
		return "angles[" + this.roll + "," + this.pitch + "," + this.yaw + "]";
	}
}

/**
 * 180度（定数）。オイラー角の範囲・変換に利用します。
 * @type {number}
 */
S3Angles.PI = 180.0;

/**
 * 90度（定数）。
 * @type {number}
 */
S3Angles.PIOVER2 = S3Angles.PI / 2.0;

/**
 * Gimbal lock防止用の値（90度-微小値）。
 * @type {number}
 */
S3Angles.PILOCK = S3Angles.PIOVER2 - 0.0001;

/**
 * 360度（定数）。
 * @type {number}
 */
S3Angles.PI2 = 2.0 * S3Angles.PI;
