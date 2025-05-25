﻿import S3Math from "./S3Math.js";
import S3Matrix from "./S3Matrix.js";

/**
 * 3DCG用のベクトルクラス（immutable）
 */
export default class S3Vector {
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
	 * 3点を通る平面の法線、接線、従法線を計算します。
	 * A, B, C の3点を通る平面の法線と、UV座標による接線、従法線を求めます。
	 * A, B, C の3点の時計回りが表だとした場合、表方向へ延びる法線となります。
	 * @param {S3Vector} posA 点A
	 * @param {S3Vector} posB 点B
	 * @param {S3Vector} posC 点C
	 * @param {S3Vector} [uvA] UV座標A
	 * @param {S3Vector} [uvB] UV座標B
	 * @param {S3Vector} [uvC] UV座標C
	 * @returns {{normal:S3Vector, tangent:S3Vector, binormal:S3Vector}}
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
