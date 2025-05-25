import S3Math from "../math/S3Math.js";
import S3Vector from "../math/S3Vector.js";
import S3Matrix from "../math/S3Matrix.js";

import S3Camera from "./S3Camera.js";
import S3Light from "./S3Light.js";
import S3Material from "./S3Material.js";
import S3Mesh from "./S3Mesh.js";
import S3Model from "./S3Model.js";
import S3Scene from "./S3Scene.js";
import S3Texture from "./S3Texture.js";
import S3TriangleIndex from "./S3TriangleIndex.js";
import S3Vertex from "./S3Vertex.js";

/**
 * /////////////////////////////////////////////////////////
 * 描写に使用するシーンを構成するクラス群
 * 3DCGを作成するための行列を準備したり、シーンの描写をしたりする
 *
 * 3DCGを作るうえで必要最小限の機能を提供する
 * ・それらを構成する頂点、材質、面（全てimmutable）
 * ・モデル (mutable)
 * ・カメラ (mutable)
 * ・シーン (mutable)
 * ・描写用の行列作成
 * ・描写のための必要最低限の計算
 *
 * ポリゴン情報を構成部品
 * S3Vertex			頂点
 * S3Material		素材
 * S3TriangleIndex	インデックス
 * S3Mesh			頂点とインデックス情報と素材からなるメッシュ
 *
 * ポリゴンの描写用構成部品
 * S3Model			どの座標にどのように表示するかモデル
 * S3Camera			映像をどのように映すか
 * S3Scene			モデルとカメラを使用してシーン
 * S3Texture		テクスチャ
 * /////////////////////////////////////////////////////////
 */

/**
 * 3DCGシステム全体を管理するクラス
 *
 * 3DCGのための座標変換やシーン管理、基本的な生成処理・ユーティリティ関数などをまとめて提供します。
 * 頂点やメッシュ、マテリアルなど各種オブジェクトのファクトリ機能も持ちます。
 *
 */
export default class S3System {
	/**
	 * S3Systemインスタンスを作成します。
	 * 描画モードや背景色などを初期化します。
	 */
	constructor() {
		this._init();
	}

	/**
	 * 内部状態を初期化します（描画モードや背景色のリセット）。
	 * @private
	 */
	_init() {
		this.setSystemMode(S3System.SYSTEM_MODE.OPEN_GL);
		this.setBackgroundColor(new S3Vector(1.0, 1.0, 1.0, 1.0));
	}

	/**
	 * ユニークなID文字列を発行します（テクスチャなどの管理用途）。
	 * @returns {string} 新しいID文字列
	 */
	_createID() {
		if (typeof this._CREATE_ID1 === "undefined") {
			this._CREATE_ID1 = 0;
			this._CREATE_ID2 = 0;
			this._CREATE_ID3 = 0;
			this._CREATE_ID4 = 0;
		}
		const id =
			"" +
			this._CREATE_ID4.toString(16) +
			":" +
			this._CREATE_ID3.toString(16) +
			":" +
			this._CREATE_ID2.toString(16) +
			":" +
			this._CREATE_ID1.toString(16);
		this._CREATE_ID1++;
		if (this._CREATE_ID1 === 0x100000000) {
			this._CREATE_ID1 = 0;
			this._CREATE_ID2++;
			if (this._CREATE_ID2 === 0x100000000) {
				this._CREATE_ID2 = 0;
				this._CREATE_ID3++;
				if (this._CREATE_ID3 === 0x100000000) {
					this._CREATE_ID3 = 0;
					this._CREATE_ID4++;
					if (this._CREATE_ID4 === 0x100000000) {
						this._CREATE_ID4 = 0;
						throw "createID";
					}
				}
			}
		}
		return id;
	}

	/**
	 * 画像やテキストファイルをダウンロードします。
	 * 画像拡張子ならImage要素、それ以外はテキストとして取得しコールバックします。
	 * @param {string} url 取得先URL
	 * @param {function} callback 取得完了時に呼ばれるコールバック関数
	 */
	_download(url, callback) {
		const dotlist = url.split(".");
		let isImage = false;
		const ext = "";
		if (dotlist.length > 1) {
			const ext = dotlist[dotlist.length - 1].toLocaleString();
			isImage =
				ext === "gif" || ext === "jpg" || ext === "png" || ext === "bmp" || ext === "svg" || ext === "jpeg";
		}
		if (isImage) {
			const image = new Image();
			image.onload = function () {
				callback(image, ext);
			};
			image.src = url;
			return;
		}
		const http = new XMLHttpRequest();
		/**
		 * @returns {void}
		 */
		const handleHttpResponse = function () {
			if (http.readyState === 4) {
				// DONE
				if (http.status !== 200) {
					console.log("error download [" + url + "]");
					return null;
				}
				callback(http.responseText, ext);
			}
		};
		http.onreadystatechange = handleHttpResponse;
		http.open("GET", url, true);
		http.send(null);
	}

