/**
 * 数学的な便利関数を提供するユーティリティ
 * 各種演算（クランプ、ステップ関数、補間、等価判定、三角関数変換等）をまとめた静的オブジェクト
 */
const S3Math = {
	EPSILON: 2.2204460492503130808472633361816e-8,

	/**
	 * 値を[min, max]の範囲に収めます。
	 * @param {number} x 対象の値
	 * @param {number} min 最小値
	 * @param {number} max 最大値
	 * @returns {number} 範囲内に収めた値
	 */
	clamp: function (x, min, max) {
		return x < min ? min : x > max ? max : x;
	},

	/**
	 * ステップ関数。xがedge未満なら1、それ以外は0を返します。
	 * @param {number} edge 閾値
	 * @param {number} x 対象の値
	 * @returns {number} ステップ関数の値（0 or 1）
	 */
	step: function (edge, x) {
		return edge > x ? 1 : 0;
	},

	/**
	 * 線形補間（mix）を行います。
	 * @param {number} v0 始点
	 * @param {number} v1 終点
	 * @param {number} x 補間係数（0~1）
	 * @returns {number} 補間結果
	 */
	mix: function (v0, v1, x) {
		return v0 + (v1 - v0) * x;
	},

	/**
	 * スムーズステップ補間（滑らかな0-1補間）を行います。
	 * @param {number} v0 始点
	 * @param {number} v1 終点
	 * @param {number} x 補間係数（0~1）
	 * @returns {number} 補間結果
	 */
	smoothstep: function (v0, v1, x) {
		const s = x * x * (3.0 - 2.0 * x);
		return v0 + (v1 - v0) * s;
	},

	/**
	 * 2つの値が十分近いかどうか判定します（EPSILON以下の差）。
	 * @param {number} x1 値1
	 * @param {number} x2 値2
	 * @returns {boolean} 近ければtrue
	 */
	equals: function (x1, x2) {
		return Math.abs(x1 - x2) < S3Math.EPSILON;
	},

	/**
	 * 剰余を返します（負数にも対応）。
	 * @param {number} x
	 * @param {number} y
	 * @returns {number} 剰余
	 */
	mod: function (x, y) {
		return x - y * Math.floor(x / y);
	},

	/**
	 * 符号を返します。
	 * @param {number} x
	 * @returns {number} 正なら1.0、負なら-1.0
	 */
	sign: function (x) {
		return x >= 0.0 ? 1.0 : -1;
	},

	/**
	 * 小数部を返します。
	 * @param {number} x
	 * @returns {number} 小数部
	 */
	fract: function (x) {
		return x - Math.floor(x);
	},

	/**
	 * 逆平方根（1/√x）を計算します。
	 * @param {number} x
	 * @returns {number} 逆平方根
	 */
	rsqrt: function (x) {
		return Math.sqrt(1.0 / x);
	},

	/**
	 * 角度（度）をラジアンに変換します。
	 * @param {number} degree 度数
	 * @returns {number} ラジアン値
	 */
	radius: function (degree) {
		return (degree / 360.0) * (2.0 * Math.PI);
	},

	/**
	 * ラジアンを角度（度）に変換します。
	 * @param {number} rad ラジアン値
	 * @returns {number} 度数
	 */
	degrees: function (rad) {
		return (rad / (2.0 * Math.PI)) * 360.0;
	}
};

/**
 * 3DCG用の4x4行列クラス
 * 主に変換行列や射影行列などに使用されます。
 */
class S3Matrix {
	/**
	 * 3DCG用 の4x4行列  (immutable)
	 * 行列を作成します。MATLABと同様に行ごとに指定します。
	 * 9引数で3x3行列、16引数で4x4行列、引数なしで0埋め行列
	 * @param {Number} [m00]
	 * @param {Number} [m01]
	 * @param {Number} [m02]
	 * @param {Number} [m03]
	 * @param {Number} [m10]
	 * @param {Number} [m11]
	 * @param {Number} [m12]
	 * @param {Number} [m13]
	 * @param {Number} [m20]
	 * @param {Number} [m21]
	 * @param {Number} [m22]
	 * @param {Number} [m23]
	 * @param {Number} [m30]
	 * @param {Number} [m31]
	 * @param {Number} [m32]
	 * @param {Number} [m33]
	 */
	constructor(
		m00,
		m01,
		m02,
		m03, // row 1
		m10,
		m11,
		m12,
		m13, // row 2
		m20,
		m21,
		m22,
		m23, // row 3
		m30,
		m31,
		m32,
		m33
	) {
		// row 4
		if (arguments.length === 0) {
			this.m00 = 0.0;
			this.m01 = 0.0;
			this.m02 = 0.0;
			this.m03 = 0.0;
			this.m10 = 0.0;
			this.m11 = 0.0;
			this.m12 = 0.0;
			this.m13 = 0.0;
			this.m20 = 0.0;
			this.m21 = 0.0;
			this.m22 = 0.0;
			this.m23 = 0.0;
			this.m30 = 0.0;
			this.m31 = 0.0;
			this.m32 = 0.0;
			this.m33 = 0.0;
		} else if (arguments.length === 9) {
			// 3x3行列
			this.m00 = m00;
			this.m01 = m01;
			this.m02 = m02;
			this.m03 = 0.0;
			this.m10 = m03;
			this.m11 = m10;
			this.m12 = m11;
			this.m13 = 0.0;
			this.m20 = m12;
			this.m21 = m13;
			this.m22 = m20;
			this.m23 = 0.0;
			this.m30 = 0.0;
			this.m31 = 0.0;
			this.m32 = 0.0;
			this.m33 = 1.0;
		} else if (arguments.length === 16) {
			// 4x4行列
			this.m00 = m00;
			this.m01 = m01;
			this.m02 = m02;
			this.m03 = m03;
			this.m10 = m10;
			this.m11 = m11;
			this.m12 = m12;
			this.m13 = m13;
			this.m20 = m20;
			this.m21 = m21;
			this.m22 = m22;
			this.m23 = m23;
			this.m30 = m30;
			this.m31 = m31;
			this.m32 = m32;
			this.m33 = m33;
		} else {
			throw "IllegalArgumentException";
		}
	}

	/**
	 * 2つの行列が等しいか判定します。
	 * @param {S3Matrix} tgt
	 * @returns {boolean}
	 */
	equals(tgt) {
		return (
			S3Math.equals(this.m00, tgt.m00) &&
			S3Math.equals(this.m01, tgt.m01) &&
			S3Math.equals(this.m02, tgt.m02) &&
			S3Math.equals(this.m03, tgt.m03) &&
			S3Math.equals(this.m10, tgt.m10) &&
			S3Math.equals(this.m11, tgt.m11) &&
			S3Math.equals(this.m12, tgt.m12) &&
			S3Math.equals(this.m13, tgt.m13) &&
			S3Math.equals(this.m20, tgt.m20) &&
			S3Math.equals(this.m21, tgt.m21) &&
			S3Math.equals(this.m22, tgt.m22) &&
			S3Math.equals(this.m23, tgt.m23) &&
			S3Math.equals(this.m30, tgt.m30) &&
			S3Math.equals(this.m31, tgt.m31) &&
			S3Math.equals(this.m32, tgt.m32) &&
			S3Math.equals(this.m33, tgt.m33)
		);
	}

	/**
	 * 自身のクローンを作成します。
	 * @returns {S3Matrix}
	 */
	clone() {
		return new S3Matrix(
			this.m00,
			this.m01,
			this.m02,
			this.m03,
			this.m10,
			this.m11,
			this.m12,
			this.m13,
			this.m20,
			this.m21,
			this.m22,
			this.m23,
			this.m30,
			this.m31,
			this.m32,
			this.m33
		);
	}

	/**
	 * 転置行列を返します。
	 * @returns {S3Matrix}
	 */
	transposed() {
		return new S3Matrix(
			this.m00,
			this.m10,
			this.m20,
			this.m30,
			this.m01,
			this.m11,
			this.m21,
			this.m31,
			this.m02,
			this.m12,
			this.m22,
			this.m32,
			this.m03,
			this.m13,
			this.m23,
			this.m33
		);
	}

	/**
	 * 非数成分を含むか判定します。
	 * @returns {boolean}
	 */
	isNaN() {
		return (
			isNaN(this.m00) ||
			isNaN(this.m01) ||
			isNaN(this.m02) ||
			isNaN(this.m03) ||
			isNaN(this.m10) ||
			isNaN(this.m11) ||
			isNaN(this.m12) ||
			isNaN(this.m13) ||
			isNaN(this.m20) ||
			isNaN(this.m21) ||
			isNaN(this.m22) ||
			isNaN(this.m23) ||
			isNaN(this.m30) ||
			isNaN(this.m31) ||
			isNaN(this.m32) ||
			isNaN(this.m33)
		);
	}

	/**
	 * 有限の成分のみか判定します。
	 * @returns {boolean}
	 */
	isFinite() {
		return (
			(isFinite(this.m00) && isFinite(this.m01) && isFinite(this.m02) && isFinite(this.m03)) ||
			(isFinite(this.m10) && isFinite(this.m11) && isFinite(this.m12) && isFinite(this.m13)) ||
			(isFinite(this.m20) && isFinite(this.m21) && isFinite(this.m22) && isFinite(this.m23)) ||
			(isFinite(this.m30) && isFinite(this.m31) && isFinite(this.m32) && isFinite(this.m33))
		);
	}

	/**
	 * 実数値成分のみか判定します。
	 * @returns {boolean}
	 */
	isRealNumber() {
		return !this.isNaN() && this.isFinite();
	}

	/**
	 * 行列またはベクトルとの掛け算を行います。
	 * @param {S3Matrix} tgt 行列
	 * @returns {S3Matrix}
	 */
	mulMatrix(tgt) {
		const A = this;
		const B = tgt;
		const C = new S3Matrix();
		// 行列クラスのコンストラクタを変更しても問題がないように
		// 後で代入を行っております。
		C.m00 = A.m00 * B.m00 + A.m01 * B.m10 + A.m02 * B.m20 + A.m03 * B.m30;
		C.m01 = A.m00 * B.m01 + A.m01 * B.m11 + A.m02 * B.m21 + A.m03 * B.m31;
		C.m02 = A.m00 * B.m02 + A.m01 * B.m12 + A.m02 * B.m22 + A.m03 * B.m32;
		C.m03 = A.m00 * B.m03 + A.m01 * B.m13 + A.m02 * B.m23 + A.m03 * B.m33;
		C.m10 = A.m10 * B.m00 + A.m11 * B.m10 + A.m12 * B.m20 + A.m13 * B.m30;
		C.m11 = A.m10 * B.m01 + A.m11 * B.m11 + A.m12 * B.m21 + A.m13 * B.m31;
		C.m12 = A.m10 * B.m02 + A.m11 * B.m12 + A.m12 * B.m22 + A.m13 * B.m32;
		C.m13 = A.m10 * B.m03 + A.m11 * B.m13 + A.m12 * B.m23 + A.m13 * B.m33;
		C.m20 = A.m20 * B.m00 + A.m21 * B.m10 + A.m22 * B.m20 + A.m23 * B.m30;
		C.m21 = A.m20 * B.m01 + A.m21 * B.m11 + A.m22 * B.m21 + A.m23 * B.m31;
		C.m22 = A.m20 * B.m02 + A.m21 * B.m12 + A.m22 * B.m22 + A.m23 * B.m32;
		C.m23 = A.m20 * B.m03 + A.m21 * B.m13 + A.m22 * B.m23 + A.m23 * B.m33;
		C.m30 = A.m30 * B.m00 + A.m31 * B.m10 + A.m32 * B.m20 + A.m33 * B.m30;
		C.m31 = A.m30 * B.m01 + A.m31 * B.m11 + A.m32 * B.m21 + A.m33 * B.m31;
		C.m32 = A.m30 * B.m02 + A.m31 * B.m12 + A.m32 * B.m22 + A.m33 * B.m32;
		C.m33 = A.m30 * B.m03 + A.m31 * B.m13 + A.m32 * B.m23 + A.m33 * B.m33;
		return C;
	}

	/**
	 * 縦ベクトルとの掛け算を行います。
	 * @param {S3Vector} tgt 縦ベクトル
	 * @returns {S3Vector}
	 */
	mulVector(tgt) {
		const A = this;
		const v = tgt;
		// 行列×縦ベクトル＝縦ベクトル
		// Av = u なので、各項を行列の行ごとで掛け算する
		return new S3Vector(
			A.m00 * v.x + A.m01 * v.y + A.m02 * v.z + A.m03 * v.w,
			A.m10 * v.x + A.m11 * v.y + A.m12 * v.z + A.m13 * v.w,
			A.m20 * v.x + A.m21 * v.y + A.m22 * v.z + A.m23 * v.w,
			A.m30 * v.x + A.m31 * v.y + A.m32 * v.z + A.m33 * v.w
		);
	}

	/**
	 * 3x3部分行列の行列式を計算します。
	 * @returns {number}
	 */
	det3() {
		const A = this;
		let out;
		out = A.m00 * A.m11 * A.m22;
		out += A.m10 * A.m21 * A.m02;
		out += A.m20 * A.m01 * A.m12;
		out -= A.m00 * A.m21 * A.m12;
		out -= A.m20 * A.m11 * A.m02;
		out -= A.m10 * A.m01 * A.m22;
		return out;
	}

	/**
	 * 3x3部分行列の逆行列を返します。
	 * @returns {S3Matrix|null}
	 */
	inverse3() {
		const A = this;
		const det = A.det3();
		if (det === 0.0) {
			return null;
		}
		const id = 1.0 / det;
		const B = A.clone();
		B.m00 = (A.m11 * A.m22 - A.m12 * A.m21) * id;
		B.m01 = (A.m02 * A.m21 - A.m01 * A.m22) * id;
		B.m02 = (A.m01 * A.m12 - A.m02 * A.m11) * id;
		B.m10 = (A.m12 * A.m20 - A.m10 * A.m22) * id;
		B.m11 = (A.m00 * A.m22 - A.m02 * A.m20) * id;
		B.m12 = (A.m02 * A.m10 - A.m00 * A.m12) * id;
		B.m20 = (A.m10 * A.m21 - A.m11 * A.m20) * id;
		B.m21 = (A.m01 * A.m20 - A.m00 * A.m21) * id;
		B.m22 = (A.m00 * A.m11 - A.m01 * A.m10) * id;
		return B;
	}

	/**
	 * 4x4行列の行列式を計算します。
	 * @returns {number}
	 */
	det4() {
		const A = this;
		let out;
		out = A.m00 * A.m11 * A.m22 * A.m33;
		out += A.m00 * A.m12 * A.m23 * A.m31;
		out += A.m00 * A.m13 * A.m21 * A.m32;
		out += A.m01 * A.m10 * A.m23 * A.m32;
		out += A.m01 * A.m12 * A.m20 * A.m33;
		out += A.m01 * A.m13 * A.m22 * A.m30;
		out += A.m02 * A.m10 * A.m21 * A.m33;
		out += A.m02 * A.m11 * A.m23 * A.m30;
		out += A.m02 * A.m13 * A.m20 * A.m31;
		out += A.m03 * A.m10 * A.m22 * A.m31;
		out += A.m03 * A.m11 * A.m20 * A.m32;
		out += A.m03 * A.m12 * A.m21 * A.m30;
		out -= A.m00 * A.m11 * A.m23 * A.m32;
		out -= A.m00 * A.m12 * A.m21 * A.m33;
		out -= A.m00 * A.m13 * A.m22 * A.m31;
		out -= A.m01 * A.m10 * A.m22 * A.m33;
		out -= A.m01 * A.m12 * A.m23 * A.m30;
		out -= A.m01 * A.m13 * A.m20 * A.m32;
		out -= A.m02 * A.m10 * A.m23 * A.m31;
		out -= A.m02 * A.m11 * A.m20 * A.m33;
		out -= A.m02 * A.m13 * A.m21 * A.m30;
		out -= A.m03 * A.m10 * A.m21 * A.m32;
		out -= A.m03 * A.m11 * A.m22 * A.m30;
		out -= A.m03 * A.m12 * A.m20 * A.m31;
		return out;
	}

	/**
	 * 4x4行列の逆行列を返します。
	 * @returns {S3Matrix|null}
	 */
	inverse4() {
		const A = this;
		const det = A.det4();
		if (det === 0.0) {
			return null;
		}
		const id = 1.0 / det;
		const B = new S3Matrix();
		B.m00 =
			(A.m11 * A.m22 * A.m33 +
				A.m12 * A.m23 * A.m31 +
				A.m13 * A.m21 * A.m32 -
				A.m11 * A.m23 * A.m32 -
				A.m12 * A.m21 * A.m33 -
				A.m13 * A.m22 * A.m31) *
			id;
		B.m01 =
			(A.m01 * A.m23 * A.m32 +
				A.m02 * A.m21 * A.m33 +
				A.m03 * A.m22 * A.m31 -
				A.m01 * A.m22 * A.m33 -
				A.m02 * A.m23 * A.m31 -
				A.m03 * A.m21 * A.m32) *
			id;
		B.m02 =
			(A.m01 * A.m12 * A.m33 +
				A.m02 * A.m13 * A.m31 +
				A.m03 * A.m11 * A.m32 -
				A.m01 * A.m13 * A.m32 -
				A.m02 * A.m11 * A.m33 -
				A.m03 * A.m12 * A.m31) *
			id;
		B.m03 =
			(A.m01 * A.m13 * A.m22 +
				A.m02 * A.m11 * A.m23 +
				A.m03 * A.m12 * A.m21 -
				A.m01 * A.m12 * A.m23 -
				A.m02 * A.m13 * A.m21 -
				A.m03 * A.m11 * A.m22) *
			id;
		B.m10 =
			(A.m10 * A.m23 * A.m32 +
				A.m12 * A.m20 * A.m33 +
				A.m13 * A.m22 * A.m30 -
				A.m10 * A.m22 * A.m33 -
				A.m12 * A.m23 * A.m30 -
				A.m13 * A.m20 * A.m32) *
			id;
		B.m11 =
			(A.m00 * A.m22 * A.m33 +
				A.m02 * A.m23 * A.m30 +
				A.m03 * A.m20 * A.m32 -
				A.m00 * A.m23 * A.m32 -
				A.m02 * A.m20 * A.m33 -
				A.m03 * A.m22 * A.m30) *
			id;
		B.m12 =
			(A.m00 * A.m13 * A.m32 +
				A.m02 * A.m10 * A.m33 +
				A.m03 * A.m12 * A.m30 -
				A.m00 * A.m12 * A.m33 -
				A.m02 * A.m13 * A.m30 -
				A.m03 * A.m10 * A.m32) *
			id;
		B.m13 =
			(A.m00 * A.m12 * A.m23 +
				A.m02 * A.m13 * A.m20 +
				A.m03 * A.m10 * A.m22 -
				A.m00 * A.m13 * A.m22 -
				A.m02 * A.m10 * A.m23 -
				A.m03 * A.m12 * A.m20) *
			id;
		B.m20 =
			(A.m10 * A.m21 * A.m33 +
				A.m11 * A.m23 * A.m30 +
				A.m13 * A.m20 * A.m31 -
				A.m10 * A.m23 * A.m31 -
				A.m11 * A.m20 * A.m33 -
				A.m13 * A.m21 * A.m30) *
			id;
		B.m21 =
			(A.m00 * A.m23 * A.m31 +
				A.m01 * A.m20 * A.m33 +
				A.m03 * A.m21 * A.m30 -
				A.m00 * A.m21 * A.m33 -
				A.m01 * A.m23 * A.m30 -
				A.m03 * A.m20 * A.m31) *
			id;
		B.m22 =
			(A.m00 * A.m11 * A.m33 +
				A.m01 * A.m13 * A.m30 +
				A.m03 * A.m10 * A.m31 -
				A.m00 * A.m13 * A.m31 -
				A.m01 * A.m10 * A.m33 -
				A.m03 * A.m11 * A.m30) *
			id;
		B.m23 =
			(A.m00 * A.m13 * A.m21 +
				A.m01 * A.m10 * A.m23 +
				A.m03 * A.m11 * A.m20 -
				A.m00 * A.m11 * A.m23 -
				A.m01 * A.m13 * A.m20 -
				A.m03 * A.m10 * A.m21) *
			id;
		B.m30 =
			(A.m10 * A.m22 * A.m31 +
				A.m11 * A.m20 * A.m32 +
				A.m12 * A.m21 * A.m30 -
				A.m10 * A.m21 * A.m32 -
				A.m11 * A.m22 * A.m30 -
				A.m12 * A.m20 * A.m31) *
			id;
		B.m31 =
			(A.m00 * A.m21 * A.m32 +
				A.m01 * A.m22 * A.m30 +
				A.m02 * A.m20 * A.m31 -
				A.m00 * A.m22 * A.m31 -
				A.m01 * A.m20 * A.m32 -
				A.m02 * A.m21 * A.m30) *
			id;
		B.m32 =
			(A.m00 * A.m12 * A.m31 +
				A.m01 * A.m10 * A.m32 +
				A.m02 * A.m11 * A.m30 -
				A.m00 * A.m11 * A.m32 -
				A.m01 * A.m12 * A.m30 -
				A.m02 * A.m10 * A.m31) *
			id;
		B.m33 =
			(A.m00 * A.m11 * A.m22 +
				A.m01 * A.m12 * A.m20 +
				A.m02 * A.m10 * A.m21 -
				A.m00 * A.m12 * A.m21 -
				A.m01 * A.m10 * A.m22 -
				A.m02 * A.m11 * A.m20) *
			id;
		return B;
	}

	/**
	 * 行列を文字列に変換します。
	 * @returns {string}
	 */
	toString() {
		return (
			"[" +
			"[" +
			this.m00 +
			" " +
			this.m01 +
			" " +
			this.m02 +
			" " +
			this.m03 +
			"]\n" +
			" [" +
			this.m10 +
			" " +
			this.m11 +
			" " +
			this.m12 +
			" " +
			this.m13 +
			"]\n" +
			" [" +
			this.m20 +
			" " +
			this.m21 +
			" " +
			this.m22 +
			" " +
			this.m23 +
			"]\n" +
			" [" +
			this.m30 +
			" " +
			this.m31 +
			" " +
			this.m32 +
			" " +
			this.m33 +
			"]]"
		);
	}

	/**
	 * 他の型のインスタンスに変換します（配列化）。
	 * @param {{new(array: number[]): any}} Instance 配列型のコンストラクタ
	 * @param {number} dimension 配列長
	 * @returns {*} 変換結果
	 */
	toInstanceArray(Instance, dimension) {
		if (dimension === 1) {
			return new Instance([this.m00]);
		} else if (dimension === 4) {
			return new Instance([this.m00, this.m10, this.m01, this.m11]);
		} else if (dimension === 9) {
			return new Instance([
				this.m00,
				this.m10,
				this.m20,
				this.m01,
				this.m11,
				this.m21,
				this.m02,
				this.m12,
				this.m22
			]);
		} else {
			return new Instance([
				this.m00,
				this.m10,
				this.m20,
				this.m30,
				this.m01,
				this.m11,
				this.m21,
				this.m31,
				this.m02,
				this.m12,
				this.m22,
				this.m32,
				this.m03,
				this.m13,
				this.m23,
				this.m33
			]);
		}
	}
}

/**
 * 3DCG用のベクトルクラス（immutable）
 */
class S3Vector {
	/**
	 * ベクトルを作成します。
	 * @param {number} x x成分
	 * @param {number} y y成分
	 * @param {number} [z=0.0] z成分
	 * @param {number} [w=1.0] w成分（遠近除算用）
	 */
	constructor(x, y, z, w) {
		/**
		 * x成分
		 * @type {number}
		 */
		this.x = x;

		/**
		 * y成分
		 * @type {number}
		 */
		this.y = y;
		if (z === undefined) {
			/**
			 * z成分
			 * @type {number}
			 * @default 0.0
			 */
			this.z = 0.0;
		} else {
			this.z = z;
		}
		if (w === undefined) {
			/**
			 * w成分（遠近除算用）
			 * @type {number}
			 * @default 1.0
			 */
			this.w = 1.0;
		} else {
			this.w = w;
		}
	}

	/**
	 * 自身のクローンを作成します。
	 * @returns {S3Vector} 複製されたベクトル
	 */
	clone() {
		return new S3Vector(this.x, this.y, this.z, this.w);
	}

	/**
	 * 各成分を反転したベクトルを返します。
	 * @returns {S3Vector}
	 */
	negate() {
		return new S3Vector(-this.x, -this.y, -this.z, this.w);
	}

	/**
	 * 2つのベクトルの外積を計算します。
	 * @param {S3Vector} tgt
	 * @returns {S3Vector} 外積ベクトル
	 */
	cross(tgt) {
		return new S3Vector(
			this.y * tgt.z - this.z * tgt.y,
			this.z * tgt.x - this.x * tgt.z,
			this.x * tgt.y - this.y * tgt.x,
			1.0
		);
	}

	/**
	 * 2つのベクトルの内積を計算します。
	 * @param {S3Vector} tgt
	 * @returns {number} 内積値
	 */
	dot(tgt) {
		return this.x * tgt.x + this.y * tgt.y + this.z * tgt.z;
	}

	/**
	 * ベクトル同士の加算を行います。
	 * @param {S3Vector} tgt
	 * @returns {S3Vector} 加算結果
	 */
	add(tgt) {
		return new S3Vector(this.x + tgt.x, this.y + tgt.y, this.z + tgt.z, 1.0);
	}

	/**
	 * ベクトル同士の減算を行います。
	 * @param {S3Vector} tgt
	 * @returns {S3Vector} 減算結果
	 */
	sub(tgt) {
		return new S3Vector(this.x - tgt.x, this.y - tgt.y, this.z - tgt.z, 1.0);
	}

	/**
	 * ベクトルの各成分にスカラー、ベクトル、または行列を掛けます。
	 * @param {number|S3Vector|S3Matrix} tgt
	 * @returns {S3Vector}
	 */
	mul(tgt) {
		if (tgt instanceof S3Vector) {
			return new S3Vector(this.x * tgt.x, this.y * tgt.y, this.z * tgt.z, 1.0);
		} else if (tgt instanceof S3Matrix) {
			// 横ベクトル×行列＝横ベクトル
			const v = this;
			const A = tgt;
			// vA = u なので、各項を行列の列ごとで掛け算する
			return new S3Vector(
				v.x * A.m00 + v.y * A.m10 + v.z * A.m20 + v.w * A.m30,
				v.x * A.m01 + v.y * A.m11 + v.z * A.m21 + v.w * A.m31,
				v.x * A.m02 + v.y * A.m12 + v.z * A.m22 + v.w * A.m32,
				v.x * A.m03 + v.y * A.m13 + v.z * A.m23 + v.w * A.m33
			);
		} else if (typeof tgt === "number") {
			return new S3Vector(this.x * tgt, this.y * tgt, this.z * tgt, 1.0);
		} else {
			throw "IllegalArgumentException";
		}
	}

	/**
	 * x成分のみ変更した新しいベクトルを返します。
	 * @param {number} x
	 * @returns {S3Vector}
	 */
	setX(x) {
		return new S3Vector(x, this.y, this.z, this.w);
	}

	/**
	 * y成分のみ変更した新しいベクトルを返します。
	 * @param {number} y
	 * @returns {S3Vector}
	 */
	setY(y) {
		return new S3Vector(this.x, y, this.z, this.w);
	}

	/**
	 * z成分のみ変更した新しいベクトルを返します。
	 * @param {number} z
	 * @returns {S3Vector}
	 */
	setZ(z) {
		return new S3Vector(this.x, this.y, z, this.w);
	}

	/**
	 * w成分のみ変更した新しいベクトルを返します。
	 * @param {number} w
	 * @returns {S3Vector}
	 */
	setW(w) {
		return new S3Vector(this.x, this.y, this.z, w);
	}

	/**
	 * 各成分の最大値を持つ新しいベクトルを返します。
	 * @param {S3Vector} tgt
	 * @returns {S3Vector}
	 */
	max(tgt) {
		return new S3Vector(
			Math.max(this.x, tgt.x),
			Math.max(this.y, tgt.y),
			Math.max(this.z, tgt.z),
			Math.max(this.w, tgt.w)
		);
	}

	/**
	 * 各成分の最小値を持つ新しいベクトルを返します。
	 * @param {S3Vector} tgt
	 * @returns {S3Vector}
	 */
	min(tgt) {
		return new S3Vector(
			Math.min(this.x, tgt.x),
			Math.min(this.y, tgt.y),
			Math.min(this.z, tgt.z),
			Math.min(this.w, tgt.w)
		);
	}
	/**
	 * 各成分が等しいか判定します。
	 * @param {S3Vector} tgt
	 * @returns {boolean} 全ての成分が等しい場合true
	 */
	equals(tgt) {
		return (
			S3Math.equals(this.x, tgt.x) &&
			S3Math.equals(this.y, tgt.y) &&
			S3Math.equals(this.z, tgt.z) &&
			S3Math.equals(this.w, tgt.w)
		);
	}

	/**
	 * 2つのベクトル間を線形補間します。
	 * @param {S3Vector} tgt
	 * @param {number} alpha 補間係数（0~1）
	 * @returns {S3Vector}
	 */
	mix(tgt, alpha) {
		return new S3Vector(
			S3Math.mix(this.x, tgt.x, alpha),
			S3Math.mix(this.y, tgt.y, alpha),
			S3Math.mix(this.z, tgt.z, alpha),
			S3Math.mix(this.w, tgt.w, alpha)
		);
	}

	/**
	 * ノルム（二乗和の平方根、長さ）を計算します。
	 * @returns {number} ベクトルの長さ
	 */
	norm() {
		return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
	}

	/**
	 * ノルムの2乗値（高速、平方根なし）を返します。
	 * @returns {number} 長さの二乗
	 */
	normFast() {
		return this.x * this.x + this.y * this.y + this.z * this.z;
	}

	/**
	 * 正規化した新しいベクトルを返します。
	 * @returns {S3Vector}
	 */
	normalize() {
		let b = this.normFast();
		if (b === 0.0) {
			throw "divide error";
		}
		b = Math.sqrt(1.0 / b);
		return new S3Vector(this.x * b, this.y * b, this.z * b, 1.0);
	}

	/**
	 * ベクトルを文字列化します。
	 * @param {number} [num] 成分数指定（省略時は4成分）
	 * @returns {string}
	 */
	toString(num) {
		if (num === 1) {
			return "[" + this.x + "]T";
		} else if (num === 2) {
			return "[" + this.x + "," + this.y + "]T";
		} else if (num === 3) {
			return "[" + this.x + "," + this.y + "," + this.z + "]T";
		} else {
			return "[" + this.x + "," + this.y + "," + this.z + "," + this.w + "]T";
		}
	}

