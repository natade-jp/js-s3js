﻿import S3Vector from "./S3Vector.js";

/**
 * 3DCG用の平面クラス
 * 法線ベクトルと距離または平面上の1点から平面を定義します。
 */
export default class S3Plane {
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