	/**
	 * 任意の値をS3Vectorに変換します。
	 * @param {S3Vector|Array<number>|number} x 変換対象
	 * @returns {S3Vector} ベクトル化した値
	 */
	_toVector3(x) {
		if (x instanceof S3Vector) {
			return x;
		} else if (typeof x === "number") {
			return new S3Vector(x, x, x);
		} else if (x instanceof Array) {
			return new S3Vector(x[0], x[1], x[2]);
		} else {
			throw "IllegalArgumentException";
		}
	}

	/**
	 * 任意の値を数値に変換します。
	 * @param {*} x 変換対象
	 * @returns {number} 数値
	 */
	_toValue(x) {
		if (!isNaN(x)) {
			return x;
		} else {
			throw "IllegalArgumentException";
		}
	}

	/**
	 * 背景色を設定します。
	 * @param {S3Vector} color RGBAで指定する背景色
	 */
	setBackgroundColor(color) {
		this.backgroundColor = color;
	}

	/**
	 * 背景色を取得します。
	 * @returns {S3Vector} 現在の背景色（RGBA）
	 */
	getBackgroundColor() {
		return this.backgroundColor;
	}

	/**
	 * システムモードを設定します（OpenGL/DIRECT_Xなど）。
	 * 各種描画パラメータも合わせて設定されます。
	 * @param {number} mode S3System.SYSTEM_MODE で定義される値
	 */
	setSystemMode(mode) {
		this.systemmode = mode;
		if (this.systemmode === S3System.SYSTEM_MODE.OPEN_GL) {
			this.depthmode = S3System.DEPTH_MODE.OPEN_GL;
			this.dimensionmode = S3System.DIMENSION_MODE.RIGHT_HAND;
			this.vectormode = S3System.VECTOR_MODE.VECTOR4x1;
			this.frontface = S3System.FRONT_FACE.COUNTER_CLOCKWISE;
			this.cullmode = S3System.CULL_MODE.BACK;
		} else {
			this.depthmode = S3System.DEPTH_MODE.DIRECT_X;
			this.dimensionmode = S3System.DIMENSION_MODE.LEFT_HAND;
			this.vectormode = S3System.VECTOR_MODE.VECTOR1x4;
			this.frontface = S3System.FRONT_FACE.CLOCKWISE;
			this.cullmode = S3System.CULL_MODE.BACK;
		}
	}

	/**
	 * 深度（Z値の扱い）のモードを設定します。
	 * @param {number} depthmode S3System.DEPTH_MODE
	 */
	setDepthMode(depthmode) {
		this.depthmode = depthmode;
	}

	/**
	 * 座標系（右手/左手系）を設定します。
	 * @param {number} dimensionmode S3System.DIMENSION_MODE
	 */
	setDimensionMode(dimensionmode) {
		this.dimensionmode = dimensionmode;
	}

	/**
	 * ベクトル表現のモードを設定します（縦型/横型）。
	 * @param {number} vectormode S3System.VECTOR_MODE
	 */
	setVectorMode(vectormode) {
		this.vectormode = vectormode;
	}

	/**
	 * 前面と判定する面の頂点順序（時計回り/反時計回り）を設定します。
	 * @param {number} frontface S3System.FRONT_FACE
	 */
	setFrontMode(frontface) {
		this.frontface = frontface;
	}

	/**
	 * カリング（非表示面除去）の方法を設定します。
	 * @param {number} cullmode S3System.CULL_MODE
	 */
	setCullMode(cullmode) {
		this.cullmode = cullmode;
	}

