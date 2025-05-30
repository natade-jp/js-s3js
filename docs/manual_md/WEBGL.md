# WebGL 拡張

## 概要

WebGL 実装系 (`S3GL*` クラス群) について説明します。

* **純粋な JS のクラス構成**（ES Modules 構成）
* **抽象レイヤー**（基本形状・メッシュ・カメラ・ライト・マテリアル etc...）
* **WebGL レイヤー**（GL バッファ／シェーダ／テクスチャ／描画パイプライン管理）

## アーキテクチャ全体図

```
+-----------------------------------------------------------+
|                        S3GLSystem                        |
| (WebGL全体の管理／描画パイプライン・GLContext管理)        |
+---------------------+---------+--------------------------+
                      |         |
           +----------+         +--------------+
           |                                    |
    +------v-------+                      +-----v------+
    |  S3GLScene   |                      |  S3GLMesh  |
    |(Scene全体管理|                      |(メッシュ/VBO|
    +------+-------+                      +-----+------+
           |                                    |
    +------v-----------+                +-------v---------+
    |  S3GLModel       |                | S3GLTriangle... |
    |(モデル/形状/変換) |                |(三角形インデックス)|
    +------------------+                +-----------------+
           |                                    |
    +------v----------+                +--------v-------+
    |  S3GLMaterial   |                |  S3GLVertex    |
    |  (材質・uniform) |                |  (頂点情報)    |
    +-----------------+                +----------------+
```

## レイヤ・主な責務

### 1. 抽象・システムレイヤ（`S3System`など）

* **シーン管理**（S3Scene）・**モデル/カメラ/ライト生成**
* **行列演算・座標変換**（モデル/ビュー/プロジェクション）
* **頂点・メッシュ・マテリアルのファクトリ機能**

### 2. WebGLレイヤ（`S3GL*` クラス群）

* **GLContext の初期化・管理**（`S3GLSystem`）
* **GLバッファ生成／VBO/IBO 化**（`S3GLMesh`）
* **GLシェーダ・プログラム管理**（`S3GLShader`, `S3GLProgram`）
* **シーン/モデル/マテリアル/ライトの uniform 変換**（`getUniforms` 系）
* **GLリソース（テクスチャ/バッファ）管理・破棄**

## ファイル構成

* `S3GLSystem.js`: WebGL描画システム本体
* `S3GLMesh.js`: GL用メッシュ（VBO/IBO管理、属性生成）
* `S3GLModel.js`: GL用モデル（uniforms生成）
* `S3GLMaterial.js`: GL用マテリアル（uniforms生成・テクスチャ管理）
* `S3GLScene.js`: GL用シーン管理
* `S3GLProgram.js`: シェーダ・GLプログラム管理
* `S3GLVertex.js`, `S3GLTriangleIndex.js`, `S3GLTriangleIndexData.js`: 頂点・面・属性生成
* `S3GLArray.js`: GL用データ変換・型管理
* `S3GLTexture.js`: GL用テクスチャ
* `S3GLLight.js`: GL用ライト

## 主要クラスの役割

### S3GLSystem

* **WebGL 描画全体の管理者**

  * GLContext の初期化／プログラム切り替え
  * 描画モード・カリング・深度・背景色管理
  * プログラムへのバインド・描画ループ処理
  * 各種ファクトリ（メッシュ/モデル/カメラ etc...）

### S3GLScene

* **シーン単位のデータ統括**

  * モデル・カメラ・ライトの管理
  * 全 uniform 生成（`getUniforms`：カメラ方向やライト配列を uniform 形式で返す）

### S3GLModel

* **オブジェクト（形状）の位置・スケール・回転・メッシュ参照**

  * 複数のマテリアルを集約し、uniform を生成
  * ワールド座標変換行列もここで算出

### S3GLMesh

* **WebGLに適したメッシュ（頂点配列・インデックス配列）**

  * VBO/IBO 生成・バッファ管理
  * 各三角形ごとに法線/接線/従法線なども計算
  * 頂点ハッシュにより、異なる属性毎に頂点をユニーク化

### S3GLTriangleIndex / S3GLTriangleIndexData

* **三角形インデックス情報**（各面ごとのUV, マテリアル等を含む）

  * 面単位/頂点単位で法線・接線等も格納

### S3GLVertex

* **各頂点の 3D 位置ベクトルを GL フォーマットで管理**

  * attribute へのバインド用データ（Float32Array化など）

### S3GLMaterial

* **色/拡散/反射/発光/環境光/テクスチャ等の uniform 化**

  * テクスチャ有無を含むデータをまとめて返す
  * GLSL シェーダ側の uniform 変数名と一致

### S3GLTexture

* **画像から WebGL テクスチャ生成／管理**

### S3GLLight

* **平行光源/点光源/環境光などの uniform 生成**

### S3GLProgram

* **頂点・フラグメントシェーダの管理／GLSL uniform・attribute バインド管理**

  * GLSL 変数名ごとに型・ロケーション・バインド関数を自動管理
  * VBO/IBO の bind, uniform の bind をすべて管理

## データフロー／描画パイプライン例

1. **S3GLSystem**: `setCanvas`, `setProgram`, `setBackgroundColor` などシステム初期化
2. **メッシュ・モデル生成**: `createMesh`, `createModel`、ファイル/データからメッシュ生成（例: MQOローダ）
3. **マテリアル・テクスチャ・ライトのセット**
4. **シーン生成／モデル・ライト登録**
5. **drawScene(scene)** でシーン全体描画

   * (a) **Uniforms**: シーン/カメラ/ライト/マテリアルの uniform をプログラムにバインド
   * (b) **VBO/IBO バインド**: メッシュごとに属性・インデックスバッファをGLへ
   * (c) **Draw Call**: `drawElements` 実行で WebGL へ描画指示

```js
const s3 = new S3GLSystem();
const program = s3.createProgram();
program.setVertexShader("...");
program.setFragmentShader("...");
s3.setProgram(program);

const mesh = s3.createMesh(); // 頂点・インデックス・マテリアル追加
const model = s3.createModel();
model.setMesh(mesh);

const scene = s3.createScene();
scene.setCamera(s3.createCamera());
scene.addModel(model);

s3.drawScene(scene); // ⇒ 描画パイプラインがすべて自動処理
```

## モジュール依存関係

* math/ : S3Vector, S3Matrix, S3Math など数学系
* basic/ : S3Vertex, S3Material, S3TriangleIndex, S3Mesh, S3Model, S3Scene, S3Camera など
* GL用: S3GLSystem, S3GLMesh, S3GLModel, S3GLScene, S3GLMaterial, S3GLTexture, S3GLTriangleIndex, S3GLVertex, S3GLLight, S3GLProgram, S3GLShader, S3GLArray, S3GLTriangleIndexData

## 設計の特徴・意図

* **抽象（basic）とWebGL層（GL）を明確に分離**

  * 抽象的な3D形状操作（座標/変換/論理）と、WebGL用最適化データ（バッファ/テクスチャ/シェーダ/GL管理）を分けて設計

* **可搬性／汎用性**

  * 例えば「CPU計算のみで画像を出す」用途や、「将来の他API対応」も見据えている
* **データの immutable 準拠（頂点/三角形/マテリアル）と、mutableな Scene/Model/Camera**
* **GLSLシェーダ変数との自動バインド管理（S3GLProgramで自動解析）**