	/**
	 * ベクトルのハッシュ値を返します。
	 * @param {number} [num] 成分数指定（省略時は1成分）
	 * @returns {number}
	 */
	toHash(num) {
		const s = 4;
		const t = 10000;
		let x = (parseFloat(this.x.toExponential(3).substring(0, 5)) * 321) & 0xffffffff;
		if (num >= 2) {
			x = (x * 12345 + parseFloat(this.y.toExponential(s).substring(0, s + 2)) * t) & 0xffffffff;
		}
		if (num >= 3) {
			x = (x * 12345 + parseFloat(this.z.toExponential(s).substring(0, s + 2)) * t) & 0xffffffff;
		}
		if (num >= 4) {
			x = (x * 12345 + parseFloat(this.w.toExponential(s).substring(0, s + 2)) * t) & 0xffffffff;
		}
		return x;
	}

	/**
	 * 他の型のインスタンスに変換します（配列化）。
	 * @param {{new(array: number[]): any}} Instance 配列型のコンストラクタ
	 * @param {number} dimension 配列長
	 * @returns {*} 変換結果
	 */
	toInstanceArray(Instance, dimension) {
		if (dimension === 1) {
			return new Instance([this.x]);
		} else if (dimension === 2) {
			return new Instance([this.x, this.y]);
		} else if (dimension === 3) {
			return new Instance([this.x, this.y, this.z]);
		} else {
			return new Instance([this.x, this.y, this.z, this.w]);
		}
	}

	/**
	 * 配列に成分をプッシュします。
	 * @param {Array<number>} array
	 * @param {number} num 成分数
	 */
	pushed(array, num) {
		if (num === 1) {
			array.push(this.x);
		} else if (num === 2) {
			array.push(this.x);
			array.push(this.y);
		} else if (num === 3) {
			array.push(this.x);
			array.push(this.y);
			array.push(this.z);
		} else {
			array.push(this.x);
			array.push(this.y);
			array.push(this.z);
			array.push(this.w);
		}
	}

	/**
	 * tgtへの方向ベクトルを取得します。
	 * @param {S3Vector} tgt
	 * @returns {S3Vector} tgt-自身のベクトル
	 */
	getDirection(tgt) {
		return tgt.sub(this);
	}

	/**
	 * tgtへの正規化された方向ベクトルを取得します。
	 * @param {S3Vector} tgt
	 * @returns {S3Vector}
	 */
	getDirectionNormalized(tgt) {
		return tgt.sub(this).normalize();
	}

	/**
	 * tgtとの距離を返します。
	 * @param {S3Vector} tgt
	 * @returns {number}
	 */
	getDistance(tgt) {
		return this.getDirection(tgt).norm();
	}

	/**
	 * 非数かどうか判定します。
	 * @returns {boolean}
	 */
	isNaN() {
		return isNaN(this.x) || isNaN(this.y) || isNaN(this.z) || isNaN(this.w);
	}

	/**
	 * 有限かどうか判定します。
	 * @returns {boolean}
	 */
	isFinite() {
		return isFinite(this.x) && isFinite(this.y) && isFinite(this.z) && isFinite(this.w);
	}

	/**
	 * 実数かどうか判定します。
	 * @returns {boolean}
	 */
	isRealNumber() {
		return !this.isNaN() && this.isFinite();
	}

	/**
	 * @typedef {Object} S3NormalVector
	 * @property {S3Vector} normal 平面の法線
	 * @property {S3Vector} tangent UV座標による接線
	 * @property {S3Vector} binormal UV座標による従法線
	 */

	/**
	 * 3点を通る平面の法線、接線、従法線を計算します。
	 * A, B, C の3点を通る平面の法線と、UV座標による接線、従法線を求めます。
	 * A, B, C の3点の時計回りが表だとした場合、表方向へ延びる法線となります。
	 * @param {S3Vector} posA 点A
	 * @param {S3Vector} posB 点B
	 * @param {S3Vector} posC 点C
	 * @param {S3Vector} [uvA] UV座標A
	 * @param {S3Vector} [uvB] UV座標B
	 * @param {S3Vector} [uvC] UV座標C
	 * @returns {S3NormalVector}
	 */
	static getNormalVector(posA, posB, posC, uvA, uvB, uvC) {
		let N;

		while (1) {
			const P0 = posA.getDirection(posB);
			const P1 = posA.getDirection(posC);
			try {
				N = P0.cross(P1).normalize();
			} catch (e) {
				// 頂点の位置が直行しているなどのエラー処理
				N = new S3Vector(0.3333, 0.3333, 0.3333);
				break;
			}
			if (uvA === undefined && uvB === undefined && uvC === undefined) {
				// UV値がない場合はノーマルのみ返す
				break;
			}
			// 接線と従法線を計算するにあたり、以下のサイトを参考にしました。
			// http://sunandblackcat.com/tipFullView.php?l=eng&topicid=8
			// https://stackoverflow.com/questions/5255806/how-to-calculate-tangent-and-binormal
			// http://www.terathon.com/code/tangent.html
			const st0 = uvA.getDirection(uvB);
			const st1 = uvA.getDirection(uvC);
			let q;
			try {
				// 接線と従法線を求める
				q = 1.0 / st0.cross(st1).z;
				const Tx = q * (st1.y * P0.x - st0.y * P1.x);
				const Ty = q * (st1.y * P0.y - st0.y * P1.y);
				const Tz = q * (st1.y * P0.z - st0.y * P1.z);
				const Bx = q * (-st1.x * P0.x + st0.x * P1.x);
				const By = q * (-st1.x * P0.y + st0.x * P1.y);
				const Bz = q * (-st1.x * P0.z + st0.x * P1.z);
				const T = new S3Vector(Tx, Ty, Tz); // Tangent	接線
				const B = new S3Vector(Bx, By, Bz); // Binormal	従法線
				return {
					normal: N,
					tangent: T.normalize(),
					binormal: B.normalize()
				};
				/*
				// 接線と従法線は直行していない
				// 直行している方が行列として安定している。
				// 以下、Gram-Schmidtアルゴリズムで直行したベクトルを作成する場合
				const nT = T.sub(N.mul(N.dot(T))).normalize();
				const w  = N.cross(T).dot(B) < 0.0 ? -1.0 : 1.0;
				const nB = N.cross(nT).mul(w);
				return {
					normal		: N,
					tangent		: nT,
					binormal	: nB
				}
				*/
			} catch (e) {
				break;
			}
		}
		return {
			normal: N,
			tangent: null,
			binormal: null
		};
	}

	/**
	 * 3点が時計回りか判定します。
	 * @param {S3Vector} A
	 * @param {S3Vector} B
	 * @param {S3Vector} C
	 * @returns {boolean|null} 時計回り:true、反時計回り:false、判定不可:null
	 */
	static isClockwise(A, B, C) {
		const v1 = A.getDirection(B).setZ(0);
		const v2 = A.getDirection(C).setZ(0);
		const type = v1.cross(v2).z;
		if (type === 0) {
			return null;
		} else if (type > 0) {
			return true;
		} else {
			return false;
		}
	}
}

/**
 * 0
 * @type S3Vector
 */
S3Vector.ZERO = new S3Vector(0.0, 0.0, 0.0);

/**
 * 3DCGシーンのカメラ（視点）情報を管理するクラス
 * 視点座標、注視点、視野角、描画範囲、各種行列演算などを保持・操作します。
 */
class S3Camera {
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

/**
 * 3DCGシーン用のライト（照明）情報を管理するクラス
 * 各種ライト（環境光・平行光源・点光源など）のモード・強さ・方向・色などを保持します。
 */
class S3Light {
	/**
	 * ライト情報を初期化して作成します。
	 * @constructor
	 */
	constructor() {
		this.init();
	}

	/**
	 * ライト情報を初期値でリセットします。
	 * モードや強度、範囲、方向、色なども初期状態に戻ります。
	 */
	init() {
		/**
		 * ライトの種類（モード）を指定します。S3Light.MODEを参照。
		 * @type {number}
		 */
		this.mode = S3Light.MODE.DIRECTIONAL_LIGHT;

		/**
		 * ライトの強さ（1.0=通常、0.0=無効）
		 * @type {number}
		 */
		this.power = 1.0;

		/**
		 * ライトの影響範囲（主に点光源で使用）
		 * @type {number}
		 */
		this.range = 1000.0;

		/**
		 * ライトの位置ベクトル（主に点光源で使用）
		 * @type {S3Vector}
		 */
		this.position = new S3Vector(0.0, 0.0, 0.0);

		/**
		 * ライトの方向ベクトル（主に平行光源で使用）
		 * @type {S3Vector}
		 */
		this.direction = new S3Vector(0.0, 0.0, -1);

		/**
		 * ライトの色（RGB値のベクトル）
		 * @type {S3Vector}
		 */
		this.color = new S3Vector(1.0, 1.0, 1.0);
	}

	/**
	 * このライト情報のクローン（複製）を作成します。
	 * @param {typeof S3Light} [Instance] クラス指定（省略時はS3Light）
	 * @returns {S3Light} 複製されたライトインスタンス
	 */
	clone(Instance) {
		if (!Instance) {
			Instance = S3Light;
		}
		const light = new Instance();
		light.mode = this.mode;
		light.power = this.power;
		light.range = this.range;
		light.position = this.position;
		light.direction = this.direction;
		light.color = this.color;
		return light;
	}

	/**
	 * ライトの種類（モード）を設定します。
	 * @param {number} mode S3Light.MODEで定義される値
	 */
	setMode(mode) {
		this.mode = mode;
	}

	/**
	 * ライトの強さを設定します。
	 * @param {number} power 強度（通常1.0、0.0で無効）
	 */
	setPower(power) {
		this.power = power;
	}

	/**
	 * ライトの影響範囲を設定します（点光源等）。
	 * @param {number} range 範囲
	 */
	setRange(range) {
		this.range = range;
	}

	/**
	 * ライトの位置を設定します（点光源等）。
	 * @param {S3Vector} position 位置ベクトル
	 */
	setPosition(position) {
		this.position = position;
	}

	/**
	 * ライトの方向を設定します（平行光源等）。
	 * @param {S3Vector} direction 方向ベクトル
	 */
	setDirection(direction) {
		this.direction = direction;
	}

	/**
	 * ライトの色を設定します（RGB）。
	 * @param {S3Vector} color 色ベクトル
	 */
	setColor(color) {
		this.color = color;
	}
}

/**
 * ライトの種類（モード）定数
 * @enum {number}
 */
S3Light.MODE = {
	/** ライト無効 */
	NONE: 0,
	/** 環境光 */
	AMBIENT_LIGHT: 1,
	/** 平行光源 */
	DIRECTIONAL_LIGHT: 2,
	/** 点光源 */
	POINT_LIGHT: 3
};

/**
 * 3DCG用のテクスチャ（画像）情報を管理するクラス
 * 画像のセットや2の累乗化処理、ロード状況管理、破棄処理などを担当します。
 */
class S3Texture {
	/**
	 * テクスチャを作成します。
	 * @param {S3System} s3system S3Systemインスタンス（画像ID発行・ダウンロード補助用）
	 * @param {string|ImageData|HTMLImageElement|HTMLCanvasElement|HTMLVideoElement} [data] 初期化時に与える画像やURL等（省略可）
	 */
	constructor(s3system, data) {
		/**
		 * システムインスタンス
		 * @type {S3System}
		 */
		this.sys = s3system;
		this._init();
		if (data !== undefined) {
			this.setImage(data);
		}
	}

	/**
	 * テクスチャ情報を初期化します。ロードフラグや画像情報をリセットします。
	 * @protect
	 */
	_init() {
		/**
		 * テクスチャのURLやID
		 * @type {?string}
		 */
		this.url = null;

		/**
		 * テクスチャ画像本体（ImageData, HTMLImageElement, HTMLCanvasElement, HTMLVideoElementなど）
		 * @type {?ImageData|HTMLImageElement|HTMLCanvasElement|HTMLVideoElement}
		 */
		this.image = null;

		/**
		 * 画像がロード済みかどうか
		 * @type {boolean}
		 */
		this.is_loadimage = false;

		/**
		 * テクスチャが破棄されたかどうか
		 * @type {boolean}
		 */
		this.is_dispose = false;
	}

	/**
	 * テクスチャを破棄します。再利用は不可になります。
	 */
	dispose() {
		if (!this.is_dispose) {
			this.is_dispose = true;
		}
	}

	/**
	 * テクスチャ画像を設定します。
	 * - 画像が2の累乗でない場合は自動でリサイズします。
	 * - 文字列の場合はURLとして画像をダウンロードします。
	 * - 設定可能な形式: ImageData, HTMLImageElement, HTMLCanvasElement, HTMLVideoElement, URL(string)
	 * @param {string|ImageData|HTMLImageElement|HTMLCanvasElement|HTMLVideoElement} image 設定する画像データまたはURL文字列
	 */
	setImage(image) {
		if (image === null || this.is_dispose) {
			return;
		}
		if (image instanceof HTMLImageElement || image instanceof HTMLCanvasElement) {
			const original_width = image.width;
			const original_height = image.height;
			const ceil_power_of_2 = function (x) {
				// IE には Math.log2 がない
				const a = Math.log(x) / Math.log(2);
				if (a - Math.floor(a) < 1e-10) {
					return x;
				} else {
					return 1 << Math.ceil(a);
				}
			};
			const ceil_width = ceil_power_of_2(original_width);
			const ceil_height = ceil_power_of_2(original_height);
			if (original_width !== ceil_width || original_height !== ceil_height) {
				// 2の累乗ではない場合は、2の累乗のサイズに変換
				const ceil_image = document.createElement("canvas");
				ceil_image.width = ceil_width;
				ceil_image.height = ceil_height;
				ceil_image
					.getContext("2d")
					.drawImage(image, 0, 0, original_width, original_height, 0, 0, ceil_width, ceil_height);
				image = ceil_image;
			}
		}
		if (
			image instanceof ImageData ||
			image instanceof HTMLImageElement ||
			image instanceof HTMLCanvasElement ||
			image instanceof HTMLVideoElement
		) {
			if (this.url === null) {
				// 直接設定した場合はIDをURLとして設定する
				this.url = this.sys._createID();
			}
			this.image = image;
			this.is_loadimage = true;
			return;
		} else if (typeof image === "string") {
			this.url = image;
			const that = this;
			this.sys._download(this.url, function (image) {
				that.setImage(image);
			});
			return;
		} else {
			console.log("not setImage");
			console.log(image);
		}
	}
}

/**
 * 3DCG用のマテリアル（素材）情報を管理するクラス(mutable)
 * 拡散反射色、自己照明、鏡面反射、環境光、反射、テクスチャなどを一括管理します。
 */
class S3Material {
	/**
	 * マテリアルを作成します。
	 * @param {S3System} s3system S3System インスタンス（内部処理・生成補助用）
	 * @param {string} [name] マテリアル名（任意指定、未指定時は"s3default"）
	 */
	constructor(s3system, name) {
		/**
		 * システム管理用
		 * @type {S3System}
		 */
		this.sys = s3system;

		/**
		 * マテリアル名
		 * @type {string}
		 */
		this.name = "s3default";
		if (name !== undefined) {
			this.name = name;
		}

		/**
		 * 拡散反射色（ベースカラー、RGBA値）
		 * @type {S3Vector}
		 */
		this.color = new S3Vector(1.0, 1.0, 1.0, 1.0);

		/**
		 * 拡散反射の強さ（0～1）
		 * @type {number}
		 */
		this.diffuse = 0.8;

		/**
		 * 自己照明（発光色）
		 * @type {S3Vector}
		 */
		this.emission = new S3Vector(0.0, 0.0, 0.0);

		/**
		 * 鏡面反射色
		 * @type {S3Vector}
		 */
		this.specular = new S3Vector(0.0, 0.0, 0.0);

		/**
		 * 鏡面反射の強さ
		 * @type {number}
		 */
		this.power = 5.0;

		/**
		 * 環境光（光源に依存しない基本色）
		 * @type {S3Vector}
		 */
		this.ambient = new S3Vector(0.6, 0.6, 0.6);

		/**
		 * 環境マッピングの反射率
		 * @type {number}
		 */
		this.reflect = 0.0;

		/**
		 * 色用テクスチャ（拡散色テクスチャ）
		 * @type {S3Texture}
		 */
		this.textureColor = this.sys.createTexture();

		/**
		 * 法線マップ用テクスチャ
		 * @type {S3Texture}
		 */
		this.textureNormal = this.sys.createTexture();
	}

	/**
	 * マテリアルを解放します（現状は未実装）。
	 */
	dispose() {}

	/**
	 * マテリアル名を設定します。
	 * @param {string} name 新しい名前
	 */
	setName(name) {
		this.name = name;
	}

	/**
	 * 拡散反射色を設定します。
	 * @param {S3Vector|Array<number>|number} color S3Vector, 配列, または単一値
	 */
	setColor(color) {
		this.color = this.sys._toVector3(color);
	}

	/**
	 * 拡散反射の強さを設定します。
	 * @param {number} diffuse 拡散反射係数（0～1）
	 */
	setDiffuse(diffuse) {
		this.diffuse = this.sys._toValue(diffuse);
	}

	/**
	 * 自己照明（発光色）を設定します。
	 * @param {S3Vector|Array<number>|number} emission S3Vector, 配列, または単一値
	 */
	setEmission(emission) {
		this.emission = this.sys._toVector3(emission);
	}

	/**
	 * 鏡面反射色を設定します。
	 * @param {S3Vector|Array<number>|number} specular S3Vector, 配列, または単一値
	 */
	setSpecular(specular) {
		this.specular = this.sys._toVector3(specular);
	}

	/**
	 * 鏡面反射の強さを設定します。
	 * @param {number} power 鏡面反射係数
	 */
	setPower(power) {
		this.power = this.sys._toValue(power);
	}

	/**
	 * 環境光（アンビエント色）を設定します。
	 * @param {S3Vector|Array<number>|number} ambient S3Vector, 配列, または単一値
	 */
	setAmbient(ambient) {
		this.ambient = this.sys._toVector3(ambient);
	}

	/**
	 * 環境マッピングの反射率を設定します。
	 * @param {number} reflect 反射率（0～1）
	 */
	setReflect(reflect) {
		this.reflect = this.sys._toValue(reflect);
	}

	/**
	 * 拡散色用テクスチャ画像を設定します。
	 * @param {*} data 画像またはURL等（S3Texture.setImage に渡される形式）
	 */
	setTextureColor(data) {
		if (this.textureColor !== null) {
			this.textureColor.dispose();
		}
		this.textureColor = this.sys.createTexture();
		this.textureColor.setImage(data);
	}

	/**
	 * 法線マップ用テクスチャ画像を設定します。
	 * @param {*} data 画像またはURL等（S3Texture.setImageに渡される形式）
	 */
	setTextureNormal(data) {
		if (this.textureNormal !== null) {
			this.textureNormal.dispose();
		}
		this.textureNormal = this.sys.createTexture();
		this.textureNormal.setImage(data);
	}
}

/**
 * 3DCG用の頂点クラス（immutable）
 * 各頂点の空間上の座標情報を管理するシンプルなクラスです。
 */
class S3Vertex {
	/**
	 * 頂点を作成します。（immutable）
	 * @param {S3Vector} position 頂点の座標ベクトル
	 */
	constructor(position) {
		this.position = position;
	}

	/**
	 * 頂点インスタンスのクローン（複製）を作成します。
	 * @param {typeof S3Vertex} [Instance] 複製する際のクラス指定（省略時はS3Vertex）
	 * @returns {S3Vertex} 複製されたS3Vertexインスタンス
	 */
	clone(Instance) {
		if (!Instance) {
			Instance = S3Vertex;
		}
		return new Instance(this.position);
	}
}

/**
 * 三角形ポリゴンのインデックス情報を保持するクラス（immutable）
 * 各ポリゴン面を構成する頂点インデックスやUV座標、マテリアルインデックスを管理します。
 */
class S3TriangleIndex {
	/**
	 * ABCの頂点を囲む三角形ポリゴンを作成します。
	 * @param {number} i1 配列内の頂点Aのインデックス
	 * @param {number} i2 配列内の頂点Bのインデックス
	 * @param {number} i3 配列内の頂点Cのインデックス
	 * @param {Array<number>} indexlist 頂点インデックス配列
	 * @param {number} [materialIndex] 使用するマテリアルのインデックス（省略時や負値の場合は0）
	 * @param {Array<S3Vector>} [uvlist] UV座標配列（S3Vector配列、なくても可）
	 */
	constructor(i1, i2, i3, indexlist, materialIndex, uvlist) {
		this._init(i1, i2, i3, indexlist, materialIndex, uvlist);
	}

	/**
	 * 三角形ポリゴン情報を初期化します。
	 * @private
	 * @param {number} i1 頂点Aのインデックス
	 * @param {number} i2 頂点Bのインデックス
	 * @param {number} i3 頂点Cのインデックス
	 * @param {Array<number>} indexlist 頂点インデックス配列
	 * @param {number} [materialIndex] マテリアルインデックス
	 * @param {Array<S3Vector>} [uvlist] UV座標配列
	 */
	_init(i1, i2, i3, indexlist, materialIndex, uvlist) {
		/**
		 * 頂点インデックス配列（各頂点のインデックスを3つ持つ）
		 * @type {Array<number>}
		 */
		this.index = null;

		/**
		 * 各頂点のUV座標配列（3つのS3Vector、またはnull）
		 * @type {Array<S3Vector|null>}
		 */
		this.uv = null;
		/**
		 * 面のマテリアルインデックス（0以上の整数）
		 * @type {number}
		 */
		this.materialIndex = null;

		if (indexlist instanceof Array && indexlist.length > 0) {
			this.index = [indexlist[i1], indexlist[i2], indexlist[i3]];
		} else {
			throw "IllegalArgumentException";
		}
		if (uvlist !== undefined && uvlist instanceof Array && uvlist.length > 0 && uvlist[0] instanceof S3Vector) {
			this.uv = [uvlist[i1], uvlist[i2], uvlist[i3]];
		} else {
			this.uv = [null, null, null];
		}
		materialIndex = materialIndex ? materialIndex : 0;
		materialIndex = materialIndex >= 0 ? materialIndex : 0;
		this.materialIndex = materialIndex;
	}

	/**
	 * この三角形インデックスのクローンを作成します。
	 * @param {typeof S3TriangleIndex} [Instance] クローン時のクラス指定（省略時はS3TriangleIndex）
	 * @returns {S3TriangleIndex} 複製されたインスタンス
	 */
	clone(Instance) {
		if (!Instance) {
			Instance = S3TriangleIndex;
		}
		return new Instance(0, 1, 2, this.index, this.materialIndex, this.uv);
	}

	/**
	 * 頂点A/B/Cの順序を逆転させた三角形インデックスを返します。
	 * 通常カリングモードに応じて表裏を反転させたい場合に利用します。
	 * @param {typeof S3TriangleIndex} [Instance] 反転時のクラス指定（省略時はS3TriangleIndex）
	 * @returns {S3TriangleIndex} 反転された三角形インデックス
	 */
	inverseTriangle(Instance) {
		if (!Instance) {
			Instance = S3TriangleIndex;
		}
		return new Instance(2, 1, 0, this.index, this.materialIndex, this.uv);
	}
}

/**
 * 3DCG用メッシュ（立体形状データ）を管理するクラス (mutable)
 * 頂点・面・マテリアルを保持し、複数の形状や属性を一つにまとめます。
 */
class S3Mesh {
	/**
	 * メッシュを作成します。
	 * @param {S3System} s3system S3Systemインスタンス
	 */
	constructor(s3system) {
		this.sys = s3system;
		this._init();
	}

	/**
	 * メッシュの内部状態を初期化します。
	 */
	_init() {
		/**
		 * メッシュの構成要素
		 * @type {{vertex: Array<S3Vertex>, triangleindex: Array<S3TriangleIndex>, material: Array<S3Material>}}
		 */
		this.src = {
			vertex: [],
			triangleindex: [],
			material: []
		};

		/**
		 * メッシュが確定済みかどうか
		 * @type {boolean}
		 */
		this.is_complete = false;
	}

	/**
	 * メッシュが確定済みかどうかを返します。
	 * @returns {boolean} 確定済みならtrue
	 */
	isComplete() {
		return this.is_complete;
	}

	/**
	 * このメッシュのクローン（複製）を作成します。
	 * @param {typeof S3Mesh} [Instance] 複製時のクラス指定（省略時はS3Mesh）
	 * @returns {S3Mesh} 複製されたS3Meshインスタンス
	 */
	clone(Instance) {
		if (!Instance) {
			Instance = S3Mesh;
		}
		const mesh = new Instance(this.sys);
		mesh.addVertex(this.getVertexArray());
		mesh.addTriangleIndex(this.getTriangleIndexArray());
		mesh.addMaterial(this.getMaterialArray());
		return mesh;
	}

	/**
	 * メッシュの確定状態を設定します。
	 * @param {boolean} is_complete 確定済みかどうか
	 */
	setComplete(is_complete) {
		this.is_complete = is_complete;
	}

	/**
	 * 三角形インデックスの順序を反転するモードを設定します。
	 * 反転時はaddTriangleIndexで自動的に面を裏返します。
	 * @param {boolean} inverse 反転するならtrue
	 */
	setInverseTriangle(inverse) {
		this.setComplete(false);
		this.is_inverse = inverse;
	}

	/**
	 * メッシュが保持する頂点配列を取得します。
	 * @returns {Array<S3Vertex>} 頂点配列
	 */
	getVertexArray() {
		return this.src.vertex;
	}

	/**
	 * メッシュが保持する三角形インデックス配列を取得します。
	 * @returns {Array<S3TriangleIndex>} 三角形インデックス配列
	 */
	getTriangleIndexArray() {
		return this.src.triangleindex;
	}

	/**
	 * メッシュが保持するマテリアル配列を取得します。
	 * @returns {Array<S3Material>} マテリアル配列
	 */
	getMaterialArray() {
		return this.src.material;
	}

	/**
	 * 頂点（S3Vertexまたはその配列）をメッシュに追加します。
	 * @param {S3Vertex|Array<S3Vertex>} vertex 追加する頂点またはその配列
	 */
	addVertex(vertex) {
		// immutableなのでシャローコピー
		this.setComplete(false);
		const meshvertex = this.getVertexArray();
		if (vertex === undefined) ; else if (vertex instanceof S3Vertex) {
			meshvertex[meshvertex.length] = vertex;
		} else {
			for (let i = 0; i < vertex.length; i++) {
				meshvertex[meshvertex.length] = vertex[i];
			}
		}
	}

	/**
	 * 三角形インデックス（S3TriangleIndexまたはその配列）をメッシュに追加します。
	 * 反転モード時は面を裏返して追加します。
	 * @param {S3TriangleIndex|Array<S3TriangleIndex>} ti 追加する三角形インデックスまたはその配列
	 */
	addTriangleIndex(ti) {
		// immutableなのでシャローコピー
		this.setComplete(false);
		const meshtri = this.getTriangleIndexArray();
		if (ti === undefined) ; else if (ti instanceof S3TriangleIndex) {
			meshtri[meshtri.length] = this.is_inverse ? ti.inverseTriangle() : ti;
		} else {
			for (let i = 0; i < ti.length; i++) {
				meshtri[meshtri.length] = this.is_inverse ? ti[i].inverseTriangle() : ti[i];
			}
		}
	}

	/**
	 * マテリアル（S3Materialまたはその配列）をメッシュに追加します。
	 * @param {S3Material|Array<S3Material>} material 追加するマテリアルまたはその配列
	 */
	addMaterial(material) {
		// immutableなのでシャローコピー
		this.setComplete(false);
		const meshmat = this.getMaterialArray();
		if (material === undefined) ; else if (material instanceof S3Material) {
			meshmat[meshmat.length] = material;
		} else {
			for (let i = 0; i < material.length; i++) {
				meshmat[meshmat.length] = material[i];
			}
		}
	}
}

/**
 * 3DCG用のオイラー角クラス（immutable）
 * Roll（Z軸）、Pitch（X軸）、Yaw（Y軸）の順で角度を保持します。
 * 各値は常に周期的（-180～180度）に管理されます。
 */
class S3Angles {
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

/**
 * 3DCGシーンに配置する「モデル」を管理するクラス (mutable)
 * 位置・回転・スケール・メッシュ（形状）などモデルの変換・配置情報を保持します。
 */
class S3Model {
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

/**
 * 3DCGシーン（描画シーン）の管理クラス
 * モデル・ライト・カメラなどシーン構成要素を一括管理します。
 */
class S3Scene {
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

/**
 * /////////////////////////////////////////////////////////
 * 描写に使用するシーンを構成するクラス群
 * 3DCGを作成するための行列を準備したり、シーンの描写をしたりする
 *
 * 3DCGを作るうえで必要最小限の機能を提供する
 * ・それらを構成する頂点、材質、面（全てimmutable）
 * ・モデル (mutable)
 * ・カメラ (mutable)
 * ・シーン (mutable)
 * ・描写用の行列作成
 * ・描写のための必要最低限の計算
 *
 * ポリゴン情報を構成部品
 * S3Vertex			頂点
 * S3Material		素材
 * S3TriangleIndex	インデックス
 * S3Mesh			頂点とインデックス情報と素材からなるメッシュ
 *
 * ポリゴンの描写用構成部品
 * S3Model			どの座標にどのように表示するかモデル
 * S3Camera			映像をどのように映すか
 * S3Scene			モデルとカメラを使用してシーン
 * S3Texture		テクスチャ
 * /////////////////////////////////////////////////////////
 */

/**
 * 3DCGシステム全体を管理するクラス
 *
 * 3DCGのための座標変換やシーン管理、基本的な生成処理・ユーティリティ関数などをまとめて提供します。
 * 頂点やメッシュ、マテリアルなど各種オブジェクトのファクトリ機能も持ちます。
 *
 */
class S3System {
	/**
	 * S3Systemインスタンスを作成します。
	 * 描画モードや背景色などを初期化します。
	 */
	constructor() {
		this._init();
	}

	/**
	 * 内部状態を初期化します（描画モードや背景色のリセット）。
	 * @private
	 */
	_init() {
		this.setSystemMode(S3System.SYSTEM_MODE.OPEN_GL);
		this.setBackgroundColor(new S3Vector(1.0, 1.0, 1.0, 1.0));
	}

	/**
	 * ユニークなID文字列を発行します（テクスチャなどの管理用途）。
	 * @returns {string} 新しいID文字列
	 */
	_createID() {
		if (typeof this._CREATE_ID1 === "undefined") {
			this._CREATE_ID1 = 0;
			this._CREATE_ID2 = 0;
			this._CREATE_ID3 = 0;
			this._CREATE_ID4 = 0;
		}
		const id =
			"" +
			this._CREATE_ID4.toString(16) +
			":" +
			this._CREATE_ID3.toString(16) +
			":" +
			this._CREATE_ID2.toString(16) +
			":" +
			this._CREATE_ID1.toString(16);
		this._CREATE_ID1++;
		if (this._CREATE_ID1 === 0x100000000) {
			this._CREATE_ID1 = 0;
			this._CREATE_ID2++;
			if (this._CREATE_ID2 === 0x100000000) {
				this._CREATE_ID2 = 0;
				this._CREATE_ID3++;
				if (this._CREATE_ID3 === 0x100000000) {
					this._CREATE_ID3 = 0;
					this._CREATE_ID4++;
					if (this._CREATE_ID4 === 0x100000000) {
						this._CREATE_ID4 = 0;
						throw "createID";
					}
				}
			}
		}
		return id;
	}