	/**
	 * 描画に使うCanvasを関連付け、2D描画用Contextを内部にセットします。
	 * @param {HTMLCanvasElement} canvas 使用するcanvas要素
	 */
	setCanvas(canvas) {
		const that = this;
		const ctx = canvas.getContext("2d");
		this.canvas = canvas;

		/**
		 * 2D描画ユーティリティ
		 * @property {CanvasRenderingContext2D} context 2D描画コンテキスト
		 * @property {function(S3Vector, S3Vector):void} drawLine 2点間の直線を描画
		 * @property {function(S3Vector, S3Vector, S3Vector):void} drawLinePolygon 3点から三角形（線のみ）を描画
		 * @property {function(number):void} setLineWidth 線の太さを設定
		 * @property {function(string):void} setLineColor 線の色を設定
		 * @property {function():void} clear キャンバス全体を背景色で塗りつぶし
		 */
		this.context2d = {
			context: ctx,

			/**
			 * 2点間の直線を描画します。
			 * @param {S3Vector} v0 始点
			 * @param {S3Vector} v1 終点
			 */
			drawLine: function (v0, v1) {
				ctx.beginPath();
				ctx.moveTo(v0.x, v0.y);
				ctx.lineTo(v1.x, v1.y);
				ctx.stroke();
			},

			/**
			 * 3点で囲む三角形の外枠（線のみ）を描画します。
			 * @param {S3Vector} v0
			 * @param {S3Vector} v1
			 * @param {S3Vector} v2
			 */
			drawLinePolygon: function (v0, v1, v2) {
				ctx.beginPath();
				ctx.moveTo(v0.x, v0.y);
				ctx.lineTo(v1.x, v1.y);
				ctx.lineTo(v2.x, v2.y);
				ctx.closePath();
				ctx.stroke();
			},

			/**
			 * 線の太さを設定します（ピクセル単位）。
			 * @param {number} width 線幅
			 */
			setLineWidth: function (width) {
				ctx.lineWidth = width;
			},

			/**
			 * 線の色を設定します（CSSカラー形式）。
			 * @param {string} color 線の色（例: "rgb(255,0,0)"）
			 */
			setLineColor: function (color) {
				ctx.strokeStyle = color;
			},

			/**
			 * キャンバス全体を背景色でクリアします。
			 */
			clear: function () {
				const color = that.getBackgroundColor();
				ctx.clearRect(0, 0, that.canvas.width, that.canvas.height);
				ctx.fillStyle =
					"rgba(" + color.x * 255 + "," + color.y * 255 + "," + color.z * 255 + "," + color.w + ")";
				ctx.fillRect(0, 0, that.canvas.width, that.canvas.height);
			}
		};
	}

	/**
	 * 三角形がカリング対象かどうか判定します。
	 * @param {S3Vector} p1 頂点1
	 * @param {S3Vector} p2 頂点2
	 * @param {S3Vector} p3 頂点3
	 * @returns {boolean} trueの場合は描画しない
	 */
	testCull(p1, p2, p3) {
		if (this.cullmode === S3System.CULL_MODE.NONE) {
			return false;
		}
		if (this.cullmode === S3System.CULL_MODE.FRONT_AND_BACK) {
			return true;
		}
		const isclock = S3Vector.isClockwise(p1, p2, p3);
		if (isclock === null) {
			return true;
		} else if (!isclock) {
			if (this.frontface === S3System.FRONT_FACE.CLOCKWISE) {
				return this.cullmode !== S3System.CULL_MODE.BACK;
			} else {
				return this.cullmode !== S3System.CULL_MODE.FRONT;
			}
		} else {
			if (this.frontface === S3System.FRONT_FACE.CLOCKWISE) {
				return this.cullmode === S3System.CULL_MODE.BACK;
			} else {
				return this.cullmode === S3System.CULL_MODE.FRONT;
			}
		}
	}

	/**
	 * ビューポート行列を生成します。
	 * @param {number} x 左上X
	 * @param {number} y 左上Y
	 * @param {number} Width 幅
	 * @param {number} Height 高さ
	 * @param {number} [MinZ=0.0] 最小深度
	 * @param {number} [MaxZ=1.0] 最大深度
	 * @returns {S3Matrix} ビューポート変換行列
	 */
	getMatrixViewport(x, y, Width, Height, MinZ, MaxZ) {
		if (MinZ === undefined) {
			MinZ = 0.0;
		}
		if (MaxZ === undefined) {
			MaxZ = 1.0;
		}
		// M.m11 は、DirectXだとマイナス、OpenGLだとプラスである
		// 今回は、下がプラスであるcanvasに表示させることを考えて、マイナスにしてある。
		const M = new S3Matrix();
		M.m00 = Width / 2;
		M.m01 = 0.0;
		M.m02 = 0.0;
		M.m03 = 0.0;
		M.m10 = 0.0;
		M.m11 = -Height / 2;
		M.m12 = 0.0;
		M.m13 = 0.0;
		M.m20 = 0.0;
		M.m21 = 0.0;
		M.m22 = 1.0;
		M.m23 = 1.0;
		M.m30 = x + Width / 2;
		M.m31 = y + Height / 2;
		M.m32 = 0.0;
		M.m33 = 1.0;

		if (this.depthmode === S3System.DEPTH_MODE.DIRECT_X) {
			M.m22 = MinZ - MaxZ;
			M.m32 = MinZ;
		} else if (this.depthmode === S3System.DEPTH_MODE.OPEN_GL) {
			M.m22 = (MinZ - MaxZ) / 2;
			M.m32 = (MinZ + MaxZ) / 2;
		}
		return this.vectormode === S3System.VECTOR_MODE.VECTOR4x1 ? M.transposed() : M;
	}

