import S3Material from "../basic/S3Material.js";
import S3GLSystem from "./S3GLSystem.js";
import S3GLArray from "./S3GLArray.js";
import S3GLTexture from "./S3GLTexture.js";

/**
 * WebGL描画用のマテリアル（材質）クラス。
 * 基本のS3Materialを拡張し、GL用データ生成・ハッシュ管理などWebGL用途向けの機能を追加します。
 * 色、拡散/反射/発光/環境光、テクスチャ情報などを保持し、GLSLシェーダへのuniformデータ化を担います。
 *
 * @class
 * @extends S3Material
 * @module S3
 */
export default class S3GLMaterial extends S3Material {
	/**
	 * マテリアル情報を初期化します。
	 * @param {S3GLSystem} s3glsystem GL用システムインスタンス（テクスチャ生成等に必要）
	 * @param {string} name マテリアル名（一意識別のためGLハッシュにも使用）
	 */
	constructor(s3glsystem, name) {
		// @ts-ignore
		super(s3glsystem, name);

		/**
		 * S3GLSystem アクセス用
		 * @type {S3GLSystem}
		 */
		this._s3gl = s3glsystem;
	}

	/**
	 * このマテリアルの一意なハッシュ文字列を取得します。
	 * 通常はマテリアル名がそのままハッシュ値になります。
	 * @returns {string} マテリアルの識別用ハッシュ値（名前）
	 */
	getGLHash() {
		// 名前は被らないので、ハッシュに使用する
		return this.name;
	}

	/**
	 * 頂点データを作成して取得する
	 * 頂点データ内に含まれるデータは、S3GLArray型となる。
	 * なお、ここでつけているメンバの名前は、そのままバーテックスシェーダで使用する変数名となる
	 * uniform の数がハードウェア上限られているため、送る情報は選定すること
	 *
	 *   - materialsColorAndDiffuse: 色(RGB)+拡散率（vec4/Float32Array）
	 *   - materialsSpecularAndPower: 鏡面色(RGB)+光沢度（vec4/Float32Array）
	 *   - materialsEmission: 発光色（vec3/Float32Array）
	 *   - materialsAmbientAndReflect: 環境光(RGB)+反射率（vec4/Float32Array）
	 *   - materialsTextureExist: テクスチャ有無フラグ（[color有:1/0, normal有:1/0]）
	 *   - materialsTextureColor: カラーテクスチャのGLオブジェクト
	 *   - materialsTextureNormal: 法線テクスチャのGLオブジェクト
	 *
	 * @returns {{[key: string]: S3GLArray | WebGLTexture }}
	 */
	getGLData() {
		/**
		 * @type {S3GLTexture}
		 */
		const textureColorGl = /** @type {S3GLTexture} */ (this.textureColor);

		/**
		 * @type {S3GLTexture}
		 */
		const textureNormalGl = /** @type {S3GLTexture} */ (this.textureNormal);

		// テクスチャを取得
		let tex_color = textureColorGl.getGLData();
		let tex_normal = textureNormalGl.getGLData();
		// テクスチャのありなしフラグを作成。ない場合はダミーデータを入れる。
		const tex_exist = [tex_color === null ? 0 : 1, tex_normal === null ? 0 : 1];
		tex_color = tex_color === null ? this._s3gl._getDummyTexture() : tex_color;
		tex_normal = tex_normal === null ? this._s3gl._getDummyTexture() : tex_normal;
		return {
			materialsColorAndDiffuse: new S3GLArray(
				[this.color.x, this.color.y, this.color.z, this.diffuse],
				4,
				S3GLArray.datatype.Float32Array
			),
			materialsSpecularAndPower: new S3GLArray(
				[this.specular.x, this.specular.y, this.specular.z, this.power],
				4,
				S3GLArray.datatype.Float32Array
			),
			materialsEmission: new S3GLArray(this.emission, 3, S3GLArray.datatype.Float32Array),
			materialsAmbientAndReflect: new S3GLArray(
				[this.ambient.x, this.ambient.y, this.ambient.z, this.reflect],
				4,
				S3GLArray.datatype.Float32Array
			),
			materialsTextureExist: new S3GLArray(tex_exist, 2, S3GLArray.datatype.Float32Array),
			materialsTextureColor: tex_color,
			materialsTextureNormal: tex_normal
		};
	}
}