	/**
	 * 画像やテキストファイルをダウンロードします。
	 * 画像拡張子ならImage要素、それ以外はテキストとして取得しコールバックします。
	 * @param {string} url 取得先URL
	 * @param {function} callback 取得完了時に呼ばれるコールバック関数
	 */
	_download(url, callback) {
		const dotlist = url.split(".");
		let isImage = false;
		const ext = "";
		if (dotlist.length > 1) {
			const ext = dotlist[dotlist.length - 1].toLocaleString();
			isImage =
				ext === "gif" || ext === "jpg" || ext === "png" || ext === "bmp" || ext === "svg" || ext === "jpeg";
		}
		if (isImage) {
			const image = new Image();
			image.onload = function () {
				callback(image, ext);
			};
			image.src = url;
			return;
		}
		const http = new XMLHttpRequest();
		/**
		 * @returns {void}
		 */
		const handleHttpResponse = function () {
			if (http.readyState === 4) {
				// DONE
				if (http.status !== 200) {
					console.log("error download [" + url + "]");
					return null;
				}
				callback(http.responseText, ext);
			}
		};
		http.onreadystatechange = handleHttpResponse;
		http.open("GET", url, true);
		http.send(null);
	}

	/**
	 * 任意の値をS3Vectorに変換します。
	 * @param {S3Vector|Array<number>|number} x 変換対象
	 * @returns {S3Vector} ベクトル化した値
	 */
	_toVector3(x) {
		if (x instanceof S3Vector) {
			return x;
		} else if (typeof x === "number") {
			return new S3Vector(x, x, x);
		} else if (x instanceof Array) {
			return new S3Vector(x[0], x[1], x[2]);
		} else {
			throw "IllegalArgumentException";
		}
	}

	/**
	 * 任意の値を数値に変換します。
	 * @param {*} x 変換対象
	 * @returns {number} 数値
	 */
	_toValue(x) {
		if (!isNaN(x)) {
			return x;
		} else {
			throw "IllegalArgumentException";
		}
	}

	/**
	 * 背景色を設定します。
	 * @param {S3Vector} color RGBAで指定する背景色
	 */
	setBackgroundColor(color) {
		this.backgroundColor = color;
	}

	/**
	 * 背景色を取得します。
	 * @returns {S3Vector} 現在の背景色（RGBA）
	 */
	getBackgroundColor() {
		return this.backgroundColor;
	}

	/**
	 * システムモードを設定します（OpenGL/DIRECT_Xなど）。
	 * 各種描画パラメータも合わせて設定されます。
	 * @param {number} mode S3System.SYSTEM_MODE で定義される値
	 */
	setSystemMode(mode) {
		this.systemmode = mode;
		if (this.systemmode === S3System.SYSTEM_MODE.OPEN_GL) {
			this.depthmode = S3System.DEPTH_MODE.OPEN_GL;
			this.dimensionmode = S3System.DIMENSION_MODE.RIGHT_HAND;
			this.vectormode = S3System.VECTOR_MODE.VECTOR4x1;
			this.frontface = S3System.FRONT_FACE.COUNTER_CLOCKWISE;
			this.cullmode = S3System.CULL_MODE.BACK;
		} else {
			this.depthmode = S3System.DEPTH_MODE.DIRECT_X;
			this.dimensionmode = S3System.DIMENSION_MODE.LEFT_HAND;
			this.vectormode = S3System.VECTOR_MODE.VECTOR1x4;
			this.frontface = S3System.FRONT_FACE.CLOCKWISE;
			this.cullmode = S3System.CULL_MODE.BACK;
		}
	}

	/**
	 * 深度（Z値の扱い）のモードを設定します。
	 * @param {number} depthmode S3System.DEPTH_MODE
	 */
	setDepthMode(depthmode) {
		this.depthmode = depthmode;
	}

	/**
	 * 座標系（右手/左手系）を設定します。
	 * @param {number} dimensionmode S3System.DIMENSION_MODE
	 */
	setDimensionMode(dimensionmode) {
		this.dimensionmode = dimensionmode;
	}

	/**
	 * ベクトル表現のモードを設定します（縦型/横型）。
	 * @param {number} vectormode S3System.VECTOR_MODE
	 */
	setVectorMode(vectormode) {
		this.vectormode = vectormode;
	}

	/**
	 * 前面と判定する面の頂点順序（時計回り/反時計回り）を設定します。
	 * @param {number} frontface S3System.FRONT_FACE
	 */
	setFrontMode(frontface) {
		this.frontface = frontface;
	}

	/**
	 * カリング（非表示面除去）の方法を設定します。
	 * @param {number} cullmode S3System.CULL_MODE
	 */
	setCullMode(cullmode) {
		this.cullmode = cullmode;
	}

	/**
	 * 描画に使うCanvasを関連付け、2D描画用Contextを内部にセットします。
	 * @param {HTMLCanvasElement} canvas 使用するcanvas要素
	 */
	setCanvas(canvas) {
		const that = this;
		const ctx = canvas.getContext("2d");
		this.canvas = canvas;

		/**
		 * 2D描画ユーティリティ
		 * @property {CanvasRenderingContext2D} context 2D描画コンテキスト
		 * @property {function(S3Vector, S3Vector):void} drawLine 2点間の直線を描画
		 * @property {function(S3Vector, S3Vector, S3Vector):void} drawLinePolygon 3点から三角形（線のみ）を描画
		 * @property {function(number):void} setLineWidth 線の太さを設定
		 * @property {function(string):void} setLineColor 線の色を設定
		 * @property {function():void} clear キャンバス全体を背景色で塗りつぶし
		 */
		this.context2d = {
			context: ctx,

			/**
			 * 2点間の直線を描画します。
			 * @param {S3Vector} v0 始点
			 * @param {S3Vector} v1 終点
			 */
			drawLine: function (v0, v1) {
				ctx.beginPath();
				ctx.moveTo(v0.x, v0.y);
				ctx.lineTo(v1.x, v1.y);
				ctx.stroke();
			},

			/**
			 * 3点で囲む三角形の外枠（線のみ）を描画します。
			 * @param {S3Vector} v0
			 * @param {S3Vector} v1
			 * @param {S3Vector} v2
			 */
			drawLinePolygon: function (v0, v1, v2) {
				ctx.beginPath();
				ctx.moveTo(v0.x, v0.y);
				ctx.lineTo(v1.x, v1.y);
				ctx.lineTo(v2.x, v2.y);
				ctx.closePath();
				ctx.stroke();
			},

			/**
			 * 線の太さを設定します（ピクセル単位）。
			 * @param {number} width 線幅
			 */
			setLineWidth: function (width) {
				ctx.lineWidth = width;
			},

			/**
			 * 線の色を設定します（CSSカラー形式）。
			 * @param {string} color 線の色（例: "rgb(255,0,0)"）
			 */
			setLineColor: function (color) {
				ctx.strokeStyle = color;
			},

			/**
			 * キャンバス全体を背景色でクリアします。
			 */
			clear: function () {
				const color = that.getBackgroundColor();
				ctx.clearRect(0, 0, that.canvas.width, that.canvas.height);
				ctx.fillStyle =
					"rgba(" + color.x * 255 + "," + color.y * 255 + "," + color.z * 255 + "," + color.w + ")";
				ctx.fillRect(0, 0, that.canvas.width, that.canvas.height);
			}
		};
	}

	/**
	 * 三角形がカリング対象かどうか判定します。
	 * @param {S3Vector} p1 頂点1
	 * @param {S3Vector} p2 頂点2
	 * @param {S3Vector} p3 頂点3
	 * @returns {boolean} trueの場合は描画しない
	 */
	testCull(p1, p2, p3) {
		if (this.cullmode === S3System.CULL_MODE.NONE) {
			return false;
		}
		if (this.cullmode === S3System.CULL_MODE.FRONT_AND_BACK) {
			return true;
		}
		const isclock = S3Vector.isClockwise(p1, p2, p3);
		if (isclock === null) {
			return true;
		} else if (!isclock) {
			if (this.frontface === S3System.FRONT_FACE.CLOCKWISE) {
				return this.cullmode !== S3System.CULL_MODE.BACK;
			} else {
				return this.cullmode !== S3System.CULL_MODE.FRONT;
			}
		} else {
			if (this.frontface === S3System.FRONT_FACE.CLOCKWISE) {
				return this.cullmode === S3System.CULL_MODE.BACK;
			} else {
				return this.cullmode === S3System.CULL_MODE.FRONT;
			}
		}
	}

	/**
	 * ビューポート行列を生成します。
	 * @param {number} x 左上X
	 * @param {number} y 左上Y
	 * @param {number} Width 幅
	 * @param {number} Height 高さ
	 * @param {number} [MinZ=0.0] 最小深度
	 * @param {number} [MaxZ=1.0] 最大深度
	 * @returns {S3Matrix} ビューポート変換行列
	 */
	getMatrixViewport(x, y, Width, Height, MinZ, MaxZ) {
		if (MinZ === undefined) {
			MinZ = 0.0;
		}
		if (MaxZ === undefined) {
			MaxZ = 1.0;
		}
		// M.m11 は、DirectXだとマイナス、OpenGLだとプラスである
		// 今回は、下がプラスであるcanvasに表示させることを考えて、マイナスにしてある。
		const M = new S3Matrix();
		M.m00 = Width / 2;
		M.m01 = 0.0;
		M.m02 = 0.0;
		M.m03 = 0.0;
		M.m10 = 0.0;
		M.m11 = -Height / 2;
		M.m12 = 0.0;
		M.m13 = 0.0;
		M.m20 = 0.0;
		M.m21 = 0.0;
		M.m22 = 1.0;
		M.m23 = 1.0;
		M.m30 = x + Width / 2;
		M.m31 = y + Height / 2;
		M.m32 = 0.0;
		M.m33 = 1.0;

		if (this.depthmode === S3System.DEPTH_MODE.DIRECT_X) {
			M.m22 = MinZ - MaxZ;
			M.m32 = MinZ;
		} else if (this.depthmode === S3System.DEPTH_MODE.OPEN_GL) {
			M.m22 = (MinZ - MaxZ) / 2;
			M.m32 = (MinZ + MaxZ) / 2;
		}
		return this.vectormode === S3System.VECTOR_MODE.VECTOR4x1 ? M.transposed() : M;
	}

	/**
	 * 視体積の上下方向の視野角を求めます。
	 * @param {number} zoomY
	 * @returns {number}
	 */
	static calcFovY(zoomY) {
		return 2.0 * Math.atan(1.0 / zoomY);
	}

	/**
	 * アスペクト比を計算します。
	 * @static
	 * @param {number} width 幅
	 * @param {number} height 高さ
	 * @returns {number} アスペクト比
	 */
	static calcAspect(width, height) {
		return width / height;
	}

	/**
	 * 視野角（FOVY）から射影行列を生成します。
	 * @param {number} fovY 視体積の上下方向の視野角（0度から180度）
	 * @param {number} Aspect 近平面、遠平面のアスペクト比（Width / Height）
	 * @param {number} Near カメラから近平面までの距離（ニアークリッピング平面）
	 * @param {number} Far カメラから遠平面までの距離（ファークリッピング平面）
	 * @returns {S3Matrix} 射影変換行列
	 */
	getMatrixPerspectiveFov(fovY, Aspect, Near, Far) {
		const arc = S3Math.radius(fovY);
		const zoomY = 1.0 / Math.tan(arc / 2.0);
		const zoomX = zoomY / Aspect;
		const M = new S3Matrix();
		M.m00 = zoomX;
		M.m01 = 0.0;
		M.m02 = 0.0;
		M.m03 = 0.0;
		M.m10 = 0.0;
		M.m11 = zoomY;
		M.m12 = 0.0;
		M.m13 = 0.0;
		M.m20 = 0.0;
		M.m21 = 0.0;
		M.m22 = 1.0;
		M.m23 = 1.0;
		M.m30 = 0.0;
		M.m31 = 0.0;
		M.m32 = 0.0;
		M.m33 = 0.0;
		const Delta = Far - Near;
		if (Near > Far) {
			throw "Near > Far error";
		} else if (Delta === 0.0) {
			throw "divide error";
		}
		if (this.depthmode === S3System.DEPTH_MODE.DIRECT_X) {
			M.m22 = Far / Delta;
			M.m32 = (-Far * Near) / Delta;
		} else if (this.depthmode === S3System.DEPTH_MODE.OPEN_GL) {
			M.m22 = (Far + Near) / Delta;
			M.m32 = (-2 * Far * Near) / Delta;
		}
		if (this.dimensionmode === S3System.DIMENSION_MODE.RIGHT_HAND) {
			M.m22 = -M.m22;
			M.m23 = -M.m23;
		}
		return this.vectormode === S3System.VECTOR_MODE.VECTOR4x1 ? M.transposed() : M;
	}

	/**
	 * カメラのビュー行列を生成します。
	 * @param {S3Vector} eye カメラの座標の位置ベクトル
	 * @param {S3Vector} at カメラの注視点の位置ベクトル
	 * @param {S3Vector} [up] カメラの上への方向ベクトル
	 * @returns {S3Matrix} ビュー行列
	 */
	getMatrixLookAt(eye, at, up) {
		if (up === undefined) {
			up = new S3Vector(0.0, 1.0, 0.0);
		}
		// Z ベクトルの作成
		let Z = eye.getDirectionNormalized(at);
		if (this.dimensionmode === S3System.DIMENSION_MODE.RIGHT_HAND) {
			// 右手系なら反転
			Z = Z.negate();
		}
		// X, Y ベクトルの作成
		const X = up.cross(Z).normalize();
		const Y = Z.cross(X);
		const M = new S3Matrix();
		M.m00 = X.x;
		M.m01 = Y.x;
		M.m02 = Z.x;
		M.m03 = 0.0;
		M.m10 = X.y;
		M.m11 = Y.y;
		M.m12 = Z.y;
		M.m13 = 0.0;
		M.m20 = X.z;
		M.m21 = Y.z;
		M.m22 = Z.z;
		M.m23 = 0.0;
		M.m30 = -X.dot(eye);
		M.m31 = -Y.dot(eye);
		M.m32 = -Z.dot(eye);
		M.m33 = 1.0;
		return this.vectormode === S3System.VECTOR_MODE.VECTOR4x1 ? M.transposed() : M;
	}

	/**
	 * 単位行列を生成します。
	 * @returns {S3Matrix} 単位行列
	 */
	getMatrixIdentity() {
		const M = new S3Matrix();
		M.m00 = 1.0;
		M.m01 = 0.0;
		M.m02 = 0.0;
		M.m03 = 0.0;
		M.m10 = 0.0;
		M.m11 = 1.0;
		M.m12 = 0.0;
		M.m13 = 0.0;
		M.m20 = 0.0;
		M.m21 = 0.0;
		M.m22 = 1.0;
		M.m23 = 0.0;
		M.m30 = 0.0;
		M.m31 = 0.0;
		M.m32 = 0.0;
		M.m33 = 1.0;
		return M;
	}

	/**
	 * 平行移動行列を生成します。
	 * @param {number} x X移動量
	 * @param {number} y Y移動量
	 * @param {number} z Z移動量
	 * @returns {S3Matrix} 平行移動行列
	 */
	getMatrixTranslate(x, y, z) {
		const M = new S3Matrix();
		M.m00 = 1.0;
		M.m01 = 0.0;
		M.m02 = 0.0;
		M.m03 = 0.0;
		M.m10 = 0.0;
		M.m11 = 1.0;
		M.m12 = 0.0;
		M.m13 = 0.0;
		M.m20 = 0.0;
		M.m21 = 0.0;
		M.m22 = 1.0;
		M.m23 = 0.0;
		M.m30 = x;
		M.m31 = y;
		M.m32 = z;
		M.m33 = 1.0;
		return this.vectormode === S3System.VECTOR_MODE.VECTOR4x1 ? M.transposed() : M;
	}

	/**
	 * 拡大縮小行列を生成します。
	 * @param {number} x X方向スケール
	 * @param {number} y Y方向スケール
	 * @param {number} z Z方向スケール
	 * @returns {S3Matrix} スケーリング行列
	 */
	getMatrixScale(x, y, z) {
		const M = new S3Matrix();
		M.m00 = x;
		M.m01 = 0.0;
		M.m02 = 0.0;
		M.m03 = 0.0;
		M.m10 = 0.0;
		M.m11 = y;
		M.m12 = 0.0;
		M.m13 = 0.0;
		M.m20 = 0.0;
		M.m21 = 0.0;
		M.m22 = z;
		M.m23 = 0.0;
		M.m30 = 0.0;
		M.m31 = 0.0;
		M.m32 = 0.0;
		M.m33 = 1.0;
		return this.vectormode === S3System.VECTOR_MODE.VECTOR4x1 ? M.transposed() : M;
	}

	/**
	 * X軸周りの回転行列を生成します。
	 * @param {number} degree 角度（度）
	 * @returns {S3Matrix} 回転行列
	 */
	getMatrixRotateX(degree) {
		const arc = S3Math.radius(degree);
		const cos = Math.cos(arc);
		const sin = Math.sin(arc);
		const M = new S3Matrix();
		M.m00 = 1.0;
		M.m01 = 0.0;
		M.m02 = 0.0;
		M.m03 = 0.0;
		M.m10 = 0.0;
		M.m11 = cos;
		M.m12 = sin;
		M.m13 = 0.0;
		M.m20 = 0.0;
		M.m21 = -sin;
		M.m22 = cos;
		M.m23 = 0.0;
		M.m30 = 0.0;
		M.m31 = 0.0;
		M.m32 = 0.0;
		M.m33 = 1.0;
		return this.vectormode === S3System.VECTOR_MODE.VECTOR4x1 ? M.transposed() : M;
	}

	/**
	 * Y軸周りの回転行列を生成します。
	 * @param {number} degree 角度（度）
	 * @returns {S3Matrix} 回転行列
	 */
	getMatrixRotateY(degree) {
		const arc = S3Math.radius(degree);
		const cos = Math.cos(arc);
		const sin = Math.sin(arc);
		const M = new S3Matrix();
		M.m00 = cos;
		M.m01 = 0.0;
		M.m02 = -sin;
		M.m03 = 0.0;
		M.m10 = 0.0;
		M.m11 = 1.0;
		M.m12 = 0.0;
		M.m13 = 0.0;
		M.m20 = sin;
		M.m21 = 0.0;
		M.m22 = cos;
		M.m23 = 0.0;
		M.m30 = 0.0;
		M.m31 = 0.0;
		M.m32 = 0.0;
		M.m33 = 1.0;
		return this.vectormode === S3System.VECTOR_MODE.VECTOR4x1 ? M.transposed() : M;
	}

	/**
	 * Z軸周りの回転行列を生成します。
	 * @param {number} degree 角度（度）
	 * @returns {S3Matrix} 回転行列
	 */
	getMatrixRotateZ(degree) {
		const arc = S3Math.radius(degree);
		const cos = Math.cos(arc);
		const sin = Math.sin(arc);
		const M = new S3Matrix();
		M.m00 = cos;
		M.m01 = sin;
		M.m02 = 0.0;
		M.m03 = 0.0;
		M.m10 = -sin;
		M.m11 = cos;
		M.m12 = 0.0;
		M.m13 = 0.0;
		M.m20 = 0.0;
		M.m21 = 0.0;
		M.m22 = 1.0;
		M.m23 = 0.0;
		M.m30 = 0.0;
		M.m31 = 0.0;
		M.m32 = 0.0;
		M.m33 = 1.0;
		return this.vectormode === S3System.VECTOR_MODE.VECTOR4x1 ? M.transposed() : M;
	}

	/**
	 * 縦型/横型を踏まえて2つの行列を掛けます。
	 * @param {S3Matrix} A
	 * @param {S3Matrix} B
	 * @returns {S3Matrix} 計算結果
	 */
	mulMatrix(A, B) {
		// 横型の場合は、v[AB]=u
		// 縦型の場合は、[BA]v=u
		return this.vectormode === S3System.VECTOR_MODE.VECTOR4x1 ? B.mulMatrix(A) : A.mulMatrix(B);
	}

	/**
	 * 縦型/横型を踏まえて行列とベクトルを掛けます。
	 * @param {S3Matrix} A
	 * @param {S3Vector} B
	 * @returns {S3Vector} 計算結果
	 */
	mulVector(A, B) {
		// 横型の場合は、[vA]=u
		// 縦型の場合は、[Av]=u
		return this.vectormode === S3System.VECTOR_MODE.VECTOR4x1 ? A.mulVector(B) : B.mul(A);
	}

	/**
	 * 航空機の姿勢制御 ZXY（ロール・ピッチ・ヨー）の順で回転行列を作成します。
	 * @param {number} z ロール角（Z）
	 * @param {number} x ピッチ角（X）
	 * @param {number} y ヨー角（Y）
	 * @returns {S3Matrix} 合成回転行列
	 */
	getMatrixRotateZXY(z, x, y) {
		const Z = this.getMatrixRotateZ(z);
		const X = this.getMatrixRotateX(x);
		const Y = this.getMatrixRotateY(y);
		return this.mulMatrix(this.mulMatrix(Z, X), Y);
	}

	/**
	 * 指定モデルのワールド変換行列を生成します（スケール→回転→移動の順）。
	 * @param {S3Model} model 対象モデル
	 * @returns {S3Matrix} ワールド変換行列
	 */
	getMatrixWorldTransform(model) {
		// 回転行列
		const R = this.getMatrixRotateZXY(model.angles.roll, model.angles.pitch, model.angles.yaw);
		// スケーリング
		const S = this.getMatrixScale(model.scale.x, model.scale.y, model.scale.z);
		// 移動行列
		const T = this.getMatrixTranslate(model.position.x, model.position.y, model.position.z);
		// ワールド変換行列を作成する
		const W = this.mulMatrix(this.mulMatrix(S, R), T);
		return W;
	}

	/**
	 * 2Dキャンバスの内容をクリアします。
	 */
	clear() {
		this.context2d.clear();
	}

	/**
	 * 頂点リストをMVP変換・射影して新しい頂点配列を返します。
	 * @param {Array<S3Vertex>} vertexlist 変換対象の頂点配列
	 * @param {S3Matrix} MVP モデル・ビュー・射影行列
	 * @param {S3Matrix} Viewport ビューポート変換行列
	 * @returns {Array<S3Vertex>} 変換後の頂点配列
	 */
	_calcVertexTransformation(vertexlist, MVP, Viewport) {
		const newvertexlist = [];

		for (let i = 0; i < vertexlist.length; i++) {
			let p = vertexlist[i].position;

			//	console.log("1 " + p);
			//	console.log("2 " + this.mulMatrix(VPS.LookAt, p));
			//	console.log("3 " + this.mulMatrix(VPS.PerspectiveFov, this.mulMatrix(VPS.LookAt, p)));
			//	console.log("4 " + this.mulMatrix(MVP, p));

			p = this.mulVector(MVP, p);
			const rhw = p.w;
			p = p.mul(1.0 / rhw);
			p = this.mulVector(Viewport, p);
			newvertexlist[i] = new S3Vertex(p);
		}
		return newvertexlist;
	}

	/**
	 * X, Y, Zの座標軸を描画します（デバッグ用）。
	 * @param {S3Scene} scene 対象シーン
	 */
	drawAxis(scene) {
		const VPS = scene.getCamera().getVPSMatrix(this.canvas);

		const vertexvector = [];
		vertexvector[0] = new S3Vector(0, 0, 0);
		vertexvector[1] = new S3Vector(10, 0, 0);
		vertexvector[2] = new S3Vector(0, 10, 0);
		vertexvector[3] = new S3Vector(0, 0, 10);

		const newvector = [];
		const M = this.mulMatrix(VPS.LookAt, VPS.PerspectiveFov);
		for (let i = 0; i < vertexvector.length; i++) {
			let p = vertexvector[i];
			p = this.mulVector(M, p);
			p = p.mul(1.0 / p.w);
			p = this.mulVector(VPS.Viewport, p);
			newvector[i] = p;
		}

		this.context2d.setLineWidth(3.0);
		this.context2d.setLineColor("rgb(255, 0, 0)");
		this.context2d.drawLine(newvector[0], newvector[1]);
		this.context2d.setLineColor("rgb(0, 255, 0)");
		this.context2d.drawLine(newvector[0], newvector[2]);
		this.context2d.setLineColor("rgb(0, 0, 255)");
		this.context2d.drawLine(newvector[0], newvector[3]);
	}

	/**
	 * ポリゴン（三角形群）を描画します（ラインで表示）。
	 * @param {Array<S3Vertex>} vetexlist 頂点配列
	 * @param {Array<S3TriangleIndex>} triangleindexlist インデックス配列
	 */
	_drawPolygon(vetexlist, triangleindexlist) {
		for (let i = 0; i < triangleindexlist.length; i++) {
			const ti = triangleindexlist[i];
			if (
				this.testCull(
					vetexlist[ti.index[0]].position,
					vetexlist[ti.index[1]].position,
					vetexlist[ti.index[2]].position
				)
			) {
				continue;
			}
			this.context2d.drawLinePolygon(
				vetexlist[ti.index[0]].position,
				vetexlist[ti.index[1]].position,
				vetexlist[ti.index[2]].position
			);
		}
	}

	/**
	 * シーン全体を描画します。
	 * @param {S3Scene} scene 描画対象のシーン
	 */
	drawScene(scene) {
		const VPS = scene.getCamera().getVPSMatrix(this.canvas);

		this.context2d.setLineWidth(1.0);
		this.context2d.setLineColor("rgb(0, 0, 0)");

		const models = scene.getModels();
		for (let i = 0; i < models.length; i++) {
			const model = models[i];
			const mesh = model.getMesh();
			if (mesh.isComplete() === false) {
				continue;
			}
			const M = this.getMatrixWorldTransform(model);
			const MVP = this.mulMatrix(this.mulMatrix(M, VPS.LookAt), VPS.PerspectiveFov);
			const vlist = this._calcVertexTransformation(mesh.src.vertex, MVP, VPS.Viewport);
			this._drawPolygon(vlist, mesh.src.triangleindex);
		}
	}

	/**
	 * 不要になったリソースを解放します（未実装）。
	 * @param {Object} obj 解放対象のオブジェクト
	 * @returns {void}
	 */
	_disposeObject(obj) {}

	/**
	 * 新しい頂点インスタンスを生成します。
	 * @param {S3Vector} position 頂点座標
	 * @returns {S3Vertex} 生成された頂点
	 */
	createVertex(position) {
		return new S3Vertex(position);
	}

	/**
	 * 新しい三角形インデックスインスタンスを生成します。
	 * @param {number} i1 頂点1のインデックス
	 * @param {number} i2 頂点2のインデックス
	 * @param {number} i3 頂点3のインデックス
	 * @param {Array<number>} indexlist 頂点インデックス配列
	 * @param {number} [materialIndex] マテリアルインデックス
	 * @param {Array<S3Vector>} [uvlist] UV座標配列
	 * @returns {S3TriangleIndex} 生成された三角形インデックス
	 */
	createTriangleIndex(i1, i2, i3, indexlist, materialIndex, uvlist) {
		return new S3TriangleIndex(i1, i2, i3, indexlist, materialIndex, uvlist);
	}

	/**
	 * 新しいテクスチャインスタンスを生成します。
	 * @param {string|ImageData|HTMLImageElement|HTMLCanvasElement|HTMLVideoElement} [name] テクスチャ名や画像データ
	 * @returns {S3Texture} 生成されたテクスチャ
	 */
	createTexture(name) {
		return new S3Texture(this, name);
	}

	/**
	 * 新しいシーンインスタンスを生成します。
	 * @returns {S3Scene} 生成されたシーン
	 */
	createScene() {
		return new S3Scene();
	}

	/**
	 * 新しいモデルインスタンスを生成します。
	 * @returns {S3Model} 生成されたモデル
	 */
	createModel() {
		return new S3Model();
	}

	/**
	 * 新しいメッシュインスタンスを生成します。
	 * @returns {S3Mesh} 生成されたメッシュ
	 */
	createMesh() {
		return new S3Mesh(this);
	}

	/**
	 * 新しいマテリアルインスタンスを生成します。
	 * @param {string} [name] マテリアル名
	 * @returns {S3Material} 生成されたマテリアル
	 */
	createMaterial(name) {
		return new S3Material(this, name);
	}

	/**
	 * 新しいライトインスタンスを生成します。
	 * @returns {S3Light} 生成されたライト
	 */
	createLight() {
		return new S3Light();
	}

	/**
	 * 新しいカメラインスタンスを生成します。
	 * @returns {S3Camera} 生成されたカメラ
	 */
	createCamera() {
		const camera = new S3Camera(this);
		return camera;
	}
}

/**
 * システムの描画モードを指定する定数
 *
 * - OPEN_GL: OpenGLに準拠した描画処理・座標変換方式を用います。
 * - DIRECT_X: DirectXに準拠した描画処理・座標変換方式を用います。
 *
 * シーンの座標系や深度バッファの扱いなどにも影響します。
 * @enum {number}
 * @property {number} OPEN_GL   OpenGL準拠（値: 0）
 * @property {number} DIRECT_X  DirectX準拠（値: 1）
 */
S3System.SYSTEM_MODE = {
	/** OpenGL準拠の描画方式（右手系、Zバッファ0～1など） */
	OPEN_GL: 0,
	/** DirectX準拠の描画方式（左手系、Zバッファ0～1など） */
	DIRECT_X: 1
};

S3System.DEPTH_MODE = {
	/**
	 * Z値の範囲などの依存関係をOpenGL準拠
	 * @type Number
	 */
	OPEN_GL: 0,
	/**
	 * Z値の範囲などの依存関係をDirecX準拠
	 * @type Number
	 */
	DIRECT_X: 1
};

S3System.DIMENSION_MODE = {
	/**
	 * 右手系
	 * @type Number
	 */
	RIGHT_HAND: 0,
	/**
	 * 左手系
	 * @type Number
	 */
	LEFT_HAND: 1
};

S3System.VECTOR_MODE = {
	/**
	 * 値を保持するベクトルを縦ベクトルとみなす
	 * @type Number
	 */
	VECTOR4x1: 0,
	/**
	 * 値を保持するベクトルを横ベクトルとみなす
	 * @type Number
	 */
	VECTOR1x4: 1
};

S3System.FRONT_FACE = {
	/**
	 * 反時計回りを前面とする
	 * @type Number
	 */
	COUNTER_CLOCKWISE: 0,

	/**
	 * 時計回りを前面とする
	 * @type Number
	 */
	CLOCKWISE: 1
};

S3System.CULL_MODE = {
	/**
	 * 常にすべての三角形を描画します。
	 * @type Number
	 */
	NONE: 0,

	/**
	 * 前向きの三角形を描写しません。
	 * @type Number
	 */
	FRONT: 1,

	/**
	 * 後ろ向きの三角形を描写しません。
	 * @type Number
	 */
	BACK: 2,

	/**
	 * 常に描写しない。
	 * @type Number
	 */
	FRONT_AND_BACK: 3
};

/**
 * WebGLのシェーダー管理クラス。
 * 頂点シェーダ／フラグメントシェーダのソースコード・型・GLオブジェクトを保持し、コンパイルや破棄、状態取得などの機能を提供します。
 * S3GLProgram 内部で利用され、単体では直接使わないことが多い設計です。
 */
class S3GLShader {
	/**
	 * WebGLシェーダーを初期化します。
	 * @param {S3GLSystem} sys GLシステムインスタンス（GLコンテキスト・コンパイル補助などに必要）
	 * @param {string} code シェーダーのGLSLソースコード、またはGLSLファイルのURL（1行の場合は自動判別）
	 */
	constructor(sys, code) {
		this._init(sys, code);
	}