	/**
	 * 視体積の上下方向の視野角を求めます。
	 * @param {number} zoomY
	 * @returns {number}
	 */
	static calcFovY(zoomY) {
		return 2.0 * Math.atan(1.0 / zoomY);
	}

	/**
	 * アスペクト比を計算します。
	 * @static
	 * @param {number} width 幅
	 * @param {number} height 高さ
	 * @returns {number} アスペクト比
	 */
	static calcAspect(width, height) {
		return width / height;
	}

	/**
	 * 視野角（FOVY）から射影行列を生成します。
	 * @param {number} fovY 視体積の上下方向の視野角（0度から180度）
	 * @param {number} Aspect 近平面、遠平面のアスペクト比（Width / Height）
	 * @param {number} Near カメラから近平面までの距離（ニアークリッピング平面）
	 * @param {number} Far カメラから遠平面までの距離（ファークリッピング平面）
	 * @returns {S3Matrix} 射影変換行列
	 */
	getMatrixPerspectiveFov(fovY, Aspect, Near, Far) {
		const arc = S3Math.radius(fovY);
		const zoomY = 1.0 / Math.tan(arc / 2.0);
		const zoomX = zoomY / Aspect;
		const M = new S3Matrix();
		M.m00 = zoomX;
		M.m01 = 0.0;
		M.m02 = 0.0;
		M.m03 = 0.0;
		M.m10 = 0.0;
		M.m11 = zoomY;
		M.m12 = 0.0;
		M.m13 = 0.0;
		M.m20 = 0.0;
		M.m21 = 0.0;
		M.m22 = 1.0;
		M.m23 = 1.0;
		M.m30 = 0.0;
		M.m31 = 0.0;
		M.m32 = 0.0;
		M.m33 = 0.0;
		const Delta = Far - Near;
		if (Near > Far) {
			throw "Near > Far error";
		} else if (Delta === 0.0) {
			throw "divide error";
		}
		if (this.depthmode === S3System.DEPTH_MODE.DIRECT_X) {
			M.m22 = Far / Delta;
			M.m32 = (-Far * Near) / Delta;
		} else if (this.depthmode === S3System.DEPTH_MODE.OPEN_GL) {
			M.m22 = (Far + Near) / Delta;
			M.m32 = (-2.0 * Far * Near) / Delta;
		}
		if (this.dimensionmode === S3System.DIMENSION_MODE.RIGHT_HAND) {
			M.m22 = -M.m22;
			M.m23 = -M.m23;
		}
		return this.vectormode === S3System.VECTOR_MODE.VECTOR4x1 ? M.transposed() : M;
	}

	/**
	 * カメラのビュー行列を生成します。
	 * @param {S3Vector} eye カメラの座標の位置ベクトル
	 * @param {S3Vector} at カメラの注視点の位置ベクトル
	 * @param {S3Vector} [up] カメラの上への方向ベクトル
	 * @returns {S3Matrix} ビュー行列
	 */
	getMatrixLookAt(eye, at, up) {
		if (up === undefined) {
			up = new S3Vector(0.0, 1.0, 0.0);
		}
		// Z ベクトルの作成
		let Z = eye.getDirectionNormalized(at);
		if (this.dimensionmode === S3System.DIMENSION_MODE.RIGHT_HAND) {
			// 右手系なら反転
			Z = Z.negate();
		}
		// X, Y ベクトルの作成
		const X = up.cross(Z).normalize();
		const Y = Z.cross(X);
		const M = new S3Matrix();
		M.m00 = X.x;
		M.m01 = Y.x;
		M.m02 = Z.x;
		M.m03 = 0.0;
		M.m10 = X.y;
		M.m11 = Y.y;
		M.m12 = Z.y;
		M.m13 = 0.0;
		M.m20 = X.z;
		M.m21 = Y.z;
		M.m22 = Z.z;
		M.m23 = 0.0;
		M.m30 = -X.dot(eye);
		M.m31 = -Y.dot(eye);
		M.m32 = -Z.dot(eye);
		M.m33 = 1.0;
		return this.vectormode === S3System.VECTOR_MODE.VECTOR4x1 ? M.transposed() : M;
	}

