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