	/**
	 * 内部初期化処理。
	 * シェーダーソースの格納、コードの取得（URLならダウンロード）、GLオブジェクト初期化などを行います。
	 * @private
	 * @param {S3GLSystem} sys GLシステムインスタンス（GLコンテキスト・コンパイル補助などに必要）
	 * @param {string} code シェーダーのGLSLソースコード、またはGLSLファイルのURL（1行の場合は自動判別）
	 */
	_init(sys, code) {
		this.sys = sys;
		this.code = null;
		this.shader = null;
		this.sharder_type = -1;
		this.is_error = false;
		const that = this;

		/**
		 * コードダウンロード時のコールバック関数型。
		 * @callback DownloadCallback
		 * @param {string} code ダウンロードしたGLSLコード
		 */

		/** @type {DownloadCallback} */
		const downloadCallback = function (code) {
			that.code = code;
		};
		if (code.indexOf("\n") === -1) {
			// 1行の場合はURLとみなす（雑）
			this.sys._download(code, downloadCallback);
		} else {
			this.code = code;
		}
	}

	/**
	 * このシェーダーでエラーが発生しているか判定します。
	 * @returns {boolean} エラー発生時はtrue
	 */
	isError() {
		return this.is_error;
	}

	/**
	 * シェーダーのソースコードを取得します（GLSL文字列）。
	 * @returns {string|null} シェーダーソース。まだ取得できていない場合はnull
	 */
	getCode() {
		return this.code;
	}

	/**
	 * シェーダーオブジェクト（GLShader）を取得します。
	 * 初回はGLSLの内容から自動でタイプ（頂点/フラグメント）判定とコンパイルを行います。
	 * コンパイルエラー時や準備未完了時はnullを返します。
	 * @returns {?WebGLShader} コンパイル済みGLシェーダーオブジェクト、またはnull
	 */
	getShader() {
		const gl = this.sys.getGL();
		if (gl === null || this.is_error || this.code === null) {
			// まだ準備ができていないのでエラーを発生させない
			return null;
		}
		if (this.shader !== null) {
			// すでにコンパイル済みであれば返す
			return this.shader;
		}
		let code = this.code;
		// コメントを除去する
		code = code.replace(/\/\/.*/g, "");
		code = code.replace(/\/\*([^*]|\*[^/])*\*\//g, "");
		// コード内を判定して種別を自動判断する（雑）
		let sharder_type = 0;
		if (code.indexOf("gl_FragColor") !== -1) {
			// フラグメントシェーダである
			sharder_type = gl.FRAGMENT_SHADER;
		} else {
			// バーテックスシェーダである
			sharder_type = gl.VERTEX_SHADER;
		}
		const data = this.sys.glfunc.createShader(sharder_type, code);
		if (data.is_error) {
			this.is_error = true;
			return null;
		}
		this.shader = data.shader;
		this.sharder_type = sharder_type;
		return this.shader;
	}

	/**
	 * このシェーダーのタイプ（頂点orフラグメント）を返します。
	 * 準備ができていない場合やエラー時はnullになります。
	 * @returns {number|null} gl.VERTEX_SHADER または gl.FRAGMENT_SHADER、未定義時は null
	 */
	getShaderType() {
		if (this.sharder_type !== -1) {
			return this.sharder_type;
		}
		if (this.getShader() !== null) {
			return this.sharder_type;
		}
		return null;
	}

	/**
	 * シェーダーリソースを解放し、GLオブジェクトを破棄します。
	 * 以後このシェーダーは再利用できません。
	 * @returns {boolean|null} 正常終了:true、GL未設定時:null
	 */
	dispose() {
		const gl = this.sys.getGL();
		if (gl === null) {
			return null;
		}
		if (this.shader === null) {
			return true;
		}
		this.sys.glfunc.deleteShader(this.shader);
		this.shader = null;
		this.sharder_type = -1;
		return true;
	}
}

/**
 * WebGL用の配列（バッファ）を生成・管理するクラス。（immutable）
 * 各種型（S3Vector, S3Matrix, 数値配列等）をWebGLバッファ（Float32Array/Int32Array）に変換し、
 * 対応するGLSL型（vec3, mat4等）情報も保持します。
 */
class S3GLArray {
	/**
	 * WebGL用の配列データを作成します（immutable）。
	 * 渡された値に応じて型変換・整形し、GLSLでそのまま利用可能な形にします。
	 *
	 * @param {number[]|number|S3Vector|S3Matrix|Float32Array|Int32Array} data 配列、数値、S3Vector/S3Matrix、あるいは既にTypedArrayの場合も可
	 * @param {number} dimension 配列の次元（例：3ならvec3やivec3になる）
	 * @param {S3GLArrayDataType} datatype 使用するバッファ型（S3GLArray.datatype）
	 */
	constructor(data, dimension, datatype) {
		// 引数の情報(S3GLArray.datatype.instance)を用いて、
		// JS用配列を、WEBGL用配列に変換して保存する
		if (data instanceof datatype.instance) {
			this.data = data;
		} else if (data instanceof S3Vector || data instanceof S3Matrix) {
			this.data = data.toInstanceArray(datatype.instance, dimension);
		} else if (data instanceof Array || data instanceof Float32Array || data instanceof Int32Array) {
			this.data = new datatype.instance(data);
		} else if (!isNaN(data)) {
			this.data = new datatype.instance([data]);
		} else {
			throw "IllegalArgumentException";
		}
		this.dimension = dimension;
		this.datatype = datatype;

		let instance = "";
		if (data instanceof S3Vector) {
			instance = "S3Vector";
		} else if (data instanceof S3Matrix) {
			instance = "S3Matrix";
		} else {
			instance = "Number";
		}

		// GLSL型（vec3, mat4など）を自動判別し、型名文字列として保存
		/**
		 * GLSL型（vec3, mat4など）
		 * @type {string}
		 */
		this.glsltype = S3GLArray.gltypetable[datatype.name][instance][dimension];
	}
}

/**
 * TypedArrayのコンストラクタ型定義（Int32Array, Float32Array など）。
 * @typedef {(typeof Float32Array | typeof Int32Array)} TypedArrayConstructor
 */

/**
 * WebGL配列で利用できるデータ型情報（各種TypedArray型）。
 *
 * - instance: 対応するTypedArrayコンストラクタ（例：Float32Array, Int32Array）
 * - name:     型の名前文字列（"Float32Array"等）
 *
 * @typedef {Object} S3GLArrayDataType
 * @property {TypedArrayConstructor} instance 対応するTypedArrayのコンストラクタ
 * @property {string} name 型名（"Float32Array"等）
 */

/**
 * WebGLで利用できる配列データ型定数（Float32Array/Int32Array）。
 * @type {{ Float32Array: S3GLArrayDataType, Int32Array: S3GLArrayDataType }}
 */
S3GLArray.datatype = {
	Float32Array: {
		instance: Float32Array,
		name: "Float32Array"
	},
	Int32Array: {
		instance: Int32Array,
		name: "Int32Array"
	}
};

/**
 * GLSL型名（"vec3"や"mat4"など）を配列次元や入力種別から自動判定するためのテーブル構造。
 *
 * - 第一階層キー：データ型名（"Float32Array" または "Int32Array"）
 * - 第二階層キー：値種別（"Number", "S3Vector", "S3Matrix"）
 * - 第三階層キー：配列次元や要素数（2, 3, 4, 9, 16など）
 * - 値：対応するGLSL型名（"vec3"等）を表す文字列
 *
 * 例）gltypetable["Float32Array"]["S3Matrix"][16] === "mat4"
 *
 * @typedef {Object<string, Object<string, Object<number, string>>>} S3GLArrayGLTypeTable
 */

/**
 * GLSL型判定用テーブル。
 * 値の型により適切なGLSL型名（vec3, mat4等）を自動で取得できます。
 *
 * @type {S3GLArrayGLTypeTable}
 */
S3GLArray.gltypetable = {
	Float32Array: {
		Number: {
			1: "float",
			2: "vec2",
			3: "vec3",
			4: "vec4"
		},
		S3Vector: {
			2: "vec2",
			3: "vec3",
			4: "vec4"
		},
		S3Matrix: {
			4: "mat2",
			9: "mat3",
			16: "mat4"
		}
	},
	Int32Array: {
		Number: {
			1: "int",
			2: "ivec2",
			3: "ivec3",
			4: "ivec4"
		},
		S3Vector: {
			2: "ivec2",
			3: "ivec3",
			4: "ivec4"
		}
	}
};

/**
 * WebGL描画用のテクスチャクラス。
 * S3Textureを拡張し、WebGL用のGLTexture管理、GL用データ取得（getGLData）、破棄などを担います。
 * 画像データをGPUのテクスチャへ変換し、GLSLシェーダへのuniformバインドなどに利用します。
 */
class S3GLTexture extends S3Texture {
	/**
	 * テクスチャを初期化します。
	 * @param {S3GLSystem} s3glsystem GL用システムインスタンス（テクスチャ生成・削除などに必要）
	 * @param {string|ImageData|HTMLImageElement|HTMLCanvasElement|HTMLVideoElement} [data]
	 *   初期化時に与える画像・動画・URLなど（省略可）
	 */
	constructor(s3glsystem, data) {
		// @ts-ignore
		super(s3glsystem, data);

		/**
		 * S3GLSystem アクセス用
		 * @type {S3GLSystem}
		 */
		this._s3gl = s3glsystem;

		/**
		 * GL上のテクスチャオブジェクト
		 * @type {?WebGLTexture}
		 */
		this.gldata = null;
	}

	/**
	 * テクスチャ情報を初期化します。ロード状況やGLオブジェクトもリセットします。
	 * 通常は内部用（再初期化や継承先での利用目的）。
	 * @protect
	 */
	_init() {
		super._init();
		this.gldata = null;
	}

	/**
	 * このテクスチャを破棄し、GLリソースも解放します。
	 * dispose後は再利用できません。
	 */
	dispose() {
		if (!this.is_dispose) {
			this.is_dispose = true;
			if (this.gldata !== null) {
				this._s3gl.glfunc.deleteTexture(this.url);
				this.gldata = null;
			}
		}
	}

	/**
	 * WebGL用テクスチャオブジェクト（GLTexture）を取得します。
	 * 画像データがロード済みならGLテクスチャとして生成し、以後はキャッシュされます。
	 * dispose済み、もしくは未ロードならnullを返します。
	 * @returns {?WebGLTexture} WebGLテクスチャ（未生成・dispose時はnull）
	 */
	getGLData() {
		if (this.is_dispose) {
			return null;
		}
		if (this.gldata !== null) {
			return this.gldata;
		}
		if (this.is_loadimage) {
			this.gldata = this._s3gl.glfunc.createTexture(this.url, this.image);
			return this.gldata;
		}
		return null;
	}
}

/**
 * The script is part of SenkoJS.
 *
 * AUTHOR:
 *  natade (http://twitter.com/natadea)
 *
 * LICENSE:
 *  The MIT license https://opensource.org/licenses/MIT
 */


/**
 * WebGL描画用の頂点（バーテックス）クラス。
 * S3Vertexを拡張し、GL用データ生成やハッシュ化などを提供します。
 * 頂点情報（位置）をGL向け形式に変換し、バーテックスシェーダのattributeと連携できます。
 */
class S3GLVertex extends S3Vertex {
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

/**
 * @typedef {Object} S3GLTriangleIndex
 * @property {number[]} index - 頂点インデックス配列（各頂点のインデックスを3つ持つ）
 * @property {(S3Vector|null)[]} uv - 各頂点のUV座標配列（3つのS3Vector、またはnull）
 * @property {number} materialIndex - 面のマテリアルインデックス（0以上の整数）
 */

/**
 * WebGL描画用の三角形インデックス・属性データ格納クラス。
 * 三角形ごとの頂点インデックス・UV・法線・接線・従法線などを保持し、
 * WebGL（GLSL）用に最適化されたデータ生成やハッシュ作成も担います。
 */
class S3GLTriangleIndexData {
	/**
	 * 三角形インデックス情報からGL用データ構造を生成します。
	 * @param {S3GLTriangleIndex} triangle_index S3GLTriangleIndexなどの三角形インデックス情報
	 */
	constructor(triangle_index) {
		/**
		 * 各頂点を示すインデックス配列
		 * @type {number[]}
		 */
		this.index = triangle_index.index;

		/**
		 * 面が使用するマテリアル番号
		 * @type {number}
		 */
		this.materialIndex = triangle_index.materialIndex;

		/**
		 * 各頂点のUV座標（S3Vectorの配列）
		 * @type {Array<S3Vector>}
		 */
		this.uv = triangle_index.uv;

		/**
		 * UV情報が有効かどうか
		 * @type {boolean}
		 */
		this._isEnabledTexture = triangle_index.uv[0] !== null;

		/**
		 * 面（フェース）単位の属性情報型。
		 * S3Vector.getTangentVector で計算された面の法線・接線・従法線（すべてS3Vector型またはnull）。
		 *
		 * @typedef {Object} S3GLFaceAttribute
		 * @property {?S3Vector} normal   面の法線ベクトル
		 * @property {?S3Vector} tangent  面の接線ベクトル
		 * @property {?S3Vector} binormal 面の従法線ベクトル
		 */

		/**
		 * 頂点単位の属性情報型。
		 * 各頂点（3つ）の法線・接線・従法線（いずれもS3Vector型またはnull）の配列。
		 *
		 * @typedef {Object} S3GLVertexAttribute
		 * @property {Array<?S3Vector>} normal   各頂点の法線ベクトル [0], [1], [2]
		 * @property {Array<?S3Vector>} tangent  各頂点の接線ベクトル [0], [1], [2]
		 * @property {Array<?S3Vector>} binormal 各頂点の従法線ベクトル [0], [1], [2]
		 */

		/**
		 * 面の法線・接線・従法線
		 * @type {S3GLFaceAttribute}
		 */
		this.face = {
			normal: null,
			tangent: null,
			binormal: null
		};

		/**
		 * 各頂点（3つ）の法線・接線・従法線の配列
		 * @type {S3GLVertexAttribute}
		 */
		this.vertex = {
			normal: [null, null, null],
			tangent: [null, null, null],
			binormal: [null, null, null]
		};
	}

	/**
	 * この三角形の、指定頂点（number番目）についてWebGL用一意ハッシュ値を生成します。
	 * 頂点情報・UV・法線などを元にGLバッファのキャッシュや識別に使えます。
	 * @param {number} number 三角形の頂点番号（0, 1, 2）
	 * @param {Array<S3GLVertex>} vertexList 全頂点配列
	 * @returns {string} 頂点＋属性を加味したハッシュ文字列
	 */
	getGLHash(number, vertexList) {
		const uvdata = this._isEnabledTexture
			? this.uv[number].toString(2) + this.face.binormal.toString(2) + this.face.tangent.toString(2)
			: "";
		const vertex = vertexList[this.index[number]].getGLHash();
		return vertex + this.materialIndex + uvdata + this.vertex.normal[number].toString(3);
	}

	/**
	 * 指定頂点のWebGL向け頂点属性データ（GLSL用attribute名に合わせたデータ群）を返します。
	 * 位置・マテリアル番号・UV・法線・接線・従法線などがGLArray形式で格納されます。
	 *
	 * - vertexPosition: 頂点位置(vec3)
	 * - vertexTextureCoord: UV座標(vec2)
	 * - vertexMaterialFloat: マテリアル番号(float)
	 * - vertexNormal: 法線ベクトル(vec3)
	 * - vertexBinormal: 従法線ベクトル(vec3)
	 * - vertexTangent: 接線ベクトル(vec3)
	 *
	 * @param {number} number 三角形内の何番目の頂点データを取得するか（0, 1, 2）
	 * @param {Array<S3GLVertex>} vertexList 頂点の配列
	 * @returns {{[key: string]: S3GLArray}}
	 */
	getGLData(number, vertexList) {
		/**
		 * @type {{[key: string]: S3GLArray}}
		 */
		const vertex = {};
		const vertexdata_list = vertexList[this.index[number]].getGLData();
		for (const key in vertexdata_list) {
			vertex[key] = vertexdata_list[key];
		}
		const uvdata = this._isEnabledTexture ? this.uv[number] : new S3Vector(0.0, 0.0);
		vertex.vertexTextureCoord = new S3GLArray(uvdata, 2, S3GLArray.datatype.Float32Array);
		vertex.vertexMaterialFloat = new S3GLArray(this.materialIndex, 1, S3GLArray.datatype.Float32Array);
		vertex.vertexNormal = new S3GLArray(this.vertex.normal[number], 3, S3GLArray.datatype.Float32Array);
		vertex.vertexBinormal = new S3GLArray(this.vertex.binormal[number], 3, S3GLArray.datatype.Float32Array);
		vertex.vertexTangent = new S3GLArray(this.vertex.tangent[number], 3, S3GLArray.datatype.Float32Array);
		return vertex;
	}
}

/**
 * WebGL描画用の三角形インデックスクラス。
 * 基本のS3TriangleIndexを拡張し、GL用属性データ生成（S3GLTriangleIndexData化）などを追加しています。
 * 頂点インデックス・マテリアル番号・UV座標などの情報を持ち、WebGL向け処理の土台となります。
 */
class S3GLTriangleIndex extends S3TriangleIndex {
	/**
	 * ABCの頂点を囲む三角形ポリゴンを作成します。
	 * @param {number} i1 配列内の頂点Aのインデックス
	 * @param {number} i2 配列内の頂点Bのインデックス
	 * @param {number} i3 配列内の頂点Cのインデックス
	 * @param {Array<number>} indexlist 頂点インデックス配列
	 * @param {number} [materialIndex] 使用するマテリアルのインデックス（省略時や負値の場合は0）
	 * @param {Array<S3Vector>} [uvlist] UV座標配列（S3Vector配列、なくても可）
	 */
	constructor(i1, i2, i3, indexlist, materialIndex, uvlist) {
		super(i1, i2, i3, indexlist, materialIndex, uvlist);
	}

	/**
	 * この三角形インデックスのクローン（複製）を作成します。
	 * @returns {S3GLTriangleIndex} 複製されたS3GLTriangleIndexインスタンス
	 */
	clone() {
		// @ts-ignore
		return super.clone(S3GLTriangleIndex);
	}

	/**
	 * 三角形の頂点順序を反転した新しいインスタンスを作成します。
	 * モデルの表裏を逆転したい場合などに利用します。
	 * @returns {S3GLTriangleIndex} 頂点順序を逆にした新しい三角形インデックス
	 */
	inverseTriangle() {
		// @ts-ignore
		return super.inverseTriangle(S3GLTriangleIndex);
	}
	/**
	 * この三角形の情報をWebGL用属性データ（S3GLTriangleIndexData）として生成します。
	 * 法線・UV・接線等も含めた拡張情報付きで返します。
	 * @returns {S3GLTriangleIndexData} WebGL向け属性データ
	 */
	createGLTriangleIndexData() {
		return new S3GLTriangleIndexData(this);
	}
}

/**
 * WebGL描画用のマテリアル（材質）クラス。
 * 基本のS3Materialを拡張し、GL用データ生成・ハッシュ管理などWebGL用途向けの機能を追加します。
 * 色、拡散/反射/発光/環境光、テクスチャ情報などを保持し、GLSLシェーダへのuniformデータ化を担います。
 */
class S3GLMaterial extends S3Material {
	/**
	 * マテリアル情報を初期化します。
	 * @param {S3GLSystem} s3glsystem GL用システムインスタンス（テクスチャ生成等に必要）
	 * @param {string} name マテリアル名（一意識別のためGLハッシュにも使用）
	 */
	constructor(s3glsystem, name) {
		// @ts-ignore
		super(s3glsystem, name);
		this._s3gl = s3glsystem;
	}

	/**
	 * このマテリアルの一意なハッシュ文字列を取得します。
	 * 通常はマテリアル名がそのままハッシュ値になります。
	 * @returns {string} マテリアルの識別用ハッシュ値（名前）
	 */
	getGLHash() {
		// 名前は被らないので、ハッシュに使用する
		return this.name;
	}

	/**
	 * 頂点データを作成して取得する
	 * 頂点データ内に含まれるデータは、S3GLArray型となる。
	 * なお、ここでつけているメンバの名前は、そのままバーテックスシェーダで使用する変数名となる
	 * uniform の数がハードウェア上限られているため、送る情報は選定すること
	 *
	 *   - materialsColorAndDiffuse: 色(RGB)+拡散率（vec4/Float32Array）
	 *   - materialsSpecularAndPower: 鏡面色(RGB)+光沢度（vec4/Float32Array）
	 *   - materialsEmission: 発光色（vec3/Float32Array）
	 *   - materialsAmbientAndReflect: 環境光(RGB)+反射率（vec4/Float32Array）
	 *   - materialsTextureExist: テクスチャ有無フラグ（[color有:1/0, normal有:1/0]）
	 *   - materialsTextureColor: カラーテクスチャのGLオブジェクト
	 *   - materialsTextureNormal: 法線テクスチャのGLオブジェクト
	 *
	 * @returns {{[key: string]: S3GLArray | WebGLTexture }}
	 */
	getGLData() {
		/**
		 * @type {S3GLTexture}
		 */
		const textureColorGl = /** @type {S3GLTexture} */ (this.textureColor);

		/**
		 * @type {S3GLTexture}
		 */
		const textureNormalGl = /** @type {S3GLTexture} */ (this.textureNormal);

		// テクスチャを取得
		let tex_color = textureColorGl.getGLData();
		let tex_normal = textureNormalGl.getGLData();
		// テクスチャのありなしフラグを作成。ない場合はダミーデータを入れる。
		const tex_exist = [tex_color === null ? 0 : 1, tex_normal === null ? 0 : 1];
		tex_color = tex_color === null ? this._s3gl._getDummyTexture() : tex_color;
		tex_normal = tex_normal === null ? this._s3gl._getDummyTexture() : tex_normal;
		return {
			materialsColorAndDiffuse: new S3GLArray(
				[this.color.x, this.color.y, this.color.z, this.diffuse],
				4,
				S3GLArray.datatype.Float32Array
			),
			materialsSpecularAndPower: new S3GLArray(
				[this.specular.x, this.specular.y, this.specular.z, this.power],
				4,
				S3GLArray.datatype.Float32Array
			),
			materialsEmission: new S3GLArray(this.emission, 3, S3GLArray.datatype.Float32Array),
			materialsAmbientAndReflect: new S3GLArray(
				[this.ambient.x, this.ambient.y, this.ambient.z, this.reflect],
				4,
				S3GLArray.datatype.Float32Array
			),
			materialsTextureExist: new S3GLArray(tex_exist, 2, S3GLArray.datatype.Float32Array),
			materialsTextureColor: tex_color,
			materialsTextureNormal: tex_normal
		};
	}
}

/**
 * WebGL用のメッシュ（立体形状データ）を管理するクラスです。
 * S3Meshを拡張し、WebGL描画に必要なVBOやIBO情報、GL用データ生成・解放機能などを持ちます。
 * モデルの描画時にGLにバインドできるバッファ形式への変換・管理も行います。
 */
class S3GLMesh extends S3Mesh {
	/**
	 * S3GLMeshのインスタンスを生成します。
	 * @param {S3GLSystem} s3glsystem WebGLシステム（GLContext等の管理）インスタンス
	 */
	constructor(s3glsystem) {
		super(s3glsystem);

		/**
		 * S3GLSystem アクセス用
		 * @type {S3GLSystem}
		 */
		this._s3gl = s3glsystem;
	}

	/**
	 * メッシュの内部状態とWebGL用データ（gldata）を初期化します。
	 * 通常はコンストラクタから自動的に呼ばれます。
	 */
	_init() {
		super._init();

		/**
		 * WebGL用バッファデータ格納オブジェクト
		 * @type {S3GLMeshArrayData}
		 */
		this.gldata = null;

		/**
		 * GL用データのコンパイル状態
		 * @type {boolean}
		 */
		this.is_compile_gl = false;
	}

	/**
	 * このメッシュのクローン（複製）を生成します。
	 * @returns {S3GLMesh} 複製されたS3GLMeshインスタンス
	 */
	clone() {
		// @ts-ignore
		return /** @type {S3GLMesh} */ super.clone(S3GLMesh);
	}

	/**
	 * メッシュが保持する頂点配列を取得します。
	 * @returns {Array<S3GLVertex>} 頂点配列
	 */
	getVertexArray() {
		// @ts-ignore
		return /** @type {Array<S3GLVertex>} */ super.getVertexArray();
	}

	/**
	 * メッシュが保持する三角形インデックス配列を取得します。
	 * @returns {Array<S3GLTriangleIndex>} 三角形インデックス配列
	 */
	getTriangleIndexArray() {
		// @ts-ignore
		return /** @type {Array<S3GLTriangleIndex>} */ super.getTriangleIndexArray();
	}

	/**
	 * メッシュが保持するマテリアル配列を取得します。
	 * @returns {Array<S3GLMaterial>} マテリアル配列
	 */
	getMaterialArray() {
		// @ts-ignore
		return /** @type {Array<S3GLMaterial>} */ super.getMaterialArray();
	}

	/**
	 * 頂点（ S3GLVertex またはその配列）をメッシュに追加します。
	 * @param {S3GLVertex|Array<S3GLVertex>} vertex 追加する頂点またはその配列
	 */
	addVertex(vertex) {
		// @ts-ignore
		super.addVertex(vertex);
	}

	/**
	 * 三角形インデックス（ S3GLTriangleIndex またはその配列）をメッシュに追加します。
	 * 反転モード時は面を裏返して追加します。
	 * @param {S3GLTriangleIndex|Array<S3GLTriangleIndex>} ti 追加する三角形インデックスまたはその配列
	 */
	addTriangleIndex(ti) {
		// @ts-ignore
		super.addTriangleIndex(ti);
	}

	/**
	 * マテリアル（ S3GLMaterial またはその配列）をメッシュに追加します。
	 * @param {S3GLMaterial|Array<S3GLMaterial>} material 追加するマテリアルまたはその配列
	 */
	addMaterial(material) {
		// @ts-ignore
		super.addMaterial(material);
	}

	/**
	 * WebGL用データがすでに作成済みかどうかを返します。
	 * @returns {boolean} 作成済みならtrue
	 */
	isCompileGL() {
		return this.is_compile_gl;
	}

	/**
	 * WebGL用データのコンパイル状態を設定します。
	 * @param {boolean} is_compile_gl コンパイル済みかどうか
	 */
	setCompileGL(is_compile_gl) {
		this.is_compile_gl = is_compile_gl;
	}

	/**
	 * 各三角形ごとに、WebGL用属性データ（頂点ごとの法線・接線等）を生成します。
	 * 頂点の共有を考慮して法線のスムージングも自動計算します。
	 * @returns {Array<S3GLTriangleIndexData>} 三角形ごとのGL用属性データリスト
	 */
	createTriangleIndexData() {
		const vertex_list = this.getVertexArray();
		const triangleindex_list = this.getTriangleIndexArray();

		/**
		 * @typedef {Object} S3NormalVector
		 * @property {S3Vector} normal 平面の法線
		 * @property {S3Vector} tangent UV座標による接線
		 * @property {S3Vector} binormal UV座標による従法線
		 */

		/**
		 * 三角形ごとのWebGL属性データリスト
		 * @type {Array<S3GLTriangleIndexData & { face : S3NormalVector }>}
		 */
		const tid_list = [];

		/**
		 * @typedef {"normal"|"tangent"|"binormal"} NormalListKey
		 */

		/**
		 * 面ごとの法線・接線・従法線名をまとめたオブジェクト
		 * @type {{ normal: boolean, tangent: boolean, binormal: boolean }}
		 */
		const normallist = {
			normal: false,
			tangent: false,
			binormal: false
		};

		// 各面の法線、接線、従法線を調べる
		for (let i = 0; i < triangleindex_list.length; i++) {
			const triangleindex = triangleindex_list[i];
			const index = triangleindex.index;
			const uv = triangleindex.uv;
			tid_list[i] = triangleindex.createGLTriangleIndexData();
			let vector_list = null;
			// 3点を時計回りで通る平面が表のとき
			if (this.sys.dimensionmode === S3System.DIMENSION_MODE.RIGHT_HAND) {
				vector_list = S3Vector.getNormalVector(
					vertex_list[index[0]].position,
					vertex_list[index[1]].position,
					vertex_list[index[2]].position,
					uv[0],
					uv[1],
					uv[2]
				);
			} else {
				vector_list = S3Vector.getNormalVector(
					vertex_list[index[2]].position,
					vertex_list[index[1]].position,
					vertex_list[index[0]].position,
					uv[2],
					uv[1],
					uv[0]
				);
			}

			tid_list[i].face = {
				normal: vector_list.normal,
				tangent: vector_list.tangent,
				binormal: vector_list.binormal
			};
		}

		// 素材ごとに、三角形の各頂点に、面の法線情報を追加する
		// 後に正規化する（平均値をとる）が、同じベクトルを加算しないようにキャッシュでチェックする

		/**
		 * マテリアルごと、頂点ごとの属性ベクトル情報リスト
		 * @type {Array<Array<{ normal: S3Vector, tangent: S3Vector, binormal: S3Vector }>>}
		 */
		const vertexdatalist_material = [];

		/**
		 * 各マテリアル・頂点ごと、法線等ベクトルごとのキャッシュ管理
		 * @type {Array<Array<{ normal: Object<string, boolean>, tangent: Object<string, boolean>, binormal: Object<string, boolean> }>>}
		 */
		const vertexdatalist_material_cash = [];
		for (let i = 0; i < triangleindex_list.length; i++) {
			const triangleindex = triangleindex_list[i];
			const material = triangleindex.materialIndex;
			const triangledata = tid_list[i];
			// 未登録なら新規作成する
			if (vertexdatalist_material[material] === undefined) {
				vertexdatalist_material[material] = [];
				vertexdatalist_material_cash[material] = [];
			}
			const vertexdata_list = vertexdatalist_material[material];
			const vertexdata_list_cash = vertexdatalist_material_cash[material];
			// 素材ごとの三角形の各頂点に対応する法線情報に加算していく
			for (let j = 0; j < 3; j++) {
				// 未登録なら新規作成する
				const index = triangleindex.index[j];
				if (vertexdata_list[index] === undefined) {
					vertexdata_list[index] = {
						normal: new S3Vector(0, 0, 0),
						tangent: new S3Vector(0, 0, 0),
						binormal: new S3Vector(0, 0, 0)
					};
					vertexdata_list_cash[index] = {
						normal: {},
						tangent: {},
						binormal: {}
					};
				}
				const vertexdata = vertexdata_list[index];
				const vertexdata_cash = vertexdata_list_cash[index];

				// 加算する
				for (const vector_name in normallist) {
					const key = /** @type {NormalListKey} */ (vector_name);
					if (triangledata.face[key] !== null) {
						// データが入っていたら加算する
						const id = triangledata.face[key].toHash(3);
						if (vertexdata_cash[key][id]) continue;
						vertexdata[key] = vertexdata[key].add(triangledata.face[key]);
						vertexdata_cash[key][id] = true;
					}
				}
			}
		}

		// マテリアルごとの頂点の法線を、正規化して1とする（平均値をとる）
		for (const material in vertexdatalist_material) {
			const vertexdata_list = vertexdatalist_material[material];
			for (const index in vertexdata_list) {
				const vertexdata = vertexdata_list[index];
				for (const vector_name in normallist) {
					const key = /** @type {NormalListKey} */ (vector_name);
					// あまりに小さいと、0で割ることになるためチェックする
					if (vertexdata[key].normFast() > 0.000001) {
						vertexdata[key] = vertexdata[key].normalize();
					}
				}
			}
		}

		// 面法線と、頂点（スムーズ）法線との角度の差が、下記より大きい場合は面法線を優先
		const SMOOTH = {};
		SMOOTH.normal = Math.cos((50 / 360) * (2 * Math.PI));
		SMOOTH.tangent = Math.cos((50 / 360) * (2 * Math.PI));
		SMOOTH.binormal = Math.cos((50 / 360) * (2 * Math.PI));

		// 最終的に三角形の各頂点の法線を求める
		for (let i = 0; i < triangleindex_list.length; i++) {
			const triangleindex = triangleindex_list[i];
			const material = triangleindex.materialIndex;
			const triangledata = tid_list[i];
			const vertexdata_list = vertexdatalist_material[material];

			// 法線ががあまりに違うのであれば、面の法線を採用する
			for (let j = 0; j < 3; j++) {
				const index = triangleindex.index[j];
				const vertexdata = vertexdata_list[index];
				for (const vector_name in normallist) {
					const key = /** @type {NormalListKey} */ (vector_name);
					let targetdata;
					if (triangledata.face[key]) {
						// 面で計算した値が入っているなら、
						// 面で計算した値と、頂点の値とを比較してどちらかを採用する
						const rate = triangledata.face[key].dot(vertexdata[key]);
						// 指定した度以上傾いていたら、面の法線を採用する
						targetdata = rate < SMOOTH[key] ? triangledata.face : vertexdata;
					} else {
						targetdata = vertexdata;
					}
					// コピー
					triangledata.vertex[key][j] = targetdata[key];
				}
			}
		}

		return tid_list;
	}

