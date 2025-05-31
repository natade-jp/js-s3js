import S3System from "./basic/S3System.js";
import S3Light from "./basic/S3Light.js";
import S3GLSystem from "./gl/S3GLSystem.js";
import S3MeshLoader from "./loader/S3MeshLoader.js";
import S3Math from "./math/S3Math.js";
import S3Angles from "./math/S3Angles.js";
import S3Vector from "./math/S3Vector.js";
import S3Matrix from "./math/S3Matrix.js";
import S3Plane from "./math/S3Plane.js";
import CameraController from "./tools/CameraController.js";

/**
 * S3 3DCGエンジンのメイン名前空間オブジェクト
 *
 * 主要クラスやユーティリティ（System, Math, Vector, Matrix, Plane, Loader, Controllerなど）を
 * ひとつの名前空間に集約してエクスポートします。
 * 各種定数・列挙体やローダ・ツールへのショートカットも含まれます。
 *
 * @namespace S3
 * @property {typeof S3System} System 3DCGシステム管理クラス
 * @property {typeof S3GLSystem} GLSystem WebGL用拡張システム
 * @property {typeof S3Math} Math 数学ユーティリティ
 * @property {typeof S3Angles} Angles オイラー角クラス
 * @property {typeof S3Vector} Vector ベクトルクラス
 * @property {typeof S3Matrix} Matrix 行列クラス
 * @property {typeof S3Plane} Plane 平面クラス
 * @property {Object} SYSTEM_MODE 描画モード定数
 * @property {Object} DEPTH_MODE 深度バッファモード定数
 * @property {Object} DIMENSION_MODE 座標系モード定数
 * @property {Object} VECTOR_MODE ベクトルモード定数
 * @property {Object} FRONT_FACE 面の前面判定モード定数
 * @property {Object} CULL_MODE カリングモード定数
 * @property {Object} LIGHT_MODE ライトモード定数
 * @property {typeof S3MeshLoader} MeshLoader メッシュデータローダ
 * @property {typeof CameraController} CameraController カメラコントローラー
 *
 * @example
 * import S3 from "S3.js";
 * const sys = new S3.System();
 * const mesh = sys.createMesh();
 * // もしくは
 * const glsys = new S3.GLSystem();
 */
const S3 = {
	System: S3System,
	GLSystem: S3GLSystem,
	Math: S3Math,
	Angles: S3Angles,
	Vector: S3Vector,
	Matrix: S3Matrix,
	Plane: S3Plane,

	SYSTEM_MODE: S3System.SYSTEM_MODE,
	DEPTH_MODE: S3System.DEPTH_MODE,
	DIMENSION_MODE: S3System.DIMENSION_MODE,
	VECTOR_MODE: S3System.VECTOR_MODE,
	FRONT_FACE: S3System.FRONT_FACE,
	CULL_MODE: S3System.CULL_MODE,
	LIGHT_MODE: S3Light.MODE,

	MeshLoader: S3MeshLoader,
	CameraController: CameraController
};

export default S3;
