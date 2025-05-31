import S3Vertex from "./S3Vertex.js";
import S3Material from "./S3Material.js";
import S3TriangleIndex from "./S3TriangleIndex.js";
import S3System from "./S3System.js";

/**
 * 3DCG用メッシュ（立体形状データ）を管理するクラス (mutable)
 * 頂点・面・マテリアルを保持し、複数の形状や属性を一つにまとめます。
 *
 * @class
 * @module S3
 */
export default class S3Mesh {
	/**
	 * メッシュを作成します。
	 * @param {S3System} s3system S3Systemインスタンス
	 */
	constructor(s3system) {
		/**
		 * システムインスタンス
		 * @type {S3System}
		 */
		this.sys = s3system;

		/**
		 * 三角形インデックス追加時に面の頂点順序（表裏）を反転するかどうかを指定します。
		 * true の場合は addTriangleIndex() で自動的に面を裏返して追加します。
		 * @type {boolean}
		 */
		this.is_inverse = false;

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
	 * データを開放します
	 * @returns {void}
	 */
	dispose() {
		this.src = null;
		this.sys = null;
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
	 * @param {S3Vertex|Array<S3Vertex>} [vertex] 追加する頂点またはその配列
	 */
	addVertex(vertex) {
		// immutableなのでシャローコピー
		this.setComplete(false);
		// 引数があった場合にのみ処理
		if (vertex) {
			const meshvertex = this.getVertexArray();
			if (vertex instanceof S3Vertex) {
				meshvertex[meshvertex.length] = vertex;
			} else {
				for (let i = 0; i < vertex.length; i++) {
					meshvertex[meshvertex.length] = vertex[i];
				}
			}
		}
	}

	/**
	 * 三角形インデックス（S3TriangleIndexまたはその配列）をメッシュに追加します。
	 * 反転モード時は面を裏返して追加します。
	 * @param {S3TriangleIndex|Array<S3TriangleIndex>} [ti] 追加する三角形インデックスまたはその配列
	 */
	addTriangleIndex(ti) {
		// immutableなのでシャローコピー
		this.setComplete(false);
		// 引数がある場合に動作する
		if (ti !== undefined) {
			const meshtri = this.getTriangleIndexArray();
			if (ti instanceof S3TriangleIndex) {
				meshtri[meshtri.length] = this.is_inverse ? ti.inverseTriangle() : ti;
			} else {
				for (let i = 0; i < ti.length; i++) {
					meshtri[meshtri.length] = this.is_inverse ? ti[i].inverseTriangle() : ti[i];
				}
			}
		}
	}

	/**
	 * マテリアル（S3Materialまたはその配列）をメッシュに追加します。
	 * @param {S3Material|Array<S3Material>} [material] 追加するマテリアルまたはその配列
	 */
	addMaterial(material) {
		// immutableなのでシャローコピー
		this.setComplete(false);
		const meshmat = this.getMaterialArray();
		// 引数が設定されたとき動作する
		if (material) {
			if (material instanceof S3Material) {
				meshmat[meshmat.length] = material;
			} else {
				for (let i = 0; i < material.length; i++) {
					meshmat[meshmat.length] = material[i];
				}
			}
		}
	}
}
