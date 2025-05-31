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
