import S3Vector from "../math/S3Vector.js";
import S3Matrix from "../math/S3Matrix.js";

/**
 * WebGL用の配列（バッファ）を生成・管理するクラス。（immutable）
 * 各種型（S3Vector, S3Matrix, 数値配列等）をWebGLバッファ（Float32Array/Int32Array）に変換し、
 * 対応するGLSL型（vec3, mat4等）情報も保持します。
 */
export default class S3GLArray {
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
