import S3Vector from "../math/S3Vector.js";

/**
 * 3DCGシーン用のライト（照明）情報を管理するクラス
 * 各種ライト（環境光・平行光源・点光源など）のモード・強さ・方向・色などを保持します。
 */
export default class S3Light {
	/**
	 * ライト情報を初期化して作成します。
	 * @constructor
	 */
	constructor() {
		this.init();
	}

	/**
	 * ライト情報を初期値でリセットします。
	 * モードや強度、範囲、方向、色なども初期状態に戻ります。
	 */
	init() {
		/**
		 * ライトの種類（モード）を指定します。S3Light.MODEを参照。
		 * @type {number}
		 */
		this.mode = S3Light.MODE.DIRECTIONAL_LIGHT;

		/**
		 * ライトの強さ（1.0=通常、0.0=無効）
		 * @type {number}
		 */
		this.power = 1.0;

		/**
		 * ライトの影響範囲（主に点光源で使用）
		 * @type {number}
		 */
		this.range = 1000.0;

		/**
		 * ライトの位置ベクトル（主に点光源で使用）
		 * @type {S3Vector}
		 */
		this.position = new S3Vector(0.0, 0.0, 0.0);

		/**
		 * ライトの方向ベクトル（主に平行光源で使用）
		 * @type {S3Vector}
		 */
		this.direction = new S3Vector(0.0, 0.0, -1.0);

		/**
		 * ライトの色（RGB値のベクトル）
		 * @type {S3Vector}
		 */
		this.color = new S3Vector(1.0, 1.0, 1.0);
	}

	/**
	 * このライト情報のクローン（複製）を作成します。
	 * @param {typeof S3Light} [Instance] クラス指定（省略時はS3Light）
	 * @returns {S3Light} 複製されたライトインスタンス
	 */
	clone(Instance) {
		if (!Instance) {
			Instance = S3Light;
		}
		const light = new Instance();
		light.mode = this.mode;
		light.power = this.power;
		light.range = this.range;
		light.position = this.position;
		light.direction = this.direction;
		light.color = this.color;
		return light;
	}

	/**
	 * ライトの種類（モード）を設定します。
	 * @param {number} mode S3Light.MODEで定義される値
	 */
	setMode(mode) {
		this.mode = mode;
	}

	/**
	 * ライトの強さを設定します。
	 * @param {number} power 強度（通常1.0、0.0で無効）
	 */
	setPower(power) {
		this.power = power;
	}

	/**
	 * ライトの影響範囲を設定します（点光源等）。
	 * @param {number} range 範囲
	 */
	setRange(range) {
		this.range = range;
	}

	/**
	 * ライトの位置を設定します（点光源等）。
	 * @param {S3Vector} position 位置ベクトル
	 */
	setPosition(position) {
		this.position = position;
	}

	/**
	 * ライトの方向を設定します（平行光源等）。
	 * @param {S3Vector} direction 方向ベクトル
	 */
	setDirection(direction) {
		this.direction = direction;
	}

	/**
	 * ライトの色を設定します（RGB）。
	 * @param {S3Vector} color 色ベクトル
	 */
	setColor(color) {
		this.color = color;
	}
}

/**
 * ライトの種類（モード）定数
 * @enum {number}
 */
S3Light.MODE = {
	/** ライト無効 */
	NONE: 0,
	/** 環境光 */
	AMBIENT_LIGHT: 1,
	/** 平行光源 */
	DIRECTIONAL_LIGHT: 2,
	/** 点光源 */
	POINT_LIGHT: 3
};
