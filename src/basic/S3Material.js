import S3System from "./S3System.js";
import S3Texture from "./S3Texture.js";
import S3Vector from "../math/S3Vector.js";

/**
 * 3DCG用のマテリアル（素材）情報を管理するクラス(mutable)
 * 拡散反射色、自己照明、鏡面反射、環境光、反射、テクスチャなどを一括管理します。
 */
export default class S3Material {
	/**
	 * マテリアルを作成します。
	 * @param {S3System} s3system S3System インスタンス（内部処理・生成補助用）
	 * @param {string} [name] マテリアル名（任意指定、未指定時は"s3default"）
	 */
	constructor(s3system, name) {
		/**
		 * システム管理用
		 * @type {S3System}
		 */
		this.sys = s3system;

		/**
		 * マテリアル名
		 * @type {string}
		 */
		this.name = "s3default";
		if (name !== undefined) {
			this.name = name;
		}

		/**
		 * 拡散反射色（ベースカラー、RGBA値）
		 * @type {S3Vector}
		 */
		this.color = new S3Vector(1.0, 1.0, 1.0, 1.0);

		/**
		 * 拡散反射の強さ（0～1）
		 * @type {number}
		 */
		this.diffuse = 0.8;

		/**
		 * 自己照明（発光色）
		 * @type {S3Vector}
		 */
		this.emission = new S3Vector(0.0, 0.0, 0.0);

		/**
		 * 鏡面反射色
		 * @type {S3Vector}
		 */
		this.specular = new S3Vector(0.0, 0.0, 0.0);

		/**
		 * 鏡面反射の強さ
		 * @type {number}
		 */
		this.power = 5.0;

		/**
		 * 環境光（光源に依存しない基本色）
		 * @type {S3Vector}
		 */
		this.ambient = new S3Vector(0.6, 0.6, 0.6);

		/**
		 * 環境マッピングの反射率
		 * @type {number}
		 */
		this.reflect = 0.0;

		/**
		 * 色用テクスチャ（拡散色テクスチャ）
		 * @type {S3Texture}
		 */
		this.textureColor = null;

		/**
		 * 法線マップ用テクスチャ
		 * @type {S3Texture}
		 */
		this.textureNormal = null;
	}

	/**
	 * マテリアルを解放します（現状は未実装）。
	 */
	dispose() {}

	/**
	 * マテリアル名を設定します。
	 * @param {string} name 新しい名前
	 */
	setName(name) {
		this.name = name;
	}

	/**
	 * 拡散反射色を設定します。
	 * @param {S3Vector|Array<number>|number} color S3Vector, 配列, または単一値
	 */
	setColor(color) {
		this.color = this.sys._toVector3(color);
	}

	/**
	 * 拡散反射の強さを設定します。
	 * @param {number} diffuse 拡散反射係数（0～1）
	 */
	setDiffuse(diffuse) {
		this.diffuse = this.sys._toValue(diffuse);
	}

	/**
	 * 自己照明（発光色）を設定します。
	 * @param {S3Vector|Array<number>|number} emission S3Vector, 配列, または単一値
	 */
	setEmission(emission) {
		this.emission = this.sys._toVector3(emission);
	}

	/**
	 * 鏡面反射色を設定します。
	 * @param {S3Vector|Array<number>|number} specular S3Vector, 配列, または単一値
	 */
	setSpecular(specular) {
		this.specular = this.sys._toVector3(specular);
	}

	/**
	 * 鏡面反射の強さを設定します。
	 * @param {number} power 鏡面反射係数
	 */
	setPower(power) {
		this.power = this.sys._toValue(power);
	}

	/**
	 * 環境光（アンビエント色）を設定します。
	 * @param {S3Vector|Array<number>|number} ambient S3Vector, 配列, または単一値
	 */
	setAmbient(ambient) {
		this.ambient = this.sys._toVector3(ambient);
	}

	/**
	 * 環境マッピングの反射率を設定します。
	 * @param {number} reflect 反射率（0～1）
	 */
	setReflect(reflect) {
		this.reflect = this.sys._toValue(reflect);
	}

	/**
	 * 拡散色用テクスチャ画像を設定します。
	 * @param {*} data 画像またはURL等（S3Texture.setImage に渡される形式）
	 */
	setTextureColor(data) {
		if (this.textureColor !== null) {
			this.textureColor.dispose();
		}
		this.textureColor = this.sys.createTexture();
		this.textureColor.setImage(data);
	}

	/**
	 * 法線マップ用テクスチャ画像を設定します。
	 * @param {*} data 画像またはURL等（S3Texture.setImageに渡される形式）
	 */
	setTextureNormal(data) {
		if (this.textureNormal !== null) {
			this.textureNormal.dispose();
		}
		this.textureNormal = this.sys.createTexture();
		this.textureNormal.setImage(data);
	}
}
