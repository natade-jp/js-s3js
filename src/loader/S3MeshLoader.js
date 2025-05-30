import S3System from "../basic/S3System.js";
import S3Mesh from "../basic/S3Mesh.js";
import S3MeshLoaderJSON from "./S3MeshLoaderJSON.js";
import S3MeshLoaderMQO from "./S3MeshLoaderMQO.js";
import S3MeshLoaderOBJ from "./S3MeshLoaderOBJ.js";

/**
 * メッシュデータの入出力用関数定義
 * @typedef {Object} S3MeshLoaderDataIOFunvction
 * @property {string} name 入出力形式の名前（"JSON", "MQO", "OBJ"など）
 * @property {function(S3System, S3Mesh, string, string=): boolean} input テキストをインスタンスへ変換する
 * @property {function(S3Mesh): string} [output] インスタンスをテキストへ出力する
 */

/**
 * @type {Array<S3MeshLoaderDataIOFunvction>}
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
	 * @param {string|Object} data 3Dデータ本体またはデータ取得用URL
	 * @param {string} [type] データの拡張子（"JSON", "MQO", "OBJ"）, data がURLの場合は自動判別されます。
	 * @param {function(S3Mesh):void} [callback] データインポート後に呼ばれるコールバック（省略時は即時同期）
	 * @returns {S3Mesh} 生成されたS3Meshインスタンス（非同期時も仮のインスタンスを返す）
	 */
	inputData: function (s3system, data, type, callback) {
		const s3mesh = s3system.createMesh();
		let this_type = type ? type.toUpperCase() : "";

		/**
		 * データ本体を指定フォーマットでS3Meshに変換し、必要ならコールバックを呼び出します。
		 *
		 * @param {string|any} ldata 3Dデータ本体（テキストまたはJSONなど）
		 * @param {string} url データ取得元URL（直接データの場合は空文字列）
		 */
		const load = function (ldata, url) {
			s3mesh._init();
			for (let i = 0; i < DATA_IO_FUNCTION.length; i++) {
				if (DATA_IO_FUNCTION[i].name === this_type) {
					const isLoad = DATA_IO_FUNCTION[i].input(s3system, s3mesh, ldata, url);
					s3mesh.setComplete(isLoad);
					if (callback) {
						callback(s3mesh);
					}
				}
			}
		};
		/**
		 * データのダウンロード完了時に呼ばれるコールバック関数。
		 * ダウンロードしたテキストデータを `load` 関数へ渡し、メッシュへのインポート処理を行います。
		 * @param {string} text 取得した3Dデータ本体（テキストデータ）
		 */
		const downloadCallback = function (text) {
			load(text, typeof data === "string" ? data : undefined);
		};
		// 文字列がある場合
		if (typeof data === "string" && data.indexOf("\n") === -1) {
			// 拡張子が設定されている場合
			if (data.indexOf(".") !== -1) {
				const ext = data.split(".").pop();
				for (let i = 0; i < DATA_IO_FUNCTION.length; i++) {
					if (DATA_IO_FUNCTION[i].name === ext.toUpperCase()) {
						this_type = ext.toUpperCase();
						s3system._download(data, downloadCallback);
					}
				}
			}
		}
		load(data, "");
		return s3mesh;
	},

	/**
	 * S3Meshインスタンスを指定フォーマットでエクスポート（テキスト化）します。
	 *
	 * @param {S3Mesh} s3mesh 出力対象のメッシュ
	 * @param {string} type 出力の形式（"JSON"、"MQO"、"OBJ" など）
	 * @returns {string} 指定フォーマットのテキストデータ
	 */
	outputData: function (s3mesh, type) {
		for (let i = 0; i < DATA_IO_FUNCTION.length; i++) {
			if (DATA_IO_FUNCTION[i].name === type.toUpperCase()) {
				if (DATA_IO_FUNCTION[i].output) {
					return DATA_IO_FUNCTION[i].output(s3mesh);
				}
			}
		}
		return null;
	}
};

export default S3MeshLoader;
