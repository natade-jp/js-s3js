import S3Vector from "../math/S3Vector.js";
import S3System from "../basic/S3System.js";
import S3Mesh from "../basic/S3Mesh.js";
import S3GLTexture from "./S3GLTexture.js";
import S3GLSystem from "./S3GLSystem.js";
import S3GLVertex from "./S3GLVertex.js";
import S3GLTriangleIndex from "./S3GLTriangleIndex.js";
import S3GLMaterial from "./S3GLMaterial.js";
import S3GLTriangleIndexData from "./S3GLTriangleIndexData.js";

/**
 * WebGL用のメッシュ（立体形状データ）を管理するクラスです。
 * S3Meshを拡張し、WebGL描画に必要なVBOやIBO情報、GL用データ生成・解放機能などを持ちます。
 * モデルの描画時にGLにバインドできるバッファ形式への変換・管理も行います。
 */
export default class S3GLMesh extends S3Mesh {
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
