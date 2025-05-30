import S3System from "../basic/S3System.js";
import S3Camera from "../basic/S3Camera.js";
import S3Vector from "../math/S3Vector.js";

import S3GLProgram from "./S3GLProgram.js";

import S3GLLight from "./S3GLLight.js";
import S3GLMaterial from "./S3GLMaterial.js";
import S3GLMesh from "./S3GLMesh.js";
import S3GLShader from "./S3GLShader.js";
import S3GLModel from "./S3GLModel.js";
import S3GLScene from "./S3GLScene.js";
import S3GLTexture from "./S3GLTexture.js";
import S3GLTriangleIndex from "./S3GLTriangleIndex.js";
import S3GLVertex from "./S3GLVertex.js";

/**
 * WebGLレンダリングシステムを管理するクラス。
 * シェーダー、テクスチャ、バッファオブジェクトの生成・管理、および描画制御を担当。
 * WebGLの初期化やプログラムのセットアップ、シーンの描画などの処理を含む。
 */
export default class S3GLSystem extends S3System {
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
		 * @typedef {Object} S3GLFuncTextureCashEntry
		 * @property {WebGLTexture} texture WebGLテクスチャオブジェクト
		 * @property {number} count このテクスチャの参照カウント
		 */

		/**
		 * テクスチャキャッシュ全体の型定義。
		 * キーがテクスチャID（string）で、値がGLFuncTextureCashEntry型になります。
		 * @typedef {Object.<string, S3GLFuncTextureCashEntry>} S3GLFuncTextureCashTable
		 */

		/**
		 * テクスチャキャッシュ情報を管理するオブジェクトです。
		 * キーにテクスチャID（string）を持ち、値は
		 * { texture: WebGLTexture, count: number } のオブジェクト構造で、
		 * 生成済みWebGLTextureの使い回しや参照カウント管理に利用します。
		 *
		 * @type {S3GLFuncTextureCashTable}
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