	/**
	 * IBO（インデックスバッファオブジェクト）データ構造
	 * @typedef {Object} S3GLMeshIBOData
	 * @property {number} array_length 配列の要素数（インデックス総数）
	 * @property {Int16Array} array インデックス値の配列（WebGL用）
	 * @property {WebGLBuffer} [data] GL生成後のバッファオブジェクト（未生成時はundefined）
	 */

	/**
	 * VBO（頂点バッファオブジェクト）1要素のデータ構造
	 * @typedef {Object} S3GLMeshVBOElement
	 * @property {string} name 属性名（例："position", "normal", "uv" など）
	 * @property {number} dimension 配列の次元（例：位置なら3、UVなら2など）
	 * @property {typeof Float32Array | typeof Int32Array} datatype 使用する配列型
	 * @property {number} array_length 配列の要素数（全頂点×次元）
	 * @property {Float32Array | Int32Array} array 属性データ本体
	 * @property {WebGLBuffer} [data] GL生成後のバッファオブジェクト（未生成時はundefined）
	 */

	/**
	 * VBO（頂点バッファオブジェクト）全体のデータ構造
	 * @typedef {Object.<string, S3GLMeshVBOElement>} S3GLMeshVBOData
	 * 属性名（position/normal/uv等）→S3GLVBOElementの連想配列
	 */

	/**
	 * _getGLArrayDataの返却値（IBOとVBOまとめて返す構造）
	 * @typedef {Object} S3GLMeshArrayData
	 * @property {S3GLMeshIBOData} ibo インデックスバッファ情報
	 * @property {S3GLMeshVBOData} vbo 頂点バッファ情報
	 */

	/**
	 * メッシュ全体の頂点・インデックス情報をWebGL用のバッファ形式（VBO/IBO）に変換します。
	 * すでに計算済みなら再計算は行いません。
	 *
	 * - IBOはポリゴン（三角形）の頂点インデックス列
	 * - VBOは各頂点の属性（位置、法線、UV等）の配列
	 * - 戻り値の各dataプロパティは、GLバッファ生成後のみセットされます
	 *
	 * @returns {S3GLMeshArrayData} IBO/VBOデータをまとめたオブジェクト
	 */
	_getGLArrayData() {
		/**
		 * 頂点配列
		 * @type {Array<S3GLVertex>}
		 */
		const vertex_list = this.getVertexArray();

		/**
		 * 三角形インデックスデータ配列
		 * @type {Array<S3GLTriangleIndexData>}
		 */
		const triangleindex_list = this.createTriangleIndexData();

		/**
		 * 頂点ハッシュ文字列→頂点配列インデックスの対応表
		 * @type {Object<string, number>}
		 */
		const hashlist = {};

		let vertex_length = 0;

		/**
		 * 三角形ごとの頂点インデックス配列
		 * @type {Array<Int16Array>}
		 */
		const triangle = [];

		/**
		 * 属性ごとの頂点データリスト（raw属性値の配列）
		 * @type {Object<string, Array<any>>}
		 */
		const vertextypelist = {};

		// インデックスを再構築して、VBOとIBOを作る
		// 今の生データだと、頂点情報、素材情報がばらばらに保存されているので
		// 1つの頂点情報（位置、色等）を1つのセットで保存する必要がある
		// 面に素材が結びついているので、面が1つの頂点を共有していると
		// それらの面の素材情報によって、別の頂点として扱う必要がある
		// なので基本的には頂点情報を毎回作り直す必要があるが、
		// 1度作ったものと等しいものが必要であれば、キャッシュを使用する
		for (let i = 0; i < triangleindex_list.length; i++) {
			const triangleindex = triangleindex_list[i];

			/**
			 * 1つの三角形(face)に対する3頂点のインデックス番号リスト
			 * @type {Array<number>}
			 */
			const indlist = [];
			// ポリゴンの各頂点を調べる
			for (let j = 0; j < 3; j++) {
				// その頂点（面の情報（UVなど）も含めたデータ）のハッシュ値を求める
				const hash = triangleindex.getGLHash(j, vertex_list);
				// すでに以前と同一の頂点があるならば、その頂点アドレスを選択。ない場合は新しいアドレス
				const hit = hashlist[hash];
				indlist[j] = hit !== undefined ? hit : vertex_length;
				// 頂点がもしヒットしていなかったら
				if (hit === undefined) {
					// 頂点データを作成して
					const vertexdata = triangleindex.getGLData(j, vertex_list);
					hashlist[hash] = vertex_length;
					// 頂点にはどういった情報があるか分からないので、in を使用する。
					// key には、position / normal / color / uv などがおそらく入っている
					for (const key in vertexdata) {
						if (vertextypelist[key] === undefined) {
							vertextypelist[key] = [];
						}
						vertextypelist[key].push(vertexdata[key]);
					}
					vertex_length++;
				}
			}
			// 3つの頂点のインデックスを記録
			triangle[i] = new Int16Array(indlist);
		}

		// データ結合処理
		// これまでは複数の配列にデータが入ってしまっているので、
		// 1つの指定した型の配列に全てをまとめる必要がある

		let pt = 0;

		/**
		 * IBOデータ格納用
		 * @type {S3GLMeshIBOData}
		 */
		const ibo = {};
		{
			// IBOの結合（インデックス）
			ibo.array_length = triangleindex_list.length * 3;
			ibo.array = new Int16Array(ibo.array_length);
			pt = 0;
			for (let i = 0; i < triangleindex_list.length; i++) {
				for (let j = 0; j < 3; j++) {
					ibo.array[pt++] = triangle[i][j];
				}
			}
		}

		/**
		 * VBOデータ格納用
		 * @type {S3GLMeshVBOData}
		 */
		const vbo = {};
		{
			// VBOの結合（頂点）
			// 位置、法線、色などを、それぞれ1つの配列として記録する
			for (const key in vertextypelist) {
				const srcdata = vertextypelist[key];
				const dimension = srcdata[0].dimension;
				const dstdata = {};
				// 情報の名前(position / uv / normal など)
				dstdata.name = key;
				// 1つの頂点あたり、いくつの値が必要か。例えばUVなら2次元情報
				dstdata.dimension = srcdata[0].dimension;
				// 型情報 Float32Array / Int32Array なのかどうか
				dstdata.datatype = srcdata[0].datatype;
				// 配列の長さ
				dstdata.array_length = dimension * vertex_length;
				// 型情報と、配列の長さから、メモリを確保する
				dstdata.array = new dstdata.datatype.instance(dstdata.array_length);
				// data を1つの配列に結合する
				pt = 0;
				for (let i = 0; i < vertex_length; i++) {
					for (let j = 0; j < dimension; j++) {
						dstdata.array[pt++] = srcdata[i].data[j];
					}
				}
				// VBOオブジェクトに格納
				vbo[key] = dstdata;
			}
		}

		const arraydata = {};
		arraydata.ibo = ibo;
		arraydata.vbo = vbo;
		return arraydata;
	}

	/**
	 * WebGL用バッファ（IBO/VBO）やテクスチャなどのGLリソースを開放し、再利用不可にします。
	 * テクスチャを含むマテリアルのリソースも解放対象です。
	 * @returns {void}
	 */
	disposeGLData() {
		// コンパイルしていなかったら抜ける
		if (!this.isCompileGL()) {
			return;
		}
		const gldata = this.getGLData();
		if (gldata !== null) {
			if (gldata.ibo !== undefined) {
				if (gldata.ibo.data !== undefined) {
					this._s3gl.glfunc.deleteBuffer(gldata.ibo.data);
				}
				delete gldata.ibo;
			}
			if (gldata.vbo !== undefined) {
				for (const key in gldata.vbo) {
					if (gldata.vbo[key].data !== undefined) {
						this._s3gl.glfunc.deleteBuffer(gldata.vbo[key].data);
					}
				}
				delete gldata.vbo;
			}
			{
				const material_list = this.getMaterialArray();
				for (let i = 0; i < material_list.length; i++) {
					const mat = material_list[i];
					mat.textureColor.dispose();
					mat.textureNormal.dispose();
				}
			}
		}
		delete this.gldata;
		this.gldata = null;
		this.setCompileGL(false);
	}

	/**
	 * メッシュのGLデータ（VBO/IBO）を取得・生成します。
	 * すでに生成済みならキャッシュを返します。
	 * メッシュが未完成または GLContext が未セットの場合はnullを返します。
	 * @returns {S3GLMeshArrayData|null} WebGL用バッファデータ（ibo, vbo等を含む）またはnull
	 */
	getGLData() {
		// すでに存在している場合は、返す
		if (this.isCompileGL()) {
			return this.gldata;
		}
		// 完成していない場合は null
		if (this.isComplete() === false) {
			return null;
		}
		// GLを取得できない場合も、この時点で終了させる
		if (!this._s3gl.isSetGL()) {
			return null;
		}
		const gldata = this._getGLArrayData(); // GL用の配列データを作成

		// IBO / VBO 用のオブジェクトを作成
		gldata.ibo.data = this._s3gl.glfunc.createBufferIBO(gldata.ibo.array);
		for (const key in gldata.vbo) {
			gldata.vbo[key].data = this._s3gl.glfunc.createBufferVBO(gldata.vbo[key].array);
		}
		// 代入
		this.gldata = gldata;
		this.setCompileGL(true);
		return this.gldata;
	}
}

/** @typedef {import('./typedefs.js').S3GLProgramBindInputDataSingle} S3GLProgramBindInputDataSingle */
/** @typedef {import('./typedefs.js').S3GLProgramBindInputData} S3GLProgramBindInputData */


/**
 * WebGLのプログラム（Program）管理クラス。
 * 頂点・フラグメント2つのシェーダーと、それらをリンクしたGLプログラムオブジェクトを保持し、
 * 各種attribute/uniform変数とのバインドや、プログラム切替・破棄などの管理を担います。
 * S3GLSystem経由でのWebGL描画制御のコアとなります。
 */
class S3GLProgram {
	/**
	 * WebGLプログラムを初期化します。
	 * @param {S3GLSystem} sys GLシステムインスタンス
	 * @param {number} id プログラム一意識別ID
	 */
	constructor(sys, id) {
		this._init(sys, id);
	}

	/**
	 * プログラムの内部初期化。
	 * 変数情報・シェーダー状態・リンク済みフラグ等をリセットします。
	 * @private
	 * @param {S3GLSystem} sys
	 * @param {number} id
	 */
	_init(sys, id) {
		/**
		 * プログラム一意ID
		 * @type {number}
		 */
		this.id = id;

		/**
		 * GLシステムインスタンス
		 * @type {S3GLSystem}
		 */
		this.sys = sys;

		/**
		 * 頂点シェーダインスタンス
		 * @type {?S3GLShader}
		 */
		this.vertex = null;

		/**
		 * フラグメントシェーダインスタンス
		 * @type {?S3GLShader}
		 */
		this.fragment = null;

		/**
		 * 頂点シェーダがダウンロード中かどうか
		 * @type {boolean}
		 */
		this.isDLVertex = false;

		/**
		 * フラグメントシェーダがダウンロード中かどうか
		 * @type {boolean}
		 */
		this.isDLFragment = false;

		/**
		 * リンク済みGLプログラム
		 * @type {?WebGLProgram}
		 */
		this.program = null;

		/**
		 * GL上でリンク済みかどうか
		 * @type {boolean}
		 */
		this.is_linked = false;

		/**
		 * エラー発生済みかどうか
		 * @type {boolean}
		 */
		this.is_error = false;

		/**
		 * 有効化済みのattributeロケーション番号管理
		 * @type {Object<number, boolean>}
		 */
		this.enable_vertex_number = {};

		/**
		 * シェーダ変数管理構造体
		 * @type {Object<string, S3GLShaderData>}
		 */
		this.variable = {};

		const _this = this;

		/**
		 * 次にバインド予定のアクティブテクスチャ番号
		 * @type {number}
		 */
		this.activeTextureId = 0;

		/**
		 * WebGLのuniform変数バインド用関数群。
		 * 各関数はGLSLの型に応じて正しいuniform関数（uniform1iv/uniformMatrix4fv等）でデータを送る役割を持ちます。
		 *
		 * @typedef {Object} S3GLUniformBindFunctions
		 * @property {function(WebGLUniformLocation, Int32Array):void}  uniform1iv  1次元整数配列を送信
		 * @property {function(WebGLUniformLocation, Int32Array):void}  uniform2iv  2次元整数配列を送信
		 * @property {function(WebGLUniformLocation, Int32Array):void}  uniform3iv  3次元整数配列を送信
		 * @property {function(WebGLUniformLocation, Int32Array):void}  uniform4iv  4次元整数配列を送信
		 * @property {function(WebGLUniformLocation, Float32Array):void} uniform1fv  1次元浮動小数点配列を送信
		 * @property {function(WebGLUniformLocation, Float32Array):void} uniform2fv  2次元浮動小数点配列を送信
		 * @property {function(WebGLUniformLocation, Float32Array):void} uniform3fv  3次元浮動小数点配列を送信
		 * @property {function(WebGLUniformLocation, Float32Array):void} uniform4fv  4次元浮動小数点配列を送信
		 * @property {function(WebGLUniformLocation, Float32Array):void} uniformMatrix2fv  2x2行列を送信
		 * @property {function(WebGLUniformLocation, Float32Array):void} uniformMatrix3fv  3x3行列を送信
		 * @property {function(WebGLUniformLocation, Float32Array):void} uniformMatrix4fv  4x4行列を送信
		 * @property {function(WebGLUniformLocation, WebGLTexture):void} uniformSampler2D   2Dテクスチャ（sampler2D）を送信
		 */

		/**
		 * GLSLのuniform変数型ごとに適切なWebGLバインド関数を提供するオブジェクト
		 * @type {S3GLUniformBindFunctions}
		 */
		const g = {
			/**
			 * 1次元整数配列 uniform1iv
			 * @param {WebGLUniformLocation} location
			 * @param {Int32Array} value
			 */
			uniform1iv: function (location, value) {
				if (sys.getGL()) {
					sys.getGL().uniform1iv(location, value);
				}
			},

			/**
			 * 2次元整数配列 uniform2iv
			 * @param {WebGLUniformLocation} location
			 * @param {Int32Array} value
			 */
			uniform2iv: function (location, value) {
				if (sys.getGL()) {
					sys.getGL().uniform2iv(location, value);
				}
			},

			/**
			 * 3次元整数配列 uniform3iv
			 * @param {WebGLUniformLocation} location
			 * @param {Int32Array} value
			 */
			uniform3iv: function (location, value) {
				if (sys.getGL()) {
					sys.getGL().uniform3iv(location, value);
				}
			},

			/**
			 * 4次元整数配列 uniform4iv
			 * @param {WebGLUniformLocation} location
			 * @param {Int32Array} value
			 */
			uniform4iv: function (location, value) {
				if (sys.getGL()) {
					sys.getGL().uniform4iv(location, value);
				}
			},

			/**
			 * 1次元浮動小数点配列 uniform1fv
			 * @param {WebGLUniformLocation} location
			 * @param {Float32Array} value
			 */
			uniform1fv: function (location, value) {
				if (sys.getGL()) {
					sys.getGL().uniform1fv(location, value);
				}
			},

			/**
			 * 2次元浮動小数点配列 uniform2fv
			 * @param {WebGLUniformLocation} location
			 * @param {Float32Array} value
			 */
			uniform2fv: function (location, value) {
				if (sys.getGL()) {
					sys.getGL().uniform2fv(location, value);
				}
			},

			/**
			 * 3次元浮動小数点配列 uniform3fv
			 * @param {WebGLUniformLocation} location
			 * @param {Float32Array} value
			 */
			uniform3fv: function (location, value) {
				if (sys.getGL()) {
					sys.getGL().uniform3fv(location, value);
				}
			},

			/**
			 * 4次元浮動小数点配列 uniform4fv
			 * @param {WebGLUniformLocation} location
			 * @param {Float32Array} value
			 */
			uniform4fv: function (location, value) {
				if (sys.getGL()) {
					sys.getGL().uniform4fv(location, value);
				}
			},

			/**
			 * 2x2行列 uniformMatrix2fv
			 * @param {WebGLUniformLocation} location
			 * @param {Float32Array} value
			 */
			uniformMatrix2fv: function (location, value) {
				if (sys.getGL()) {
					sys.getGL().uniformMatrix2fv(location, false, value);
				}
			},

			/**
			 * 3x3行列 uniformMatrix3fv
			 * @param {WebGLUniformLocation} location
			 * @param {Float32Array} value
			 */
			uniformMatrix3fv: function (location, value) {
				if (sys.getGL()) {
					sys.getGL().uniformMatrix3fv(location, false, value);
				}
			},

			/**
			 * 4x4行列 uniformMatrix4fv
			 * @param {WebGLUniformLocation} location
			 * @param {Float32Array} value
			 */
			uniformMatrix4fv: function (location, value) {
				if (sys.getGL()) {
					sys.getGL().uniformMatrix4fv(location, false, value);
				}
			},

			/**
			 * サンプラー2D（テクスチャ） uniformSampler2D
			 * @param {WebGLUniformLocation} location
			 * @param {WebGLTexture} value
			 */
			uniformSampler2D: function (location, value) {
				const gl = sys.getGL();
				if (gl) {
					gl.activeTexture(gl.TEXTURE0 + _this.activeTextureId);
					gl.bindTexture(gl.TEXTURE_2D, value);
					gl.uniform1i(location, _this.activeTextureId);
					_this.activeTextureId++;
				}
			}
		};

		/**
		 * GLSL型名ごとのWebGLバインド情報テーブル。
		 * 各GLSL型（int, float, mat4, vec3, sampler2D等）に対し、
		 * - glsltype: GLSL型名（"vec3" など）
		 * - instance: 対応するTypedArray型またはImage（サンプラーの場合）
		 * - size: 必要な要素数（配列長）
		 * - btype: 内部的なデータ型種別（"FLOAT", "INT", "TEXTURE" など）
		 * - bind: WebGLのuniformバインド関数（g内の該当関数を使用）
		 * などの情報を保持します。
		 *
		 * @typedef {Object} S3GLProgramGLSLTypeInfo
		 * @property {string} glsltype GLSL型名（例："vec3"）
		 * @property {(typeof Float32Array | typeof Int32Array | Image)} instance 対応TypedArrayコンストラクタまたはImage
		 * @property {number} size 要素数（floatなら1, mat4なら16など）
		 * @property {string} btype 内部データ型区分（"FLOAT", "INT", "TEXTURE"等）
		 * @property {function(WebGLUniformLocation, *):void} bind uniform変数へバインドするための関数
		 */

		/**
		 * GLSL型ごとのWebGL情報テーブル。
		 * 変数型をキーとし、型ごとの詳細プロパティ（GLSL型名/配列型/要素数/バインド関数など）を格納します。
		 * @type {Object<string, S3GLProgramGLSLTypeInfo>}
		 */
		const info = {
			int: { glsltype: "int", instance: Int32Array, size: 1, btype: "INT", bind: g.uniform1iv },
			float: { glsltype: "float", instance: Float32Array, size: 1, btype: "FLOAT", bind: g.uniform1fv },
			bool: { glsltype: "bool", instance: Int32Array, size: 1, btype: "INT", bind: g.uniform1iv },
			mat2: { glsltype: "mat2", instance: Float32Array, size: 4, btype: "FLOAT", bind: g.uniformMatrix2fv },
			mat3: { glsltype: "mat3", instance: Float32Array, size: 9, btype: "FLOAT", bind: g.uniformMatrix3fv },
			mat4: { glsltype: "mat4", instance: Float32Array, size: 16, btype: "FLOAT", bind: g.uniformMatrix4fv },
			vec2: { glsltype: "vec2", instance: Float32Array, size: 2, btype: "FLOAT", bind: g.uniform2fv },
			vec3: { glsltype: "vec3", instance: Float32Array, size: 3, btype: "FLOAT", bind: g.uniform3fv },
			vec4: { glsltype: "vec4", instance: Float32Array, size: 4, btype: "FLOAT", bind: g.uniform4fv },
			ivec2: { glsltype: "ivec2", instance: Int32Array, size: 2, btype: "INT", bind: g.uniform2iv },
			ivec3: { glsltype: "ivec3", instance: Int32Array, size: 3, btype: "INT", bind: g.uniform3iv },
			ivec4: { glsltype: "ivec4", instance: Int32Array, size: 4, btype: "INT", bind: g.uniform4iv },
			bvec2: { glsltype: "bvec2", instance: Int32Array, size: 2, btype: "INT", bind: g.uniform2iv },
			bvec3: { glsltype: "bvec3", instance: Int32Array, size: 3, btype: "INT", bind: g.uniform3iv },
			bvec4: { glsltype: "bvec4", instance: Int32Array, size: 4, btype: "INT", bind: g.uniform4iv },
			sampler2D: { glsltype: "sampler2D", instance: Image, size: 1, btype: "TEXTURE", bind: g.uniformSampler2D },
			samplerCube: { glsltype: "samplerCube", instance: Image, size: 1, btype: "TEXTURE", bind: null }
		};

		/**
		 * ソースコードから解析した変数のデータ
		 *
		 * - info オブジェクトのキー（"int", "float", "vec3"など）を使用して、いくつかのデータはコピーされる
		 *
		 * @typedef {Object} S3GLShaderData
		 * @property {string} glsltype GLSL型名（例："vec3"）
		 * @property {(typeof Float32Array | typeof Int32Array | Image)} instance 対応TypedArrayコンストラクタまたはImage
		 * @property {number} size 要素数（floatなら1, mat4なら16など）
		 * @property {string} btype 内部データ型区分（"FLOAT", "INT", "TEXTURE"等）
		 * @property {function(WebGLUniformLocation, *):void} bind uniform変数へバインドするための関数
		 * @property {string} name 変数名（例："M"）
		 * @property {string} modifiers 宣言修飾子（例："uniform"）
		 * @property {boolean} is_array 配列かどうか（例：`true`なら配列型）
		 * @property {Array<GLint|WebGLUniformLocation>} location
		 */

		/**
		 * 頂点・フラグメントシェーダ内のattribute/uniform宣言を自動解析し、
		 * 変数型・ロケーションなどを内部情報として登録します。
		 * （通常はgetProgramで自動的に呼び出されます）
		 * @param {string} code シェーダーのGLSLソース
		 * @param {Object<string, S3GLShaderData>} variable 内部変数情報管理オブジェクト
		 * @private
		 */
		this.analysisShader = function (code, variable) {
			// コメントを除去する
			code = code.replace(/\/\/.*/g, "");
			code = code.replace(/\/\*([^*]|\*[^/])*\*\//g, "");
			// 1行ずつ解析
			const codelines = code.split("\n");
			for (let i = 0; i < codelines.length; i++) {
				// uniform vec4 lights[4]; とすると、 uniform,vec4,lights,[4]で区切られる
				const data = codelines[i].match(/(attribute|uniform)\s+(\w+)\s+(\w+)\s*(\[\s*\w+\s*\])?;/);
				if (data === null) {
					continue;
				}
				// 見つけたら変数名や、型を記録しておく
				// 配列数の調査は、定数などを使用されると簡単に調べられないため取得できない
				// そのため自動でテストできないため、bindする際に、正しい配列数の配列をbindすること

				/**
				 * uniform or attribute
				 */
				const text_space = data[1];

				/**
				 * vec4 ...
				 */
				const text_type = data[2];

				/**
				 * 変数名
				 */
				const text_variable = data[3];

				/**
				 * 配列数
				 */
				const text_array = data[4];

				/**
				 * 配列かどうか
				 */
				const is_array = text_array !== undefined;

				// 型に応じたテンプレートを取得する
				// data[1] ... uniform, data[2] ... mat4, data[3] ... M
				const targetinfo = info[text_type];

				variable[text_variable] = {
					glsltype: targetinfo.glsltype, // vec3, mat4 など
					instance: targetinfo.instance, // Float32Array, Int32Array, Image など
					size: targetinfo.size, // 1, 2, 3, 4, 16 など
					btype: targetinfo.btype, // FLOAT, INT, TEXTURE など
					bind: targetinfo.bind, // bind関数（uniform1fvなど）
					name: text_variable, // 変数名（例："M"）
					modifiers: text_space, // uniform, attribute などの修飾子
					is_array: is_array, // 配列かどうか
					location: [] // ロケーション番号（GLのuniformLocationやattributeLocation）
				};
			}
			return;
		};
	}

	/**
	 * 使用するアクティブテクスチャ番号をリセットします。
	 * テクスチャbind前に毎回呼び出し、TEXTUREユニットIDを初期化します。
	 */
	resetActiveTextureId() {
		this.activeTextureId = 0;
	}

	/**
	 * プログラムがすでにGL上でリンク済みかどうか判定します。
	 * @returns {boolean} リンク済みならtrue
	 */
	isLinked() {
		return this.is_linked;
	}

	/**
	 * プログラム・シェーダーを全て解放し、GLリソースも破棄します。
	 * 以後このインスタンスは再利用できません。
	 * @returns {boolean} 正常終了時true、GL未設定時false
	 */
	dispose() {
		const gl = this.sys.getGL();
		if (gl === null) {
			return false;
		}
		if (this.is_linked) {
			this.disuseProgram();
			this.sys.glfunc.deleteProgram(this.program, this.vertex.getShader(), this.fragment.getShader());
			this.program = null;
			this.is_linked = false;
		}
		if (this.vertex !== null) {
			this.vertex.dispose();
			this.vertex = null;
		}
		if (this.fragment !== null) {
			this.fragment.dispose();
			this.fragment = null;
		}
		this._init(this.sys, this.id);
		return true;
	}

	/**
	 * 頂点シェーダを設定します。既存のリンク状態なら設定不可。
	 * @param {string} shader_code GLSLソースコードまたはURL
	 * @returns {boolean} 成功時true、リンク済みまたはDL中はfalse
	 */
	setVertexShader(shader_code) {
		if (this.isLinked()) {
			return false;
		}
		if (this.vertex !== null) {
			this.vertex.dispose();
			this.vertex = null;
		}
		this.vertex = new S3GLShader(this.sys, shader_code);
		this.is_error = false;
		return true;
	}

	/**
	 * フラグメントシェーダを設定します。既存のリンク状態なら設定不可。
	 * @param {string} shader_code GLSLソースコードまたはURL
	 * @returns {boolean} 成功時true、リンク済みまたはDL中はfalse
	 */
	setFragmentShader(shader_code) {
		if (this.isLinked()) {
			return false;
		}
		if (this.fragment !== null) {
			this.fragment.dispose();
			this.fragment = null;
		}
		this.fragment = new S3GLShader(this.sys, shader_code);
		this.is_error = false;
		return true;
	}

	/**
	 * このプログラムをGLでuseProgram（アクティブ化）します。
	 * @returns {boolean} 成功時true
	 */
	useProgram() {
		if (!this.isLinked()) {
			return false;
		}
		const program = this.getProgram();
		if (program && this.sys.getGL()) {
			this.sys.getGL().useProgram(program);
		}
		return true;
	}

	/**
	 * このプログラムの有効化状態を解除します（バッファ属性解放など）。
	 * @returns {boolean} 成功時true
	 */
	disuseProgram() {
		if (!this.isLinked()) {
			return false;
		}
		const gl = this.sys.getGL();
		if (gl) {
			// enable化したデータを解放する
			for (const key in this.enable_vertex_number) {
				if (typeof key === "number") {
					gl.disableVertexAttribArray(key);
				}
			}
			this.enable_vertex_number = {};
		}
		return true;
	}

	/**
	 * プログラムのGLオブジェクト（WebGLProgram）を取得・生成します。
	 * シェーダー・GLの準備やリンク状況など全て検証し、問題なければ生成・返却します。
	 * @returns {?WebGLProgram} GLプログラムオブジェクト（未生成・エラー時はnull）
	 */
	getProgram() {
		const gl = this.sys.getGL();
		// 1度でもエラーが発生したか、glキャンバスの設定をしていない場合
		if (gl === null || this.is_error) {
			return null;
		}
		// ダウンロード中なら無視する
		if (this.isDLVertex || this.isDLFragment) {
			return null;
		}
		// すでにリンク済みのがあれば返す
		if (this.isLinked()) {
			return this.program;
		}
		// シェーダーを取得する
		if (this.vertex === null) {
			console.log("do not set VERTEX_SHADER");
			this.is_error = true;
			return null;
		}
		if (this.fragment === null) {
			console.log("do not set FRAGMENT_SHADER");
			this.is_error = true;
			return null;
		}
		const is_error_vertex = this.vertex.isError();
		const is_error_fragment = this.fragment.isError();
		if (is_error_vertex || is_error_fragment) {
			console.log("shader compile error");
			this.is_error = true;
			return null;
		}
		const shader_vertex = this.vertex.getShader();
		const shader_fragment = this.fragment.getShader();
		if (shader_vertex === null || shader_fragment === null) {
			// まだロードが終わってない可能性あり
			return null;
		}
		if (this.vertex.getShaderType() !== gl.VERTEX_SHADER) {
			console.log("VERTEX_SHADER is not VERTEX_SHADER");
			this.is_error = true;
			return null;
		}
		if (this.fragment.getShaderType() !== gl.FRAGMENT_SHADER) {
			console.log("FRAGMENT_SHADER is not FRAGMENT_SHADER");
			this.is_error = true;
			return null;
		}
		// 取得したシェーダーを用いてプログラムをリンクする
		const data = this.sys.glfunc.createProgram(shader_vertex, shader_fragment);
		if (data.is_error) {
			this.is_error = true;
			return null;
		}
		// リンクが成功したらプログラムの解析しておく
		this.is_linked = true;
		this.program = data.program;
		this.analysisShader(this.vertex.getCode(), this.variable);
		this.analysisShader(this.fragment.getCode(), this.variable);
		return this.program;
	}

	/**
	 * attribute/uniform変数にデータをバインドします。
	 * シェーダー内で使用されている変数名に対し、値・バッファ・テクスチャ等を型に応じて結びつけます。
	 * @param {string} name 変数名（シェーダー内で宣言された名前）
	 * @param {S3GLProgramBindInputData} data バインドしたい値やバッファ、テクスチャなど
	 * @returns {boolean} 正常にバインドできればtrue
	 */
	bindData(name, data) {
		if (!this.isLinked()) {
			return false;
		}
		const gl = this.sys.getGL();
		const prg = this.getProgram();
		const variable = this.variable[name];

		// ---- check Location ----
		if (variable === undefined) {
			// シェーダーでは利用していないものをbindしようとした。
			return false;
		}
		// 長さが0なら位置が未調査なので調査する
		if (variable.location.length === 0) {
			if (variable.modifiers === "attribute") {
				variable.location[0] = gl.getAttribLocation(prg, name);
			} else {
				if (!variable.is_array) {
					variable.location[0] = gl.getUniformLocation(prg, name);
				} else {
					if (Array.isArray(data)) {
						// 配列の場合は、配列の数だけlocationを調査する
						// 予め、シェーダー内の配列数と一致させておくこと
						for (let i = 0; i < data.length; i++) {
							variable.location[i] = gl.getUniformLocation(prg, name + "[" + i + "]");
						}
					}
				}
			}
		}
		if (variable.location[0] === -1) {
			// 変数は宣言されているが、関数の中で使用していないと -1 がかえる
			return false;
		}
		// data が bind できる形になっているか調査する

		// ---- check Type ----
		// glslの型をチェックして自動型変換する

		/**
		 * @typedef {Int32Array|Float32Array|WebGLBuffer|WebGLTexture} S3GLProgramBindData
		 */

		/**
		 * WebGL用のuniform/attributeバインド値として、データ型を自動変換する補助関数。
		 * シェーダー変数の型（glsltype）に応じて、渡された値を適切なTypedArrayや配列に整形します。
		 * 型不一致や未対応型は例外となります。
		 *
		 * @param {Int32Array|Float32Array|WebGLBuffer|WebGLTexture|S3GLArray|S3Matrix|number} data
		 * @returns {S3GLProgramBindData}
		 */
		const toArraydata = function (data) {
			if (data instanceof WebGLBuffer) {
				// VBO型は、無視する
				if (variable.modifiers === "attribute") {
					return data;
				}
			}
			if (data instanceof WebGLTexture) {
				// テクスチャ型なら無視する
				if (variable.glsltype === "sampler2D") {
					return data;
				}
			}
			if (data instanceof variable.instance) {
				// 型と同じインスタンスであるため問題なし
				return data;
			}
			// GL用の型
			if (data instanceof S3GLArray) {
				if (variable.glsltype === data.glsltype) {
					return data.data;
				}
			}
			// 入力型とGLSLが数値系であれば
			if (variable.instance === Float32Array || variable.instance === Int32Array) {
				// 入力型が行列型で
				if (data instanceof S3Matrix) {
					if (variable.glsltype === "mat2" || variable.glsltype === "mat3" || variable.glsltype === "mat4") {
						return data.toInstanceArray(variable.instance, variable.size);
					}
				}
				// 入力型がベクトル型
				if (data instanceof S3Vector) {
					if (
						variable.glsltype === "vec2" ||
						variable.glsltype === "vec3" ||
						variable.glsltype === "vec4" ||
						variable.glsltype === "ivec2" ||
						variable.glsltype === "ivec3" ||
						variable.glsltype === "ivec4" ||
						variable.glsltype === "bvec2" ||
						variable.glsltype === "bvec3" ||
						variable.glsltype === "bvec4"
					) {
						return data.toInstanceArray(variable.instance, variable.size);
					}
				}
				// 入力型が数値型
				if (typeof data === "number") {
					if (variable.glsltype === "int" || variable.glsltype === "float" || variable.glsltype === "bool") {
						return new variable.instance([data]);
					}
				}
			}
			console.log(data);
			throw "not toArraydata";
		};

		// 引数の値をArray型に統一化する
		if (!variable.is_array) {
			data = toArraydata(data);
		} else {
			if (Array.isArray(data)) {
				for (let i = 0; i < data.length; i++) {
					if (variable.location[i] !== -1) {
						// 配列の値が NULL になっているものは調査しない
						if (data[i] !== null) {
							data[i] = toArraydata(data[i]);
						}
					}
				}
			}
		}

		// ---- bind Data ----
		// 装飾子によって bind する方法を変更する
		if (variable.modifiers === "attribute") {
			if (typeof variable.location[0] === "number") {
				// bindしたいデータ
				gl.bindBuffer(gl.ARRAY_BUFFER, data);
				// 有効化していない場合は有効化する
				if (!this.enable_vertex_number[variable.location[0]]) {
					gl.enableVertexAttribArray(variable.location[0]);
					this.enable_vertex_number[variable.location[0]] = true;
				}
				// bind。型は適当に設定
				gl.vertexAttribPointer(
					variable.location[0],
					variable.size,
					variable.btype === "FLOAT" ? gl.FLOAT : gl.SHORT,
					false,
					0,
					0
				);
			} else {
				throw "error location is not number";
			}
		} else {
			// uniform の設定
			if (!variable.is_array) {
				variable.bind(variable.location[0], data);
			} else {
				// 配列の場合は、配列の数だけbindする
				if (Array.isArray(data)) {
					for (let i = 0; i < data.length; i++) {
						if (variable.location[i] !== -1) {
							// 配列の値が NULL になっているものはbindしない
							if (data[i] !== null) {
								variable.bind(variable.location[i], data[i]);
							}
						}
					}
				} else {
					throw "error data is not Array";
				}
			}
		}

		return true;
	}

	/**
	 * メッシュ（S3GLMesh）全体をこのプログラムにバインドします。
	 * 内部でattribute変数とVBO/IBOなどを結び付け、必要なバッファ設定も行います。
	 * @param {S3GLMesh} s3mesh S3GLMesh インスタンス
	 * @returns {number} IBOのインデックス数（drawElements用）
	 */
	bindMesh(s3mesh) {
		if (!this.isLinked()) {
			// programが未作成
			return 0;
		}
		const gl = this.sys.getGL();
		if (gl === null) {
			// glが用意されていない
			return 0;
		}
		const gldata = s3mesh.getGLData();
		if (gldata === null) {
			// 入力値が用意されていない
			return 0;
		}
		// インデックスをセット
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gldata.ibo.data);
		const index_length = gldata.ibo.array_length;
		// 頂点をセット(あらかじめコードから解析した attribute について埋める)
		for (const key in this.variable) {
			if (this.variable[key].modifiers === "uniform") {
				// uniform は共通設定なので省略
				continue;
			}
			// 例えば、vboのリストにあるが、gldata内に情報をもっていない場合がある
			// それは、カメラ用の行列などがあげられる。
			// 逆に、gldata内に情報をもっているが、vbo内に定義されていないのであれば、
			// 使用しない。
			if (gldata.vbo[key] === undefined) {
				continue;
			}
			this.bindData(key, gldata.vbo[key].data);
		}
		// 戻り値でインデックスの長さを返す
		// この長さは、drawElementsで必要のため
		return index_length;
	}
}

/**
 * WebGLレンダリング用のライト（照明）クラス。
 * 基本のS3Lightを拡張し、GL用データ生成や一意ハッシュ生成などのメソッドを提供します。
 */
class S3GLLight extends S3Light {
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

/**
 * WebGL描画用のモデル（Model）クラス。
 * 基本のS3Modelを拡張し、WebGL向けuniformデータの生成（getUniforms）機能を追加します。
 * モデルごとの材質（マテリアル）情報をuniformデータとしてまとめ、GLSLシェーダに渡せる形に整形します。
 */
class S3GLModel extends S3Model {
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

/**
 * WebGL描画用のシーン（Scene）クラス。
 * 基本のS3Sceneを拡張し、WebGL用のuniformデータ生成（getUniforms）などの機能を追加します。
 * カメラやライト情報をGLSLシェーダ向けにuniform変数としてまとめて提供します。
 */
class S3GLScene extends S3Scene {
	/**
	 * シーンを初期化します。
	 * モデル・カメラ・ライトの配列等はS3Sceneに準拠します。
	 */
	constructor() {
		super();
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
		 * @type {Array<S3GLModel>}
		 */
		this.model = [];
		/**
		 * シーン内のライト配列
		 * @type {Array<S3GLLight>}
		 */
		this.light = [];
	}