	/**
	 * 単位行列を生成します。
	 * @returns {S3Matrix} 単位行列
	 */
	getMatrixIdentity() {
		const M = new S3Matrix();
		M.m00 = 1.0;
		M.m01 = 0.0;
		M.m02 = 0.0;
		M.m03 = 0.0;
		M.m10 = 0.0;
		M.m11 = 1.0;
		M.m12 = 0.0;
		M.m13 = 0.0;
		M.m20 = 0.0;
		M.m21 = 0.0;
		M.m22 = 1.0;
		M.m23 = 0.0;
		M.m30 = 0.0;
		M.m31 = 0.0;
		M.m32 = 0.0;
		M.m33 = 1.0;
		return M;
	}

	/**
	 * 平行移動行列を生成します。
	 * @param {number} x X移動量
	 * @param {number} y Y移動量
	 * @param {number} z Z移動量
	 * @returns {S3Matrix} 平行移動行列
	 */
	getMatrixTranslate(x, y, z) {
		const M = new S3Matrix();
		M.m00 = 1.0;
		M.m01 = 0.0;
		M.m02 = 0.0;
		M.m03 = 0.0;
		M.m10 = 0.0;
		M.m11 = 1.0;
		M.m12 = 0.0;
		M.m13 = 0.0;
		M.m20 = 0.0;
		M.m21 = 0.0;
		M.m22 = 1.0;
		M.m23 = 0.0;
		M.m30 = x;
		M.m31 = y;
		M.m32 = z;
		M.m33 = 1.0;
		return this.vectormode === S3System.VECTOR_MODE.VECTOR4x1 ? M.transposed() : M;
	}

	/**
	 * 拡大縮小行列を生成します。
	 * @param {number} x X方向スケール
	 * @param {number} y Y方向スケール
	 * @param {number} z Z方向スケール
	 * @returns {S3Matrix} スケーリング行列
	 */
	getMatrixScale(x, y, z) {
		const M = new S3Matrix();
		M.m00 = x;
		M.m01 = 0.0;
		M.m02 = 0.0;
		M.m03 = 0.0;
		M.m10 = 0.0;
		M.m11 = y;
		M.m12 = 0.0;
		M.m13 = 0.0;
		M.m20 = 0.0;
		M.m21 = 0.0;
		M.m22 = z;
		M.m23 = 0.0;
		M.m30 = 0.0;
		M.m31 = 0.0;
		M.m32 = 0.0;
		M.m33 = 1.0;
		return this.vectormode === S3System.VECTOR_MODE.VECTOR4x1 ? M.transposed() : M;
	}

	/**
	 * X軸周りの回転行列を生成します。
	 * @param {number} degree 角度（度）
	 * @returns {S3Matrix} 回転行列
	 */
	getMatrixRotateX(degree) {
		const arc = S3Math.radius(degree);
		const cos = Math.cos(arc);
		const sin = Math.sin(arc);
		const M = new S3Matrix();
		M.m00 = 1.0;
		M.m01 = 0.0;
		M.m02 = 0.0;
		M.m03 = 0.0;
		M.m10 = 0.0;
		M.m11 = cos;
		M.m12 = sin;
		M.m13 = 0.0;
		M.m20 = 0.0;
		M.m21 = -sin;
		M.m22 = cos;
		M.m23 = 0.0;
		M.m30 = 0.0;
		M.m31 = 0.0;
		M.m32 = 0.0;
		M.m33 = 1.0;
		return this.vectormode === S3System.VECTOR_MODE.VECTOR4x1 ? M.transposed() : M;
	}

