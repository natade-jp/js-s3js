/** @typedef {import('./typedefs.js').S3GLProgramBindInputDataSingle} S3GLProgramBindInputDataSingle */
/** @typedef {import('./typedefs.js').S3GLProgramBindInputData} S3GLProgramBindInputData */

import S3Matrix from "../math/S3Matrix.js";
import S3Vector from "../math/S3Vector.js";
import S3GLShader from "./S3GLShader.js";
import S3GLSystem from "./S3GLSystem.js";
import S3GLArray from "./S3GLArray.js";
import S3GLMesh from "./S3GLMesh.js";
import typedefs from "./typedefs.js";

/**
 * WebGLのプログラム（Program）管理クラス。
 * 頂点・フラグメント2つのシェーダーと、それらをリンクしたGLプログラムオブジェクトを保持し、
 * 各種attribute/uniform変数とのバインドや、プログラム切替・破棄などの管理を担います。
 * S3GLSystem経由でのWebGL描画制御のコアとなります。
 */
export default class S3GLProgram {
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
