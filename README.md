# S3js – シンプルな3DCG描画ライブラリ

JavaScriptで手軽に3Dグラフィックスを扱うための軽量3DCGライブラリです。  
シーン・モデル・メッシュ・マテリアル・ライト・カメラの管理をシンプルなAPIで実現し、OBJ・MQO・JSON形式によるモデルのインポートも可能です。

## 特徴

- 純粋JavaScriptで動作
- 依存ライブラリ不要・軽量設計
- Canvas 2D描画に対応（WebGL拡張も可能）
- モデル・メッシュ・マテリアル・カメラ・ライト等の3Dシーン構成を簡単管理
- OBJ / MQO / JSON形式のメッシュ入力サポート
- right-hand/left-hand座標系、OpenGL/DirectX描画モード切替対応
- ベクトル・行列演算など3D数学ユーティリティ搭載

## サンプルコード

```js
import S3 from "./S3.js";

// 1. システム初期化
const s3system = new S3.System();

// 2. シーン生成
const scene = s3system.createScene();

// 3. カメラ設定
const camera = s3system.createCamera();
scene.setCamera(camera);

// 4. モデル生成（OBJファイルを読み込む例）
import S3MeshLoader from "./loader/S3MeshLoader.js";
const mesh = S3.MeshLoader.inputData(s3system, "model.obj", "OBJ");
const model = s3system.createModel();
model.setMesh(mesh);
scene.addModel(model);

// 5. ライト追加
const light = s3system.createLight();
scene.addLight(light);

// 6. Canvasへ描画
const canvas = document.getElementById("canvas3d");
s3system.setCanvas(canvas);
s3system.drawScene(scene);
````

## ディレクトリ構成

* `basic/` ... 主要な3D要素（Mesh/Model/Material/Light/Camera/Scene など）
* `math/` ... ベクトル・行列・角度など数値演算クラス
* `loader/` ... OBJ/MQO/JSON対応のメッシュローダ
* `gl/` ... WebGL拡張用クラス
* `tools/` ... 補助ツール（カメラコントローラ等）

## 主なクラス構成

* `S3System` … シーン管理・主要ファクトリ・描画処理
* `S3Model` … 3Dモデル（配置/スケール/回転）
* `S3Mesh` … メッシュ形状（頂点/面/マテリアル）
* `S3Material` … マテリアル（色/拡散/鏡面/テクスチャ等）
* `S3Light` … ライト（環境/点光源/平行光源）
* `S3Camera` … カメラ（視点/注視点/視野角等）
* `S3Scene` … シーン（モデル/ライト/カメラ一括管理）
* `S3Vector, S3Matrix` … 数学ユーティリティ
* `S3MeshLoader` … OBJ/MQO/JSON等の入出力

## ライセンス

MIT License
