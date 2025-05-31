# WebGLの3D描写のデモ

以下で実際を確認できます。

- [demo2](../demo/sample2.html)

## sample2.mjs

``` js
// 外部UIライブラリやS3エンジンの読み込み
import GuiBlocks from "./libs/GuiBlocks.min.js";
import InputDetect from "./libs/InputDetect.min.js";
import S3 from "./libs/S3.min.js";

/**
 * WebGLによる3D描画テスト用クラス
 * S3エンジンとGUI部品を組み合わせて動作するデモアプリです。
 */
class S3DGLTest {

	constructor() {
		// S3のWebGLシステム（レンダリング管理）を初期化
		this.s3 = new S3.GLSystem();

		// カメラ操作用コントローラーを初期化
		this.controller = new S3.CameraController();

		// カメラ、メッシュ、モデルの参照を初期化
		this.camera = null;
		this.mesh = null;
		this.model = null;
	}

	/**
	 * WebGL描画用Canvasの初期化処理
	 * @param {HTMLCanvasElement} canvas - 描画対象のCanvas要素
	 */
	initCanvas(canvas) {
		const s3 = this.s3;
		// 背景色を黒に設定
		s3.setBackgroundColor(new S3.Vector(0, 0, 0));
		// WebGLコンテキストをCanvasにセット
		s3.setCanvas(canvas);
		// カメラ操作用のCanvasも登録
		this.controller.setCanvas(canvas);

		// 3Dカメラを生成
		this.camera = s3.createCamera();

		// シェーダープログラム（GLSL）を作成・セット
		const program = s3.createProgram();
		program.setFragmentShader("./libs/S3GL.frag"); // フラグメントシェーダ
		program.setVertexShader("./libs/S3GL.vert");   // バーテックスシェーダ
		s3.setProgram(program);

		// 描画方式などの初期パラメータ
		s3.setSystemMode(S3.SYSTEM_MODE.OPEN_GL);       // OpenGL方式
		s3.setFrontMode(S3.FRONT_FACE.CLOCKWISE);       // 面の表裏判定を時計回りに

		// カメラの視点と注視点を設定
		this.camera.setEye(new S3.Vector(20, 30, 50));  // カメラの位置
		this.camera.setCenter(new S3.Vector(0, 0, 0));  // 注視点（原点）

		// コントローラーにカメラをセット（ユーザー操作反映用）
		this.controller.setCamera(this.camera);
	}

	/**
	 * 現在のモデル・メッシュをクリア（削除）する
	 * 破棄・参照切り離しでリソースリークを防ぐ
	 */
	clearModel() {
		if (this.model) {
			this.model = null;
		}
		if (this.mesh) {
			this.mesh.dispose(); // GLリソース解放
			this.mesh = null;
		}
	}

	/**
	 * モデル（3D形状データ）を読み込んでセットする
	 * @param {string} url - MQOファイルなどのリソースパス
	 */
	setModel(url) {
		const s3 = this.s3;
		// 新しい3Dモデルオブジェクト生成
		const newmodel = s3.createModel();
		// メッシュローダーでファイルからメッシュデータ生成
		const newmesh = S3.MeshLoader.inputData(s3, url);
		// モデルにメッシュを登録
		newmodel.setMesh(newmesh);

		// 既存のモデルをクリア
		this.clearModel();

		// 読み込んだモデル・メッシュを保持
		this.model = newmodel;
		this.mesh = newmesh;
	}

	/**
	 * シーンの描画処理
	 * カメラ、ライト、モデルをまとめてS3エンジンでレンダリング
	 */
	draw() {
		const s3 = this.s3;
		// シーン（Scene）を作成
		const scene = s3.createScene();

		// コントローラーからカメラ取得し、シーンに登録
		scene.setCamera(this.controller.getCamera());

		// モデルがセットされていればシーンに追加し、動きをつける
		if (this.model !== null) {
			scene.addModel(this.model);
			this.model.setScale(5);      // モデルを拡大
			this.model.addRotateY(3);    // モデルをY軸周りに回転
		}

		// 環境に3つのライト（光源）を追加
		// 1. 上方向からの平行光源
		const light_down = s3.createLight();
		light_down.setMode(S3.LIGHT_MODE.DIRECTIONAL_LIGHT);
		light_down.setColor(new S3.Vector(0.6, 0.6, 1.0));
		light_down.setDirection(new S3.Vector(0, -1, 0));
		scene.addLight(light_down);

		// 2. 環境光
		const light_ambient = s3.createLight();
		light_ambient.setMode(S3.LIGHT_MODE.AMBIENT_LIGHT);
		light_ambient.setColor(new S3.Vector(0.0, 0.1, 0.05));
		scene.addLight(light_ambient);

		// 3. ポイントライト（位置指定の点光源）
		const light_point = s3.createLight();
		light_point.setMode(S3.LIGHT_MODE.POINT_LIGHT);
		light_point.setColor(new S3.Vector(0.9, 0.9, 1.0));
		light_point.setPosition(new S3.Vector(100, 0, 0));
		light_point.setRange(200); // 有効範囲
		scene.addLight(light_point);

		// バッファ等の初期化
		s3.clear();

		// シーンを描画
		s3.drawScene(scene);
	}

}

// このクラスのインスタンスを生成しグローバル参照
const gl = new S3DGLTest();

/**
 * WebGL描画パネル（Canvasと連携したUI部品）の生成
 * - 画面上に1280x720のWebGLキャンバスを配置
 * - テスト用の3Dモデル（teapot.mqo）を初期表示
 * - 50msごとに描画を更新
 */
const createWebGLPanel2 = function() {
	const panel = new GuiBlocks.Canvas();
	panel.putMe("webglpanel", GuiBlocks.PUT_TYPE.IN);
	panel.setUnit(GuiBlocks.UNIT_TYPE.PX);
	panel.setPixelSize(1280, 720);

	const canvas = panel.getCanvas();

	gl.initCanvas(canvas); // WebGLセットアップ
	gl.setModel("./resource/teapot.mqo"); // ティーポット3Dモデル読み込み

	const redraw = function() {
		gl.draw(); // 画面更新
	};

	// 描画ループ（50ms間隔）
	setInterval(redraw, 50);
	// ※setTimeoutによる単発描画も可能
};

/**
 * 操作用パネルの生成
 * - ファイル選択用のコンボボックス（mqoモデルのリスト）
 * - 「load」ボタンでモデルの切り替えが可能
 */
const createOperationPanel = function() {
	const filepanel = new GuiBlocks.Panel("ファイル");
	filepanel.putMe("operationpanel", GuiBlocks.PUT_TYPE.IN);

	const filebox = new GuiBlocks.ComboBox([
		"./resource/teapot.mqo",
		"./resource/bumptest.mqo"
	]);
	filebox.putMe(filepanel, GuiBlocks.PUT_TYPE.IN);

	const loadbutton = new GuiBlocks.Button("load");
	loadbutton.putMe(filebox, GuiBlocks.PUT_TYPE.NEWLINE);
	loadbutton.addListener(function () {
		const filename = filebox.getSelectedItem();
		console.log(filename);
		gl.setModel(filename); // 新しいモデルに切り替え
	});
};

/**
 * メイン処理
 * - コンソール出力
 * - スクロール抑止
 * - WebGLパネルと操作パネルのセットアップ
 */
const main = function() {
	console.log("S3DGL クラスのサンプル");

	// スマホ等でのスクロールを抑制
	InputDetect.noScroll();

	// WebGL描画パネル生成
	createWebGLPanel2();
	// 操作パネル生成
	createOperationPanel();
};

// アプリ起動
main();
```