	/**
	 * Y軸周りの回転行列を生成します。
	 * @param {number} degree 角度（度）
	 * @returns {S3Matrix} 回転行列
	 */
	getMatrixRotateY(degree) {
		const arc = S3Math.radius(degree);
		const cos = Math.cos(arc);
		const sin = Math.sin(arc);
		const M = new S3Matrix();
		M.m00 = cos;
		M.m01 = 0.0;
		M.m02 = -sin;
		M.m03 = 0.0;
		M.m10 = 0.0;
		M.m11 = 1.0;
		M.m12 = 0.0;
		M.m13 = 0.0;
		M.m20 = sin;
		M.m21 = 0.0;
		M.m22 = cos;
		M.m23 = 0.0;
		M.m30 = 0.0;
		M.m31 = 0.0;
		M.m32 = 0.0;
		M.m33 = 1.0;
		return this.vectormode === S3System.VECTOR_MODE.VECTOR4x1 ? M.transposed() : M;
	}

	/**
	 * Z軸周りの回転行列を生成します。
	 * @param {number} degree 角度（度）
	 * @returns {S3Matrix} 回転行列
	 */
	getMatrixRotateZ(degree) {
		const arc = S3Math.radius(degree);
		const cos = Math.cos(arc);
		const sin = Math.sin(arc);
		const M = new S3Matrix();
		M.m00 = cos;
		M.m01 = sin;
		M.m02 = 0.0;
		M.m03 = 0.0;
		M.m10 = -sin;
		M.m11 = cos;
		M.m12 = 0.0;
		M.m13 = 0.0;
		M.m20 = 0.0;
		M.m21 = 0.0;
		M.m22 = 1.0;
		M.m23 = 0.0;
		M.m30 = 0.0;
		M.m31 = 0.0;
		M.m32 = 0.0;
		M.m33 = 1.0;
		return this.vectormode === S3System.VECTOR_MODE.VECTOR4x1 ? M.transposed() : M;
	}

	/**
	 * 縦型/横型を踏まえて2つの行列を掛けます。
	 * @param {S3Matrix} A
	 * @param {S3Matrix} B
	 * @returns {S3Matrix} 計算結果
	 */
	mulMatrix(A, B) {
		// 横型の場合は、v[AB]=u
		// 縦型の場合は、[BA]v=u
		return this.vectormode === S3System.VECTOR_MODE.VECTOR4x1 ? B.mulMatrix(A) : A.mulMatrix(B);
	}

	/**
	 * 縦型/横型を踏まえて行列とベクトルを掛けます。
	 * @param {S3Matrix} A
	 * @param {S3Vector} B
	 * @returns {S3Vector} 計算結果
	 */
	mulVector(A, B) {
		// 横型の場合は、[vA]=u
		// 縦型の場合は、[Av]=u
		return this.vectormode === S3System.VECTOR_MODE.VECTOR4x1 ? A.mulVector(B) : B.mul(A);
	}

	/**
	 * 航空機の姿勢制御 ZXY（ロール・ピッチ・ヨー）の順で回転行列を作成します。
	 * @param {number} z ロール角（Z）
	 * @param {number} x ピッチ角（X）
	 * @param {number} y ヨー角（Y）
	 * @returns {S3Matrix} 合成回転行列
	 */
	getMatrixRotateZXY(z, x, y) {
		const Z = this.getMatrixRotateZ(z);
		const X = this.getMatrixRotateX(x);
		const Y = this.getMatrixRotateY(y);
		return this.mulMatrix(this.mulMatrix(Z, X), Y);
	}

	/**
	 * 指定モデルのワールド変換行列を生成します（スケール→回転→移動の順）。
	 * @param {S3Model} model 対象モデル
	 * @returns {S3Matrix} ワールド変換行列
	 */
	getMatrixWorldTransform(model) {
		// 回転行列
		const R = this.getMatrixRotateZXY(model.angles.roll, model.angles.pitch, model.angles.yaw);
		// スケーリング
		const S = this.getMatrixScale(model.scale.x, model.scale.y, model.scale.z);
		// 移動行列
		const T = this.getMatrixTranslate(model.position.x, model.position.y, model.position.z);
		// ワールド変換行列を作成する
		const W = this.mulMatrix(this.mulMatrix(S, R), T);
		return W;
	}

	/**
	 * 2Dキャンバスの内容をクリアします。
	 */
	clear() {
		this.context2d.clear();
	}

