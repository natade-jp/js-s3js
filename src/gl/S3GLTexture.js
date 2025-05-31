import S3Texture from "../basic/S3Texture.js";
import S3GLSystem from "./S3GLSystem.js";

/**
 * WebGL描画用のテクスチャクラス。
 * S3Textureを拡張し、WebGL用のGLTexture管理、GL用データ取得（getGLData）、破棄などを担います。
 * 画像データをGPUのテクスチャへ変換し、GLSLシェーダへのuniformバインドなどに利用します。
 *
 * @class
 * @extends S3Texture
 * @module S3
 */
export default class S3GLTexture extends S3Texture {
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
			/**
			 * テクスチャが破棄されたかどうか
			 * @type {boolean}
			 */
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