## S3GL.vert

~~~ c
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
~~~

## S3GL.frag

~~~ c
// ========================================================================
// フラグメント（ピクセル）シェーダ
// このシェーダは、各ピクセル（画面上の1点）ごとに実行されます。
// ライティング、テクスチャ、マテリアル、ノーマルマップなどの情報を使って
// 最終的な色（gl_FragColor）を決定します。
// ========================================================================

// ---------- 精度の指定（必須：ESのGLSL） ------------------------------
precision mediump float;

// ---------- 材質（マテリアル）関連のuniform変数 -------------------------
// JavaScript側から各マテリアルごとにセットされる（最大4つまで）

#define MATERIALS_MAX 4

uniform vec4 materialsColorAndDiffuse[MATERIALS_MAX];
//  [R, G, B, 拡散率]（カラー＋ディフューズ）

uniform vec4 materialsSpecularAndPower[MATERIALS_MAX];
//  [R, G, B, 光沢度]（スペキュラ＋パワー）

uniform vec3 materialsEmission[MATERIALS_MAX];
//  発光色（エミッシブ）

uniform vec4 materialsAmbientAndReflect[MATERIALS_MAX];
//  [R, G, B, 反射率]（アンビエント＋リフレクト）

uniform vec2 materialsTextureExist[MATERIALS_MAX];
//  [カラーテクスチャの有無, ノーマルテクスチャの有無]（1:あり, 0:なし）

