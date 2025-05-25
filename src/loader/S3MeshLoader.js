import S3System from "../basic/S3System.js";
import S3Mesh from "../basic/S3Mesh.js";
import S3MeshLoaderJSON from "./S3MeshLoaderJSON.js";
import S3MeshLoaderMQO from "./S3MeshLoaderMQO.js";
import S3MeshLoaderOBJ from "./S3MeshLoaderOBJ.js";

/**
 * メッシュデータの入出力用関数定義
 * @typedef {Object} MeshLoaderDataIOFunvction
 * @property {string} name 入出力形式の名前（"JSON", "MQO", "OBJ"など）
 * @property {function(S3System, S3Mesh, string, string=): boolean} input テキストをインスタンスへ変換する
 * @property {function(S3Mesh): string} [output] インスタンスをテキストへ出力する
 */

/**
 * メッシュデータの入出力用関数定義オブジェクト
 * @typedef {Object} MeshLoaderDataIOFunvctions
 * @property {MeshLoaderDataIOFunvction} JSON
 * @property {MeshLoaderDataIOFunvction} MQO
 * @property {MeshLoaderDataIOFunvction} OBJ
 */

/**
 * @type {Array<MeshLoaderDataIOFunvction>}
 */
const DATA_IO_FUNCTION = [S3MeshLoaderJSON, S3MeshLoaderMQO, S3MeshLoaderOBJ];

/**
 * 3DCGメッシュデータの入出力を管理するローダー
 *
 * MQO/OBJ/JSONなど、各種3DフォーマットからS3Meshインスタンスへの変換（インポート）、
 * およびS3Meshから各形式へのエクスポート（出力）をまとめて扱うユーティリティオブジェクトです。
 *
 * 利用例:
 *   - ファイルの拡張子や種類ごとにパースしてS3Meshを構築
 *   - S3Meshを指定形式でテキスト化
 *   - 各形式への入出力用コールバックを内部で管理
 */
const S3MeshLoader = {
	/**
	 * 任意の3Dデータを指定形式でS3Meshに変換（インポート）します。
	 *
	 * - 文字列（URL）の場合はダウンロードして自動的にインポート
	 * - テキスト／データ本体の場合は直接パース
	 * - コールバックを指定すると非同期処理後に呼ばれます
	 *
	 * @param {S3System} s3system S3Systemインスタンス（S3Mesh生成等に必要）
	 * @param {string} data 3Dデータ本体またはデータ取得用URL
	 * @param {string} type データの形式（S3MeshLoader.TYPEのいずれか: "JSON", "MQO", "OBJ"）
	 * @param {function(S3Mesh):void} [callback] データインポート後に呼ばれるコールバック（省略時は即時同期）
	 * @returns {S3Mesh} 生成されたS3Meshインスタンス（非同期時も仮のインスタンスを返す）
	 */
	inputData: function (s3system, data, type, callback) {
		const s3mesh = s3system.createMesh();
		/**
		 * データ本体を指定フォーマットでS3Meshに変換し、必要ならコールバックを呼び出します。
		 *
		 * @param {string|any} ldata 3Dデータ本体（テキストまたはJSONなど）
		 * @param {string} ltype データの形式（"JSON"、"MQO"、"OBJ" など）
		 * @param {string} url データ取得元URL（直接データの場合は空文字列）
		 */
		const load = function (ldata, ltype, url) {
			s3mesh._init();
			for (let i = 0; i < DATA_IO_FUNCTION.length; i++) {
				if (DATA_IO_FUNCTION[i].name === type) {
					const isLoad = DATA_IO_FUNCTION[i].input(s3system, s3mesh, ldata, url);
					s3mesh.setComplete(isLoad);
					if (callback) {
						callback(s3mesh);
					}
				}
			}
		};
		// URLが指定されている場合はダウンロードしてから処理
		if (typeof data === "string" && data.indexOf("\n") === -1) {
			/**
			 * データのダウンロード完了時に呼ばれるコールバック関数。
			 * ダウンロードしたテキストデータを `load` 関数へ渡し、メッシュへのインポート処理を行います。
			 * @param {string} text 取得した3Dデータ本体（テキストデータ）
			 */
			const downloadCallback = function (text) {
				load(text, type, data);
			};
			s3system._download(data, downloadCallback);
		} else {
			load(data, type, "");
		}
		return s3mesh;
	},

	/**
	 * S3Meshインスタンスを指定フォーマットでエクスポート（テキスト化）します。
	 *
	 * @param {S3Mesh} s3mesh 出力対象のメッシュ
	 * @param {string} type 出力フォーマット（S3MeshLoader.TYPE.JSON等）
	 * @returns {string} 指定フォーマットのテキストデータ
	 */
	outputData: function (s3mesh, type) {
		for (let i = 0; i < DATA_IO_FUNCTION.length; i++) {
			if (DATA_IO_FUNCTION[i].name === type) {
				if (DATA_IO_FUNCTION[i].output) {
					return DATA_IO_FUNCTION[i].output(s3mesh);
				}
			}
		}
		return null;
	}
};

export default S3MeshLoader;