	/**
	 * シーンにモデルを追加します。
	 * @param {S3GLModel} model 追加する3Dモデル（型はS3Model等を想定）
	 */
	addModel(model) {
		this.model[this.model.length] = model;
	}

	/**
	 * シーンにライトを追加します。
	 * @param {S3GLLight} light 追加するライト（型はS3Light等を想定）
	 */
	addLight(light) {
		this.light[this.light.length] = light;
	}

	/**
	 * シーン内の全モデルを取得します。
	 * @returns {Array<S3GLModel>} モデル配列
	 */
	getModels() {
		return /** @type {Array<S3GLModel>} */ (this.model);
	}

	/**
	 * シーン内の全ライトを取得します。
	 * @returns {Array<S3GLLight>} ライト配列
	 */
	getLights() {
		return /** @type {Array<S3GLLight>} */ (this.light);
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

/**
 * WebGLレンダリングシステムを管理するクラス。
 * シェーダー、テクスチャ、バッファオブジェクトの生成・管理、および描画制御を担当。
 * WebGLの初期化やプログラムのセットアップ、シーンの描画などの処理を含む。
 */
class S3GLSystem extends S3System {
	/**
	 * S3GLSystemインスタンスを生成します。
	 * WebGLコンテキストやプログラムの初期設定を行います。
	 */
	constructor() {
		super();

		/** @type {?S3GLProgram} 現在使用中のプログラム */
		this.program = null;

		/** @type {?WebGLRenderingContext} WebGLレンダリングコンテキスト */
		this.gl = null;

		/** @type {boolean} プログラムがセット済みかどうか */
		this.is_set = false;

		/** @type {Array<S3GLProgram>} 登録されているプログラムのリスト */
		this.program_list = [];

		/** @type {number} プログラムリストの識別ID */
		this.program_listId = 0;

		const that = this;

		/**
		 * @typedef {Object} GLFuncTextureCashEntry
		 * @property {WebGLTexture} texture WebGLテクスチャオブジェクト
		 * @property {number} count このテクスチャの参照カウント
		 */

		/**
		 * テクスチャキャッシュ全体の型定義。
		 * キーがテクスチャID（string）で、値がGLFuncTextureCashEntry型になります。
		 * @typedef {Object.<string, GLFuncTextureCashEntry>} GLFuncTextureCashTable
		 */

		/**
		 * テクスチャキャッシュ情報を管理するオブジェクトです。
		 * キーにテクスチャID（string）を持ち、値は
		 * { texture: WebGLTexture, count: number } のオブジェクト構造で、
		 * 生成済みWebGLTextureの使い回しや参照カウント管理に利用します。
		 *
		 * @type {GLFuncTextureCashTable}
		 */
		const glfunc_texture_cash = {};

		/**
		 * WebGLバッファ、テクスチャ、シェーダを作成・削除するユーティリティ関数群。
		 */
		this.glfunc = {
			/**
			 * 頂点バッファオブジェクト(VBO)を作成します。
			 * @param {Float32Array|Int32Array} data バッファデータ
			 * @returns {?WebGLBuffer} 作成したバッファオブジェクト
			 */
			createBufferVBO: function (data) {
				const gl = that.getGL();
				if (gl === null) {
					return null;
				}
				const vbo = gl.createBuffer();
				gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
				gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
				gl.bindBuffer(gl.ARRAY_BUFFER, null);
				return vbo;
			},

			/**
			 * インデックスバッファオブジェクト(IBO)を作成します。
			 * @param {Int16Array|Uint16Array} data インデックスバッファデータ
			 * @returns {?WebGLBuffer} 作成したインデックスバッファオブジェクト
			 */
			createBufferIBO: function (data) {
				const gl = that.getGL();
				if (gl === null) {
					return null;
				}
				const ibo = gl.createBuffer();
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
				gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
				return ibo;
			},

			/**
			 * 指定されたバッファを削除します。
			 * @param {WebGLBuffer} data 削除するバッファオブジェクト
			 * @returns {boolean} 成功時true
			 */
			deleteBuffer: function (data) {
				const gl = that.getGL();
				if (gl !== null) {
					return false;
				}
				gl.deleteBuffer(data);
				return true;
			},

			/**
			 * テクスチャオブジェクトを作成します。
			 * @param {string} id テクスチャの識別ID
			 * @param {ImageData|HTMLImageElement|HTMLCanvasElement|HTMLVideoElement} image テクスチャ画像
			 * @returns {?WebGLTexture} 作成したテクスチャオブジェクト
			 */
			createTexture: function (id, image) {
				if (
					!(image instanceof ImageData) &&
					!(image instanceof HTMLImageElement) &&
					!(image instanceof HTMLCanvasElement) &&
					!(image instanceof HTMLVideoElement)
				) {
					throw "createBufferTexture";
				}
				const gl = that.getGL();
				if (gl === null) {
					return null;
				}
				let texture = null;
				if (!glfunc_texture_cash[id]) {
					texture = gl.createTexture();
					gl.bindTexture(gl.TEXTURE_2D, texture);
					gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
					gl.generateMipmap(gl.TEXTURE_2D);
					gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
					const cash = {
						texture: texture,
						count: 0
					};
					glfunc_texture_cash[id] = cash;
				}
				texture = glfunc_texture_cash[id].texture;
				glfunc_texture_cash[id].count++;
				return texture;
			},

			/**
			 * 指定されたテクスチャを削除します。
			 * @param {string} id テクスチャの識別ID
			 */
			deleteTexture: function (id) {
				const gl = that.getGL();
				if (gl !== null) {
					if (glfunc_texture_cash[id]) {
						glfunc_texture_cash[id].count--;
						if (glfunc_texture_cash[id].count === 0) {
							gl.deleteTexture(glfunc_texture_cash[id].texture);
							delete glfunc_texture_cash[id];
						}
					}
				}
			},

			/**
			 * シェーダープログラムを作成します。
			 * @param {WebGLShader} shader_vertex 頂点シェーダ
			 * @param {WebGLShader} shader_fragment フラグメントシェーダ
			 * @returns {{program: WebGLProgram, is_error: boolean}} 作成結果
			 */
			createProgram: function (shader_vertex, shader_fragment) {
				const gl = that.getGL();
				if (gl === null) {
					return null;
				}
				let program = gl.createProgram();
				let is_error = false;
				gl.attachShader(program, shader_vertex);
				gl.attachShader(program, shader_fragment);
				gl.linkProgram(program);
				if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
					console.log("link error " + gl.getProgramInfoLog(program));
					gl.detachShader(program, shader_vertex);
					gl.detachShader(program, shader_fragment);
					gl.deleteProgram(program);
					program = null;
					is_error = true;
				}
				return {
					program: program,
					is_error: is_error
				};
			},

			/**
			 * シェーダープログラムを削除します。
			 * @param {WebGLProgram} program 削除するプログラム
			 * @param {WebGLShader} shader_vertex 頂点シェーダ
			 * @param {WebGLShader} shader_fragment フラグメントシェーダ
			 * @returns {boolean} 成功時true
			 */
			deleteProgram: function (program, shader_vertex, shader_fragment) {
				const gl = that.getGL();
				if (gl === null) {
					return false;
				}
				gl.detachShader(program, shader_vertex);
				gl.detachShader(program, shader_fragment);
				gl.deleteProgram(program);
				return true;
			},

			/**
			 * シェーダーを作成します。
			 * @param {number} sharder_type シェーダタイプ(gl.VERTEX_SHADER|gl.FRAGMENT_SHADER)
			 * @param {string} code シェーダのGLSLソースコード
			 * @returns {{shader: WebGLShader, is_error: boolean}} 作成結果
			 */
			createShader: function (sharder_type, code) {
				const gl = that.getGL();
				if (gl === null) {
					return null;
				}
				let shader = gl.createShader(sharder_type);
				let is_error = false;
				gl.shaderSource(shader, code);
				gl.compileShader(shader);
				if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
					console.log("compile error " + gl.getShaderInfoLog(shader));
					gl.deleteShader(shader);
					shader = null;
					is_error = true;
				}
				return {
					shader: shader,
					is_error: is_error
				};
			},

			/**
			 * 指定されたシェーダを削除します。
			 * @param {WebGLShader} shader 削除するシェーダ
			 * @returns {boolean} 成功時true
			 */
			deleteShader: function (shader) {
				const gl = that.getGL();
				if (gl === null) {
					return false;
				}
				gl.deleteShader(shader);
				return true;
			}
		};
	}

	/**
	 * WebGLコンテキストを取得します。
	 * @returns {WebGLRenderingContext} WebGLコンテキスト
	 */
	getGL() {
		return this.gl;
	}

	/**
	 * WebGLコンテキストが設定されているかを確認します。
	 * @returns {boolean} 設定済みの場合true
	 */
	isSetGL() {
		return this.gl !== null;
	}

	/**
	 * 描画対象となるCanvasを設定します。
	 * @param {HTMLCanvasElement} canvas 描画対象のCanvas要素
	 */
	setCanvas(canvas) {
		// 初期化色
		const gl = /** @type {WebGLRenderingContext} */ (
			canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
		);
		this.canvas = canvas;
		this.gl = gl;
	}

	/**
	 * 新しいシェーダープログラムを生成し取得します。
	 * @returns {S3GLProgram} 新規生成されたシェーダープログラム
	 */
	createProgram() {
		const program = new S3GLProgram(this, this.program_listId);
		this.program_list[this.program_listId] = program;
		this.program_listId++;
		return program;
	}

	/**
	 * 登録されている全てのシェーダープログラムを破棄します。
	 */
	disposeProgram() {
		for (const key in this.program_list) {
			this.program_list[key].dispose();
			delete this.program_list[key];
		}
	}

	/**
	 * シェーダープログラムをアクティブにします。
	 * @param {S3GLProgram} glprogram アクティブに設定するシェーダープログラム
	 * @returns {boolean} 設定が成功した場合true
	 */
	setProgram(glprogram) {
		// nullの場合はエラーも無視
		if (glprogram === null) {
			return false;
		}
		// 明確な入力の誤り
		if (!(glprogram instanceof S3GLProgram)) {
			throw new Error("引数がS3GLProgramのインスタンスではありません。");
		}
		// 新規のプログラムなら保持しておく
		if (this.program === null) {
			this.program = glprogram;
		}
		// プログラムが取得できない場合は、ダウンロード中の可能性あり無視する
		const new_program = glprogram.getProgram();
		if (null === new_program) {
			return false;
		}
		// すでに動作中で、設定されているものと同一なら無視する
		if (this.program === glprogram && this.is_set) {
			return true;
		}
		// 新しいプログラムなのでセットする
		if (this.program !== null) {
			this.program.disuseProgram();
		}
		this.program = glprogram;
		this.program.useProgram();
		this.is_set = true;
	}

	/**
	 * 描画クリア処理を行います（背景色・深度バッファのリセット）。
	 * @returns {boolean} 成功時true
	 */
	clear() {
		if (this.gl === null) {
			return false;
		}
		const color = this.getBackgroundColor();
		this.gl.clearColor(color.x, color.y, color.z, color.w);
		this.gl.clearDepth(1.0);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
		return true;
	}

	/**
	 * 指定されたインデックスサイズに基づいて要素を描画します。
	 * @param {number} indexsize インデックスバッファのサイズ
	 * @returns {boolean} 成功時true
	 */
	drawElements(indexsize) {
		if (!this.is_set) {
			return false;
		}
		this.gl.drawElements(this.gl.TRIANGLES, indexsize, this.gl.UNSIGNED_SHORT, 0);
		this.gl.flush();
		return true;
	}

	/**
	 * 指定したWebGLバッファを削除します。
	 * @param {WebGLBuffer} data 削除するバッファオブジェクト
	 * @returns {boolean} 成功時true
	 */
	deleteBuffer(data) {
		if (this.gl === null) {
			return false;
		}
		this.gl.deleteBuffer(data);
		return true;
	}

	/**
	 * 1x1ピクセルのダミーテクスチャ（WebGLTexture）を取得します。
	 * まだ生成されていない場合は新規作成します。テクスチャ未指定時の代替として利用されます。
	 * @returns {WebGLTexture} ダミーテクスチャのWebGLTextureオブジェクト
	 */
	_getDummyTexture() {
		if (this._textureDummyData === undefined) {
			const canvas = document.createElement("canvas");
			canvas.width = 1;
			canvas.height = 1;
			const context = canvas.getContext("2d");
			const imagedata = context.getImageData(0, 0, canvas.width, canvas.height);
			this._textureDummyId = this._createID();
			this._textureDummyData = this.glfunc.createTexture(this._textureDummyId, imagedata);
		}
		return this._textureDummyData;
	}

	/**
	 * 深度バッファのテストモードをWebGLで有効化します。
	 * 通常は自動的に呼ばれます。
	 * @returns {boolean} 成功時true
	 */
	_setDepthMode() {
		if (this.gl === null) {
			return false;
		}
		const gl = this.gl;
		gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LEQUAL);
		return true;
	}

	/**
	 * WebGLのカリングモード（描画面の制御）を設定します。
	 * カリングの有無・前面/背面/両面の設定も行います。
	 * @returns {boolean} 成功時true
	 */
	_setCullMode() {
		if (this.gl === null) {
			return false;
		}
		const gl = this.gl;
		if (this.cullmode === S3System.CULL_MODE.NONE) {
			gl.disable(gl.CULL_FACE);
			return true;
		} else {
			gl.enable(gl.CULL_FACE);
		}
		if (this.frontface === S3System.FRONT_FACE.CLOCKWISE) {
			gl.frontFace(gl.CW);
		} else {
			gl.frontFace(gl.CCW);
		}
		if (this.cullmode === S3System.CULL_MODE.FRONT_AND_BACK) {
			gl.cullFace(gl.FRONT_AND_BACK);
		} else if (this.cullmode === S3System.CULL_MODE.BACK) {
			gl.cullFace(gl.BACK);
		} else if (this.cullmode === S3System.CULL_MODE.FRONT) {
			gl.cullFace(gl.FRONT);
		}
		return true;
	}

	/**
	 * 描画前処理として、アクティブなテクスチャIDをリセットします。
	 * 通常は内部的に呼ばれます。
	 */
	_bindStart() {
		this.program.resetActiveTextureId();
	}

	/**
	 * 描画後処理として、バインド状態の解放やクリーンアップを行います。
	 * （本実装では何もしていません。拡張用）
	 */
	_bindEnd() {}

	/**
	 * モデル・uniforms・名前と値を与えた場合のデータバインド処理を実行します。
	 * - 2引数: シェーダ変数名とデータをバインド
	 * - 1引数: S3GLModelならメッシュ情報をバインド
	 * - 1引数: uniforms情報ならすべてのuniformsをバインド
	 *
	 * @param {...any} args バインド対象
	 * @returns {number} 0以上は成功、モデルの場合はIBOインデックス数（モデルの場合）
	 */
	_bind() {
		if (!this.is_set) {
			return -1;
		}
		const prg = this.program;
		let index_lenght = 0;
		// p1が文字列、p2がデータの場合、データとして結びつける
		if (arguments.length === 2 && typeof arguments[0] === "string") {
			if (!prg.bindData(arguments[0], arguments[1])) {
				return -1;
			}
		}
		// 引数がモデルであれば、モデルとして紐づける
		else if (arguments.length === 1 && arguments[0] instanceof S3GLModel) {
			const mesh = arguments[0].getMesh();
			if (mesh instanceof S3GLMesh) {
				index_lenght = prg.bindMesh(mesh);
			}
		}
		// uniformsデータであれば、内部のデータを全て割り当てる
		else if (arguments.length === 1 && arguments[0].uniforms) {
			const uniforms = arguments[0].uniforms;
			for (const key in uniforms) {
				if (!prg.bindData(key, uniforms[key])) {
					return -1;
				}
			}
		}
		return index_lenght;
	}

	/**
	 * シーン全体を描画します。
	 * プログラム設定や深度・カリングモードの設定、各種Uniformやモデルバインド・描画を自動実行します。
	 * @param {S3GLScene} scene 描画対象のシーン
	 * @returns {void}
	 */
	drawScene(scene) {
		// プログラムを再設定
		this.setProgram(this.program);

		// まだ設定できていない場合は、この先へいかせない
		if (!this.is_set) {
			return;
		}

		// 画面の初期化
		this._setDepthMode();
		this._setCullMode();

		// 描写開始
		this._bindStart();

		// Sceneに関するUniform設定（カメラやライト設定など）
		this._bind(scene.getUniforms());

		// カメラの行列を取得する
		const VPS = scene.getCamera().getVPSMatrix(this.canvas);

		// モデル描写
		const models = scene.getModels();
		for (let i = 0; i < models.length; i++) {
			const model = models[i];
			const mesh = model.getMesh();
			if (mesh.isComplete() === false) {
				continue;
			}

			// モデルに関するUniform設定（材質の設定など）
			this._bind(model.getUniforms());

			// モデル用のBIND
			const M = this.getMatrixWorldTransform(model);
			const MV = this.mulMatrix(M, VPS.LookAt);
			const MVP = this.mulMatrix(MV, VPS.PerspectiveFov);
			this._bind("matrixWorldToLocal4", M.inverse4());
			this._bind("matrixLocalToWorld4", M);
			this._bind("matrixLocalToWorld3", M);
			this._bind("matrixLocalToPerspective4", MVP);

			const indexsize = this._bind(model);
			if (indexsize) {
				this.drawElements(indexsize);
			}
		}

		// 描写終了
		this._bindEnd();
	}

	/**
	 * 不要になったリソースを解放します（未実装）。
	 * @param {Object} obj 解放対象のオブジェクト
	 * @returns {void}
	 */
	_disposeObject(obj) {}

	/**
	 * GL用の頂点インスタンス（S3GLVertex）を生成します。
	 * @param {S3Vector} position 頂点座標
	 * @returns {S3GLVertex} 生成されたGL用頂点
	 */
	createVertex(position) {
		return new S3GLVertex(position);
	}

	/**
	 * GL用の三角形インデックスインスタンスを生成します。
	 * @param {number} i1 頂点1のインデックス
	 * @param {number} i2 頂点2のインデックス
	 * @param {number} i3 頂点3のインデックス
	 * @param {Array<number>} indexlist 頂点インデックス配列
	 * @param {number} [materialIndex] マテリアルインデックス
	 * @param {Array<S3Vector>} [uvlist] UV座標配列
	 * @returns {S3GLTriangleIndex} 生成されたGL用三角形インデックス
	 */
	createTriangleIndex(i1, i2, i3, indexlist, materialIndex, uvlist) {
		return new S3GLTriangleIndex(i1, i2, i3, indexlist, materialIndex, uvlist);
	}

	/**
	 * GL用のテクスチャインスタンスを生成します。
	 * @param {string|ImageData|HTMLImageElement|HTMLCanvasElement|HTMLVideoElement} [name] テクスチャ名や画像データ
	 * @returns {S3GLTexture} 生成されたGL用テクスチャ
	 */
	createTexture(name) {
		return new S3GLTexture(this, name);
	}

	/**
	 * GL用のシーンインスタンスを生成します。
	 * @returns {S3GLScene} 生成されたGL用シーン
	 */
	createScene() {
		return new S3GLScene();
	}

	/**
	 * GL用のモデルインスタンスを生成します。
	 * @returns {S3GLModel} 生成されたGL用モデル
	 */
	createModel() {
		return new S3GLModel();
	}

	/**
	 * GL用のメッシュインスタンスを生成します。
	 * @returns {S3GLMesh} 生成されたGL用メッシュ
	 */
	createMesh() {
		return new S3GLMesh(this);
	}

	/**
	 * GL用のマテリアルインスタンスを生成します。
	 * @param {string} [name] マテリアル名
	 * @returns {S3GLMaterial} 生成されたGL用マテリアル
	 */
	createMaterial(name) {
		return new S3GLMaterial(this, name);
	}

	/**
	 * GL用のライトインスタンスを生成します。
	 * @returns {S3GLLight} 生成されたGL用ライト
	 */
	createLight() {
		return new S3GLLight();
	}