uniform sampler2D materialsTextureColor[MATERIALS_MAX];
//  カラーテクスチャ（画像）

uniform sampler2D materialsTextureNormal[MATERIALS_MAX];
//  ノーマルマップ（法線マップ用画像）

// ---------- 変換行列のuniform（主に法線変換で使う） ----------------------
uniform mat4 matrixWorldToLocal4; // ワールド→ローカル変換（逆行列など）
uniform mat3 matrixLocalToWorld3; // ローカル→ワールド変換（回転のみ3x3行列）

// ---------- ライト（光源）情報のuniform ---------------------------------

#define LIGHTS_MAX 4
#define LIGHT_MODE_NONE		0
#define LIGHT_MODE_AMBIENT	 1
#define LIGHT_MODE_DIRECTIONAL 2
#define LIGHT_MODE_POINT	   3

uniform int lightsLength;				 // 実際に使う光源の数
uniform vec4 lightsData1[LIGHTS_MAX];	 // 光源の種類・レンジ・方向/位置(XY)
uniform vec4 lightsData2[LIGHTS_MAX];	 // 方向/位置(Z), 光源色(RGB)

// ---------- カメラ情報（視線ベクトル） ---------------------------------
uniform vec3 eyeWorldDirection;

// ---------- 頂点シェーダから渡された補間値 ------------------------------
varying float interpolationMaterialFloat;	// マテリアル番号（float型）
varying vec3 interpolationNormal;		   // 法線ベクトル
varying vec3 interpolationBinormal;		 // バイノーマル
varying vec3 interpolationTangent;		  // タンジェント
varying vec3 interpolationPosition;		 // ワールド空間での頂点位置
varying vec2 interpolationTextureCoord;	 // テクスチャUV座標

