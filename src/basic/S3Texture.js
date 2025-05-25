import S3System from "./S3System.js";

/**
 * 3DCG用のテクスチャ（画像）情報を管理するクラス
 * 画像のセットや2の累乗化処理、ロード状況管理、破棄処理などを担当します。
 */
export default class S3Texture {
	/**
	 * テクスチャを作成します。
	 * @param {S3System} s3system S3Systemインスタンス（画像ID発行・ダウンロード補助用）
	 * @param {string|ImageData|HTMLImageElement|HTMLCanvasElement|HTMLVideoElement} [data] 初期化時に与える画像やURL等（省略可）
	 */
	constructor(s3system, data) {
		/**
		 * システムインスタンス
		 * @type {S3System}
		 */
		this.sys = s3system;
		this._init();
		if (data !== undefined) {
			this.setImage(data);
		}
	}

	/**
	 * テクスチャ情報を初期化します。ロードフラグや画像情報をリセットします。
	 * @protect
	 */
	_init() {
		/**
		 * テクスチャのURLやID
		 * @type {?string}
		 */
		this.url = null;

		/**
		 * テクスチャ画像本体（ImageData, HTMLImageElement, HTMLCanvasElement, HTMLVideoElementなど）
		 * @type {?ImageData|HTMLImageElement|HTMLCanvasElement|HTMLVideoElement}
		 */
		this.image = null;

		/**
		 * 画像がロード済みかどうか
		 * @type {boolean}
		 */
		this.is_loadimage = false;

		/**
		 * テクスチャが破棄されたかどうか
		 * @type {boolean}
		 */
		this.is_dispose = false;
	}

	/**
	 * テクスチャを破棄します。再利用は不可になります。
	 */
	dispose() {
		if (!this.is_dispose) {
			this.is_dispose = true;
		}
	}

	/**
	 * テクスチャ画像を設定します。
	 * - 画像が2の累乗でない場合は自動でリサイズします。
	 * - 文字列の場合はURLとして画像をダウンロードします。
	 * - 設定可能な形式: ImageData, HTMLImageElement, HTMLCanvasElement, HTMLVideoElement, URL(string)
	 * @param {string|ImageData|HTMLImageElement|HTMLCanvasElement|HTMLVideoElement} image 設定する画像データまたはURL文字列
	 */
	setImage(image) {
		if (image === null || this.is_dispose) {
			return;
		}
		if (image instanceof HTMLImageElement || image instanceof HTMLCanvasElement) {
			const original_width = image.width;
			const original_height = image.height;
			const ceil_power_of_2 = function (x) {
				// IE には Math.log2 がない
				const a = Math.log(x) / Math.log(2);
				if (a - Math.floor(a) < 1e-10) {
					return x;
				} else {
					return 1 << Math.ceil(a);
				}
			};
			const ceil_width = ceil_power_of_2(original_width);
			const ceil_height = ceil_power_of_2(original_height);
			if (original_width !== ceil_width || original_height !== ceil_height) {
				// 2の累乗ではない場合は、2の累乗のサイズに変換
				const ceil_image = document.createElement("canvas");
				ceil_image.width = ceil_width;
				ceil_image.height = ceil_height;
				ceil_image
					.getContext("2d")
					.drawImage(image, 0, 0, original_width, original_height, 0, 0, ceil_width, ceil_height);
				image = ceil_image;
			}
		}
		if (
			image instanceof ImageData ||
			image instanceof HTMLImageElement ||
			image instanceof HTMLCanvasElement ||
			image instanceof HTMLVideoElement
		) {
			if (this.url === null) {
				// 直接設定した場合はIDをURLとして設定する
				this.url = this.sys._createID();
			}
			this.image = image;
			this.is_loadimage = true;
			return;
		} else if (typeof image === "string") {
			this.url = image;
			const that = this;
			this.sys._download(this.url, function (image) {
				that.setImage(image);
			});
			return;
		} else {
			console.log("not setImage");
			console.log(image);
		}
	}
}