	/**
	 * GL用のカメラインスタンスを生成します。
	 * @returns {S3Camera} 生成されたGL用カメラ
	 */
	createCamera() {
		const camera = new S3Camera(/** @type {S3System} */ (/** @type {unknown} */ (this)));
		return camera;
	}
}

/*
	次のようなデータを入出力できます。
	const sample = {
		Indexes:{
			body:[
				[ 0, 1, 2],
				[ 3, 1, 0],
				[ 3, 0, 2],
				[ 3, 2, 1]
			]
		},
		Vertices:[
			[  0,  0,  -5],
			[  0, 20,  -5],
			[ 10,  0,  -5],
			[  0,  0, -20]
		]
	};
*/

const S3MeshLoaderJSON = {
	/**
	 * メッシュデータの入出力形式名
	 * @type {string}
	 */
	name: "JSON",

	/**
	 * JSONデータをS3Meshへ変換（インポート）します。
	 *
	 * - 頂点配列（Vertices）、面インデックス配列（Indexes）を含むJSONデータを解析し
	 *   S3Meshオブジェクトへ詰め替えます。
	 * - 文字列型なら自動的にJSON.parseします。
	 *
	 * @param {S3System} sys S3Systemインスタンス
	 * @param {S3Mesh} mesh メッシュインスタンス（初期化済み/空状態で渡される）
	 * @param {string|Object} json JSON文字列またはそのオブジェクト
	 * @returns {boolean} パースが成功した場合はtrue
	 *
	 * @example
	 * // 文字列からの直接インポート
	 * S3MeshLoaderJSON.input(sys, mesh, '{"Vertices":[[0,0,0]],"Indexes":{"mat1":[[0,0,0]]}}');
	 */
	input: function (sys, mesh, json) {
		let meshdata;
		if (typeof json === "string") {
			meshdata = JSON.parse(json);
		} else {
			meshdata = json;
		}
		let material = 0;
		// 材質名とインデックスを取得
		for (const materialname in meshdata.Indexes) {
			mesh.addMaterial(sys.createMaterial(materialname));
			const materialindexlist = meshdata.Indexes[materialname];
			for (let i = 0; i < materialindexlist.length; i++) {
				const list = materialindexlist[i];
				for (let j = 0; j < list.length - 2; j++) {
					// 3角形と4角形に対応
					const ti =
						j % 2 === 0
							? sys.createTriangleIndex(j, j + 1, j + 2, list, material)
							: sys.createTriangleIndex(j - 1, j + 1, j + 2, list, material);
					mesh.addTriangleIndex(ti);
				}
			}
			material++;
		}
		// 頂点座標を取得
		for (let i = 0; i < meshdata.Vertices.length; i++) {
			const vector = new S3Vector(meshdata.Vertices[i][0], meshdata.Vertices[i][1], meshdata.Vertices[i][2]);
			const vertex = sys.createVertex(vector);
			mesh.addVertex(vertex);
		}
		return true;
	},

	/**
	 * S3MeshインスタンスをシンプルなJSONオブジェクトに変換（エクスポート）します。
	 *
	 * - 頂点配列・面インデックス配列・マテリアル名などを全てJSONオブジェクト形式で返します。
	 * - マテリアルごとのインデックスリストも整理されます。
	 *
	 * @param {S3Mesh} mesh 出力対象のメッシュ
	 * @returns {string} JSON形式のテキストデータ
	 *
	 * @example
	 * const json = S3MeshLoaderJSON.output(mesh);
	 * // → ファイル保存やエディタ表示などに活用できます
	 */
	output: function (mesh) {
		const vertex = mesh.getVertexArray();
		const triangleindex = mesh.getTriangleIndexArray();
		const material = mesh.getMaterialArray();

		/**
		 * デフォルトのマテリアル情報（必要時に参照される）
		 *
		 * @typedef {Object} MeshLoaderMaterial
		 * @property {string} name 名前
		 * @property {S3Vector} color 拡散反射色
		 * @property {number} diffuse 拡散係数
		 * @property {S3Vector} emission 自己照明色
		 * @property {S3Vector} specular 鏡面反射色
		 * @property {number} power 鏡面反射強度
		 * @property {S3Vector} ambient 環境光色
		 * @property {number} reflect 環境マッピング反射率
		 * @property {null} textureColor 拡散テクスチャ
		 * @property {null} textureNormal 法線マップ
		 */

		/**
		 * @typedef {Object} MeshLoaderMaterialListEntry
		 * @property {MeshLoaderMaterial|S3Material} material マテリアル情報（S3Material型またはDefaultMaterialオブジェクト）
		 * @property {Array<Array<number>>} list そのマテリアルに属する三角形インデックス配列
		 */

		/**
		 * @type {MeshLoaderMaterial}
		 */
		const DefaultMaterial = {
			name: "s3default",
			color: new S3Vector(1.0, 1.0, 1.0, 1.0),
			diffuse: 0.8,
			emission: new S3Vector(0.0, 0.0, 0.0),
			specular: new S3Vector(0.0, 0.0, 0.0),
			power: 5.0,
			ambient: new S3Vector(0.6, 0.6, 0.6),
			reflect: 0.0,
			textureColor: null,
			textureNormal: null
		};

		/**
		 * @type {Array<MeshLoaderMaterialListEntry>}
		 */
		const material_vertexlist = [];
		const material_length = material.length !== 0 ? material.length : 1;
		const default_material = DefaultMaterial;
		// 材質リストを取得
		for (let i = 0; i < material_length; i++) {
			material_vertexlist[i] = {
				material: material[i] ? material[i] : default_material,
				list: []
			};
		}
		// 材質名に合わせて、インデックスリストを取得
		for (let i = 0; i < triangleindex.length; i++) {
			const ti = triangleindex[i];
			material_vertexlist[ti.materialIndex].list.push(ti.index);
		}
		const output = [];
		output.push("{");
		output.push("\tIndexes:{");
		for (let i = 0; i < material_vertexlist.length; i++) {
			const mv = material_vertexlist[i];
			output.push("\t\t" + mv.material.name + ":[");
			for (let j = 0; j < mv.list.length; j++) {
				const vi = mv.list[j];
				output.push(
					"\t\t\t[" + vi[0] + " " + vi[1] + " " + vi[2] + "]" + (j === mv.list.length - 1 ? "" : ",")
				);
			}
			output.push("\t\t]" + (i === material_vertexlist.length - 1 ? "" : ","));
		}
		output.push("\t},");
		output.push("\tVertices:[");
		for (let i = 0; i < vertex.length; i++) {
			const vp = vertex[i].position;
			output.push("\t\t[" + vp.x + " " + vp.y + " " + vp.z + "]" + (i === vertex.length - 1 ? "" : ","));
		}
		output.push("\t]");
		output.push("}");
		return output.join("\n");
	}
};

/**
 * パス名操作・ファイルパスの解決用ヘルパークラス
 *
 * - MQOファイル内や外部ファイルへの参照（テクスチャパス等）を絶対パスに変換するために利用されます。
 * - `getAbsolutePath()` でファイルの絶対パスを計算し、`getParent()` で親ディレクトリのパスも取得できます。
 * - 内部的にパスの区切りを正規化（バックスラッシュ→スラッシュ）します。
 */
class File {
	/**
	 * ファイルインスタンスを生成します。
	 * @param {string} pathname ファイルパスやURL
	 */
	constructor(pathname) {
		/**
		 * 正規化済みパス
		 * @type {string}
		 */
		this.pathname = pathname.replace(/\\/g, "/");
	}

