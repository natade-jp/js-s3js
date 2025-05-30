# 一般

## 概要

このプロジェクトは、純粋なJavaScriptで3DCG描画やモデルデータの管理、各種ファイルフォーマット対応（OBJ, MQO, JSON等）を可能にするシンプルな3DCGライブラリです。
主な構成要素は、ジオメトリ（メッシュ・頂点・面）、マテリアル、ライト、カメラ、シーン管理、システムユーティリティ、各種データローダー/エクスポーターなどです。

## アーキテクチャ全体図（概要）

```
[S3System] ──┬─> [S3Scene] ─┬─> [S3Model] ──> [S3Mesh]
             │               │                ├─> [S3Vertex]
             │               │                ├─> [S3TriangleIndex]
             │               │                └─> [S3Material]
             │               ├─> [S3Light]
             │               └─> [S3Camera]
             ├─> [S3MeshLoader] <─ [OBJ/MQO/JSON File]
             └─> [Utility: Math, Vector, Matrix, Angles]
```

## コアモジュールの責務

### S3System

* **システムの中核クラス。**

  * 各種ファクトリ（シーン/モデル/メッシュ/頂点/マテリアル/ライト/カメラ等の生成）。
  * 座標変換（平行移動、回転、スケール、射影、ビューポート等）、MVP計算、カリングなど。
  * 2D Canvas描画のサポート（ラインレンダ、軸描画など）。
  * 描画モードや座標系（OpenGL/DirectX系）切り替え等のシステム設定。

### S3Scene

* **シーン（描画単位）の管理クラス。**

  * 複数モデル・ライト・カメラの登録、シーン全体の保持。
  * シーンの空化やモデル/ライト追加、カメラ切替が可能。

### S3Model

* **ワールド座標変換を含む3Dオブジェクト単位。**

  * 位置・回転（オイラー角）・スケール・メッシュ情報を保持。

### S3Mesh

* **ジオメトリ（立体形状）のまとまり。**

  * 頂点（S3Vertex）、面（S3TriangleIndex）、マテリアル（S3Material）をまとめる。
  * 面の反転や複数素材対応、確定化フラグなど。

### S3Vertex / S3TriangleIndex

* **頂点座標、面情報の基本クラス。**

  * 頂点（S3Vertex）：位置（S3Vector）だけを持つシンプルなimmutableオブジェクト。
  * 三角形面（S3TriangleIndex）：3頂点インデックス、UV座標、マテリアルインデックスを保持。

### S3Material

* **マテリアル（材質・テクスチャ等）のプロパティを管理。**

  * 拡散色、環境光、鏡面、発光、反射率、テクスチャ画像等。

### S3Texture

* **画像やテクスチャデータの管理。**

  * 各種Image型やURLの対応、2の累乗への自動変換等。

### S3Light

* **シーン内の光源情報管理。**

  * 種類（環境光/平行光源/点光源）、強度、方向、色などを保持。

### S3Camera

* **視点情報・射影/ビュー/ビューポート行列管理。**

  * 視点、注視点、視野角、ニア・ファークリップ、各種行列取得APIあり。

## 数学系ユーティリティ

* **S3Vector / S3Matrix / S3Angles など**

  * ベクトル・行列計算、オイラー角変換、線形補間など汎用的な3DCG数値処理を提供。

## メッシュローダー（データ入出力）

### S3MeshLoader（Facadeパターン的役割）

* 各種3Dフォーマット（OBJ/MQO/JSON）を一元的にS3Meshインスタンスへ変換（インポート）、逆に各形式へのエクスポート（出力）を提供。

#### S3MeshLoaderOBJ

* Wavefront OBJ形式の読み書き。テキスト→メッシュへの変換、各要素の解析。

#### S3MeshLoaderMQO

* Metasequoia MQO形式の読み書き。テキスト→メッシュ、素材パラメータやUVも一部対応。

#### S3MeshLoaderJSON

* シンプルなJSONメッシュデータ対応。自前データ構造用。

## 拡張性について

* **追加フォーマット：** `S3MeshLoader`に新しいローダーを追加すれば良い設計。
* **レンダラ置換：** デフォルトは2D Canvas描画だが、`S3GLSystem`などでWebGL拡張も容易。
* **独自モデル・マテリアル：** S3Model/S3Material/S3Meshを継承し独自拡張可能。
* **シーン構成/ユーティリティ：** 数学系やカメラ制御等もモジュール分離で独自実装しやすい。

## モジュール依存関係と流れ

1. **S3System**がすべてのファクトリ・管理・計算の中核となり、インスタンス生成も担当。
2. **S3Scene**が、各モデル・ライト・カメラを保持し、`S3System`からの描画要求で内容を渡す。
3. **S3MeshLoader**を通じて、外部3Dデータを読み込み、`S3Mesh`へ展開。
4. 各モデルは自身の`S3Mesh`を持ち、ワールド変換行列は`S3System`で算出。
5. 描画時は、S3Systemがモデル・カメラ・シーン情報からMVP行列等を組み立て、Canvasにライン/シェーディング等を描く。

## シンプルな利用例

```js
import S3 from "./S3.js";
const sys = new S3.System();
const scene = sys.createScene();
const camera = sys.createCamera();
scene.setCamera(camera);

const mesh = sys.createMesh();
// ... meshに頂点・面・マテリアル追加 ...

const model = sys.createModel();
model.setMesh(mesh);
scene.addModel(model);

sys.setCanvas(document.getElementById("canvas"));
sys.drawScene(scene);
```

## まとめ

* **責務分離・シンプル設計。**
* **数値系/ジオメトリ/シーン管理/各種ローダーは独立性高く拡張容易。**
* **WebGL化や独自レンダラ、拡張フォーマット対応も視野に入れた柔軟アーキテクチャ。**

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
