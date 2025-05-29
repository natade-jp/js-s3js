// ========================================================================
// バーテックス（頂点）シェーダ
// このシェーダは、3Dオブジェクトの各頂点ごとに呼び出され、
// 頂点位置の座標変換や、法線・テクスチャ座標などの各種属性を
// フラグメントシェーダ（ピクセルシェーダ）に渡します。
// ========================================================================

// ---------- 頂点属性（JavaScriptからバインドされる） -------------------

// 頂点法線ベクトル（照明計算や法線マップで使う）
attribute vec3 vertexNormal;

// 接線・従法線（タンジェント/バイノーマル）
// 法線マッピング（ノーマルマップ）で必要
attribute vec3 vertexBinormal;
attribute vec3 vertexTangent;

// 頂点の3D空間位置（ワールド空間での頂点座標）
attribute vec3 vertexPosition;

// テクスチャのUV座標（2次元、0.0～1.0など）
attribute vec2 vertexTextureCoord;

// マテリアル（材質）のインデックス番号（float型で持つ）
// 面ごとに異なるマテリアル情報を持つ場合に利用
attribute float vertexMaterialFloat;

// ---------- 行列（uniform: 全頂点で共通の定数値） ----------------------

// モデル座標→カメラ→射影空間への変換行列（最終的にgl_Positionに使う）
uniform mat4 matrixLocalToPerspective4;

// モデル座標→ワールド空間への変換行列
uniform mat4 matrixLocalToWorld4;

// ---------- シェーダ間の受け渡し（varying: 頂点→フラグメント） --------

// マテリアル番号
varying float interpolationMaterialFloat;

// 法線・接線・従法線（各頂点のものをフラグメントに渡す）
varying vec3 interpolationNormal;
varying vec3 interpolationBinormal;
varying vec3 interpolationTangent;

// ワールド空間での頂点位置（ピクセルシェーダのライティングなどに使う）
varying vec3 interpolationPosition;

// テクスチャ座標（フラグメントシェーダでピクセルごとのUV計算に使う）
varying vec2 interpolationTextureCoord;

// ---------- メイン関数 ----------------------------------------------

void main(void) {
	// マテリアル番号をそのまま渡す（int化はfsで行う）
	interpolationMaterialFloat = vertexMaterialFloat;

	// 各種ベクトルもフラグメントシェーダへ伝達
	interpolationNormal   = vertexNormal;
	interpolationBinormal = vertexBinormal;
	interpolationTangent  = vertexTangent;

	// ワールド空間の頂点位置を計算して渡す（照明/反射などで使う）
	interpolationPosition = (matrixLocalToWorld4 * vec4(vertexPosition, 1.0)).xyz;

	// UV座標
	interpolationTextureCoord = vertexTextureCoord;

	// 頂点を最終的にどこに描画するか計算（射影空間座標）
	gl_Position = matrixLocalToPerspective4 * vec4(vertexPosition, 1.0);

	// ※このgl_Positionの値が、画面上の頂点の位置になる
}
