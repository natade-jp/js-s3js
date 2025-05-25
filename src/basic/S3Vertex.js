import S3Vector from "../math/S3Vector.js";

/**
 * 3DCG用の頂点クラス（immutable）
 * 各頂点の空間上の座標情報を管理するシンプルなクラスです。
 */
export default class S3Vertex {
	/**
	 * 頂点を作成します。（immutable）
	 * @param {S3Vector} position 頂点の座標ベクトル
	 */
	constructor(position) {
		this.position = position;
	}

	/**
	 * 頂点インスタンスのクローン（複製）を作成します。
	 * @param {typeof S3Vertex} [Instance] 複製する際のクラス指定（省略時はS3Vertex）
	 * @returns {S3Vertex} 複製されたS3Vertexインスタンス
	 */
	clone(Instance) {
		if (!Instance) {
			Instance = S3Vertex;
		}
		return new Instance(this.position);
	}
}