	/**
	 * 頂点リストをMVP変換・射影して新しい頂点配列を返します。
	 * @param {Array<S3Vertex>} vertexlist 変換対象の頂点配列
	 * @param {S3Matrix} MVP モデル・ビュー・射影行列
	 * @param {S3Matrix} Viewport ビューポート変換行列
	 * @returns {Array<S3Vertex>} 変換後の頂点配列
	 */
	_calcVertexTransformation(vertexlist, MVP, Viewport) {
		const newvertexlist = [];

		for (let i = 0; i < vertexlist.length; i++) {
			let p = vertexlist[i].position;

			//	console.log("1 " + p);
			//	console.log("2 " + this.mulMatrix(VPS.LookAt, p));
			//	console.log("3 " + this.mulMatrix(VPS.PerspectiveFov, this.mulMatrix(VPS.LookAt, p)));
			//	console.log("4 " + this.mulMatrix(MVP, p));

			p = this.mulVector(MVP, p);
			const rhw = p.w;
			p = p.mul(1.0 / rhw);
			p = this.mulVector(Viewport, p);
			newvertexlist[i] = new S3Vertex(p);
		}
		return newvertexlist;
	}

	/**
	 * X, Y, Zの座標軸を描画します（デバッグ用）。
	 * @param {S3Scene} scene 対象シーン
	 */
	drawAxis(scene) {
		const VPS = scene.getCamera().getVPSMatrix(this.canvas);

		const vertexvector = [];
		vertexvector[0] = new S3Vector(0, 0, 0);
		vertexvector[1] = new S3Vector(10, 0, 0);
		vertexvector[2] = new S3Vector(0, 10, 0);
		vertexvector[3] = new S3Vector(0, 0, 10);

		const newvector = [];
		const M = this.mulMatrix(VPS.LookAt, VPS.PerspectiveFov);
		for (let i = 0; i < vertexvector.length; i++) {
			let p = vertexvector[i];
			p = this.mulVector(M, p);
			p = p.mul(1.0 / p.w);
			p = this.mulVector(VPS.Viewport, p);
			newvector[i] = p;
		}

		this.context2d.setLineWidth(3.0);
		this.context2d.setLineColor("rgb(255, 0, 0)");
		this.context2d.drawLine(newvector[0], newvector[1]);
		this.context2d.setLineColor("rgb(0, 255, 0)");
		this.context2d.drawLine(newvector[0], newvector[2]);
		this.context2d.setLineColor("rgb(0, 0, 255)");
		this.context2d.drawLine(newvector[0], newvector[3]);
	}

	/**
	 * ポリゴン（三角形群）を描画します（ラインで表示）。
	 * @param {Array<S3Vertex>} vetexlist 頂点配列
	 * @param {Array<S3TriangleIndex>} triangleindexlist インデックス配列
	 */
	_drawPolygon(vetexlist, triangleindexlist) {
		for (let i = 0; i < triangleindexlist.length; i++) {
			const ti = triangleindexlist[i];
			if (
				this.testCull(
					vetexlist[ti.index[0]].position,
					vetexlist[ti.index[1]].position,
					vetexlist[ti.index[2]].position
				)
			) {
				continue;
			}
			this.context2d.drawLinePolygon(
				vetexlist[ti.index[0]].position,
				vetexlist[ti.index[1]].position,
				vetexlist[ti.index[2]].position
			);
		}
	}

	/**
	 * シーン全体を描画します。
	 * @param {S3Scene} scene 描画対象のシーン
	 */
	drawScene(scene) {
		const VPS = scene.getCamera().getVPSMatrix(this.canvas);

		this.context2d.setLineWidth(1.0);
		this.context2d.setLineColor("rgb(0, 0, 0)");

		const models = scene.getModels();
		for (let i = 0; i < models.length; i++) {
			const model = models[i];
			const mesh = model.getMesh();
			if (mesh.isComplete() === false) {
				continue;
			}
			const M = this.getMatrixWorldTransform(model);
			const MVP = this.mulMatrix(this.mulMatrix(M, VPS.LookAt), VPS.PerspectiveFov);
			const vlist = this._calcVertexTransformation(mesh.src.vertex, MVP, VPS.Viewport);
			this._drawPolygon(vlist, mesh.src.triangleindex);
		}
	}

	/**
	 * 不要になったリソースを解放します（未実装）。
	 */
	_disposeObject() {}

	/**
	 * 新しい頂点インスタンスを生成します。
	 * @param {S3Vector} position 頂点座標
	 * @returns {S3Vertex} 生成された頂点
	 */
	createVertex(position) {
		return new S3Vertex(position);
	}

