import S3GLSystem from "./S3GLSystem.js";

/**
 * WebGLのシェーダー管理クラス。
 * 頂点シェーダ／フラグメントシェーダのソースコード・型・GLオブジェクトを保持し、コンパイルや破棄、状態取得などの機能を提供します。
 * S3GLProgram 内部で利用され、単体では直接使わないことが多い設計です。
 *
 * @class
 * @module S3
 */
export default class S3GLShader {
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
		/**
		 * GLシステムインスタンス
		 * @type {S3GLSystem}
		 */
		this.sys = sys;

		/**
		 * シェーダーのGLSLソースコード。GLSLコード文字列、または未ロード時はnull。
		 * @type {string|null}
		 */
		this.code = null;

		/**
		 * コンパイル済みWebGLShaderオブジェクト。未生成またはエラー時はnull。
		 * @type {?WebGLShader}
		 */
		this.shader = null;

		/**
		 * シェーダーの型。gl.VERTEX_SHADER（35633）かgl.FRAGMENT_SHADER（35632）、未設定時は-1。
		 * @type {number}
		 */
		this.sharder_type = -1;

		/**
		 * コンパイルや生成エラーが発生した場合にtrue。
		 * @type {boolean}
		 */
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