	/**
	 * ファイルの絶対パスを取得します。
	 * - http(s)の場合はそのまま
	 * - 相対パスの場合は現在のURLから解決
	 *
	 * @returns {string} 絶対パス（URL形式）
	 */
	getAbsolutePath() {
		if (/$http/.test(this.pathname)) {
			return this.pathname;
		}
		let name = window.location.toString();
		if (!/\/$/.test(name)) {
			name = name.match(/.*\//)[0];
		}
		const namelist = this.pathname.split("/");
		for (let i = 0; i < namelist.length; i++) {
			if (namelist[i] === "" || namelist[i] === ".") {
				continue;
			}
			if (namelist[i] === "..") {
				name = name.substring(0, name.length - 1).match(/.*\//)[0];
				continue;
			}
			name += namelist[i];
			if (i !== namelist.length - 1) {
				name += "/";
			}
		}
		return name;
	}

	/**
	 * 親ディレクトリのパスを取得します。
	 * @returns {string} 親ディレクトリの絶対パス
	 */
	getParent() {
		const x = this.getAbsolutePath().match(/.*\//)[0];
		return x.substring(0, x.length - 1);
	}
}

/**
 * Metasequoia（MQO）形式による3DCGメッシュデータの入出力ユーティリティ
 *
 * - S3MeshLoader.TYPE.MQO として S3MeshLoader から利用されます。
 * - メタセコイア（*.mqo）フォーマットのテキストをS3Meshに変換（インポート）、またはS3Meshからテキスト出力（エクスポート）します。
 * - 標準的なMQOの構文に加え、一部簡易パース（手動修正を要する場合もあり）。
 *
 * ※ テクスチャやUV、マテリアルの色・強度なども一部対応しています。
 */
const S3MeshLoaderMQO = {
	/**
	 * メッシュデータの入出力形式名
	 * @type {string}
	 */
	name: "MQO",

	/**
	 * Metasequoia（MQO）形式のテキストをS3Meshインスタンスに変換します（インポート）。
	 * ただしある程度手動で修正しないといけません。
	 *
	 * - MQO形式のテキスト（またはURL経由でダウンロード済みのテキスト）を解析し、
	 *   頂点・三角形面・マテリアル等をS3Meshに格納します。
	 * - テクスチャ名・UV座標・マテリアル強度・色・発光・反射等にも部分的に対応しています。
	 * - ファイル内の階層（オブジェクトブロック）・面（face）・材質（Material）を検出してパースします。
	 *
	 * @param {S3System} sys S3Systemインスタンス
	 * @param {S3Mesh} mesh メッシュインスタンス（空の状態で渡される）
	 * @param {string} text MQOファイル内容（テキスト）
	 * @param {string} [url] オプション: ファイルURLやパス
	 * @returns {boolean} パース成功時はtrue
	 *
	 * @example
	 * S3MeshLoaderMQO.input(sys, mesh, mqotext);
	 */
	input: function (sys, mesh, text, url) {
		let mqofile = null;
		let parent_dir = "./";
		if (url) {
			mqofile = new File(url);
			parent_dir = mqofile.getParent() + "/";
		}

		const lines = text.split("\n");
		const block_stack = [];
		let block_type = "none";
		/**
		 * 半角スペース区切りの文字列数値を数値型配列に変換します。
		 *
		 * @param {string} text 変換対象の文字列（例："1.0 2.5 3.14"）
		 * @returns {Array<number>} 数値型の配列
		 */
		const toNumberArray = function (text) {
			const x = text.split(" "),
				out = [];
			for (let i = 0; i < x.length; i++) {
				out[i] = parseFloat(x[i]);
			}
			return out;
		};

		/**
		 * "func(XXX)" の形式から、指定パラメータ名 parameter の括弧内の値を抜き出します。
		 *
		 * @param {string} text 対象となる1行分のテキスト
		 * @param {string} parameter 抜き出したいパラメータ名
		 * @returns {string} パラメータの中身
		 */
		const getValueFromPrm = function (text, parameter) {
			const x = text.split(" " + parameter + "(");
			if (x.length === 1) {
				return null; // パラメータが見つからない場合はnullを返す
			}
			return x[1].split(")")[0];
		};

		/**
		 * "func(XXX)" の形式から、数値パラメータを配列として取得します。
		 *
		 * @param {string} text 対象となる1行分のテキスト
		 * @param {string} parameter 抜き出したいパラメータ名
		 * @returns {Array<number>} 数値型配列（見つからなければ空配列）
		 */
		const getNumberFromPrm = function (text, parameter) {
			const value = getValueFromPrm(text, parameter);
			if (value === null) {
				return [];
			}
			return toNumberArray(value);
		};

		/**
		 * "func(XXX)" の形式から、ダブルクォート囲みのURLやファイル名を抽出します。
		 *
		 * @param {string} text 対象となる1行分のテキスト
		 * @param {string} parameter 抜き出したいパラメータ名
		 * @returns {string|null} 抜き出したURL文字列、またはnull（見つからなければ）
		 */
		const getURLFromPrm = function (text, parameter) {
			const value = getValueFromPrm(text, parameter);
			if (value === null) {
				return null;
			}
			const x = value.split('"');
			if (x.length !== 3) {
				return null;
			}
			return x[1];
		};
		// メインのパース処理
		for (let i = 0; i < lines.length; i++) {
			const trim_line = lines[i].replace(/^\s+|\s+$/g, "");
			const first = trim_line.split(" ")[0];
			if (trim_line.indexOf("{") !== -1) {
				// 階層に入る前の位置を保存
				block_stack.push(block_type);
				block_type = first;
				continue;
			} else if (trim_line.indexOf("}") !== -1) {
				block_type = block_stack.pop();
				continue;
			}
			if (block_type === "Thumbnail" || block_type === "none") {
				continue;
			}
			if (block_type === "Material") {
				const material_name = first.replace(/"/g, "");
				const material = sys.createMaterial();
				material.setName(material_name);
				let val;
				val = getNumberFromPrm(trim_line, "col");
				if (val.length !== 0) {
					material.setColor(new S3Vector(val[0], val[1], val[2], val[3]));
				}
				val = getNumberFromPrm(trim_line, "dif");
				if (val.length !== 0) {
					material.setDiffuse(val[0]);
				}
				val = getNumberFromPrm(trim_line, "amb");
				if (val.length !== 0) {
					material.setAmbient(new S3Vector(val[0], val[0], val[0]));
				}
				val = getNumberFromPrm(trim_line, "amb_col");
				if (val.length !== 0) {
					material.setAmbient(new S3Vector(val[0], val[1], val[2]));
				}
				val = getNumberFromPrm(trim_line, "emi");
				if (val.length !== 0) {
					material.setEmission(new S3Vector(val[0], val[0], val[0]));
				}
				val = getNumberFromPrm(trim_line, "emi_col");
				if (val.length !== 0) {
					material.setEmission(new S3Vector(val[0], val[1], val[2]));
				}
				val = getNumberFromPrm(trim_line, "spc");
				if (val.length !== 0) {
					material.setSpecular(new S3Vector(val[0], val[0], val[0]));
				}
				val = getNumberFromPrm(trim_line, "spc_col");
				if (val.length !== 0) {
					material.setSpecular(new S3Vector(val[0], val[1], val[2]));
				}
				val = getNumberFromPrm(trim_line, "power");
				if (val.length !== 0) {
					material.setPower(val[0]);
				}
				val = getNumberFromPrm(trim_line, "reflect");
				if (val.length !== 0) {
					material.setReflect(val[0]);
				}
				val = getURLFromPrm(trim_line, "tex");
				if (val) {
					material.setTextureColor(parent_dir + val);
				}
				val = getURLFromPrm(trim_line, "bump");
				if (val) {
					material.setTextureNormal(parent_dir + val);
				}
				mesh.addMaterial(material);
			} else if (block_type === "vertex") {
				const words = toNumberArray(trim_line);
				const vector = new S3Vector(words[0], words[1], words[2]);
				const vertex = sys.createVertex(vector);
				mesh.addVertex(vertex);
			} else if (block_type === "face") {
				const facenum = parseInt(first);
				const v = getNumberFromPrm(trim_line, "V");
				const uv_a = getNumberFromPrm(trim_line, "UV");
				const uv = [];
				const material_array = getNumberFromPrm(trim_line, "M");
				const material = material_array.length === 0 ? 0 : material_array[0];
				if (uv_a.length !== 0) {
					for (let j = 0; j < facenum; j++) {
						uv[j] = new S3Vector(uv_a[j * 2], uv_a[j * 2 + 1], 0);
					}
				}
				for (let j = 0; j < facenum - 2; j++) {
					const ti =
						j % 2 === 0
							? sys.createTriangleIndex(j, j + 1, j + 2, v, material, uv)
							: sys.createTriangleIndex(j - 1, j + 1, j + 2, v, material, uv);
					mesh.addTriangleIndex(ti);
				}
			}
		}
		return true;
	},

	/**
	 * S3MeshインスタンスをMetasequoia（MQO）形式のテキストに変換します（エクスポート）。
	 * ただしある程度手動で修正しないといけません。
	 *
	 * - MQO形式に従い、頂点座標・面情報・マテリアル情報等を出力します。
	 * - テクスチャやUV・発光などの追加情報も一部対応。
	 * - 出力後のテキストは、必要に応じて手動修正で他のソフトへインポート可能です。
	 *
	 * @param {S3Mesh} mesh 出力対象のメッシュ
	 * @returns {string} MQOフォーマットのテキストデータ
	 *
	 * @example
	 * const mqotext = S3MeshLoaderMQO.output(mesh);
	 */
	output: function (mesh) {
		const output = [];
		const vertex = mesh.getVertexArray();
		const triangleindex = mesh.getTriangleIndexArray();
		const material = mesh.getMaterialArray();

		// ヘッダ
		output.push("Metasequoia Document");
		output.push("Format Text Ver 1.0");
		output.push("");
		output.push("Scene {");
		output.push("	pos 0 0 1500");
		output.push("	lookat 0 0 0");
		output.push("	head -0.5236");
		output.push("	pich 0.5236");
		output.push("	ortho 0");
		output.push("	zoom2 5.0000");
		output.push("	amb 0.250 0.250 0.250");
		output.push("}");

		// 材質の出力
		output.push("Material " + material.length + " {");
		for (let i = 0; i < material.length; i++) {
			const mv = material[i];
			//  こんな感じにする必要がある・・・
			// "mat" shader(3) col(1.000 1.000 1.000 0.138) dif(0.213) amb(0.884) emi(0.301) spc(0.141) power(38.75) amb_col(1.000 0.996 0.000) emi_col(1.000 0.000 0.016) spc_col(0.090 0.000 1.000) reflect(0.338) refract(2.450)
			output.push(
				'\t"' +
					mv.name +
					'" col(1.000 1.000 1.000 1.000) dif(0.800) amb(0.600) emi(0.000) spc(0.000) power(5.00)'
			);
		}
		output.push("}");

		// オブジェクトの出力
		output.push('Object "obj1" {');
		{
			// 頂点の出力
			output.push("\tvertex " + vertex.length + " {");
			for (let i = 0; i < vertex.length; i++) {
				const vp = vertex[i].position;
				output.push("\t\t" + vp.x + " " + vp.y + " " + vp.z);
			}
			output.push("}");

			// 面の定義
			output.push("\tface " + triangleindex.length + " {");
			for (let i = 0; i < triangleindex.length; i++) {
				const ti = triangleindex[i];
				let line = "\t\t3";
				// 座標と材質は必ずある
				line += " V(" + ti.index[0] + " " + ti.index[1] + " " + ti.index[2] + ")";
				line += " M(" + ti.materialIndex + ")";
				// UVはないかもしれないので、条件を付ける
				if (ti.uv !== undefined && ti.uv[0] !== null) {
					line +=
						" UV(" +
						ti.uv[0].x +
						" " +
						ti.uv[0].y +
						" " +
						ti.uv[1].x +
						" " +
						ti.uv[1].y +
						" " +
						ti.uv[2].x +
						" " +
						ti.uv[2].y +
						")";
				}
				output.push(line);
			}
		}
		output.push("\t}");

		output.push("}");

		// End
		output.push("Eof\n");
		return output.join("\n");
	}
};

/**
 * Wavefront OBJ形式による3DCGメッシュデータの入出力ユーティリティ
 *
 * - S3MeshLoader.TYPE.OBJ として S3MeshLoader から利用されます。
 * - OBJ形式のテキストをS3Meshに変換（インポート）、またはS3Meshからテキスト出力（エクスポート）する機能を提供します。
 * - 頂点（v）、テクスチャ座標（vt）、法線（vn）、面（f）などの基本要素をサポート。
 * - 複数マテリアルやUV座標にも対応しています。
 */
const S3MeshLoaderOBJ = {
	/**
	 * フォーマット名（定数："OBJ"）
	 * @type {string}
	 */
	name: "OBJ",

	/**
	 * Wavefront OBJ形式のテキストをS3Meshインスタンスへ変換します（インポート）。
	 * v 頂点
	 * vt テクスチャ
	 * vn テクスチャ
	 * f 面
	 *
	 * - OBJテキスト（またはダウンロード済みテキスト）を解析し、頂点・三角形面・マテリアル情報等をS3Meshに格納します。
	 * - "v"（頂点）・"vt"（テクスチャ座標）・"vn"（法線）・"f"（面）などの行に対応します。
	 * - 複数マテリアル、テクスチャ座標付き面、法線情報付き面にも対応。
	 * - 頂点番号・UVインデックス・マテリアルインデックス等の自動変換を行います。
	 *
	 * @param {S3System} sys S3Systemインスタンス
	 * @param {S3Mesh} mesh メッシュインスタンス（空の状態で渡される）
	 * @param {string} text OBJファイル内容（テキスト）
	 * @returns {boolean} パース成功時はtrue
	 *
	 * @example
	 * S3MeshLoaderOBJ.input(sys, mesh, objtext);
	 */
	input: function (sys, mesh, text) {
		// 文字列解析
		const lines = text.split("\n");

		/**
		 * 頂点のリスト
		 * @type {Array<S3Vector>}
		 */
		const v_list = [];

		/**
		 * テクスチャ座標のリスト
		 * @type {Array<[S3Vector, number]>}
		 */
		const vt_list = [];
		const face_v_list = [];
		const face_vt_list = [];
		let material_count = 1;
		for (let i = 0; i < lines.length; i++) {
			// コメントより前の文字を取得
			const line = lines[i].split("#")[0].trim();

			if (line.length === 0) {
				// 空白なら何もしない
				continue;
			}

			/**
			 * @type {Array<string>}
			 */
			const data = line.split(" ");
			if (data[0] === "v") {
				// vertex
				const x = parseFloat(data[1]);
				const y = parseFloat(data[2]);
				const z = parseFloat(data[3]);
				const v = new S3Vector(x, y, z);
				v_list.push(v);
			} else if (data[0] === "vt") {
				// texture
				const u = parseFloat(data[1]);
				const v = parseFloat(data[2]);
				// 1より大きい場合は素材が違う
				const mat = Math.floor(v);
				const vt = new S3Vector(u, 1.0 - (v - mat)); // Vは反転させる
				vt_list.push([vt, mat]);
				if (material_count <= mat + 1) {
					material_count = mat + 1;
				}
			} else if (data[0] === "vn") {
				// normal
				new S3Vector(parseFloat(data[1]), parseFloat(data[2]), parseFloat(data[3]));
			} else if (data[0] === "f") {
				// face
				const vcount = data.length - 3; // 繰り返す回数
				const f1 = data[1];
				const f2 = data[2];
				const f3 = data[3];
				const f4 = vcount === 2 ? data[4] : "0";
				for (let j = 0; j < vcount; j++) {
					/**
					 * @type {Array<string>}
					 */
					const fdata = [];
					if (j % 2 === 0) {
						fdata[2] = f1;
						fdata[1] = f2;
						fdata[0] = f3;
					} else {
						fdata[2] = f1;
						fdata[1] = f3;
						fdata[0] = f4;
					}
					const face_v = [];
					const face_vt = [];
					const face_vn = [];
					// 数字は1から始まるので、1を引く
					for (let k = 0; k < 3; k++) {
						const indexdata = fdata[k].split("/");
						if (indexdata.length === 1) {
							// 頂点インデックス
							face_v[k] = parseInt(indexdata[0], 10) - 1;
						} else if (indexdata.length === 2) {
							// 頂点テクスチャ座標インデックス
							face_v[k] = parseInt(indexdata[0], 10) - 1;
							face_vt[k] = parseInt(indexdata[1], 10) - 1;
						} else if (indexdata.length === 3) {
							if (indexdata[1].length !== 0) {
								// 頂点法線インデックス
								face_v[k] = parseInt(indexdata[0], 10) - 1;
								face_vt[k] = parseInt(indexdata[1], 10) - 1;
								face_vn[k] = parseInt(indexdata[2], 10) - 1;
							} else {
								// テクスチャ座標インデックス無しの頂点法線インデックス
								face_v[k] = parseInt(indexdata[0], 10) - 1;
								face_vt[k] = null;
								face_vn[k] = parseInt(indexdata[2], 10) - 1;
							}
						}
					}
					face_v_list.push(face_v);
					face_vt_list.push(face_vt);
				}
			}
		}

		// 変換
		// マテリアルの保存
		for (let i = 0; i < material_count; i++) {
			const material = sys.createMaterial("" + i);
			mesh.addMaterial(material);
		}

		// 頂点の保存
		for (let i = 0; i < v_list.length; i++) {
			const vertex = sys.createVertex(v_list[i]);
			mesh.addVertex(vertex);
		}

		// インデックスの保存
		for (let i = 0; i < face_v_list.length; i++) {
			// UV情報から材質などを作成
			const vt_num = face_vt_list[i];
			let mat = 0;
			let uv = undefined;
			if (vt_num) {
				const uvm0 = vt_list[vt_num[0]];
				const uvm1 = vt_list[vt_num[1]];
				const uvm2 = vt_list[vt_num[2]];
				mat = uvm0[1];
				uv = [uvm0[0], uvm1[0], uvm2[0]];
			}
			// 追加
			const triangle = sys.createTriangleIndex(0, 1, 2, face_v_list[i], mat, uv);
			mesh.addTriangleIndex(triangle);
		}

		return true;
	}
};

/**
 * メッシュデータの入出力用関数定義
 * @typedef {Object} MeshLoaderDataIOFunvction
 * @property {string} name 入出力形式の名前（"JSON", "MQO", "OBJ"など）
 * @property {function(S3System, S3Mesh, string, string=): boolean} input テキストをインスタンスへ変換する
 * @property {function(S3Mesh): string} [output] インスタンスをテキストへ出力する
 */

/**
 * メッシュデータの入出力用関数定義オブジェクト
 * @typedef {Object} MeshLoaderDataIOFunvctions
 * @property {MeshLoaderDataIOFunvction} JSON
 * @property {MeshLoaderDataIOFunvction} MQO
 * @property {MeshLoaderDataIOFunvction} OBJ
 */

/**
 * @type {Array<MeshLoaderDataIOFunvction>}
 */
const DATA_IO_FUNCTION = [S3MeshLoaderJSON, S3MeshLoaderMQO, S3MeshLoaderOBJ];

/**
 * 3DCGメッシュデータの入出力を管理するローダー
 *
 * MQO/OBJ/JSONなど、各種3DフォーマットからS3Meshインスタンスへの変換（インポート）、
 * およびS3Meshから各形式へのエクスポート（出力）をまとめて扱うユーティリティオブジェクトです。
 *
 * 利用例:
 *   - ファイルの拡張子や種類ごとにパースしてS3Meshを構築
 *   - S3Meshを指定形式でテキスト化
 *   - 各形式への入出力用コールバックを内部で管理
 */
const S3MeshLoader = {
	/**
	 * 任意の3Dデータを指定形式でS3Meshに変換（インポート）します。
	 *
	 * - 文字列（URL）の場合はダウンロードして自動的にインポート
	 * - テキスト／データ本体の場合は直接パース
	 * - コールバックを指定すると非同期処理後に呼ばれます
	 *
	 * @param {S3System} s3system S3Systemインスタンス（S3Mesh生成等に必要）
	 * @param {string|Object} data 3Dデータ本体またはデータ取得用URL
	 * @param {string} [type] データの拡張子（"JSON", "MQO", "OBJ"）, data がURLの場合は自動判別されます。
	 * @param {function(S3Mesh):void} [callback] データインポート後に呼ばれるコールバック（省略時は即時同期）
	 * @returns {S3Mesh} 生成されたS3Meshインスタンス（非同期時も仮のインスタンスを返す）
	 */
	inputData: function (s3system, data, type, callback) {
		const s3mesh = s3system.createMesh();
		let this_type = type ? type.toUpperCase() : "";

		/**
		 * データ本体を指定フォーマットでS3Meshに変換し、必要ならコールバックを呼び出します。
		 *
		 * @param {string|any} ldata 3Dデータ本体（テキストまたはJSONなど）
		 * @param {string} url データ取得元URL（直接データの場合は空文字列）
		 */
		const load = function (ldata, url) {
			s3mesh._init();
			for (let i = 0; i < DATA_IO_FUNCTION.length; i++) {
				if (DATA_IO_FUNCTION[i].name === this_type) {
					const isLoad = DATA_IO_FUNCTION[i].input(s3system, s3mesh, ldata, url);
					s3mesh.setComplete(isLoad);
					if (callback) {
						callback(s3mesh);
					}
				}
			}
		};
		/**
		 * データのダウンロード完了時に呼ばれるコールバック関数。
		 * ダウンロードしたテキストデータを `load` 関数へ渡し、メッシュへのインポート処理を行います。
		 * @param {string} text 取得した3Dデータ本体（テキストデータ）
		 */
		const downloadCallback = function (text) {
			load(text, typeof data === "string" ? data : undefined);
		};
		// 文字列がある場合
		if (typeof data === "string" && data.indexOf("\n") === -1) {
			// 拡張子が設定されている場合
			if (data.indexOf(".") !== -1) {
				const ext = data.split(".").pop();
				for (let i = 0; i < DATA_IO_FUNCTION.length; i++) {
					if (DATA_IO_FUNCTION[i].name === ext.toUpperCase()) {
						this_type = ext.toUpperCase();
						s3system._download(data, downloadCallback);
					}
				}
			}
		}
		load(data, "");
		return s3mesh;
	},

	/**
	 * S3Meshインスタンスを指定フォーマットでエクスポート（テキスト化）します。
	 *
	 * @param {S3Mesh} s3mesh 出力対象のメッシュ
	 * @param {string} type 出力の形式（"JSON"、"MQO"、"OBJ" など）
	 * @returns {string} 指定フォーマットのテキストデータ
	 */
	outputData: function (s3mesh, type) {
		for (let i = 0; i < DATA_IO_FUNCTION.length; i++) {
			if (DATA_IO_FUNCTION[i].name === type.toUpperCase()) {
				if (DATA_IO_FUNCTION[i].output) {
					return DATA_IO_FUNCTION[i].output(s3mesh);
				}
			}
		}
		return null;
	}
};

/**
 * 3DCG用の平面クラス
 * 法線ベクトルと距離または平面上の1点から平面を定義します。
 */
class S3Plane {
	/**
	 * 平面を作成します。
	 * @param {S3Vector} n 平面の法線ベクトル
	 * @param {number|S3Vector} d 原点からの距離、または平面上の任意の点
	 */
	constructor(n, d) {
		if (d instanceof S3Vector) {
			/**
			 * 平面の法線ベクトル
			 * @type {S3Vector}
			 */
			this.n = n;

			/**
			 * 原点からの距離
			 * @type {number}
			 */
			this.d = this.n.dot(d);
		} else {
			this.n = n;
			this.d = d;
		}
	}

	/**
	 * 任意の点から平面への距離を求めます。
	 * @param {S3Vector} position 点の座標
	 * @returns {number} 平面までの距離
	 */
	getDistance(position) {
		return position.dot(this.n) - this.d;
	}

	/**
	 * 任意の点から最も近い平面上の点を求めます。
	 * @param {S3Vector} position 点の座標
	 * @returns {S3Vector} 平面上の最も近い点
	 */
	getNearestPoint(position) {
		return this.n.mul(-this.getDistance(position)).add(position);
	}

	/**
	 * 点が平面の内側（法線方向の裏側）にあるか判定します。
	 * @param {S3Vector} position 点の座標
	 * @returns {boolean} 内側ならtrue
	 */
	isHitPosition(position) {
		return this.getDistance(position) < 0;
	}

	/**
	 * 平面を文字列に変換します。
	 * @returns {string} 平面の情報を表す文字列
	 */
	toString() {
		return "Plane(" + this.n.toString() + ", [" + this.d + "])";
	}
}

/**
 * IDSwitch.js
 *
 * @module InputDetect
 * @author natade (https://github.com/natade-jp)
 * @license MIT
 */

/**
 * スイッチ（ボタン）の押下状態を管理するクラスです。
 * ボタンの押下・離す・押し続け・押した瞬間・離した瞬間など、さまざまなスイッチの状態を判定できます。
 */
class IDSwitch {
	/**
	 * 押す、離すが可能なボタンスイッチの状態管理クラス
	 * @constructor
	 */
	constructor() {
		this._initIDSwitch();
	}

	/**
	 * スイッチの状態を初期化します。
	 * @private
	 */
	_initIDSwitch() {
		/**
		 * 押した瞬間にtrueになります（1フレームのみ）
		 * @type {boolean}
		 */
		this.istyped = false;

		/**
		 * 押している間trueになります（押しっぱなし判定）
		 * @type {boolean}
		 */
		this.ispressed = false;

		/**
		 * 離した瞬間にtrueになります（1フレームのみ）
		 * @type {boolean}
		 */
		this.isreleased = false;

		/**
		 * 押している時間（フレーム数）
		 * @type {number}
		 */
		this.pressed_time = 0;
	}

	/**
	 * このスイッチの状態をコピーした新しいインスタンスを返します。
	 * @returns {IDSwitch} 複製したIDSwitchインスタンス
	 */
	clone() {
		const ret = new IDSwitch();
		ret.istyped = this.istyped;
		ret.ispressed = this.ispressed;
		ret.isreleased = this.isreleased;
		ret.pressed_time = this.pressed_time;
		return ret;
	}

	/**
	 * ボタンが押されたことを記録します。
	 * 1フレーム目はistyped、以降はispressedがtrueになります。
	 */
	keyPressed() {
		if (!this.ispressed) {
			this.istyped = true;
		}
		this.ispressed = true;
		this.pressed_time++;
	}

	/**
	 * ボタンが離されたことを記録します。
	 * isreleasedがtrueになり、ispressedがfalseになります。
	 */
	keyReleased() {
		this.ispressed = false;
		this.isreleased = true;
		this.pressed_time = 0;
	}

	/**
	 * フォーカスが外れた場合に状態をリセットします。
	 */
	focusLost() {
		this.keyReleased();
	}

	/**
	 * 他のIDSwitchインスタンスへ現在のスイッチ状態を渡します。
	 * 1フレームごとに必要な値だけを転送し、istyped/isreleasedはfalse化されます。
	 * @param {IDSwitch} c - 情報を受け取るIDSwitchインスタンス
	 * @throws {string} - cがIDSwitchのインスタンスでない場合
	 */
	pickInput(c) {
		if (!(c instanceof IDSwitch)) {
			throw "IllegalArgumentException";
		}
		c.ispressed = this.ispressed;
		c.istyped = this.istyped;
		c.isreleased = this.isreleased;
		c.pressed_time = this.pressed_time;
		this.isreleased = false;
		this.istyped = false;
	}
}

/**
 * IDPosition.js
 *
 * @module InputDetect
 * @author natade (https://github.com/natade-jp)
 * @license MIT
 */

/**
 * 位置情報を管理するクラスです。
 * x, y座標の操作や、座標同士の加算・減算、クローン生成などの機能を持ちます。
 */
class IDPosition {
	/**
	 * x座標
	 * @type {number}
	 */
	x = 0;

	/**
	 * y座標
	 * @type {number}
	 */
	y = 0;

	/**
	 * 位置情報を表すクラス
	 * @param {Number|IDPosition} [x] - x座標 または IDPositionインスタンス
	 * @param {Number} [y] - y座標
	 * @constructor
	 */
	constructor(x, y) {
		this._initIDPosition(x, y);
	}

	/**
	 * 内部的に位置情報を初期化します。
	 * @param {Number|IDPosition} [x] - x座標 または IDPositionインスタンス
	 * @param {Number} [y] - y座標
	 */
	_initIDPosition(x, y) {
		if (x instanceof IDPosition) {
			const position = x;
			this.set(position);
		} else if (x === undefined) {
			this.x = 0;
			this.y = 0;
		} else if (arguments.length === 2) {
			this.set(x, y);
		} else {
			this.x = 0;
			this.y = 0;
		}
	}

	/**
	 * このインスタンスのコピーを生成します。
	 * @returns {IDPosition} 複製したIDPosition
	 */
	clone() {
		const ret = new IDPosition(this);
		return ret;
	}

	/**
	 * 座標値を設定します。
	 * @param {Number|IDPosition} x - x座標 または IDPositionインスタンス
	 * @param {Number} [y] - y座標
	 */
	set(x, y) {
		if (x instanceof IDPosition) {
			const position = x;
			this.x = position.x;
			this.y = position.y;
		} else {
			this.x = x;
			this.y = y;
		}
	}

	/**
	 * 座標値を加算します。
	 * @param {Number|IDPosition} x - 加算するx座標 または IDPositionインスタンス
	 * @param {Number} [y] - 加算するy座標
	 */
	add(x, y) {
		if (x instanceof IDPosition) {
			const position = x;
			this.x += position.x;
			this.y += position.y;
		} else {
			this.x += x;
			this.y += y;
		}
	}

	/**
	 * 座標値を減算します。
	 * @param {Number|IDPosition} x - 減算するx座標 または IDPositionインスタンス
	 * @param {Number} [y] - 減算するy座標
	 */
	sub(x, y) {
		if (x instanceof IDPosition) {
			const position = x;
			this.x -= position.x;
			this.y -= position.y;
		} else {
			this.x -= x;
			this.y -= y;
		}
	}

	/**
	 * 2点間の距離（ノルム）を計算します。
	 * @param {IDPosition} p1 - 1点目の座標
	 * @param {IDPosition} p2 - 2点目の座標
	 * @returns {Number} 2点間のユークリッド距離
	 */
	static norm(p1, p2) {
		const x = p1.x - p2.x;
		const y = p1.y - p2.y;
		return Math.sqrt(x * x + y * y);
	}
}

/**
 * IDDraggableSwitch.js
 *
 * @module InputDetect
 * @author natade (https://github.com/natade-jp)
 * @license MIT
 */


/**
 * ドラッグ可能なスイッチ（ボタン）の状態を管理するクラスです。
 * クリックやドラッグ操作の開始・終了・移動を追跡し、イベントごとに内部状態を更新できます。
 */
class IDDraggableSwitch {
	/**
	 * ドラッグ操作可能なスイッチの状態を管理するクラス
	 * @param {number} mask - 対象となるボタン（0:左, 1:中央, 2:右）
	 * @constructor
	 */
	constructor(mask) {
		this._initIDDraggableSwitch(mask);
	}

	/**
	 * 各プロパティを初期化します。
	 * @param {number} mask - 対象ボタン番号
	 * @private
	 */
	_initIDDraggableSwitch(mask) {
		/**
		 * このインスタンスが監視するボタン種別（0:左, 1:中央, 2:右）
		 * @type {number}
		 */
		this.mask = mask;

		/**
		 * ボタンの押下状態を管理するIDSwitchインスタンス
		 * @type {IDSwitch}
		 */
		this.switch = new IDSwitch();

		/**
		 * 現在の位置（client座標系）
		 * @type {IDPosition}
		 */
		this.client = new IDPosition();

		/**
		 * ドラッグ開始位置
		 * @type {IDPosition}
		 */
		this.deltaBase = new IDPosition();

		/**
		 * ドラッグ量（始点からの移動量）
		 * @type {IDPosition}
		 */
		this.dragged = new IDPosition();
	}

	/**
	 * このインスタンスの複製を作成します。
	 * @returns {IDDraggableSwitch} 複製したIDDraggableSwitchインスタンス
	 */
	clone() {
		const ret = new IDDraggableSwitch(this.mask);
		ret.switch = this.switch.clone();
		ret.client = this.client.clone();
		ret.deltaBase = this.deltaBase.clone();
		ret.dragged = this.dragged.clone();
		return ret;
	}

	/**
	 * DOMイベントの位置情報から、ノードサイズに応じた正規化座標を計算します。
	 * 画像やcanvasのスケーリングに対応した正しい座標を返します。
	 * @param {MouseEvent|TouchEvent} event - イベントオブジェクト
	 * @returns {IDPosition} 計算済みの位置情報
	 */
	correctionForDOM(event) {
		// イベントが発生したノードの取得
		let node = event.target;
		if (!node) {
			// IE?
			node = event.currentTarget;
		}
		let clientX = 0;
		let clientY = 0;
		if ("clientX" in event && "clientY" in event) {
			clientX = event.clientX;
			clientY = event.clientY;
		} else if ("touches" in event && event.touches.length > 0) {
			clientX = event.touches[0].clientX;
			clientY = event.touches[0].clientY;
		}
		if (node === undefined) {
			return new IDPosition(clientX, clientY);
		} else {
			// ノードのサイズが変更されていることを考慮する
			// width / height が内部のサイズ
			// clientWidth / clientHeight が表示上のサイズ
			const element = /** @type {HTMLElement} */ (node);
			// Try to cast node to HTMLImageElement or HTMLCanvasElement to access width/height
			let width = element.clientWidth;
			let height = element.clientHeight;
			if ("width" in node && typeof node.width === "number") {
				width = node.width;
			}
			if ("height" in node && typeof node.height === "number") {
				height = node.height;
			}
			return new IDPosition((clientX / element.clientWidth) * width, (clientY / element.clientHeight) * height);
		}
	}

	/**
	 * 指定イベントの座標位置で、全ての位置情報を強制的にセットします。
	 * @param {MouseEvent|TouchEvent} event - イベントオブジェクト
	 */
	setPosition(event) {
		const position = this.correctionForDOM(event);
		this.client.set(position);
		this.deltaBase.set(position);
		this.dragged._initIDPosition();
	}

	/**
	 * マウスボタンが押された時の処理。
	 * 指定ボタン（mask）が押された時のみ内部状態を更新します。
	 * @param {MouseEvent} event - マウスイベント
	 */
	mousePressed(event) {
		const position = this.correctionForDOM(event);
		const state = event.button;
		if (state === this.mask) {
			if (!this.switch.ispressed) {
				this.dragged._initIDPosition();
			}
			this.switch.keyPressed();
			this.client.set(position);
			this.deltaBase.set(position);
		}
	}

	/**
	 * マウスボタンが離された時の処理。
	 * @param {MouseEvent} event - マウスイベント
	 */
	mouseReleased(event) {
		const state = event.button;
		if (state === this.mask) {
			if (this.switch.ispressed) {
				this.switch.keyReleased();
			}
		}
	}

	/**
	 * マウス移動時の処理。
	 * ドラッグ中なら移動量（dragged）を加算していきます。
	 * @param {MouseEvent} event - マウスイベント
	 */
	mouseMoved(event) {
		const position = this.correctionForDOM(event);
		if (this.switch.ispressed) {
			const delta = new IDPosition(position);
			delta.sub(this.deltaBase);
			this.dragged.add(delta);
		}
		this.client.set(position.x, position.y);
		this.deltaBase.set(position.x, position.y);
	}

	/**
	 * フォーカスが外れた場合の状態リセット処理。
	 */
	focusLost() {
		this.switch.focusLost();
	}

	/**
	 * 他のIDDraggableSwitchインスタンスに現在の入力情報をコピーします。
	 * ドラッグ量はリセットされます。
	 * @param {IDDraggableSwitch} c - 情報を受け取るインスタンス
	 * @throws {string} cがIDDraggableSwitchでない場合
	 */
	pickInput(c) {
		if (!(c instanceof IDDraggableSwitch)) {
			throw "IllegalArgumentException";
		}
		this.switch.pickInput(c.switch);
		c.client.set(this.client);
		c.dragged.set(this.dragged);
		this.dragged._initIDPosition();
	}
}

/**
 * IDMouse.js
 *
 * @module InputDetect
 * @author natade (https://github.com/natade-jp)
 * @license MIT
 */


/**
 * マウス入力を管理するクラスです。
 * 左・中央・右クリックの状態やドラッグ・ホイール回転・マウス座標の追跡を行い、複数ボタンの同時押しにも対応しています。
 */
class IDMouse {
	/**
	 * マウスの入力情報を管理するクラス
	 * 左・中央・右ボタン、位置、ホイールなどをまとめて扱えます。
	 * @constructor
	 */
	constructor() {
		this._initIDMouse();
	}

	/**
	 * 各プロパティを初期化します。
	 * @private
	 */
	_initIDMouse() {
		/**
		 * 左ボタンの状態を管理するオブジェクト
		 * @type {IDDraggableSwitch}
		 */
		this.left = new IDDraggableSwitch(IDMouse.MOUSE_EVENTS.BUTTON1_MASK);

		/**
		 * 中央ボタンの状態を管理するオブジェクト
		 * @type {IDDraggableSwitch}
		 */
		this.center = new IDDraggableSwitch(IDMouse.MOUSE_EVENTS.BUTTON2_MASK);

		/**
		 * 右ボタンの状態を管理するオブジェクト
		 * @type {IDDraggableSwitch}
		 */
		this.right = new IDDraggableSwitch(IDMouse.MOUSE_EVENTS.BUTTON3_MASK);

		/**
		 * 現在のマウス座標
		 * @type {IDPosition}
		 */
		this.position = new IDPosition();

		/**
		 * ホイールの回転量
		 * @type {number}
		 */
		this.wheelrotation = 0;
	}

	/**
	 * このインスタンスの複製を作成します。
	 * @returns {IDMouse} 複製したIDMouseインスタンス
	 */
	clone() {
		const ret = new IDMouse();
		ret.left = this.left.clone();
		ret.center = this.center.clone();
		ret.right = this.right.clone();
		ret.position = this.position.clone();
		ret.wheelrotation = this.wheelrotation;
		return ret;
	}

	/**
	 * マウスボタンが押された時の処理を行います。
	 * それぞれのボタンごとに対応する状態を更新します。
	 * @param {MouseEvent} mouseevent - マウスイベントまたは同等のオブジェクト
	 * @protected
	 */
	mousePressed(mouseevent) {
		this.left.mousePressed(mouseevent);
		this.center.mousePressed(mouseevent);
		this.right.mousePressed(mouseevent);
	}

	/**
	 * マウスボタンが離された時の処理を行います。
	 * @param {MouseEvent} mouseevent - マウスイベントまたは同等のオブジェクト
	 * @protected
	 */
	mouseReleased(mouseevent) {
		this.left.mouseReleased(mouseevent);
		this.center.mouseReleased(mouseevent);
		this.right.mouseReleased(mouseevent);
	}

	/**
	 * マウス移動時の処理を行います。
	 * それぞれのボタンのドラッグ状態や現在位置を更新します。
	 * @param {MouseEvent} mouseevent - マウスイベントまたは同等のオブジェクト
	 * @protected
	 */
	mouseMoved(mouseevent) {
		this.left.mouseMoved(mouseevent);
		this.center.mouseMoved(mouseevent);
		this.right.mouseMoved(mouseevent);
		this.position.x = this.left.client.x;
		this.position.y = this.left.client.y;
	}

	/**
	 * ホイール回転イベントの処理を行います。
	 * @param {WheelEvent} event - ホイールイベントまたは同等のオブジェクト
	 * @protected
	 */
	mouseWheelMoved(event) {
		if (event.deltaY !== 0) {
			this.wheelrotation += event.deltaY > 0 ? -1 : 1;
		}
	}

	/**
	 * マウスカーソルが要素外に出た場合の処理（状態リセット等）を行います。
	 * @protected
	 */
	focusLost() {
		this.left.focusLost();
		this.center.focusLost();
		this.right.focusLost();
	}

	/**
	 * 他のIDMouseインスタンスへ現在の入力情報をコピーします。
	 * 各ボタンや位置、ホイール回転量が渡され、渡した後はホイール量がリセットされます。
	 * @param {IDMouse} c - 情報を受け取るIDMouseインスタンス
	 * @throws {string} cがIDMouseでない場合
	 */
	pickInput(c) {
		if (!(c instanceof IDMouse)) {
			throw "IllegalArgumentException";
		}
		this.left.pickInput(c.left);
		this.center.pickInput(c.center);
		this.right.pickInput(c.right);
		c.position.set(this.position);
		c.wheelrotation = this.wheelrotation;
		this.wheelrotation = 0;
	}

	/**
	 * 指定した要素にマウス入力イベントリスナーを登録します。
	 * これにより、押下・移動・ホイール回転・フォーカスロスト等のイベントをこのクラスで検知できます。
	 * @param {HTMLElement} element - イベントリスナーを設定するDOM要素
	 */
	setListenerOnElement(element) {
		const that = this;
		/**
		 * @param {MouseEvent} e
		 */
		const mousePressed = function (e) {
			that.mousePressed(e);
		};

		/**
		 * @param {MouseEvent} e
		 */
		const mouseReleased = function (e) {
			that.mouseReleased(e);
		};

		/**
		 * @param {MouseEvent} e
		 */
		const mouseMoved = function (e) {
			that.mouseMoved(e);
		};

		const focusLost = function () {
			that.focusLost();
		};

		/**
		 * @param {WheelEvent} e
		 */
		const mouseWheelMoved = function (e) {
			that.mouseWheelMoved(e);
			e.preventDefault();
		};

		/**
		 * @param {Event} e
		 */
		const contextMenu = function (e) {
			e.preventDefault();
		};
		element.style.cursor = "crosshair";
		// 非選択化
		element.style.userSelect = "none";
		element.style.setProperty("-moz-user-select", "none");
		element.style.setProperty("-webkit-user-select", "none");
		element.style.setProperty("-ms-user-select", "none");
		// メニュー非表示化
		element.style.setProperty("-webkit-touch-callout", "none");
		// タップのハイライトカラーを消す
		element.style.setProperty("-webkit-tap-highlight-color", "rgba(0,0,0,0)");

		element.addEventListener("mousedown", mousePressed, false);
		element.addEventListener("mouseup", mouseReleased, false);
		element.addEventListener("mousemove", mouseMoved, false);
		element.addEventListener("mouseout", focusLost, false);
		element.addEventListener("wheel", mouseWheelMoved, false);
		element.addEventListener("contextmenu", contextMenu, false);
	}
}

/**
 * マウスボタン番号の定数
 * BUTTON1_MASK: 左ボタン, BUTTON2_MASK: 中央ボタン, BUTTON3_MASK: 右ボタン
 * @enum {number}
 */
IDMouse.MOUSE_EVENTS = {
	/**
	 * 左ボタン
	 * @type {number}
	 */
	BUTTON1_MASK: 0,
	/**
	 * 中央ボタン
	 * @type {number}
	 */
	BUTTON2_MASK: 1,
	/**
	 * 右ボタン
	 * @type {number}
	 */
	BUTTON3_MASK: 2
};

/**
 * IDTouch.js
 *
 * @module InputDetect
 * @author natade (https://github.com/natade-jp)
 * @license MIT
 */


/**
 * タッチデバイス入力を管理するクラスです。
 * 最大3本指のマルチタッチ操作を検出し、それぞれをマウスの左・右・中央クリックに割り当てて管理できます。
 * タッチイベントをPCのマウスイベントとして扱う変換処理も含まれています。
 */
class IDTouch extends IDMouse {
	/**
	 * 指3本までのタッチ操作に対応した入力管理クラス
	 * 1本目は左クリック、2本目は右クリック、3本目は中央クリックとして扱います。
	 * @constructor
	 */
	constructor() {
		super();
		this._initIDTouch();
	}

	/**
	 * 内部の初期化処理を行います。
	 * @private
	 */
	_initIDTouch() {
		/**
		 * タッチ数とマウスボタン番号のマッピング
		 * @type {Object<number, number>}
		 */
		this.touchcount_to_mask = {
			1: IDMouse.MOUSE_EVENTS.BUTTON1_MASK,
			2: IDMouse.MOUSE_EVENTS.BUTTON3_MASK,
			3: IDMouse.MOUSE_EVENTS.BUTTON2_MASK
		};
		const that = this;
		/**
		 * @param {MouseEvent} e
		 */
		this._mousePressed = function (e) {
			that.mousePressed(e);
		};
		/**
		 * @param {MouseEvent} e
		 */
		this._mouseReleased = function (e) {
			that.mouseReleased(e);
		};
		/**
		 * @param {MouseEvent} e
		 */
		this._mouseMoved = function (e) {
			that.mouseMoved(e);
		};
		/**
		 * 2本指の操作中かどうか
		 * @type {boolean}
		 */
		this.isdoubletouch = false;

		/**
		 * @type {IDPosition}
		 * @private
		 */
		this._doubleposition_p1 = null;

		/**
		 * @type {IDPosition}
		 * @private
		 */
		this._doubleposition_p2 = null;
	}

	/**
	 * タッチ開始時、すべての座標情報を初期化します。
	 * @param {MouseEvent|TouchEvent} mouseevent - マウスイベント相当のオブジェクト
	 * @private
	 */
	_initPosition(mouseevent) {
		this.left.setPosition(mouseevent);
		this.right.setPosition(mouseevent);
		this.center.setPosition(mouseevent);
	}

	/**
	 * マウスイベントのプロパティを仮想的なマウスイベント
	 * @typedef {Object} VirtualMouseEvent
	 * @property {number} clientX マウスのX座標
	 * @property {number} clientY マウスのY座標
	 * @property {number} button マウスボタンの種類
	 * @property {EventTarget} target イベントのターゲット
	 * @property {number} touchcount タッチ数
	 */

	/**
	 * タッチイベントを仮想的なマウスイベントへ変換します。
	 * 指の平均座標を計算し、タッチ数から対応するボタンを設定します。
	 * @param {TouchEvent} touchevent - タッチイベント
	 * @returns {MouseEvent} 仮想マウスイベントオブジェクト
	 * @private
	 */
	_MultiTouchToMouse(touchevent) {
		let x = 0,
			y = 0;
		// 座標はすべて平均値の位置とします。
		// identifier を使用すれば、1本目、2本目と管理できますが、実装は未対応となっています。
		for (let i = 0; i < touchevent.touches.length; i++) {
			x += touchevent.touches[i].clientX;
			y += touchevent.touches[i].clientY;
		}
		/**
		 * @type {VirtualMouseEvent}
		 */
		const event = {};
		if (touchevent.touches.length > 0) {
			event.clientX = x / touchevent.touches.length;
			event.clientY = y / touchevent.touches.length;
			event.button = this.touchcount_to_mask[touchevent.touches.length];
			const touch = touchevent.touches[0];
			event.target = touch.target ? touch.target : touchevent.currentTarget;
		} else {
			event.clientX = 0;
			event.clientY = 0;
			event.button = 0;
		}
		event.touchcount = touchevent.touches.length;
		// @ts-ignore
		return /** @type {MouseEvent} */ event;
	}

	/**
	 * 2本指タッチによるピンチ操作を検出し、ホイール回転に変換します。
	 * @param {TouchEvent} touchevent - タッチイベント
	 * @private
	 */
	_MoveMultiTouch(touchevent) {
		if (touchevent.touches.length === 2) {
			const p1 = touchevent.touches[0];
			const p2 = touchevent.touches[1];
			if (this.isdoubletouch === false) {
				this.isdoubletouch = true;
				this._doubleposition_p1 = new IDPosition(p1.clientX, p1.clientY);
				this._doubleposition_p2 = new IDPosition(p2.clientX, p2.clientY);
			} else {
				// 前回との2点間の距離の増加幅を調べる
				// これによりピンチイン／ピンチアウト操作がわかる。
				const newp1 = new IDPosition(p1.clientX, p1.clientY);
				const newp2 = new IDPosition(p2.clientX, p2.clientY);
				const x =
					IDPosition.norm(this._doubleposition_p1, this._doubleposition_p2) - IDPosition.norm(newp1, newp2);
				this._doubleposition_p1 = newp1;
				this._doubleposition_p2 = newp2;
				// そんなにずれていなかったら無視する
				const r = Math.abs(x) < 10 ? Math.abs(x) * 0.01 : 0.5;
				this.wheelrotation += (x > 0 ? -1 : 1) * r;
			}
		} else {
			this.isdoubletouch === false;
		}
	}

	/**
	 * 指定されたボタンに応じて関数を呼び分けます。
	 * @param {MouseEvent} mouseevent - 仮想マウスイベント
	 * @param {Function} funcOn - 対象ボタンで呼ぶ関数
	 * @param {Function} funcOff - それ以外のボタンで呼ぶ関数
	 * @param {number} target - 対象となるボタン番号
	 * @private
	 */
	_actFuncMask(mouseevent, funcOn, funcOff, target) {
		const events = /** @type {VirtualMouseEvent} */ mouseevent;
		for (const key in IDMouse.MOUSE_EVENTS) {
			// @ts-ignore
			events.button = IDMouse.MOUSE_EVENTS[key];
			// @ts-ignore
			if (IDMouse.MOUSE_EVENTS[key] === target) {
				funcOn(events);
			} else {
				funcOff(events);
			}
		}
	}

	/**
	 * タッチ開始イベントを処理します。
	 * @param {TouchEvent} touchevent - タッチイベント
	 * @private
	 */
	_touchStart(touchevent) {
		const mouseevent = this._MultiTouchToMouse(touchevent);
		// タッチした時点ですべての座標を初期化する
		this._initPosition(mouseevent);
		this._actFuncMask(mouseevent, this._mousePressed, this._mouseReleased, mouseevent.button);
	}

	/**
	 * タッチ終了イベントを処理します。
	 * @param {TouchEvent} touchevent - タッチイベント
	 * @private
	 */
	_touchEnd(touchevent) {
		const mouseevent = this._MultiTouchToMouse(touchevent);
		this._actFuncMask(mouseevent, this._mouseReleased, this._mouseReleased, mouseevent.button);
	}

	/**
	 * タッチ移動イベントを処理します。
	 * @param {TouchEvent} touchevent - タッチイベント
	 * @private
	 */
	_touchMove(touchevent) {
		this._MoveMultiTouch(touchevent);
		const mouseevent = this._MultiTouchToMouse(touchevent);
		this._actFuncMask(mouseevent, this._mouseMoved, this._mouseMoved, mouseevent.button);
	}

	/**
	 * 対象要素にタッチイベントリスナーを設定します。
	 * @param {HTMLElement} element - イベントを監視するDOM要素
	 */
	setListenerOnElement(element) {
		super.setListenerOnElement(element);

		const that = this;

		/**
		 * @param {TouchEvent} touchevent
		 */
		const touchStart = function (touchevent) {
			that._touchStart(touchevent);
		};

		/**
		 * @param {TouchEvent} touchevent
		 */
		const touchEnd = function (touchevent) {
			that._touchEnd(touchevent);
		};

		/**
		 * @param {TouchEvent} touchevent
		 */
		const touchMove = function (touchevent) {
			that._touchMove(touchevent);
			// スクロール禁止
			touchevent.preventDefault();
		};

		element.addEventListener("touchstart", touchStart, false);
		element.addEventListener("touchend", touchEnd, false);
		element.addEventListener("touchmove", touchMove, false);
		element.addEventListener("touchcancel", touchEnd, false);
	}
}

/**
 * IDTools.js
 *
 * @module InputDetect
 * @author natade (https://github.com/natade-jp)
 * @license MIT
 */

/**
 * デバイス系ツールユーティリティのオブジェクトです。
 * 主に画面スクロールの制御など、補助的な機能を提供します。
 */
const IDTools = {
	/**
	 * ページの縦スクロールバーを非表示にします。
	 * HTMLのbodyとhtml要素のスタイルを変更し、ページ全体でスクロールを禁止します。
	 *
	 * @function
	 * @returns {void}
	 *
	 * @example
	 * // ページの縦スクロールを禁止したいときに実行
	 * IDTools.noScroll();
	 */
	noScroll: function () {
		// 縦のスクロールバーを削除
		const main = function () {
			// body
			document.body.style.height = "100%";
			document.body.style.overflow = "hidden";
			// html
			document.documentElement.style.height = "100%";
			document.documentElement.style.overflow = "hidden";
		};
		window.addEventListener("load", main, false);
	}
};

/**
 * InputDetect
 *
 * @module InputDetect
 * @author natade (https://github.com/natade-jp)
 * @license MIT
 */


class InputDetect {
	/**
	 * @private
	 */
	constructor() {
		/**
		 * @type {IDTouch}
		 * @private
		 */
		this._data = new IDTouch();
	}

	/**
	 * InputDetect のインスタンスを生成します。
	 * @returns {InputDetect}
	 */
	static create() {
		return new InputDetect();
	}

	/**
	 * 対象要素にタッチイベントリスナーを設定します。
	 * @param {HTMLElement} element - イベントを監視するDOM要素
	 */
	setListenerOnElement(element) {
		this._data.setListenerOnElement(element);
	}

	/**
	 * 現在の入力情報が入ったIDTouchインスタンスを取得します。
	 * 各ボタンや位置、ホイール回転量が渡され、渡した後はホイール量がリセットされます。
	 * @returns {IDTouch} - タッチデータを持つIDTouchインスタンス
	 */
	pickInput() {
		const pick_data = new IDTouch();
		this._data.pickInput(pick_data);
		return pick_data;
	}

	/**
	 * スクロールを禁止します。
	 *
	 * @function
	 * @returns {void}
	 *
	 * @example
	 * // ページの縦スクロールを禁止したいときに実行
	 * IDTools.noScroll();
	 */
	static noScroll() {
		IDTools.noScroll();
	}
}

/**
 * カメラ操作用コントローラー
 * タッチ操作やマウス操作を用いて3DCGシーンのカメラの移動・回転・ズームイン/アウトなどを制御するクラスです。
 * InputDetect の入力情報をもとに、カメラの移動・回転・距離変更（ズーム）を自動で計算します。
 */
class CameraController {
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

const S3 = {
	System: S3System,
	GLSystem: S3GLSystem,
	Math: S3Math,
	Angles: S3Angles,
	Vector: S3Vector,
	Matrix: S3Matrix,
	Plane: S3Plane,

	SYSTEM_MODE: S3System.SYSTEM_MODE,
	DEPTH_MODE: S3System.DEPTH_MODE,
	DIMENSION_MODE: S3System.DIMENSION_MODE,
	VECTOR_MODE: S3System.VECTOR_MODE,
	FRONT_FACE: S3System.FRONT_FACE,
	CULL_MODE: S3System.CULL_MODE,
	LIGHT_MODE: S3Light.MODE,

	MeshLoader: S3MeshLoader,
	CameraController: CameraController
};

export { S3 as default };