	/**
	 * 新しい三角形インデックスインスタンスを生成します。
	 * @param {number} i1 頂点1のインデックス
	 * @param {number} i2 頂点2のインデックス
	 * @param {number} i3 頂点3のインデックス
	 * @param {Array<number>} indexlist 頂点インデックス配列
	 * @param {number} [materialIndex] マテリアルインデックス
	 * @param {Array<S3Vector>} [uvlist] UV座標配列
	 * @returns {S3TriangleIndex} 生成された三角形インデックス
	 */
	createTriangleIndex(i1, i2, i3, indexlist, materialIndex, uvlist) {
		return new S3TriangleIndex(i1, i2, i3, indexlist, materialIndex, uvlist);
	}

	/**
	 * 新しいテクスチャインスタンスを生成します。
	 * @param {string|ImageData|HTMLImageElement|HTMLCanvasElement|HTMLVideoElement} [name] テクスチャ名や画像データ
	 * @returns {S3Texture} 生成されたテクスチャ
	 */
	createTexture(name) {
		return new S3Texture(this, name);
	}

	/**
	 * 新しいシーンインスタンスを生成します。
	 * @returns {S3Scene} 生成されたシーン
	 */
	createScene() {
		return new S3Scene();
	}

	/**
	 * 新しいモデルインスタンスを生成します。
	 * @returns {S3Model} 生成されたモデル
	 */
	createModel() {
		return new S3Model();
	}

	/**
	 * 新しいメッシュインスタンスを生成します。
	 * @returns {S3Mesh} 生成されたメッシュ
	 */
	createMesh() {
		return new S3Mesh(this);
	}

	/**
	 * 新しいマテリアルインスタンスを生成します。
	 * @param {string} [name] マテリアル名
	 * @returns {S3Material} 生成されたマテリアル
	 */
	createMaterial(name) {
		return new S3Material(this, name);
	}

	/**
	 * 新しいライトインスタンスを生成します。
	 * @returns {S3Light} 生成されたライト
	 */
	createLight() {
		return new S3Light();
	}

	/**
	 * 新しいカメラインスタンスを生成します。
	 * @returns {S3Camera} 生成されたカメラ
	 */
	createCamera() {
		const camera = new S3Camera(this);
		return camera;
	}
}

/**
 * システムの描画モードを指定する定数
 *
 * - OPEN_GL: OpenGLに準拠した描画処理・座標変換方式を用います。
 * - DIRECT_X: DirectXに準拠した描画処理・座標変換方式を用います。
 *
 * シーンの座標系や深度バッファの扱いなどにも影響します。
 * @enum {number}
 * @property {number} OPEN_GL   OpenGL準拠（値: 0）
 * @property {number} DIRECT_X  DirectX準拠（値: 1）
 */
S3System.SYSTEM_MODE = {
	/** OpenGL準拠の描画方式（右手系、Zバッファ0～1など） */
	OPEN_GL: 0,
	/** DirectX準拠の描画方式（左手系、Zバッファ0～1など） */
	DIRECT_X: 1
};

S3System.DEPTH_MODE = {
	/**
	 * Z値の範囲などの依存関係をOpenGL準拠
	 * @type Number
	 */
	OPEN_GL: 0,
	/**
	 * Z値の範囲などの依存関係をDirecX準拠
	 * @type Number
	 */
	DIRECT_X: 1
};

S3System.DIMENSION_MODE = {
	/**
	 * 右手系
	 * @type Number
	 */
	RIGHT_HAND: 0,
	/**
	 * 左手系
	 * @type Number
	 */
	LEFT_HAND: 1
};

S3System.VECTOR_MODE = {
	/**
	 * 値を保持するベクトルを縦ベクトルとみなす
	 * @type Number
	 */
	VECTOR4x1: 0,
	/**
	 * 値を保持するベクトルを横ベクトルとみなす
	 * @type Number
	 */
	VECTOR1x4: 1
};

S3System.FRONT_FACE = {
	/**
	 * 反時計回りを前面とする
	 * @type Number
	 */
	COUNTER_CLOCKWISE: 0,

	/**
	 * 時計回りを前面とする
	 * @type Number
	 */
	CLOCKWISE: 1
};

S3System.CULL_MODE = {
	/**
	 * 常にすべての三角形を描画します。
	 * @type Number
	 */
	NONE: 0,

	/**
	 * 前向きの三角形を描写しません。
	 * @type Number
	 */
	FRONT: 1,

	/**
	 * 後ろ向きの三角形を描写しません。
	 * @type Number
	 */
	BACK: 2,

	/**
	 * 常に描写しない。
	 * @type Number
	 */
	FRONT_AND_BACK: 3
};
