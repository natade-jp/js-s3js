﻿/**
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
		return x >= 0.0 ? 1.0 : -1.0;
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

export default S3Math;
