// --- ライブラリの読み込み ---
// UI操作用ライブラリ
import GuiBlocks from "./libs/GuiBlocks.min.js";
// 入力デバイス（マウスやタッチ）操作用ライブラリ
import InputDetect from "./libs/InputDetect.min.js";
// 3DCGエンジン本体（あなたが作ったS3ライブラリ）
import S3 from "./libs/S3.min.js";

/**
 * S3ライブラリ内の数値計算クラスのデモ関数
 * 行列の作成・計算・逆行列など、基本的な数値処理のサンプルを表示します。
 */
const testMath = function() {
	console.log("Math のサンプル");

	// 4x4行列の生成
	const m4 = new S3.Matrix(
		3, -2, -6, 4,
		-7, -6, 8, 21,
		-4, -7, 9, 11,
		2, -3, -5, 8
	);

	console.log("行列を作成");
	console.log(m4.toString());

	// 4x4行列の行列式を計算（det4）
	console.log("4x4行列の行列式");
	console.log(m4.det4().toString());

	// 4x4行列の逆行列を計算（inverse4）
	console.log("4x4行列の逆行列");
	console.log(m4.inverse4().toString());

	// 行列同士の掛け算
	console.log("行列の掛け算");
	console.log(m4.mulMatrix(m4).toString());

	// 3x3行列の生成
	const m3 = new S3.Matrix(
		1, 2, 1,
		2, 1, 0,
		1, 1, 2
	);

	// 3x3行列の行列式
	console.log("3x3行列の行列式");
	console.log(m3.det3().toString());

	// 3x3行列の逆行列
	console.log("3x3行列の逆行列");
	console.log(m3.inverse3().toString());
};

/**
 * メイン処理（ウィンドウ表示・3D描画）
 */
const main = function() {
	testMath(); // まず数値計算デモを実行

	console.log("S3 クラスのサンプル");

	// スクロールを抑止（マウスやタッチ操作が3D操作用イベントとして優先されるようにする）
	InputDetect.noScroll();

	// --- GUIパネル（描画用キャンバス）を作成 ---
	// 640x480ピクセルの描画パネル（HTML canvas）を作成
	const panel = new GuiBlocks.SCanvas();
	// id="scomponent" の要素内にこのパネルを追加
	panel.putMe("scomponent", GuiBlocks.PUT_TYPE.IN);
	// サイズ単位をピクセルで設定
	panel.setUnit(GuiBlocks.UNIT_TYPE.PX);
	panel.setPixelSize(640, 480);  // 実際のピクセルサイズ
	panel.setSize(640, 480);       // 論理サイズ

	{
		// HTMLCanvasElementを取得
		const canvas = panel.getCanvas();

		// S3システム本体（描画エンジン管理クラス）を作成
		const sys = new S3.System();
		// カメラ操作用コントローラを作成
		const controller = new S3.CameraController();
		// カメラ（視点）を生成
		const camera = sys.createCamera();

		// S3システムにcanvasを登録（描画の出力先を指定）
		sys.setCanvas(canvas);
		// カメラ操作コントローラにもcanvasを登録（マウス操作取得）
		controller.setCanvas(canvas);

		// システムの座標系モードをOpenGL互換に設定（右手系、逆順カリングなど）
		sys.setSystemMode(S3.SYSTEM_MODE.OPEN_GL);
		// DirectX互換の場合はこちら
		// sys.setSystemMode(S3.SYSTEM_MODE.DIRECT_X);

		// --- 3Dモデルデータの作成と読み込みデモ ---
		console.log("json形式での読み書きのテスト");
		// サンプル用の簡単なポリゴン（四面体っぽい）データ
		const meshdata = {
			Indexes:{
				body:[
					[ 0, 1, 2],
					[ 3, 1, 0],
					[ 3, 0, 2],
					[ 3, 2, 1]
				]
			},
			Vertices:[
				[  0,  0,  -5],
				[  0, 20,  -5],
				[ 10,  0,  -5],
				[  0,  0, -20]
			]
		};

		let mesh;
		// JSONデータからS3Meshにインポート
		console.log(".json");
		mesh = S3.MeshLoader.inputData(sys, meshdata, "json");
		// S3MeshをJSON形式でエクスポート（逆変換）
		console.log(S3.MeshLoader.outputData(mesh, "json"));

		// MQO形式（Metasequoia 3Dモデラー用）のエクスポートテスト
		console.log("MQOでの出力テスト");
		console.log(".mqo");
		console.log(S3.MeshLoader.outputData(mesh, "mqo"));

		// MQOファイルのインポートテスト（ファイルは ./resource/teapot.mqo を想定）
		console.log("MQOでの入力テスト");
		mesh = S3.MeshLoader.inputData(sys, "./resource/teapot.mqo");

		// --- モデル（位置・回転・スケールを持つ3Dオブジェクト）を作成 ---
		const model = sys.createModel();
		model.setMesh(mesh);    // 形状データをセット
		model.setScale(5);      // 全体スケールを5倍に設定

		// --- カメラ（視点）の初期設定 ---
		camera.setEye(new S3.Vector( 20,  30,  50));   // 視点（カメラ位置）を設定
		camera.setCenter(new S3.Vector( 0,  0,  0));   // 注視点（カメラが向く中心）を設定
		controller.setCamera(camera);                  // カメラコントローラにカメラを登録

		// --- シーン（3D空間）を作成してモデルとカメラを配置 ---
		const scene = sys.createScene();
		scene.setCamera(camera);        // シーンにカメラをセット
		scene.addModel(model);          // モデルをシーンに追加

		/**
		 * 画面を定期的に再描画する関数（アニメーションループ）
		 * モデルを回転させたり、カメラコントローラで動的に視点操作できる
		 */
		const redraw = function() {
			// コントローラの入力に合わせてカメラを更新
			scene.setCamera(controller.getCamera());
			sys.clear();           // 描画バッファをクリア
			model.addRotateY(3);   // モデルをY軸回転させる（毎フレーム3度）
			sys.drawAxis(scene);   // XYZ軸を描画（デバッグ・可視化用）
			sys.drawScene(scene);  // シーン全体を描画（全モデルを表示）
		};

		console.log(model);

		// 50ミリ秒ごとにredraw()を実行（1秒あたり約20回の描画更新＝アニメーション）
		setInterval(redraw, 50);
	}
};

// メイン関数実行（最初に呼ばれる）
main();