// ========================================================================
// メイン処理開始
// ========================================================================
void main(void) {

	// ----- 定数定義（色やノーマルの基準値） ----------------------------
	const vec4 ZERO	  = vec4(0.0, 0.0, 0.0, 0.0);
	const vec4 ONE	   = vec4(1.0, 1.0, 1.0, 1.0);
	const vec4 WHITE	 = ONE;
	const vec3 NORMALTOP = vec3(0.5, 0.5, 1.0); // 法線マップのデフォルト

	// ----- 1. 頂点シェーダから受け取った値の初期処理 ------------------

	int   vertexMaterial = int(interpolationMaterialFloat); // マテリアル番号をintに変換
	vec3  vertexNormal   = normalize(interpolationNormal);
	vec3  vertexBinormal = normalize(interpolationBinormal);
	vec3  vertexTangent  = normalize(interpolationTangent);

	// ----- 2. 面ごとのマテリアル情報（配列から抽出） ------------------

	// 各種マテリアル属性値（色、反射率、テクスチャ有無など）を取得
	vec3  materialColor;
	float materialDiffuse;
	vec3  materialSpecular;
	float materialPower;
	vec3  materialEmission;
	vec3  materialAmbient;
	float materialReflect;
	float materialRoughness;
	vec4  materialTextureColor;
	vec3  materialTextureNormal;
	bool  materialIsSetNormal;

	{
		// 材質配列（最大4つ）から該当インデックスを選択
		if (vertexMaterial < 4) {
			// 材質番号ごとに各種パラメータを取り出す
			// 下記のような分岐は、配列に対してインデックスでアクセスしやすくするため
			if(vertexMaterial < 2) {
				if(vertexMaterial == 0) {
					materialColor		 = materialsColorAndDiffuse[0].xyz;
					materialDiffuse	   = materialsColorAndDiffuse[0].z;
					materialSpecular	  = materialsSpecularAndPower[0].xyz;
					materialPower		 = materialsSpecularAndPower[0].w;
					materialEmission	  = materialsEmission[0];
					materialAmbient	   = materialsAmbientAndReflect[0].xyz;
					materialReflect	   = materialsAmbientAndReflect[0].w;
					materialTextureColor  = materialsTextureExist[0].x > 0.5 ?
						texture2D(materialsTextureColor[0], interpolationTextureCoord) : WHITE;
					materialIsSetNormal   = materialsTextureExist[0].y > 0.5;
					materialTextureNormal = materialIsSetNormal ?
						texture2D(materialsTextureNormal[0], interpolationTextureCoord).xyz : NORMALTOP;
				}
				else {
					// 1番のマテリアル
					materialColor		 = materialsColorAndDiffuse[1].xyz;
					materialDiffuse	   = materialsColorAndDiffuse[1].z;
					materialSpecular	  = materialsSpecularAndPower[1].xyz;
					materialPower		 = materialsSpecularAndPower[1].w;
					materialEmission	  = materialsEmission[1];
					materialAmbient	   = materialsAmbientAndReflect[1].xyz;
					materialReflect	   = materialsAmbientAndReflect[1].w;
					materialTextureColor  = materialsTextureExist[1].x > 0.5 ?
						texture2D(materialsTextureColor[1], interpolationTextureCoord) : WHITE;
					materialIsSetNormal   = materialsTextureExist[1].y > 0.5;
					materialTextureNormal = materialIsSetNormal ?
						texture2D(materialsTextureNormal[1], interpolationTextureCoord).xyz : NORMALTOP;
				}
			}
			else {
				if(vertexMaterial == 2) {
					// 2番のマテリアル
					materialColor		 = materialsColorAndDiffuse[2].xyz;
					materialDiffuse	   = materialsColorAndDiffuse[2].z;
					materialSpecular	  = materialsSpecularAndPower[2].xyz;
					materialPower		 = materialsSpecularAndPower[2].w;
					materialEmission	  = materialsEmission[2];
					materialAmbient	   = materialsAmbientAndReflect[2].xyz;
					materialReflect	   = materialsAmbientAndReflect[2].w;
					materialTextureColor  = materialsTextureExist[2].x > 0.5 ?
						texture2D(materialsTextureColor[2], interpolationTextureCoord) : WHITE;
					materialIsSetNormal   = materialsTextureExist[2].y > 0.5;
					materialTextureNormal = materialIsSetNormal ?
						texture2D(materialsTextureNormal[2], interpolationTextureCoord).xyz : NORMALTOP;
				}
				else {
					// 3番のマテリアル
					materialColor		 = materialsColorAndDiffuse[3].xyz;
					materialDiffuse	   = materialsColorAndDiffuse[3].z;
					materialSpecular	  = materialsSpecularAndPower[3].xyz;
					materialPower		 = materialsSpecularAndPower[3].w;
					materialEmission	  = materialsEmission[3];
					materialAmbient	   = materialsAmbientAndReflect[3].xyz;
					materialReflect	   = materialsAmbientAndReflect[3].w;
					materialTextureColor  = materialsTextureExist[3].x > 0.5 ?
						texture2D(materialsTextureColor[3], interpolationTextureCoord) : WHITE;
					materialIsSetNormal   = materialsTextureExist[3].y > 0.5;
					materialTextureNormal = materialIsSetNormal ?
						texture2D(materialsTextureNormal[3], interpolationTextureCoord).xyz : NORMALTOP;
				}
			}
		}
		// ラフネス（ざらざら感）は光沢度から計算
		// ラフネス値(0...1)を暫定計算(大きいほどざらざらしている)
		materialRoughness = (100.0 - materialPower) * 0.01;
	}

	// ----- 3. テクスチャ反映・ノーマルマッピング ------------------------
	{
		// カラーテクスチャで色を掛ける
		materialColor *= materialTextureColor.xyz;

		// ノーマルマップ（法線テクスチャ）を使う場合
		if(materialIsSetNormal) {
			// [0,1] -> [-1,1]の範囲へ変換
			materialTextureNormal = (materialTextureNormal * 2.0 - 1.0);
			// 接線空間からワールド空間に変換
			vertexNormal = normalize(
				-materialTextureNormal.x * vertexTangent +
				materialTextureNormal.y * vertexBinormal +
				materialTextureNormal.z * vertexNormal);
		}
	}

	// ----- 4. 反射ベクトルや視線方向の計算 ------------------------------
	
	// 反射ベクトル
	vec3 vertexReflectVector = reflect(eyeWorldDirection, normalize(matrixLocalToWorld3 * vertexNormal));

	// カメラが向いている方向を取得
	vec3 eyeDirection = normalize(matrixWorldToLocal4 * vec4(eyeWorldDirection, 0.0)).xyz;

	// ----- 5. 出力色の初期化 --------------------------------------------
	vec3 destDiffuse  = materialColor * materialEmission;
	vec3 destSpecular = ZERO.xyz;
	vec3 destAmbient  = materialAmbient * 0.2;

	// 光源全体の平均色（反射表現などに使う）
	vec3 averageLightsColor = ZERO.xyz;

	// ----- 6. ライティング計算 ------------------------------------------
	{
		// 全ライトについて計算
		for(int i = 0; i < LIGHTS_MAX; i++) {
			int   lightMode   = int(lightsData1[i].x);
			float lightRange  = lightsData1[i].y;
			vec3  lightVector = vec3(lightsData1[i].zw, lightsData2[i].x);
			vec3  lightColor  = lightsData2[i].yzw;

			// 平行光源・点光源
			if((lightMode == LIGHT_MODE_DIRECTIONAL) || (lightMode == LIGHT_MODE_POINT)) {
				bool is_direction = lightMode == LIGHT_MODE_DIRECTIONAL;
				// 光源の向きや位置を求める
				// 光源の種類によって、ピクセルと光への方向ベクトルの計算を変える
				// lightsVector は、点光源なら位置を、平行光源なら方向を指す値
				vec3 lightDirection = is_direction ?
					normalize(matrixWorldToLocal4 * vec4(lightVector, 0.0)).xyz :
					normalize(matrixWorldToLocal4 * vec4(interpolationPosition - lightVector, 1.0)).xyz;
				float d = is_direction ? -1.0 : length(lightVector - interpolationPosition);

				if(d < lightRange) {
					// 距離減衰
					float rate = is_direction ? 1.0 : pow(1.0 - (d / lightRange), 0.5);
					// 拡散反射（ランバート反射）
					float diffuse = clamp(((dot(vertexNormal, lightDirection) * 0.9) + 0.1) * materialDiffuse, 0.0, 1.0);
					destDiffuse  += lightColor * materialColor.xyz * diffuse * rate;
					// 鏡面反射（ブリン・フォン）
					vec3  halfLightEye = normalize(lightDirection + eyeDirection);
					float specular	 = pow(clamp(dot(vertexNormal, halfLightEye), 0.0, 1.0), materialPower);
					destSpecular	  += lightColor * materialSpecular.xyz * specular * rate;
				}
			}
			// アンビエントライト（環境光）
			else if(lightMode == LIGHT_MODE_AMBIENT) {
				destDiffuse += lightColor * materialColor.xyz;
				destAmbient += lightColor * materialAmbient.xyz;
			}

			// 光の平均色（反射・環境エフェクト用）
			averageLightsColor += lightColor;

			// 実際に使う光源数分だけループ
			if(i == lightsLength) {
				break;
			}
		}
		// 平均色を正規化
		if(0 < lightsLength) {
			averageLightsColor /= vec3(lightsLength, lightsLength, lightsLength);
		}
	}

	// ----- 7. 反射表現（リフレクションの模様作成）-----------------------
	vec3 destColor = ZERO.xyz;

	{
		// アンビエント光
		destColor += destAmbient;

		// 拡散反射（反射率が高いほど弱くする）
		destColor += clamp(destDiffuse * (1.0 - materialReflect * 0.8), 0.0, 1.0);

		// 鏡面反射
		destColor += destSpecular;

		// 反射のエフェクト（物体に周囲の色が写り込む）
		if(materialReflect > 0.0001) {
			// リフレクト用の簡易ノイズ模様を計算（ラフネスで模様のボケ方を制御）
			float x = vertexReflectVector.y;
			float x1 = mix(-0.1, -0.5, materialRoughness);
			float x2 = mix(0.01,  0.5, materialRoughness);
			float c1 = mix(-0.3,  0.5, materialRoughness);
			float c2 = mix( 0.9,  0.6, materialRoughness);
			float c3 = mix( 0.3,  0.4, materialRoughness);
			float c4 = mix( 1.2,  0.8, materialRoughness);
			float c5 = mix( 0.3,  0.5, materialRoughness);

			x = x < x1 ? mix( c1, c2, (x + 1.0) * (1.0 / (1.0 + x1))) :
				x < 0.0 ? mix( c2, c3, (x - x1) * (1.0 / -x1)) :
				x < x2  ? mix( c3, c4, x * (1.0 / x2)) :
						  mix( c4, c5, (x - x2) * (1.0 / (1.0 - x2))) ;

			// 光沢・ラフネスの影響も反映した色模様
			//  リフレクトが大きいほどはっきり強くうつりこむ
			//  映り込む模様は、周りの光の色に影響する
			vec3 reflectColor = vec3(x, x, x) * materialReflect * averageLightsColor;

			// 映り込む模様の色
			//  ラフネスが大きいほど、物体の色で映り込む
			//  ラフネスが小さいほど、スペキュラの色で映り込む
			reflectColor *= materialRoughness * materialColor + (1.0 - materialRoughness) * materialSpecular;

			destColor += reflectColor;
		}
	}

	// ----- 8. 出力（ピクセル色の最終決定）-------------------------------
	gl_FragColor = vec4(destColor, 1.0);
}
~~~