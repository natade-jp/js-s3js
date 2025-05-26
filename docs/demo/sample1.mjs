import GuiBlocks from "./libs/GuiBlocks.min.js";
import InputDetect from "./libs/InputDetect.min.js";
import S3 from "./libs/S3.js";

const testMath = function() {
	
	console.log("Math のサンプル");
	
	const m4 = new S3.Matrix(
		3, -2, -6, 4,
		-7, -6, 8, 21,
		-4, -7, 9, 11,
		2, -3, -5, 8
	);
	
	console.log("行列を作成");
	console.log(m4.toString());
	
	console.log("4x4行列の行列式");
	console.log(m4.det4().toString());
	
	console.log("4x4行列の逆行列");
	console.log(m4.inverse4().toString());
	
	console.log("行列の掛け算");
	console.log(m4.mulMatrix(m4).toString());
	
	const m3 = new S3.Matrix(
		1, 2, 1,
		2, 1, 0,
		1, 1, 2
	);
	
	console.log("3x3行列の行列式");
	console.log(m3.det3().toString());
	
	console.log("3x3行列の逆行列");
	console.log(m3.inverse3().toString());
	
};

const main = function() {
	
	testMath();

	console.log("S3 クラスのサンプル");
	
	// 縦スクロール防止
	InputDetect.noScroll();
	
	// パネルを作って、指定した ID の要素内に入れる。
	const panel = new GuiBlocks.SCanvas();
	panel.putMe("scomponent", GuiBlocks.PUT_TYPE.IN);
	panel.setUnit(GuiBlocks.UNIT_TYPE.PX);
	panel.setPixelSize(640, 480);
	panel.setSize(640, 480);
	
	{
		const canvas = panel.getCanvas();
		
		const sys = new S3.System();
		const controller = new S3.CameraController();
		const camera = sys.createCamera();

		sys.setCanvas(canvas);
		controller.setCanvas(canvas);

		sys.setSystemMode(S3.SYSTEM_MODE.OPEN_GL);
		// s3.setSystemMode(S3.SYSTEM_MODE.DIRECT_X);

		console.log("json形式での読み書きのテスト");
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
		console.log(".json");
		mesh = S3.MeshLoader.inputData(sys, meshdata, "json");
		console.log(S3.MeshLoader.outputData(mesh, "json"));

		console.log("MQOでの出力テスト");
		console.log(".mqo");
		console.log(S3.MeshLoader.outputData(mesh, "mqo"));

		console.log("MQOでの入力テスト");
		mesh = S3.MeshLoader.inputData(sys, "./resource/teapot.mqo");

		const model = sys.createModel();
		model.setMesh(mesh);
		model.setScale(5);

		camera.setEye(new S3.Vector( 20,  30,  50));
		camera.setCenter(new S3.Vector( 0,  0,  0));
		controller.setCamera(camera);

		const scene = sys.createScene();
		scene.setCamera(camera);
		scene.addModel(model);

		const redraw = function() {
			scene.setCamera(controller.getCamera());
			sys.clear();
			model.addRotateY(3);
			sys.drawAxis(scene);
			sys.drawScene(scene);
		};

		console.log(model);

		//setTimeout(redraw, 50);
		setInterval(redraw, 50);
	}
};

main();

