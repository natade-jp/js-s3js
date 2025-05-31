export { S3 as default };
/**
 * TypedArrayのコンストラクタ型定義（Int32Array, Float32Array など）。
 */
export type S3GLTypedArrayConstructor = (typeof Float32Array | typeof Int32Array);
/**
 * WebGL配列で利用できるデータ型情報（各種TypedArray型）。
 *
 * - instance: 対応するTypedArrayコンストラクタ（例：Float32Array, Int32Array）
 * - name:     型の名前文字列（"Float32Array"等）
 */
export type S3GLArrayDataType = {
    /**
     * 対応するTypedArrayのコンストラクタ
     */
    instance: S3GLTypedArrayConstructor;
    /**
     * 型名（"Float32Array"等）
     */
    name: string;
};
/**
 * GLSL型名（"vec3"や"mat4"など）を配列次元や入力種別から自動判定するためのテーブル構造。
 *
 * - 第一階層キー：データ型名（"Float32Array" または "Int32Array"）
 * - 第二階層キー：値種別（"Number", "S3Vector", "S3Matrix"）
 * - 第三階層キー：配列次元や要素数（2, 3, 4, 9, 16など）
 * - 値：対応するGLSL型名（"vec3"等）を表す文字列
 *
 * 例）gltypetable["Float32Array"]["S3Matrix"][16] === "mat4"
 */
export type S3GLArrayGLTypeTable = {
    [x: string]: {
        [x: string]: {
            [x: number]: string;
        };
    };
};
/**
 * bindDataの入力データ(単体)
 */
export type S3GLProgramBindInputDataSingle = Int32Array | Float32Array | WebGLBuffer | WebGLTexture | S3GLArray | S3Matrix | S3Vector | number;
/**
 * bindDataの入力データ(配列可)
 */
export type S3GLProgramBindInputData = S3GLProgramBindInputDataSingle | Array<S3GLProgramBindInputDataSingle>;
export type S3GLProgramBindInputDataTable = {
    [x: string]: S3GLProgramBindInputData;
};
export type S3GLProgramUniforms = {
    uniforms: S3GLProgramBindInputDataTable;
};
/**
 * メッシュデータの入出力用関数定義
 */
export type S3MeshLoaderDataIOFunvction = {
    /**
     * 入出力形式の名前（"JSON", "MQO", "OBJ"など）
     */
    name: string;
    /**
     * テキストをインスタンスへ変換する
     */
    input: (arg0: S3System, arg1: S3Mesh, arg2: string, arg3: string | undefined) => boolean;
    /**
     * インスタンスをテキストへ出力する
     */
    output?: (arg0: S3Mesh) => string;
};
declare namespace S3 {
    export { S3System as System };
    export { S3GLSystem as GLSystem };
    export { S3Math as Math };
    export { S3Angles as Angles };
    export { S3Vector as Vector };
    export { S3Matrix as Matrix };
    export { S3Plane as Plane };
    import SYSTEM_MODE = S3System.SYSTEM_MODE;
    export { SYSTEM_MODE };
    import DEPTH_MODE = S3System.DEPTH_MODE;
    export { DEPTH_MODE };
    import DIMENSION_MODE = S3System.DIMENSION_MODE;
    export { DIMENSION_MODE };
    import VECTOR_MODE = S3System.VECTOR_MODE;
    export { VECTOR_MODE };
    import FRONT_FACE = S3System.FRONT_FACE;
    export { FRONT_FACE };
    import CULL_MODE = S3System.CULL_MODE;
    export { CULL_MODE };
    import LIGHT_MODE = S3Light.MODE;
    export { LIGHT_MODE };
    export { S3MeshLoader as MeshLoader };
    export { CameraController };
}
/**
 * WebGL用の配列（バッファ）を生成・管理するクラス。（immutable）
 * 各種型（S3Vector, S3Matrix, 数値配列等）をWebGLバッファ（Float32Array/Int32Array）に変換し、
 * 対応するGLSL型（vec3, mat4等）情報も保持します。
 *
 * @class
 * @module S3
 */
declare class S3GLArray {
    /**
     * WebGL用の配列データを作成します（immutable）。
     * 渡された値に応じて型変換・整形し、GLSLでそのまま利用可能な形にします。
     *
     * @param {number[]|number|S3Vector|S3Matrix|Float32Array|Int32Array} data 配列、数値、S3Vector/S3Matrix、あるいは既にTypedArrayの場合も可
     * @param {number} dimension 配列の次元（例：3ならvec3やivec3になる）
     * @param {S3GLArrayDataType} datatype 使用するバッファ型（S3GLArray.datatype）
     */
    constructor(data: number[] | number | S3Vector | S3Matrix | Float32Array | Int32Array, dimension: number, datatype: S3GLArrayDataType);
    /**
     * 本体データ（TypedArray: Float32Array または Int32Array）
     * @type {Float32Array|Int32Array}
     */
    data: Float32Array | Int32Array;
    /**
     * 配列の次元（要素数やGLSL型を決定するための値）
     * 例: 3 → vec3, 16 → mat4
     * @type {number}
     */
    dimension: number;
    /**
     * 配列のデータ型情報（TypedArray種別や型名などを格納したオブジェクト）
     * @type {S3GLArrayDataType}
     */
    datatype: S3GLArrayDataType;
    /**
     * GLSLの型名（vec3, mat4, float等）
     * @type {string}
     */
    glsltype: string;
}
declare namespace S3GLArray {
    let datatype: {
        Float32Array: S3GLArrayDataType;
        Int32Array: S3GLArrayDataType;
    };
    let gltypetable: S3GLArrayGLTypeTable;
}
/**
 * 3DCG用の4x4行列クラス
 * 主に変換行列や射影行列などに使用されます。
 *
 * @class
 * @module S3
 */
declare class S3Matrix {
    /**
     * 3DCG用 の4x4行列  (immutable)
     * 行列を作成します。MATLABと同様に行ごとに指定します。
     * 9引数で3x3行列、16引数で4x4行列、引数なしで0埋め行列
     * @param {Number} [m00]
     * @param {Number} [m01]
     * @param {Number} [m02]
     * @param {Number} [m03]
     * @param {Number} [m10]
     * @param {Number} [m11]
     * @param {Number} [m12]
     * @param {Number} [m13]
     * @param {Number} [m20]
     * @param {Number} [m21]
     * @param {Number} [m22]
     * @param {Number} [m23]
     * @param {Number} [m30]
     * @param {Number} [m31]
     * @param {Number} [m32]
     * @param {Number} [m33]
     */
    constructor(m00?: number, m01?: number, m02?: number, m03?: number, m10?: number, m11?: number, m12?: number, m13?: number, m20?: number, m21?: number, m22?: number, m23?: number, m30?: number, m31?: number, m32?: number, m33?: number, ...args: any[]);
    /** @type {number} */
    m00: number;
    /** @type {number} */
    m01: number;
    /** @type {number} */
    m02: number;
    /** @type {number} */
    m03: number;
    /** @type {number} */
    m10: number;
    /** @type {number} */
    m11: number;
    /** @type {number} */
    m12: number;
    /** @type {number} */
    m13: number;
    /** @type {number} */
    m20: number;
    /** @type {number} */
    m21: number;
    /** @type {number} */
    m22: number;
    /** @type {number} */
    m23: number;
    /** @type {number} */
    m30: number;
    /** @type {number} */
    m31: number;
    /** @type {number} */
    m32: number;
    /** @type {number} */
    m33: number;
    /**
     * 2つの行列が等しいか判定します。
     * @param {S3Matrix} tgt
     * @returns {boolean}
     */
    equals(tgt: S3Matrix): boolean;
    /**
     * 自身のクローンを作成します。
     * @returns {S3Matrix}
     */
    clone(): S3Matrix;
    /**
     * 転置行列を返します。
     * @returns {S3Matrix}
     */
    transposed(): S3Matrix;
    /**
     * 非数成分を含むか判定します。
     * @returns {boolean}
     */
    isNaN(): boolean;
    /**
     * 有限の成分のみか判定します。
     * @returns {boolean}
     */
    isFinite(): boolean;
    /**
     * 実数値成分のみか判定します。
     * @returns {boolean}
     */
    isRealNumber(): boolean;
    /**
     * 行列またはベクトルとの掛け算を行います。
     * @param {S3Matrix} tgt 行列
     * @returns {S3Matrix}
     */
    mulMatrix(tgt: S3Matrix): S3Matrix;
    /**
     * 縦ベクトルとの掛け算を行います。
     * @param {S3Vector} tgt 縦ベクトル
     * @returns {S3Vector}
     */
    mulVector(tgt: S3Vector): S3Vector;
    /**
     * 3x3部分行列の行列式を計算します。
     * @returns {number}
     */
    det3(): number;
    /**
     * 3x3部分行列の逆行列を返します。
     * @returns {S3Matrix|null}
     */
    inverse3(): S3Matrix | null;
    /**
     * 4x4行列の行列式を計算します。
     * @returns {number}
     */
    det4(): number;
    /**
     * 4x4行列の逆行列を返します。
     * @returns {S3Matrix|null}
     */
    inverse4(): S3Matrix | null;
    /**
     * 行列を文字列に変換します。
     * @returns {string}
     */
    toString(): string;
    /**
     * 他の型のインスタンスに変換します（配列化）。
     * @param {{new(array: number[]): any}} Instance 配列型のコンストラクタ
     * @param {number} dimension 配列長
     * @returns {*} 変換結果
     */
    toInstanceArray(Instance: {
        new (array: number[]): any;
    }, dimension: number): any;
}
/**
 * 3DCG用のベクトルクラス（immutable）
 *
 * @class
 * @module S3
 */
declare class S3Vector {
    /**
     * @typedef {Object} S3NormalVector
     * @property {S3Vector} normal 平面の法線
     * @property {S3Vector} tangent UV座標による接線
     * @property {S3Vector} binormal UV座標による従法線
     */
    /**
     * 3点を通る平面の法線、接線、従法線を計算します。
     * A, B, C の3点を通る平面の法線と、UV座標による接線、従法線を求めます。
     * A, B, C の3点の時計回りが表だとした場合、表方向へ延びる法線となります。
     * @param {S3Vector} posA 点A
     * @param {S3Vector} posB 点B
     * @param {S3Vector} posC 点C
     * @param {S3Vector} [uvA] UV座標A
     * @param {S3Vector} [uvB] UV座標B
     * @param {S3Vector} [uvC] UV座標C
     * @returns {S3NormalVector}
     */
    static getNormalVector(posA: S3Vector, posB: S3Vector, posC: S3Vector, uvA?: S3Vector, uvB?: S3Vector, uvC?: S3Vector): {
        /**
         * 平面の法線
         */
        normal: S3Vector;
        /**
         * UV座標による接線
         */
        tangent: S3Vector;
        /**
         * UV座標による従法線
         */
        binormal: S3Vector;
    };
    /**
     * 3点が時計回りか判定します。
     * @param {S3Vector} A
     * @param {S3Vector} B
     * @param {S3Vector} C
     * @returns {boolean|null} 時計回り:true、反時計回り:false、判定不可:null
     */
    static isClockwise(A: S3Vector, B: S3Vector, C: S3Vector): boolean | null;
    /**
     * ベクトルを作成します。
     * @param {number} x x成分
     * @param {number} y y成分
     * @param {number} [z=0.0] z成分
     * @param {number} [w=1.0] w成分（遠近除算用）
     */
    constructor(x: number, y: number, z?: number, w?: number);
    /**
     * x成分
     * @type {number}
     */
    x: number;
    /**
     * y成分
     * @type {number}
     */
    y: number;
    /**
     * z成分
     * @type {number}
     * @default 0.0
     */
    z: number;
    /**
     * w成分（遠近除算用）
     * @type {number}
     * @default 1.0
     */
    w: number;
    /**
     * 自身のクローンを作成します。
     * @returns {S3Vector} 複製されたベクトル
     */
    clone(): S3Vector;
    /**
     * 各成分を反転したベクトルを返します。
     * @returns {S3Vector}
     */
    negate(): S3Vector;
    /**
     * 2つのベクトルの外積を計算します。
     * @param {S3Vector} tgt
     * @returns {S3Vector} 外積ベクトル
     */
    cross(tgt: S3Vector): S3Vector;
    /**
     * 2つのベクトルの内積を計算します。
     * @param {S3Vector} tgt
     * @returns {number} 内積値
     */
    dot(tgt: S3Vector): number;
    /**
     * ベクトル同士の加算を行います。
     * @param {S3Vector} tgt
     * @returns {S3Vector} 加算結果
     */
    add(tgt: S3Vector): S3Vector;
    /**
     * ベクトル同士の減算を行います。
     * @param {S3Vector} tgt
     * @returns {S3Vector} 減算結果
     */
    sub(tgt: S3Vector): S3Vector;
    /**
     * ベクトルの各成分にスカラー、ベクトル、または行列を掛けます。
     * @param {number|S3Vector|S3Matrix} tgt
     * @returns {S3Vector}
     */
    mul(tgt: number | S3Vector | S3Matrix): S3Vector;
    /**
     * x成分のみ変更した新しいベクトルを返します。
     * @param {number} x
     * @returns {S3Vector}
     */
    setX(x: number): S3Vector;
    /**
     * y成分のみ変更した新しいベクトルを返します。
     * @param {number} y
     * @returns {S3Vector}
     */
    setY(y: number): S3Vector;
    /**
     * z成分のみ変更した新しいベクトルを返します。
     * @param {number} z
     * @returns {S3Vector}
     */
    setZ(z: number): S3Vector;
    /**
     * w成分のみ変更した新しいベクトルを返します。
     * @param {number} w
     * @returns {S3Vector}
     */
    setW(w: number): S3Vector;
    /**
     * 各成分の最大値を持つ新しいベクトルを返します。
     * @param {S3Vector} tgt
     * @returns {S3Vector}
     */
    max(tgt: S3Vector): S3Vector;
    /**
     * 各成分の最小値を持つ新しいベクトルを返します。
     * @param {S3Vector} tgt
     * @returns {S3Vector}
     */
    min(tgt: S3Vector): S3Vector;
    /**
     * 各成分が等しいか判定します。
     * @param {S3Vector} tgt
     * @returns {boolean} 全ての成分が等しい場合true
     */
    equals(tgt: S3Vector): boolean;
    /**
     * 2つのベクトル間を線形補間します。
     * @param {S3Vector} tgt
     * @param {number} alpha 補間係数（0~1）
     * @returns {S3Vector}
     */
    mix(tgt: S3Vector, alpha: number): S3Vector;
    /**
     * ノルム（二乗和の平方根、長さ）を計算します。
     * @returns {number} ベクトルの長さ
     */
    norm(): number;
    /**
     * ノルムの2乗値（高速、平方根なし）を返します。
     * @returns {number} 長さの二乗
     */
    normFast(): number;
    /**
     * 正規化した新しいベクトルを返します。
     * @returns {S3Vector}
     */
    normalize(): S3Vector;
    /**
     * ベクトルを文字列化します。
     * @param {number} [num] 成分数指定（省略時は4成分）
     * @returns {string}
     */
    toString(num?: number): string;
    /**
     * ベクトルのハッシュ値を返します。
     * @param {number} [num] 成分数指定（省略時は1成分）
     * @returns {number}
     */
    toHash(num?: number): number;
    /**
     * 他の型のインスタンスに変換します（配列化）。
     * @param {{new(array: number[]): any}} Instance 配列型のコンストラクタ
     * @param {number} dimension 配列長
     * @returns {*} 変換結果
     */
    toInstanceArray(Instance: {
        new (array: number[]): any;
    }, dimension: number): any;
    /**
     * 配列に成分をプッシュします。
     * @param {Array<number>} array
     * @param {number} num 成分数
     */
    pushed(array: Array<number>, num: number): void;
    /**
     * tgtへの方向ベクトルを取得します。
     * @param {S3Vector} tgt
     * @returns {S3Vector} tgt-自身のベクトル
     */
    getDirection(tgt: S3Vector): S3Vector;
    /**
     * tgtへの正規化された方向ベクトルを取得します。
     * @param {S3Vector} tgt
     * @returns {S3Vector}
     */
    getDirectionNormalized(tgt: S3Vector): S3Vector;
    /**
     * tgtとの距離を返します。
     * @param {S3Vector} tgt
     * @returns {number}
     */
    getDistance(tgt: S3Vector): number;
    /**
     * 非数かどうか判定します。
     * @returns {boolean}
     */
    isNaN(): boolean;
    /**
     * 有限かどうか判定します。
     * @returns {boolean}
     */
    isFinite(): boolean;
    /**
     * 実数かどうか判定します。
     * @returns {boolean}
     */
    isRealNumber(): boolean;
}
declare namespace S3Vector {
    let ZERO: S3Vector;
}
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
 * @class
 * @module S3
 *
 */
declare class S3System {
    /**
     * 視体積の上下方向の視野角を求めます。
     * @param {number} zoomY
     * @returns {number}
     */
    static calcFovY(zoomY: number): number;
    /**
     * アスペクト比を計算します。
     * @static
     * @param {number} width 幅
     * @param {number} height 高さ
     * @returns {number} アスペクト比
     */
    static calcAspect(width: number, height: number): number;
    /**
     * 現在のシステムモード（OpenGL/DirectX）
     * @type {number}
     * @see S3System.SYSTEM_MODE
     */
    systemmode: number;
    /**
     * 深度バッファのモード（OpenGL/DirectX）
     * @type {number}
     * @see S3System.DEPTH_MODE
     */
    depthmode: number;
    /**
     * 座標系モード（右手系/左手系）
     * @type {number}
     * @see S3System.DIMENSION_MODE
     */
    dimensionmode: number;
    /**
     * ベクトル型のモード（VECTOR4x1 / VECTOR1x4）
     * @type {number}
     * @see S3System.VECTOR_MODE
     */
    vectormode: number;
    /**
     * 前面判定の面の向き（時計回り/反時計回り）
     * @type {number}
     * @see S3System.FRONT_FACE
     */
    frontface: number;
    /**
     * カリングモード（面の非表示除去方法）
     * @type {number}
     * @see S3System.CULL_MODE
     */
    cullmode: number;
    /**
     * 背景色（RGBAベクトル）
     * @type {S3Vector}
     */
    backgroundColor: S3Vector;
    /**
     * 描画に使うcanvas要素
     * @type {HTMLCanvasElement}
     */
    canvas: HTMLCanvasElement;
    /**
     * 内部状態を初期化します（描画モードや背景色のリセット）。
     * @private
     */
    private _init;
    /**
     * ユニークなID文字列を発行します（テクスチャなどの管理用途）。
     * @returns {string} 新しいID文字列
     */
    _createID(): string;
    /**
     * 内部で一意なIDを発行するためのカウンタ配列
     * @type {number[]} [4]
     * @private
     */
    private _CREATE_ID;
    /**
     * 画像やテキストファイルをダウンロードします。
     * 画像拡張子ならImage要素、それ以外はテキストとして取得しコールバックします。
     * @param {string} url 取得先URL
     * @param {function} callback 取得完了時に呼ばれるコールバック関数
     */
    _download(url: string, callback: Function): void;
    /**
     * 任意の値をS3Vectorに変換します。
     * @param {S3Vector|Array<number>|number} x 変換対象
     * @returns {S3Vector} ベクトル化した値
     */
    _toVector3(x: S3Vector | Array<number> | number): S3Vector;
    /**
     * 任意の値を数値に変換します。
     * @param {*} x 変換対象
     * @returns {number} 数値
     */
    _toValue(x: any): number;
    /**
     * 背景色を設定します。
     * @param {S3Vector} color RGBAで指定する背景色
     */
    setBackgroundColor(color: S3Vector): void;
    /**
     * 背景色を取得します。
     * @returns {S3Vector} 現在の背景色（RGBA）
     */
    getBackgroundColor(): S3Vector;
    /**
     * システムモードを設定します（OpenGL/DIRECT_Xなど）。
     * 各種描画パラメータも合わせて設定されます。
     * @param {number} mode S3System.SYSTEM_MODE で定義される値
     */
    setSystemMode(mode: number): void;
    /**
     * 深度（Z値の扱い）のモードを設定します。
     * @param {number} depthmode S3System.DEPTH_MODE
     */
    setDepthMode(depthmode: number): void;
    /**
     * 座標系（右手/左手系）を設定します。
     * @param {number} dimensionmode S3System.DIMENSION_MODE
     */
    setDimensionMode(dimensionmode: number): void;
    /**
     * ベクトル表現のモードを設定します（縦型/横型）。
     * @param {number} vectormode S3System.VECTOR_MODE
     */
    setVectorMode(vectormode: number): void;
    /**
     * 前面と判定する面の頂点順序（時計回り/反時計回り）を設定します。
     * @param {number} frontface S3System.FRONT_FACE
     */
    setFrontMode(frontface: number): void;
    /**
     * カリング（非表示面除去）の方法を設定します。
     * @param {number} cullmode S3System.CULL_MODE
     */
    setCullMode(cullmode: number): void;
    /**
     * 描画に使うCanvasを関連付け、2D描画用Contextを内部にセットします。
     * @param {HTMLCanvasElement} canvas 使用するcanvas要素
     */
    setCanvas(canvas: HTMLCanvasElement): void;
    /**
     * 2D描画用のユーティリティオブジェクト（drawLine, drawLinePolygonなど）
     * @property {CanvasRenderingContext2D} context 2D描画コンテキスト
     * @property {function(S3Vector, S3Vector):void} drawLine 2点間の直線を描画
     * @property {function(S3Vector, S3Vector, S3Vector):void} drawLinePolygon 3点から三角形（線のみ）を描画
     * @property {function(number):void} setLineWidth 線の太さを設定
     * @property {function(string):void} setLineColor 線の色を設定
     * @property {function():void} clear キャンバス全体を背景色で塗りつぶし
     */
    context2d: {
        context: CanvasRenderingContext2D;
        /**
         * 2点間の直線を描画します。
         * @param {S3Vector} v0 始点
         * @param {S3Vector} v1 終点
         */
        drawLine: (v0: S3Vector, v1: S3Vector) => void;
        /**
         * 3点で囲む三角形の外枠（線のみ）を描画します。
         * @param {S3Vector} v0
         * @param {S3Vector} v1
         * @param {S3Vector} v2
         */
        drawLinePolygon: (v0: S3Vector, v1: S3Vector, v2: S3Vector) => void;
        /**
         * 線の太さを設定します（ピクセル単位）。
         * @param {number} width 線幅
         */
        setLineWidth: (width: number) => void;
        /**
         * 線の色を設定します（CSSカラー形式）。
         * @param {string} color 線の色（例: "rgb(255,0,0)"）
         */
        setLineColor: (color: string) => void;
        /**
         * キャンバス全体を背景色でクリアします。
         */
        clear: () => void;
    };
    /**
     * 三角形がカリング対象かどうか判定します。
     * @param {S3Vector} p1 頂点1
     * @param {S3Vector} p2 頂点2
     * @param {S3Vector} p3 頂点3
     * @returns {boolean} trueの場合は描画しない
     */
    testCull(p1: S3Vector, p2: S3Vector, p3: S3Vector): boolean;
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
    getMatrixViewport(x: number, y: number, Width: number, Height: number, MinZ?: number, MaxZ?: number): S3Matrix;
    /**
     * 視野角（FOVY）から射影行列を生成します。
     * @param {number} fovY 視体積の上下方向の視野角（0度から180度）
     * @param {number} Aspect 近平面、遠平面のアスペクト比（Width / Height）
     * @param {number} Near カメラから近平面までの距離（ニアークリッピング平面）
     * @param {number} Far カメラから遠平面までの距離（ファークリッピング平面）
     * @returns {S3Matrix} 射影変換行列
     */
    getMatrixPerspectiveFov(fovY: number, Aspect: number, Near: number, Far: number): S3Matrix;
    /**
     * カメラのビュー行列を生成します。
     * @param {S3Vector} eye カメラの座標の位置ベクトル
     * @param {S3Vector} at カメラの注視点の位置ベクトル
     * @param {S3Vector} [up] カメラの上への方向ベクトル
     * @returns {S3Matrix} ビュー行列
     */
    getMatrixLookAt(eye: S3Vector, at: S3Vector, up?: S3Vector): S3Matrix;
    /**
     * 単位行列を生成します。
     * @returns {S3Matrix} 単位行列
     */
    getMatrixIdentity(): S3Matrix;
    /**
     * 平行移動行列を生成します。
     * @param {number} x X移動量
     * @param {number} y Y移動量
     * @param {number} z Z移動量
     * @returns {S3Matrix} 平行移動行列
     */
    getMatrixTranslate(x: number, y: number, z: number): S3Matrix;
    /**
     * 拡大縮小行列を生成します。
     * @param {number} x X方向スケール
     * @param {number} y Y方向スケール
     * @param {number} z Z方向スケール
     * @returns {S3Matrix} スケーリング行列
     */
    getMatrixScale(x: number, y: number, z: number): S3Matrix;
    /**
     * X軸周りの回転行列を生成します。
     * @param {number} degree 角度（度）
     * @returns {S3Matrix} 回転行列
     */
    getMatrixRotateX(degree: number): S3Matrix;
    /**
     * Y軸周りの回転行列を生成します。
     * @param {number} degree 角度（度）
     * @returns {S3Matrix} 回転行列
     */
    getMatrixRotateY(degree: number): S3Matrix;
    /**
     * Z軸周りの回転行列を生成します。
     * @param {number} degree 角度（度）
     * @returns {S3Matrix} 回転行列
     */
    getMatrixRotateZ(degree: number): S3Matrix;
    /**
     * 縦型/横型を踏まえて2つの行列を掛けます。
     * @param {S3Matrix} A
     * @param {S3Matrix} B
     * @returns {S3Matrix} 計算結果
     */
    mulMatrix(A: S3Matrix, B: S3Matrix): S3Matrix;
    /**
     * 縦型/横型を踏まえて行列とベクトルを掛けます。
     * @param {S3Matrix} A
     * @param {S3Vector} B
     * @returns {S3Vector} 計算結果
     */
    mulVector(A: S3Matrix, B: S3Vector): S3Vector;
    /**
     * 航空機の姿勢制御 ZXY（ロール・ピッチ・ヨー）の順で回転行列を作成します。
     * @param {number} z ロール角（Z）
     * @param {number} x ピッチ角（X）
     * @param {number} y ヨー角（Y）
     * @returns {S3Matrix} 合成回転行列
     */
    getMatrixRotateZXY(z: number, x: number, y: number): S3Matrix;
    /**
     * 指定モデルのワールド変換行列を生成します（スケール→回転→移動の順）。
     * @param {S3Model} model 対象モデル
     * @returns {S3Matrix} ワールド変換行列
     */
    getMatrixWorldTransform(model: S3Model): S3Matrix;
    /**
     * 2Dキャンバスの内容をクリアします。
     */
    clear(): void;
    /**
     * 頂点リストをMVP変換・射影して新しい頂点配列を返します。
     * @param {Array<S3Vertex>} vertexlist 変換対象の頂点配列
     * @param {S3Matrix} MVP モデル・ビュー・射影行列
     * @param {S3Matrix} Viewport ビューポート変換行列
     * @returns {Array<S3Vertex>} 変換後の頂点配列
     */
    _calcVertexTransformation(vertexlist: Array<S3Vertex>, MVP: S3Matrix, Viewport: S3Matrix): Array<S3Vertex>;
    /**
     * X, Y, Zの座標軸を描画します（デバッグ用）。
     * @param {S3Scene} scene 対象シーン
     */
    drawAxis(scene: S3Scene): void;
    /**
     * ポリゴン（三角形群）を描画します（ラインで表示）。
     * @param {Array<S3Vertex>} vetexlist 頂点配列
     * @param {Array<S3TriangleIndex>} triangleindexlist インデックス配列
     */
    _drawPolygon(vetexlist: Array<S3Vertex>, triangleindexlist: Array<S3TriangleIndex>): void;
    /**
     * シーン全体を描画します。
     * @param {S3Scene} scene 描画対象のシーン
     */
    drawScene(scene: S3Scene): void;
    /**
     * 不要になったリソースを解放します（未実装）。
     * @param {Object} obj 解放対象のオブジェクト
     * @returns {void}
     */
    _disposeObject(obj: Object): void;
    /**
     * 新しい頂点インスタンスを生成します。
     * @param {S3Vector} position 頂点座標
     * @returns {S3Vertex} 生成された頂点
     */
    createVertex(position: S3Vector): S3Vertex;
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
    createTriangleIndex(i1: number, i2: number, i3: number, indexlist: Array<number>, materialIndex?: number, uvlist?: Array<S3Vector>): S3TriangleIndex;
    /**
     * 新しいテクスチャインスタンスを生成します。
     * @param {string|ImageData|HTMLImageElement|HTMLCanvasElement|HTMLVideoElement} [name] テクスチャ名や画像データ
     * @returns {S3Texture} 生成されたテクスチャ
     */
    createTexture(name?: string | ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement): S3Texture;
    /**
     * 新しいシーンインスタンスを生成します。
     * @returns {S3Scene} 生成されたシーン
     */
    createScene(): S3Scene;
    /**
     * 新しいモデルインスタンスを生成します。
     * @returns {S3Model} 生成されたモデル
     */
    createModel(): S3Model;
    /**
     * 新しいメッシュインスタンスを生成します。
     * @returns {S3Mesh} 生成されたメッシュ
     */
    createMesh(): S3Mesh;
    /**
     * 新しいマテリアルインスタンスを生成します。
     * @param {string} [name] マテリアル名
     * @returns {S3Material} 生成されたマテリアル
     */
    createMaterial(name?: string): S3Material;
    /**
     * 新しいライトインスタンスを生成します。
     * @returns {S3Light} 生成されたライト
     */
    createLight(): S3Light;
    /**
     * 新しいカメラインスタンスを生成します。
     * @returns {S3Camera} 生成されたカメラ
     */
    createCamera(): S3Camera;
}
declare namespace S3System {
    export namespace SYSTEM_MODE {
        let OPEN_GL: number;
        let DIRECT_X: number;
    }
    /**
     * *
     */
    export type SYSTEM_MODE = number;
    export namespace DEPTH_MODE_1 {
        let OPEN_GL_1: number;
        export { OPEN_GL_1 as OPEN_GL };
        let DIRECT_X_1: number;
        export { DIRECT_X_1 as DIRECT_X };
    }
    export { DEPTH_MODE_1 as DEPTH_MODE };
    export namespace DIMENSION_MODE_1 {
        let RIGHT_HAND: number;
        let LEFT_HAND: number;
    }
    export { DIMENSION_MODE_1 as DIMENSION_MODE };
    export namespace VECTOR_MODE_1 {
        let VECTOR4x1: number;
        let VECTOR1x4: number;
    }
    export { VECTOR_MODE_1 as VECTOR_MODE };
    export namespace FRONT_FACE_1 {
        let COUNTER_CLOCKWISE: number;
        let CLOCKWISE: number;
    }
    export { FRONT_FACE_1 as FRONT_FACE };
    export namespace CULL_MODE_1 {
        let NONE: number;
        let FRONT: number;
        let BACK: number;
        let FRONT_AND_BACK: number;
    }
    export { CULL_MODE_1 as CULL_MODE };
}
/**
 * 3DCG用メッシュ（立体形状データ）を管理するクラス (mutable)
 * 頂点・面・マテリアルを保持し、複数の形状や属性を一つにまとめます。
 *
 * @class
 * @module S3
 */
declare class S3Mesh {
    /**
     * メッシュを作成します。
     * @param {S3System} s3system S3Systemインスタンス
     */
    constructor(s3system: S3System);
    /**
     * システムインスタンス
     * @type {S3System}
     */
    sys: S3System;
    /**
     * 三角形インデックス追加時に面の頂点順序（表裏）を反転するかどうかを指定します。
     * true の場合は addTriangleIndex() で自動的に面を裏返して追加します。
     * @type {boolean}
     */
    is_inverse: boolean;
    /**
     * メッシュの内部状態を初期化します。
     */
    _init(): void;
    /**
     * メッシュの構成要素
     * @type {{vertex: Array<S3Vertex>, triangleindex: Array<S3TriangleIndex>, material: Array<S3Material>}}
     */
    src: {
        vertex: Array<S3Vertex>;
        triangleindex: Array<S3TriangleIndex>;
        material: Array<S3Material>;
    };
    /**
     * メッシュが確定済みかどうか
     * @type {boolean}
     */
    is_complete: boolean;
    /**
     * データを開放します
     * @returns {void}
     */
    dispose(): void;
    /**
     * メッシュが確定済みかどうかを返します。
     * @returns {boolean} 確定済みならtrue
     */
    isComplete(): boolean;
    /**
     * このメッシュのクローン（複製）を作成します。
     * @param {typeof S3Mesh} [Instance] 複製時のクラス指定（省略時はS3Mesh）
     * @returns {S3Mesh} 複製されたS3Meshインスタンス
     */
    clone(Instance?: typeof S3Mesh): S3Mesh;
    /**
     * メッシュの確定状態を設定します。
     * @param {boolean} is_complete 確定済みかどうか
     */
    setComplete(is_complete: boolean): void;
    /**
     * 三角形インデックスの順序を反転するモードを設定します。
     * 反転時はaddTriangleIndexで自動的に面を裏返します。
     * @param {boolean} inverse 反転するならtrue
     */
    setInverseTriangle(inverse: boolean): void;
    /**
     * メッシュが保持する頂点配列を取得します。
     * @returns {Array<S3Vertex>} 頂点配列
     */
    getVertexArray(): Array<S3Vertex>;
    /**
     * メッシュが保持する三角形インデックス配列を取得します。
     * @returns {Array<S3TriangleIndex>} 三角形インデックス配列
     */
    getTriangleIndexArray(): Array<S3TriangleIndex>;
    /**
     * メッシュが保持するマテリアル配列を取得します。
     * @returns {Array<S3Material>} マテリアル配列
     */
    getMaterialArray(): Array<S3Material>;
    /**
     * 頂点（S3Vertexまたはその配列）をメッシュに追加します。
     * @param {S3Vertex|Array<S3Vertex>} [vertex] 追加する頂点またはその配列
     */
    addVertex(vertex?: S3Vertex | Array<S3Vertex>): void;
    /**
     * 三角形インデックス（S3TriangleIndexまたはその配列）をメッシュに追加します。
     * 反転モード時は面を裏返して追加します。
     * @param {S3TriangleIndex|Array<S3TriangleIndex>} [ti] 追加する三角形インデックスまたはその配列
     */
    addTriangleIndex(ti?: S3TriangleIndex | Array<S3TriangleIndex>): void;
    /**
     * マテリアル（S3Materialまたはその配列）をメッシュに追加します。
     * @param {S3Material|Array<S3Material>} [material] 追加するマテリアルまたはその配列
     */
    addMaterial(material?: S3Material | Array<S3Material>): void;
}
/**
 * WebGLレンダリングシステムを管理するクラス。
 * シェーダー、テクスチャ、バッファオブジェクトの生成・管理、および描画制御を担当。
 * WebGLの初期化やプログラムのセットアップ、シーンの描画などの処理を含む。
 *
 * @class
 * @extends S3System
 * @module S3
 */
declare class S3GLSystem extends S3System {
    /** @type {?S3GLProgram} 現在使用中のプログラム */
    program: S3GLProgram | null;
    /** @type {?WebGLRenderingContext} WebGLレンダリングコンテキスト */
    gl: WebGLRenderingContext | null;
    /** @type {boolean} プログラムがセット済みかどうか */
    is_set: boolean;
    /** @type {Array<S3GLProgram>} 登録されているプログラムのリスト */
    program_list: Array<S3GLProgram>;
    /** @type {number} プログラムリストの識別ID */
    program_listId: number;
    /** @type {?string} ダミーテクスチャのID文字列 */
    _textureDummyId: string | null;
    /** @type {?WebGLTexture} ダミーテクスチャのWebGLTextureオブジェクト */
    _textureDummyData: WebGLTexture | null;
    /**
     * WebGLバッファ、テクスチャ、シェーダを作成・削除するユーティリティ関数群。
     */
    glfunc: {
        /**
         * 頂点バッファオブジェクト(VBO)を作成します。
         * @param {Float32Array|Int32Array} data バッファデータ
         * @returns {?WebGLBuffer} 作成したバッファオブジェクト
         */
        createBufferVBO: (data: Float32Array | Int32Array) => WebGLBuffer | null;
        /**
         * インデックスバッファオブジェクト(IBO)を作成します。
         * @param {Int16Array|Uint16Array} data インデックスバッファデータ
         * @returns {?WebGLBuffer} 作成したインデックスバッファオブジェクト
         */
        createBufferIBO: (data: Int16Array | Uint16Array) => WebGLBuffer | null;
        /**
         * 指定されたバッファを削除します。
         * @param {WebGLBuffer} data 削除するバッファオブジェクト
         * @returns {boolean} 成功時true
         */
        deleteBuffer: (data: WebGLBuffer) => boolean;
        /**
         * テクスチャオブジェクトを作成します。
         * @param {string} id テクスチャの識別ID
         * @param {ImageData|HTMLImageElement|HTMLCanvasElement|HTMLVideoElement} image テクスチャ画像
         * @returns {?WebGLTexture} 作成したテクスチャオブジェクト
         */
        createTexture: (id: string, image: ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement) => WebGLTexture | null;
        /**
         * 指定されたテクスチャを削除します。
         * @param {string} id テクスチャの識別ID
         */
        deleteTexture: (id: string) => void;
        /**
         * シェーダープログラムを作成します。
         * @param {WebGLShader} shader_vertex 頂点シェーダ
         * @param {WebGLShader} shader_fragment フラグメントシェーダ
         * @returns {{program: WebGLProgram, is_error: boolean}} 作成結果
         */
        createProgram: (shader_vertex: WebGLShader, shader_fragment: WebGLShader) => {
            program: WebGLProgram;
            is_error: boolean;
        };
        /**
         * シェーダープログラムを削除します。
         * @param {WebGLProgram} program 削除するプログラム
         * @param {WebGLShader} shader_vertex 頂点シェーダ
         * @param {WebGLShader} shader_fragment フラグメントシェーダ
         * @returns {boolean} 成功時true
         */
        deleteProgram: (program: WebGLProgram, shader_vertex: WebGLShader, shader_fragment: WebGLShader) => boolean;
        /**
         * シェーダーを作成します。
         * @param {number} sharder_type シェーダタイプ(gl.VERTEX_SHADER|gl.FRAGMENT_SHADER)
         * @param {string} code シェーダのGLSLソースコード
         * @returns {{shader: WebGLShader, is_error: boolean}} 作成結果
         */
        createShader: (sharder_type: number, code: string) => {
            shader: WebGLShader;
            is_error: boolean;
        };
        /**
         * 指定されたシェーダを削除します。
         * @param {WebGLShader} shader 削除するシェーダ
         * @returns {boolean} 成功時true
         */
        deleteShader: (shader: WebGLShader) => boolean;
    };
    /**
     * WebGLコンテキストを取得します。
     * @returns {WebGLRenderingContext} WebGLコンテキスト
     */
    getGL(): WebGLRenderingContext;
    /**
     * WebGLコンテキストが設定されているかを確認します。
     * @returns {boolean} 設定済みの場合true
     */
    isSetGL(): boolean;
    /**
     * 新しいシェーダープログラムを生成し取得します。
     * @returns {S3GLProgram} 新規生成されたシェーダープログラム
     */
    createProgram(): S3GLProgram;
    /**
     * 登録されている全てのシェーダープログラムを破棄します。
     */
    disposeProgram(): void;
    /**
     * シェーダープログラムをアクティブにします。
     * @param {S3GLProgram} glprogram アクティブに設定するシェーダープログラム
     * @returns {boolean} 設定が成功した場合true
     */
    setProgram(glprogram: S3GLProgram): boolean;
    /**
     * 描画クリア処理を行います（背景色・深度バッファのリセット）。
     * @returns {boolean} 成功時true
     */
    clear(): boolean;
    /**
     * 指定されたインデックスサイズに基づいて要素を描画します。
     * @param {number} indexsize インデックスバッファのサイズ
     * @returns {boolean} 成功時true
     */
    drawElements(indexsize: number): boolean;
    /**
     * 指定したWebGLバッファを削除します。
     * @param {WebGLBuffer} data 削除するバッファオブジェクト
     * @returns {boolean} 成功時true
     */
    deleteBuffer(data: WebGLBuffer): boolean;
    /**
     * 1x1ピクセルのダミーテクスチャ（WebGLTexture）を取得します。
     * まだ生成されていない場合は新規作成します。テクスチャ未指定時の代替として利用されます。
     * @returns {WebGLTexture} ダミーテクスチャのWebGLTextureオブジェクト
     */
    _getDummyTexture(): WebGLTexture;
    /**
     * 深度バッファのテストモードをWebGLで有効化します。
     * 通常は自動的に呼ばれます。
     * @returns {boolean} 成功時true
     */
    _setDepthMode(): boolean;
    /**
     * WebGLのカリングモード（描画面の制御）を設定します。
     * カリングの有無・前面/背面/両面の設定も行います。
     * @returns {boolean} 成功時true
     */
    _setCullMode(): boolean;
    /**
     * 描画前処理として、アクティブなテクスチャIDをリセットします。
     * 通常は内部的に呼ばれます。
     */
    _bindStart(): void;
    /**
     * 描画後処理として、バインド状態の解放やクリーンアップを行います。
     * （本実装では何もしていません。拡張用）
     */
    _bindEnd(): void;
    /**
     * モデル・uniforms・名前と値を与えた場合のデータバインド処理を実行します。
     * - 2引数: シェーダ変数名とデータをバインド
     * - 1引数: S3GLModelならメッシュ情報をバインド
     * - 1引数: uniforms情報ならすべてのuniformsをバインド
     *
     * @param {...any} args バインド対象
     * @returns {number} 0以上は成功、モデルの場合はIBOインデックス数（モデルの場合）
     */
    _bind(...args: any[]): number;
    /**
     * シーン全体を描画します。
     * プログラム設定や深度・カリングモードの設定、各種Uniformやモデルバインド・描画を自動実行します。
     * @param {S3GLScene} scene 描画対象のシーン
     * @returns {void}
     */
    drawScene(scene: S3GLScene): void;
    /**
     * GL用の頂点インスタンス（S3GLVertex）を生成します。
     * @param {S3Vector} position 頂点座標
     * @returns {S3GLVertex} 生成されたGL用頂点
     */
    createVertex(position: S3Vector): S3GLVertex;
    /**
     * GL用の三角形インデックスインスタンスを生成します。
     * @param {number} i1 頂点1のインデックス
     * @param {number} i2 頂点2のインデックス
     * @param {number} i3 頂点3のインデックス
     * @param {Array<number>} indexlist 頂点インデックス配列
     * @param {number} [materialIndex] マテリアルインデックス
     * @param {Array<S3Vector>} [uvlist] UV座標配列
     * @returns {S3GLTriangleIndex} 生成されたGL用三角形インデックス
     */
    createTriangleIndex(i1: number, i2: number, i3: number, indexlist: Array<number>, materialIndex?: number, uvlist?: Array<S3Vector>): S3GLTriangleIndex;
    /**
     * GL用のテクスチャインスタンスを生成します。
     * @param {string|ImageData|HTMLImageElement|HTMLCanvasElement|HTMLVideoElement} [name] テクスチャ名や画像データ
     * @returns {S3GLTexture} 生成されたGL用テクスチャ
     */
    createTexture(name?: string | ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement): S3GLTexture;
    /**
     * GL用のシーンインスタンスを生成します。
     * @returns {S3GLScene} 生成されたGL用シーン
     */
    createScene(): S3GLScene;
    /**
     * GL用のモデルインスタンスを生成します。
     * @returns {S3GLModel} 生成されたGL用モデル
     */
    createModel(): S3GLModel;
    /**
     * GL用のメッシュインスタンスを生成します。
     * @returns {S3GLMesh} 生成されたGL用メッシュ
     */
    createMesh(): S3GLMesh;
    /**
     * GL用のマテリアルインスタンスを生成します。
     * @param {string} [name] マテリアル名
     * @returns {S3GLMaterial} 生成されたGL用マテリアル
     */
    createMaterial(name?: string): S3GLMaterial;
    /**
     * GL用のライトインスタンスを生成します。
     * @returns {S3GLLight} 生成されたGL用ライト
     */
    createLight(): S3GLLight;
}
declare namespace S3Math {
    let EPSILON: number;
    function clamp(x: number, min: number, max: number): number;
    function step(edge: number, x: number): number;
    function mix(v0: number, v1: number, x: number): number;
    function smoothstep(v0: number, v1: number, x: number): number;
    function equals(x1: number, x2: number): boolean;
    function mod(x: number, y: number): number;
    function sign(x: number): number;
    function fract(x: number): number;
    function rsqrt(x: number): number;
    function radius(degree: number): number;
    function degrees(rad: number): number;
}
/**
 * 3DCG用のオイラー角クラス（immutable）
 * Roll（Z軸）、Pitch（X軸）、Yaw（Y軸）の順で角度を保持します。
 * 各値は常に周期的（-180～180度）に管理されます。
 *
 * @class
 * @module S3
 */
declare class S3Angles {
    /**
     * 角度を周期的（-PI～PI）に正規化します。内部利用のためprivateです。
     * @private
     * @param {number} x 任意の角度（度単位）
     * @returns {number} 周期内（-180～180）の角度
     */
    private static _toPeriodicAngle;
    /**
     * オイラー角（ZXY順）を指定して作成します。
     * @param {number} [z] ロール角（Z軸回転）
     * @param {number} [x] ピッチ角（X軸回転）
     * @param {number} [y] ヨー角（Y軸回転）
     */
    constructor(z?: number, x?: number, y?: number, ...args: any[]);
    /**
     * ロール角（Z軸回転）を周期的に正規化した値
     * @type {number}
     */
    roll: number;
    /**
     * ピッチ角（X軸回転）を周期的に正規化した値
     * @type {number}
     */
    pitch: number;
    /**
     * ヨー角（Y軸回転）を周期的に正規化した値
     * @type {number}
     */
    yaw: number;
    /**
     * このオブジェクトのクローンを作成します。
     * @returns {S3Angles} 複製されたオイラー角インスタンス
     */
    clone(): S3Angles;
    /**
     * Roll, Pitch, Yaw の順でオイラー角を再設定します。
     * @param {number} z ロール角（Z軸回転）
     * @param {number} x ピッチ角（X軸回転）
     * @param {number} y ヨー角（Y軸回転）
     */
    setRotateZXY(z: number, x: number, y: number): void;
    /**
     * ピッチ角（X軸回転）を加算した新しいオイラー角を返します。
     * @param {number} x 追加するピッチ角
     * @returns {S3Angles} 新しいオイラー角インスタンス
     */
    addRotateX(x: number): S3Angles;
    /**
     * ヨー角（Y軸回転）を加算した新しいオイラー角を返します。
     * @param {number} y 追加するヨー角
     * @returns {S3Angles} 新しいオイラー角インスタンス
     */
    addRotateY(y: number): S3Angles;
    /**
     * ロール角（Z軸回転）を加算した新しいオイラー角を返します。
     * @param {number} z 追加するロール角
     * @returns {S3Angles} 新しいオイラー角インスタンス
     */
    addRotateZ(z: number): S3Angles;
    /**
     * ピッチ角（X軸回転）のみを設定した新しいオイラー角を返します。
     * @param {number} x 新しいピッチ角
     * @returns {S3Angles} 新しいオイラー角インスタンス
     */
    setRotateX(x: number): S3Angles;
    /**
     * ヨー角（Y軸回転）のみを設定した新しいオイラー角を返します。
     * @param {number} y 新しいヨー角
     * @returns {S3Angles} 新しいオイラー角インスタンス
     */
    setRotateY(y: number): S3Angles;
    /**
     * ロール角（Z軸回転）のみを設定した新しいオイラー角を返します。
     * @param {number} z 新しいロール角
     * @returns {S3Angles} 新しいオイラー角インスタンス
     */
    setRotateZ(z: number): S3Angles;
    /**
     * オイラー角を文字列で返します。
     * @returns {string} "angles[roll,pitch,yaw]"形式の文字列
     */
    toString(): string;
}
declare namespace S3Angles {
    let PI: number;
    let PIOVER2: number;
    let PILOCK: number;
    let PI2: number;
}
/**
 * 3DCG用の平面クラス
 * 法線ベクトルと距離または平面上の1点から平面を定義します。
 *
 * @class
 * @module S3
 */
declare class S3Plane {
    /**
     * 平面を作成します。
     * @param {S3Vector} n 平面の法線ベクトル
     * @param {number|S3Vector} d 原点からの距離、または平面上の任意の点
     */
    constructor(n: S3Vector, d: number | S3Vector);
    /**
     * 平面の法線ベクトル
     * @type {S3Vector}
     */
    n: S3Vector;
    /**
     * 原点からの距離
     * @type {number}
     */
    d: number;
    /**
     * 任意の点から平面への距離を求めます。
     * @param {S3Vector} position 点の座標
     * @returns {number} 平面までの距離
     */
    getDistance(position: S3Vector): number;
    /**
     * 任意の点から最も近い平面上の点を求めます。
     * @param {S3Vector} position 点の座標
     * @returns {S3Vector} 平面上の最も近い点
     */
    getNearestPoint(position: S3Vector): S3Vector;
    /**
     * 点が平面の内側（法線方向の裏側）にあるか判定します。
     * @param {S3Vector} position 点の座標
     * @returns {boolean} 内側ならtrue
     */
    isHitPosition(position: S3Vector): boolean;
    /**
     * 平面を文字列に変換します。
     * @returns {string} 平面の情報を表す文字列
     */
    toString(): string;
}
/**
 * 3DCGシーン用のライト（照明）情報を管理するクラス
 * 各種ライト（環境光・平行光源・点光源など）のモード・強さ・方向・色などを保持します。
 *
 * @class
 * @module S3
 */
declare class S3Light {
    /**
     * ライト情報を初期値でリセットします。
     * モードや強度、範囲、方向、色なども初期状態に戻ります。
     */
    init(): void;
    /**
     * ライトの種類（モード）を指定します。S3Light.MODEを参照。
     * @type {number}
     */
    mode: number;
    /**
     * ライトの強さ（1.0=通常、0.0=無効）
     * @type {number}
     */
    power: number;
    /**
     * ライトの影響範囲（主に点光源で使用）
     * @type {number}
     */
    range: number;
    /**
     * ライトの位置ベクトル（主に点光源で使用）
     * @type {S3Vector}
     */
    position: S3Vector;
    /**
     * ライトの方向ベクトル（主に平行光源で使用）
     * @type {S3Vector}
     */
    direction: S3Vector;
    /**
     * ライトの色（RGB値のベクトル）
     * @type {S3Vector}
     */
    color: S3Vector;
    /**
     * このライト情報のクローン（複製）を作成します。
     * @param {typeof S3Light} [Instance] クラス指定（省略時はS3Light）
     * @returns {S3Light} 複製されたライトインスタンス
     */
    clone(Instance?: typeof S3Light): S3Light;
    /**
     * ライトの種類（モード）を設定します。
     * @param {number} mode S3Light.MODEで定義される値
     */
    setMode(mode: number): void;
    /**
     * ライトの強さを設定します。
     * @param {number} power 強度（通常1.0、0.0で無効）
     */
    setPower(power: number): void;
    /**
     * ライトの影響範囲を設定します（点光源等）。
     * @param {number} range 範囲
     */
    setRange(range: number): void;
    /**
     * ライトの位置を設定します（点光源等）。
     * @param {S3Vector} position 位置ベクトル
     */
    setPosition(position: S3Vector): void;
    /**
     * ライトの方向を設定します（平行光源等）。
     * @param {S3Vector} direction 方向ベクトル
     */
    setDirection(direction: S3Vector): void;
    /**
     * ライトの色を設定します（RGB）。
     * @param {S3Vector} color 色ベクトル
     */
    setColor(color: S3Vector): void;
}
declare namespace S3Light {
    namespace MODE {
        let NONE_1: number;
        export { NONE_1 as NONE };
        export let AMBIENT_LIGHT: number;
        export let DIRECTIONAL_LIGHT: number;
        export let POINT_LIGHT: number;
    }
    /**
     * ライトの種類（モード）定数
     */
    type MODE = number;
}
declare namespace S3MeshLoader {
    function inputData(s3system: S3System, data: string | Object, type?: string, callback?: (arg0: S3Mesh) => void): S3Mesh;
    function outputData(s3mesh: S3Mesh, type: string): string;
}
/**
 * カメラ操作用コントローラー
 * タッチ操作やマウス操作を用いて3DCGシーンのカメラの移動・回転・ズームイン/アウトなどを制御するクラスです。
 * InputDetect の入力情報をもとに、カメラの移動・回転・距離変更（ズーム）を自動で計算します。
 */
declare class CameraController {
    /**
     * タッチ・マウス入力管理オブジェクト
     * @type {InputDetect}
     */
    mouse: InputDetect;
    /**
     * ズーム時の移動量の係数
     * @type {number}
     */
    moveDistance: number;
    /**
     * カメラ回転時の角度変更係数（度／ピクセル）
     * @type {number}
     */
    moveRotate: number;
    /**
     * カメラ移動時の移動量の係数（ピクセル単位から変換）
     * @type {number}
     */
    moveTranslateRelative: number;
    /**
     * コントローラが管理・操作するカメラインスタンス
     * @type {S3Camera}
     */
    camera: S3Camera;
    /**
     * カメラコントローラで操作するcanvas要素を登録し、入力イベントを設定します。
     * @param {HTMLElement} element 対象となるcanvas要素など
     */
    setCanvas(element: HTMLElement): void;
    /**
     * 操作対象となるカメラをセットします（cloneで複製して保持）。
     * @param {S3Camera} camera 操作対象のカメラ
     */
    setCamera(camera: S3Camera): void;
    /**
     * 現在のカメラを取得し、入力に基づく移動・回転・ズームなどを反映して返します。
     *
     * 毎フレーム呼び出すことで、ユーザー操作を自動で反映したカメラインスタンスが得られます。
     * @returns {S3Camera} 現在のカメラ状態
     */
    getCamera(): S3Camera;
}
/**
 * 3DCGシーンに配置する「モデル」を管理するクラス (mutable)
 * 位置・回転・スケール・メッシュ（形状）などモデルの変換・配置情報を保持します。
 *
 * @class
 * @module S3
 */
declare class S3Model {
    /**
     * モデル各種パラメータを初期化します。
     * @private
     */
    private _init;
    /**
     * モデルの回転角（オイラー角）
     * @type {S3Angles}
     */
    angles: S3Angles;
    /**
     * モデルの拡大縮小率（スケール）
     * @type {S3Vector}
     */
    scale: S3Vector;
    /**
     * モデルのワールド座標系での位置
     * @type {S3Vector}
     */
    position: S3Vector;
    /**
     * モデルが持つメッシュ（形状データ）
     * @type {S3Mesh}
     */
    mesh: S3Mesh;
    /**
     * モデルのメッシュを設定します。
     * @param {S3Mesh} mesh 新しいメッシュ
     */
    setMesh(mesh: S3Mesh): void;
    /**
     * モデルのメッシュを取得します。
     * @returns {S3Mesh} 現在のメッシュ
     */
    getMesh(): S3Mesh;
    /**
     * モデルのスケール（拡大縮小）を設定します。
     * - 1引数の場合、数値なら等倍、S3Vectorならベクトル指定
     * - 3引数の場合は(x, y, z)を個別指定
     * @param {number|S3Vector} x Xスケール or S3Vector
     * @param {number} [y] Yスケール
     * @param {number} [z] Zスケール
     */
    setScale(x: number | S3Vector, y?: number, z?: number, ...args: any[]): void;
    /**
     * モデルのスケール（拡大縮小率）を取得します。
     * @returns {S3Vector} 現在のスケール
     */
    getScale(): S3Vector;
    /**
     * モデルのワールド座標系での位置を設定します。
     * - S3Vectorでの一括指定、またはx, y, z個別指定
     * @param {number|S3Vector} x X座標 or S3Vector
     * @param {number} [y] Y座標
     * @param {number} [z] Z座標
     */
    setPosition(x: number | S3Vector, y?: number, z?: number, ...args: any[]): void;
    /**
     * モデルのワールド座標系での位置を取得します。
     * @returns {S3Vector} 現在の位置
     */
    getPosition(): S3Vector;
    /**
     * モデルの回転角（オイラー角）を取得します。
     * @returns {S3Angles} 現在の回転角
     */
    getAngle(): S3Angles;
    /**
     * モデルの回転角（オイラー角）を設定します。
     * @param {S3Angles} angles 新しいオイラー角
     */
    setAngle(angles: S3Angles): void;
    /**
     * X軸まわりに回転（相対値）を加えます。
     * @param {number} x 加算する角度（度単位）
     */
    addRotateX(x: number): void;
    /**
     * Y軸まわりに回転（相対値）を加えます。
     * @param {number} y 加算する角度（度単位）
     */
    addRotateY(y: number): void;
    /**
     * Z軸まわりに回転（相対値）を加えます。
     * @param {number} z 加算する角度（度単位）
     */
    addRotateZ(z: number): void;
    /**
     * X軸まわりの回転角を絶対値で設定します。
     * @param {number} x 新しい角度（度単位）
     */
    setRotateX(x: number): void;
    /**
     * Y軸まわりの回転角を絶対値で設定します。
     * @param {number} y 新しい角度（度単位）
     */
    setRotateY(y: number): void;
    /**
     * Z軸まわりの回転角を絶対値で設定します。
     * @param {number} z 新しい角度（度単位）
     */
    setRotateZ(z: number): void;
}
/**
 * 3DCG用の頂点クラス（immutable）
 * 各頂点の空間上の座標情報を管理するシンプルなクラスです。
 *
 * @class
 * @module S3
 */
declare class S3Vertex {
    /**
     * 頂点を作成します。（immutable）
     * @param {S3Vector} position 頂点の座標ベクトル
     */
    constructor(position: S3Vector);
    /**
     * 頂点の座標ベクトル
     * @type {S3Vector}
     */
    position: S3Vector;
    /**
     * 頂点インスタンスのクローン（複製）を作成します。
     * @param {typeof S3Vertex} [Instance] 複製する際のクラス指定（省略時はS3Vertex）
     * @returns {S3Vertex} 複製されたS3Vertexインスタンス
     */
    clone(Instance?: typeof S3Vertex): S3Vertex;
}
/**
 * 3DCGシーン（描画シーン）の管理クラス
 * モデル・ライト・カメラなどシーン構成要素を一括管理します。
 *
 * @class
 * @module S3
 */
declare class S3Scene {
    /**
     * シーン構成要素を初期化します。
     * カメラは新規作成、モデル・ライトは空配列となります。
     */
    _init(): void;
    /**
     * シーン全体のカメラ
     * @type {S3Camera}
     */
    camera: S3Camera;
    /**
     * シーン内の3Dモデル配列
     * @type {Array<S3Model>}
     */
    model: Array<S3Model>;
    /**
     * シーン内のライト配列
     * @type {Array<S3Light>}
     */
    light: Array<S3Light>;
    /**
     * シーン内のモデル・ライトをすべて削除します（カメラは保持）。
     */
    empty(): void;
    /**
     * シーンのカメラを設定します（ディープコピー）。
     * @param {S3Camera} camera 設定するカメラ
     */
    setCamera(camera: S3Camera): void;
    /**
     * シーンにモデルを追加します。
     * @param {S3Model} model 追加する3Dモデル（型はS3Model等を想定）
     */
    addModel(model: S3Model): void;
    /**
     * シーンにライトを追加します。
     * @param {S3Light} light 追加するライト（型はS3Light等を想定）
     */
    addLight(light: S3Light): void;
    /**
     * 現在のカメラを取得します。
     * @returns {S3Camera} シーンのカメラ
     */
    getCamera(): S3Camera;
    /**
     * シーン内の全モデルを取得します。
     * @returns {Array<S3Model>} モデル配列
     */
    getModels(): Array<S3Model>;
    /**
     * シーン内の全ライトを取得します。
     * @returns {Array<S3Light>} ライト配列
     */
    getLights(): Array<S3Light>;
}
/**
 * 三角形ポリゴンのインデックス情報を保持するクラス（immutable）
 * 各ポリゴン面を構成する頂点インデックスやUV座標、マテリアルインデックスを管理します。
 *
 * @class
 * @module S3
 */
declare class S3TriangleIndex {
    /**
     * ABCの頂点を囲む三角形ポリゴンを作成します。
     * @param {number} i1 配列内の頂点Aのインデックス
     * @param {number} i2 配列内の頂点Bのインデックス
     * @param {number} i3 配列内の頂点Cのインデックス
     * @param {Array<number>} indexlist 頂点インデックス配列
     * @param {number} [materialIndex] 使用するマテリアルのインデックス（省略時や負値の場合は0）
     * @param {Array<S3Vector>} [uvlist] UV座標配列（S3Vector配列、なくても可）
     */
    constructor(i1: number, i2: number, i3: number, indexlist: Array<number>, materialIndex?: number, uvlist?: Array<S3Vector>);
    /**
     * 三角形ポリゴン情報を初期化します。
     * @private
     * @param {number} i1 頂点Aのインデックス
     * @param {number} i2 頂点Bのインデックス
     * @param {number} i3 頂点Cのインデックス
     * @param {Array<number>} indexlist 頂点インデックス配列
     * @param {number} [materialIndex] マテリアルインデックス
     * @param {Array<S3Vector>} [uvlist] UV座標配列
     */
    private _init;
    /**
     * 頂点インデックス配列（各頂点のインデックスを3つ持つ）
     * @type {Array<number>}
     */
    index: Array<number>;
    /**
     * 各頂点のUV座標配列（3つのS3Vector、またはnull）
     * @type {Array<S3Vector|null>}
     */
    uv: Array<S3Vector | null>;
    /**
     * 面のマテリアルインデックス（0以上の整数）
     * @type {number}
     */
    materialIndex: number;
    /**
     * この三角形インデックスのクローンを作成します。
     * @param {typeof S3TriangleIndex} [Instance] クローン時のクラス指定（省略時はS3TriangleIndex）
     * @returns {S3TriangleIndex} 複製されたインスタンス
     */
    clone(Instance?: typeof S3TriangleIndex): S3TriangleIndex;
    /**
     * 頂点A/B/Cの順序を逆転させた三角形インデックスを返します。
     * 通常カリングモードに応じて表裏を反転させたい場合に利用します。
     * @param {typeof S3TriangleIndex} [Instance] 反転時のクラス指定（省略時はS3TriangleIndex）
     * @returns {S3TriangleIndex} 反転された三角形インデックス
     */
    inverseTriangle(Instance?: typeof S3TriangleIndex): S3TriangleIndex;
}
/**
 * 3DCG用のテクスチャ（画像）情報を管理するクラス
 * 画像のセットや2の累乗化処理、ロード状況管理、破棄処理などを担当します。
 *
 * @class
 * @module S3
 */
declare class S3Texture {
    /**
     * テクスチャを作成します。
     * @param {S3System} s3system S3Systemインスタンス（画像ID発行・ダウンロード補助用）
     * @param {string|ImageData|HTMLImageElement|HTMLCanvasElement|HTMLVideoElement} [data] 初期化時に与える画像やURL等（省略可）
     */
    constructor(s3system: S3System, data?: string | ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement);
    /**
     * システムインスタンス
     * @type {S3System}
     */
    sys: S3System;
    /**
     * テクスチャ情報を初期化します。ロードフラグや画像情報をリセットします。
     * @protect
     */
    _init(): void;
    /**
     * テクスチャのURLやID
     * @type {?string}
     */
    url: string | null;
    /**
     * テクスチャ画像本体（ImageData, HTMLImageElement, HTMLCanvasElement, HTMLVideoElementなど）
     * @type {?ImageData|HTMLImageElement|HTMLCanvasElement|HTMLVideoElement}
     */
    image: (ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement) | null;
    /**
     * 画像がロード済みかどうか
     * @type {boolean}
     */
    is_loadimage: boolean;
    /**
     * テクスチャが破棄されたかどうか
     * @type {boolean}
     */
    is_dispose: boolean;
    /**
     * テクスチャを破棄します。再利用は不可になります。
     */
    dispose(): void;
    /**
     * テクスチャ画像を設定します。
     * - 画像が2の累乗でない場合は自動でリサイズします。
     * - 文字列の場合はURLとして画像をダウンロードします。
     * - 設定可能な形式: ImageData, HTMLImageElement, HTMLCanvasElement, HTMLVideoElement, URL(string)
     * @param {string|ImageData|HTMLImageElement|HTMLCanvasElement|HTMLVideoElement} image 設定する画像データまたはURL文字列
     */
    setImage(image: string | ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement): void;
}
/**
 * 3DCG用のマテリアル（素材）情報を管理するクラス(mutable)
 * 拡散反射色、自己照明、鏡面反射、環境光、反射、テクスチャなどを一括管理します。
 *
 * @class
 * @module S3
 */
declare class S3Material {
    /**
     * マテリアルを作成します。
     * @param {S3System} s3system S3System インスタンス（内部処理・生成補助用）
     * @param {string} [name] マテリアル名（任意指定、未指定時は"s3default"）
     */
    constructor(s3system: S3System, name?: string);
    /**
     * システムインスタンス
     * @type {S3System}
     */
    sys: S3System;
    /**
     * マテリアル名
     * @type {string}
     */
    name: string;
    /**
     * 拡散反射色（ベースカラー、RGBA値）
     * @type {S3Vector}
     */
    color: S3Vector;
    /**
     * 拡散反射の強さ（0～1）
     * @type {number}
     */
    diffuse: number;
    /**
     * 自己照明（発光色）
     * @type {S3Vector}
     */
    emission: S3Vector;
    /**
     * 鏡面反射色
     * @type {S3Vector}
     */
    specular: S3Vector;
    /**
     * 鏡面反射の強さ
     * @type {number}
     */
    power: number;
    /**
     * 環境光（光源に依存しない基本色）
     * @type {S3Vector}
     */
    ambient: S3Vector;
    /**
     * 環境マッピングの反射率
     * @type {number}
     */
    reflect: number;
    /**
     * 色用テクスチャ（拡散色テクスチャ）
     * @type {S3Texture}
     */
    textureColor: S3Texture;
    /**
     * 法線マップ用テクスチャ
     * @type {S3Texture}
     */
    textureNormal: S3Texture;
    /**
     * マテリアルを解放します（現状は未実装）。
     */
    dispose(): void;
    /**
     * マテリアル名を設定します。
     * @param {string} name 新しい名前
     */
    setName(name: string): void;
    /**
     * 拡散反射色を設定します。
     * @param {S3Vector|Array<number>|number} color S3Vector, 配列, または単一値
     */
    setColor(color: S3Vector | Array<number> | number): void;
    /**
     * 拡散反射の強さを設定します。
     * @param {number} diffuse 拡散反射係数（0～1）
     */
    setDiffuse(diffuse: number): void;
    /**
     * 自己照明（発光色）を設定します。
     * @param {S3Vector|Array<number>|number} emission S3Vector, 配列, または単一値
     */
    setEmission(emission: S3Vector | Array<number> | number): void;
    /**
     * 鏡面反射色を設定します。
     * @param {S3Vector|Array<number>|number} specular S3Vector, 配列, または単一値
     */
    setSpecular(specular: S3Vector | Array<number> | number): void;
    /**
     * 鏡面反射の強さを設定します。
     * @param {number} power 鏡面反射係数
     */
    setPower(power: number): void;
    /**
     * 環境光（アンビエント色）を設定します。
     * @param {S3Vector|Array<number>|number} ambient S3Vector, 配列, または単一値
     */
    setAmbient(ambient: S3Vector | Array<number> | number): void;
    /**
     * 環境マッピングの反射率を設定します。
     * @param {number} reflect 反射率（0～1）
     */
    setReflect(reflect: number): void;
    /**
     * 拡散色用テクスチャ画像を設定します。
     * @param {*} data 画像またはURL等（S3Texture.setImage に渡される形式）
     */
    setTextureColor(data: any): void;
    /**
     * 法線マップ用テクスチャ画像を設定します。
     * @param {*} data 画像またはURL等（S3Texture.setImageに渡される形式）
     */
    setTextureNormal(data: any): void;
}
/**
 * 3DCGシーンのカメラ（視点）情報を管理するクラス
 * 視点座標、注視点、視野角、描画範囲、各種行列演算などを保持・操作します。
 *
 * @class
 * @module S3
 */
declare class S3Camera {
    /**
     * カメラを作成します。
     * @param {S3System} s3system S3Systemインスタンス
     */
    constructor(s3system: S3System);
    /**
     * システムインスタンス
     * @type {S3System}
     */
    sys: S3System;
    /**
     * カメラの状態を初期化します（初期パラメータにリセット）。
     */
    init(): void;
    /**
     * 上下方向の視野角（度単位）
     * @type {number}
     */
    fovY: number;
    /**
     * 視点（カメラの位置ベクトル）
     * @type {S3Vector}
     */
    eye: S3Vector;
    /**
     * 注視点（カメラが見ている位置ベクトル）
     * @type {S3Vector}
     */
    at: S3Vector;
    /**
     * 描画範囲の最近接面（ニアクリップ）
     * @type {number}
     */
    near: number;
    /**
     * 描画範囲の最遠面（ファークリップ）
     * @type {number}
     */
    far: number;
    /**
     * カメラを破棄します（プロパティを初期化）。
     */
    dispose(): void;
    /**
     * このカメラのクローン（複製）を作成します。
     * @returns {S3Camera} 複製されたS3Cameraインスタンス
     */
    clone(): S3Camera;
    /**
     * カメラのビュー・プロジェクション・ビューポート行列情報をまとめた型
     *
     * - LookAt: ビュー変換行列
     * - aspect: アスペクト比（canvas幅 / 高さ）
     * - PerspectiveFov: パースペクティブ射影行列
     * - Viewport: ビューポート変換行列
     *
     * @typedef {Object} S3VPSMatrix
     * @property {S3Matrix} LookAt         ビュー（LookAt）変換行列
     * @property {number} aspect           アスペクト比
     * @property {S3Matrix} PerspectiveFov パースペクティブ射影行列
     * @property {S3Matrix} Viewport       ビューポート変換行列
     */
    /**
     * カメラのビュー・プロジェクション・ビューポート行列（VPS）をまとめて取得します。
     * 通常は描画や座標変換時の各種行列一式の取得に使います。
     *
     * @param {HTMLCanvasElement} canvas 描画先となるcanvas要素
     * @returns {S3VPSMatrix}
     */
    getVPSMatrix(canvas: HTMLCanvasElement): {
        /**
         * ビュー（LookAt）変換行列
         */
        LookAt: S3Matrix;
        /**
         * アスペクト比
         */
        aspect: number;
        /**
         * パースペクティブ射影行列
         */
        PerspectiveFov: S3Matrix;
        /**
         * ビューポート変換行列
         */
        Viewport: S3Matrix;
    };
    /**
     * 描画範囲（ニア・ファー）を設定します。
     * @param {number} near 最近接面
     * @param {number} far 最遠面
     */
    setDrawRange(near: number, far: number): void;
    /**
     * 上下方向の視野角を設定します（度単位）。
     * @param {number} fovY 視野角
     */
    setFovY(fovY: number): void;
    /**
     * 視点（eye）を設定します。
     * @param {S3Vector} eye 新しい視点ベクトル
     */
    setEye(eye: S3Vector): void;
    /**
     * 注視点（at）を設定します。
     * @param {S3Vector} at 新しい注視点ベクトル
     */
    setCenter(at: S3Vector): void;
    /**
     * 現在の視線ベクトル（at→eye方向の単位ベクトル）を取得します。
     * @returns {S3Vector} 正規化済みの視線方向
     */
    getDirection(): S3Vector;
    /**
     * カメラと注視点の距離を取得します。
     * @returns {number} 距離
     */
    getDistance(): number;
    /**
     * 注視点から一定距離の位置に視点を設定します。
     * @param {number} distance 距離
     */
    setDistance(distance: number): void;
    /**
     * カメラの水平方向（Y軸回転）の角度を取得します（度単位）。
     * @returns {number} Y軸回転角（度）
     */
    getRotateY(): number;
    /**
     * 水平方向（Y軸回転）の角度を設定します（度単位）。
     * @param {number} deg Y軸回転角（度）
     */
    setRotateY(deg: number): void;
    /**
     * Y軸回転角を相対的に加算します（度単位）。
     * @param {number} deg 加算する角度（度）
     */
    addRotateY(deg: number): void;
    /**
     * カメラの垂直方向（X軸回転）の角度を取得します（度単位）。
     * @returns {number} X軸回転角（度）
     */
    getRotateX(): number;
    /**
     * 垂直方向（X軸回転）の角度を設定します（度単位）。
     * @param {number} deg X軸回転角（度）
     */
    setRotateX(deg: number): void;
    /**
     * X軸回転角を相対的に加算します（度単位）。
     * @param {number} deg 加算する角度（度）
     */
    addRotateX(deg: number): void;
    /**
     * ワールド座標系で絶対移動します。
     * @param {S3Vector} v 移動ベクトル
     */
    translateAbsolute(v: S3Vector): void;
    /**
     * カメラのローカル座標系で相対移動します。
     * @param {S3Vector} v 移動ベクトル
     */
    translateRelative(v: S3Vector): void;
    /**
     * カメラのパラメータを文字列で出力します。
     * @returns {string} 視点・注視点・視野角の情報を含む文字列
     */
    toString(): string;
}
/**
 * @typedef {Int32Array|Float32Array|WebGLBuffer|WebGLTexture|S3GLArray|S3Matrix|S3Vector|number} S3GLProgramBindInputDataSingle bindDataの入力データ(単体)
 */
/**
 * @typedef {S3GLProgramBindInputDataSingle|Array<S3GLProgramBindInputDataSingle>} S3GLProgramBindInputData bindDataの入力データ(配列可)
 */
/**
 * @typedef {Object.<string, S3GLProgramBindInputData>} S3GLProgramBindInputDataTable
 */
/**
 * @typedef {Object} S3GLProgramUniforms
 * @property {S3GLProgramBindInputDataTable} uniforms
 */
/**
 * WebGLのプログラム（Program）管理クラス。
 * 頂点・フラグメント2つのシェーダーと、それらをリンクしたGLプログラムオブジェクトを保持し、
 * 各種attribute/uniform変数とのバインドや、プログラム切替・破棄などの管理を担います。
 * S3GLSystem経由でのWebGL描画制御のコアとなります。
 *
 * @class
 * @module S3
 */
declare class S3GLProgram {
    /**
     * WebGLプログラムを初期化します。
     * @param {S3GLSystem} sys GLシステムインスタンス
     * @param {number} id プログラム一意識別ID
     */
    constructor(sys: S3GLSystem, id: number);
    /**
     * プログラムの内部初期化。
     * 変数情報・シェーダー状態・リンク済みフラグ等をリセットします。
     * @private
     * @param {S3GLSystem} sys
     * @param {number} id
     */
    private _init;
    /**
     * プログラム一意ID
     * @type {number}
     */
    id: number;
    /**
     * GLシステムインスタンス
     * @type {S3GLSystem}
     */
    sys: S3GLSystem;
    /**
     * 頂点シェーダインスタンス
     * @type {?S3GLShader}
     */
    vertex: S3GLShader | null;
    /**
     * フラグメントシェーダインスタンス
     * @type {?S3GLShader}
     */
    fragment: S3GLShader | null;
    /**
     * 頂点シェーダがダウンロード中かどうか
     * @type {boolean}
     */
    isDLVertex: boolean;
    /**
     * フラグメントシェーダがダウンロード中かどうか
     * @type {boolean}
     */
    isDLFragment: boolean;
    /**
     * リンク済みGLプログラム
     * @type {?WebGLProgram}
     */
    program: WebGLProgram | null;
    /**
     * GL上でリンク済みかどうか
     * @type {boolean}
     */
    is_linked: boolean;
    /**
     * エラー発生済みかどうか
     * @type {boolean}
     */
    is_error: boolean;
    /**
     * 有効化済みのattributeロケーション番号管理
     * @type {Object<number, boolean>}
     */
    enable_vertex_number: {
        [x: number]: boolean;
    };
    /**
     * シェーダ変数管理構造体
     * @type {Object<string, S3GLShaderData>}
     */
    variable: {
        [x: string]: {
            /**
             * GLSL型名（例："vec3"）
             */
            glsltype: string;
            /**
             * 対応TypedArrayコンストラクタまたはImage
             */
            instance: (typeof Float32Array | typeof Int32Array | (new (width?: number, height?: number) => HTMLImageElement));
            /**
             * 要素数（floatなら1, mat4なら16など）
             */
            size: number;
            /**
             * 内部データ型区分（"FLOAT", "INT", "TEXTURE"等）
             */
            btype: string;
            /**
             * uniform変数へバインドするための関数
             */
            bind: (arg0: WebGLUniformLocation, arg1: any) => void;
            /**
             * 変数名（例："M"）
             */
            name: string;
            /**
             * 宣言修飾子（例："uniform"）
             */
            modifiers: string;
            /**
             * 配列かどうか（例：`true`なら配列型）
             */
            is_array: boolean;
            location: Array<GLint | WebGLUniformLocation>;
        };
    };
    /**
     * 次にバインド予定のアクティブテクスチャ番号
     * @type {number}
     */
    activeTextureId: number;
    /**
     * ソースコードから解析した変数のデータ
     *
     * - info オブジェクトのキー（"int", "float", "vec3"など）を使用して、いくつかのデータはコピーされる
     *
     * @typedef {Object} S3GLShaderData
     * @property {string} glsltype GLSL型名（例："vec3"）
     * @property {(typeof Float32Array | typeof Int32Array | Image)} instance 対応TypedArrayコンストラクタまたはImage
     * @property {number} size 要素数（floatなら1, mat4なら16など）
     * @property {string} btype 内部データ型区分（"FLOAT", "INT", "TEXTURE"等）
     * @property {function(WebGLUniformLocation, *):void} bind uniform変数へバインドするための関数
     * @property {string} name 変数名（例："M"）
     * @property {string} modifiers 宣言修飾子（例："uniform"）
     * @property {boolean} is_array 配列かどうか（例：`true`なら配列型）
     * @property {Array<GLint|WebGLUniformLocation>} location
     */
    /**
     * 頂点・フラグメントシェーダ内のattribute/uniform宣言を自動解析し、
     * 変数型・ロケーションなどを内部情報として登録します。
     * （通常はgetProgramで自動的に呼び出されます）
     * @param {string} code シェーダーのGLSLソース
     * @param {Object<string, S3GLShaderData>} variable 内部変数情報管理オブジェクト
     * @private
     */
    private analysisShader;
    /**
     * 使用するアクティブテクスチャ番号をリセットします。
     * テクスチャbind前に毎回呼び出し、TEXTUREユニットIDを初期化します。
     */
    resetActiveTextureId(): void;
    /**
     * プログラムがすでにGL上でリンク済みかどうか判定します。
     * @returns {boolean} リンク済みならtrue
     */
    isLinked(): boolean;
    /**
     * プログラム・シェーダーを全て解放し、GLリソースも破棄します。
     * 以後このインスタンスは再利用できません。
     * @returns {boolean} 正常終了時true、GL未設定時false
     */
    dispose(): boolean;
    /**
     * 頂点シェーダを設定します。既存のリンク状態なら設定不可。
     * @param {string} shader_code GLSLソースコードまたはURL
     * @returns {boolean} 成功時true、リンク済みまたはDL中はfalse
     */
    setVertexShader(shader_code: string): boolean;
    /**
     * フラグメントシェーダを設定します。既存のリンク状態なら設定不可。
     * @param {string} shader_code GLSLソースコードまたはURL
     * @returns {boolean} 成功時true、リンク済みまたはDL中はfalse
     */
    setFragmentShader(shader_code: string): boolean;
    /**
     * このプログラムをGLでuseProgram（アクティブ化）します。
     * @returns {boolean} 成功時true
     */
    useProgram(): boolean;
    /**
     * このプログラムの有効化状態を解除します（バッファ属性解放など）。
     * @returns {boolean} 成功時true
     */
    disuseProgram(): boolean;
    /**
     * プログラムのGLオブジェクト（WebGLProgram）を取得・生成します。
     * シェーダー・GLの準備やリンク状況など全て検証し、問題なければ生成・返却します。
     * @returns {?WebGLProgram} GLプログラムオブジェクト（未生成・エラー時はnull）
     */
    getProgram(): WebGLProgram | null;
    /**
     * attribute/uniform変数にデータをバインドします。
     * シェーダー内で使用されている変数名に対し、値・バッファ・テクスチャ等を型に応じて結びつけます。
     * @param {string} name 変数名（シェーダー内で宣言された名前）
     * @param {S3GLProgramBindInputData} data バインドしたい値やバッファ、テクスチャなど
     * @returns {boolean} 正常にバインドできればtrue
     */
    bindData(name: string, data: S3GLProgramBindInputData): boolean;
    /**
     * メッシュ（S3GLMesh）全体をこのプログラムにバインドします。
     * 内部でattribute変数とVBO/IBOなどを結び付け、必要なバッファ設定も行います。
     * @param {S3GLMesh} s3mesh S3GLMesh インスタンス
     * @returns {number} IBOのインデックス数（drawElements用）
     */
    bindMesh(s3mesh: S3GLMesh): number;
}
/**
 * WebGL描画用のシーン（Scene）クラス。
 * 基本のS3Sceneを拡張し、WebGL用のuniformデータ生成（getUniforms）などの機能を追加します。
 * カメラやライト情報をGLSLシェーダ向けにuniform変数としてまとめて提供します。
 *
 * @class
 * @extends S3Scene
 * @module S3
 */
declare class S3GLScene extends S3Scene {
    /**
     * シーンにモデルを追加します。
     * @param {S3GLModel} model 追加する3Dモデル（型はS3Model等を想定）
     */
    addModel(model: S3GLModel): void;
    /**
     * シーンにライトを追加します。
     * @param {S3GLLight} light 追加するライト（型はS3Light等を想定）
     */
    addLight(light: S3GLLight): void;
    /**
     * シーン内の全モデルを取得します。
     * @returns {Array<S3GLModel>} モデル配列
     */
    getModels(): Array<S3GLModel>;
    /**
     * シーン内の全ライトを取得します。
     * @returns {Array<S3GLLight>} ライト配列
     */
    getLights(): Array<S3GLLight>;
    /**
     * @typedef {Object} S3GLSceneUniform
     * @property {S3Vector} eyeWorldDirection カメラ情報
     * @property {S3GLArray} lightsLength ライトの数
     * @property {S3GLArray[]} lightsData1 モード・レンジ・方向or位置 (vec4)
     * @property {S3GLArray[]} lightsData2 方向or位置Z成分＋カラー情報 (vec4)
     */
    /**
     * @typedef {Object} S3GLProgramUniforms
     * @property {S3GLSceneUniform} uniforms
     */
    /**
     * シーン全体のWebGL向けuniformデータを生成して返します。
     * カメラの視線ベクトルや、最大4つまでのライト情報をuniform用データにまとめます。
     * 各値はS3GLArrayやGLSLと連携しやすい形式で返されます。
     *
     * - uniforms: uniform変数名→データ（カメラ方向ベクトル、ライト属性配列など）
     * @returns {S3GLProgramUniforms}
     */
    getUniforms(): import("./S3").S3GLProgramUniforms;
}
/**
 * WebGL描画用の頂点（バーテックス）クラス。
 * S3Vertexを拡張し、GL用データ生成やハッシュ化などを提供します。
 * 頂点情報（位置）をGL向け形式に変換し、バーテックスシェーダのattributeと連携できます。
 *
 * @class
 * @extends S3Vertex
 * @module S3
 */
declare class S3GLVertex extends S3Vertex {
    /**
     * この頂点のクローン（複製）を作成します。
     * @returns {S3GLVertex} 複製されたS3GLVertexインスタンス
     */
    clone(): S3GLVertex;
    /**
     * WebGL用の一意なハッシュ値を返します。
     * 頂点座標情報から3進数文字列で算出されます。
     * 頂点共有やVBO再利用の判定等で用います。
     * @returns {string} 頂点を識別するハッシュ文字列
     */
    getGLHash(): string;
    /**
     * 頂点情報をWebGL用データ形式（attribute変数用）で返します。
     * GLSLバーテックスシェーダの「vertexPosition」属性と対応します。
     *
     * - vertexPosition: 頂点の位置情報（vec3/Float32ArrayとしてGLに渡す）
     * @returns {{[key: string]: S3GLArray}}
     */
    getGLData(): {
        [key: string]: S3GLArray;
    };
}
/**
 * WebGL描画用の三角形インデックスクラス。
 * 基本のS3TriangleIndexを拡張し、GL用属性データ生成（S3GLTriangleIndexData化）などを追加しています。
 * 頂点インデックス・マテリアル番号・UV座標などの情報を持ち、WebGL向け処理の土台となります。
 *
 * @class
 * @extends S3TriangleIndex
 * @module S3
 */
declare class S3GLTriangleIndex extends S3TriangleIndex {
    /**
     * この三角形インデックスのクローン（複製）を作成します。
     * @returns {S3GLTriangleIndex} 複製されたS3GLTriangleIndexインスタンス
     */
    clone(): S3GLTriangleIndex;
    /**
     * 三角形の頂点順序を反転した新しいインスタンスを作成します。
     * モデルの表裏を逆転したい場合などに利用します。
     * @returns {S3GLTriangleIndex} 頂点順序を逆にした新しい三角形インデックス
     */
    inverseTriangle(): S3GLTriangleIndex;
    /**
     * この三角形の情報をWebGL用属性データ（S3GLTriangleIndexData）として生成します。
     * 法線・UV・接線等も含めた拡張情報付きで返します。
     * @returns {S3GLTriangleIndexData} WebGL向け属性データ
     */
    createGLTriangleIndexData(): S3GLTriangleIndexData;
}
/**
 * WebGL描画用のテクスチャクラス。
 * S3Textureを拡張し、WebGL用のGLTexture管理、GL用データ取得（getGLData）、破棄などを担います。
 * 画像データをGPUのテクスチャへ変換し、GLSLシェーダへのuniformバインドなどに利用します。
 *
 * @class
 * @extends S3Texture
 * @module S3
 */
declare class S3GLTexture extends S3Texture {
    /**
     * テクスチャを初期化します。
     * @param {S3GLSystem} s3glsystem GL用システムインスタンス（テクスチャ生成・削除などに必要）
     * @param {string|ImageData|HTMLImageElement|HTMLCanvasElement|HTMLVideoElement} [data]
     *   初期化時に与える画像・動画・URLなど（省略可）
     */
    constructor(s3glsystem: S3GLSystem, data?: string | ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement);
    /**
     * S3GLSystem アクセス用
     * @type {S3GLSystem}
     */
    _s3gl: S3GLSystem;
    /**
     * GL上のテクスチャオブジェクト
     * @type {?WebGLTexture}
     */
    gldata: WebGLTexture | null;
    /**
     * WebGL用テクスチャオブジェクト（GLTexture）を取得します。
     * 画像データがロード済みならGLテクスチャとして生成し、以後はキャッシュされます。
     * dispose済み、もしくは未ロードならnullを返します。
     * @returns {?WebGLTexture} WebGLテクスチャ（未生成・dispose時はnull）
     */
    getGLData(): WebGLTexture | null;
}
/**
 * WebGL描画用のモデル（Model）クラス。
 * 基本のS3Modelを拡張し、WebGL向けuniformデータの生成（getUniforms）機能を追加します。
 * モデルごとの材質（マテリアル）情報をuniformデータとしてまとめ、GLSLシェーダに渡せる形に整形します。
 *
 * @class
 * @extends S3Model
 * @module S3
 */
declare class S3GLModel extends S3Model {
    /**
     * モデルに関連するWebGL向けuniformデータを生成し返します。
     * モデルが参照するメッシュ内の最大4つまでのマテリアル情報をGLSLシェーダ向けデータにまとめます。
     * 各マテリアルのGLデータをuniform変数名でまとめ、GLへのバインド処理を簡略化します。
     *
     * - uniforms: uniform変数名→データ配列（各マテリアルの属性ごとに配列化）
     *
     * @returns {{
     *   uniforms: Object<string, Array<any>>
     * }}
     */
    getUniforms(): {
        uniforms: {
            [x: string]: Array<any>;
        };
    };
}
/**
 * WebGL用のメッシュ（立体形状データ）を管理するクラスです。
 * S3Meshを拡張し、WebGL描画に必要なVBOやIBO情報、GL用データ生成・解放機能などを持ちます。
 * モデルの描画時にGLにバインドできるバッファ形式への変換・管理も行います。
 *
 * @class
 * @extends S3Mesh
 * @module S3
 */
declare class S3GLMesh extends S3Mesh {
    /**
     * S3GLMeshのインスタンスを生成します。
     * @param {S3GLSystem} s3glsystem WebGLシステム（GLContext等の管理）インスタンス
     */
    constructor(s3glsystem: S3GLSystem);
    /**
     * S3GLSystem アクセス用
     * @type {S3GLSystem}
     */
    _s3gl: S3GLSystem;
    /**
     * WebGL用バッファデータ格納オブジェクト
     * @type {S3GLMeshArrayData}
     */
    gldata: {
        /**
         * インデックスバッファ情報
         */
        ibo: {
            /**
             * 配列の要素数（インデックス総数）
             */
            array_length: number;
            /**
             * インデックス値の配列（WebGL用）
             */
            array: Int16Array;
            /**
             * GL生成後のバッファオブジェクト（未生成時はundefined）
             */
            data?: WebGLBuffer;
        };
        /**
         * 頂点バッファ情報
         */
        vbo: {
            [x: string]: {
                /**
                 * 属性名（例："position", "normal", "uv" など）
                 */
                name: string;
                /**
                 * 配列の次元（例：位置なら3、UVなら2など）
                 */
                dimension: number;
                /**
                 * 使用する配列型
                 */
                datatype: typeof Float32Array | typeof Int32Array;
                /**
                 * 配列の要素数（全頂点×次元）
                 */
                array_length: number;
                /**
                 * 属性データ本体
                 */
                array: Float32Array | Int32Array;
                /**
                 * GL生成後のバッファオブジェクト（未生成時はundefined）
                 */
                data?: WebGLBuffer;
            };
        };
    };
    /**
     * GL用データのコンパイル状態
     * @type {boolean}
     */
    is_compile_gl: boolean;
    /**
     * このメッシュのクローン（複製）を生成します。
     * @returns {S3GLMesh} 複製されたS3GLMeshインスタンス
     */
    clone(): S3GLMesh;
    /**
     * メッシュが保持する頂点配列を取得します。
     * @returns {Array<S3GLVertex>} 頂点配列
     */
    getVertexArray(): Array<S3GLVertex>;
    /**
     * メッシュが保持する三角形インデックス配列を取得します。
     * @returns {Array<S3GLTriangleIndex>} 三角形インデックス配列
     */
    getTriangleIndexArray(): Array<S3GLTriangleIndex>;
    /**
     * メッシュが保持するマテリアル配列を取得します。
     * @returns {Array<S3GLMaterial>} マテリアル配列
     */
    getMaterialArray(): Array<S3GLMaterial>;
    /**
     * 頂点（ S3GLVertex またはその配列）をメッシュに追加します。
     * @param {S3GLVertex|Array<S3GLVertex>} vertex 追加する頂点またはその配列
     */
    addVertex(vertex: S3GLVertex | Array<S3GLVertex>): void;
    /**
     * 三角形インデックス（ S3GLTriangleIndex またはその配列）をメッシュに追加します。
     * 反転モード時は面を裏返して追加します。
     * @param {S3GLTriangleIndex|Array<S3GLTriangleIndex>} ti 追加する三角形インデックスまたはその配列
     */
    addTriangleIndex(ti: S3GLTriangleIndex | Array<S3GLTriangleIndex>): void;
    /**
     * マテリアル（ S3GLMaterial またはその配列）をメッシュに追加します。
     * @param {S3GLMaterial|Array<S3GLMaterial>} material 追加するマテリアルまたはその配列
     */
    addMaterial(material: S3GLMaterial | Array<S3GLMaterial>): void;
    /**
     * WebGL用データがすでに作成済みかどうかを返します。
     * @returns {boolean} 作成済みならtrue
     */
    isCompileGL(): boolean;
    /**
     * WebGL用データのコンパイル状態を設定します。
     * @param {boolean} is_compile_gl コンパイル済みかどうか
     */
    setCompileGL(is_compile_gl: boolean): void;
    /**
     * 各三角形ごとに、WebGL用属性データ（頂点ごとの法線・接線等）を生成します。
     * 頂点の共有を考慮して法線のスムージングも自動計算します。
     * @returns {Array<S3GLTriangleIndexData>} 三角形ごとのGL用属性データリスト
     */
    createTriangleIndexData(): Array<S3GLTriangleIndexData>;
    /**
     * IBO（インデックスバッファオブジェクト）データ構造
     * @typedef {Object} S3GLMeshIBOData
     * @property {number} array_length 配列の要素数（インデックス総数）
     * @property {Int16Array} array インデックス値の配列（WebGL用）
     * @property {WebGLBuffer} [data] GL生成後のバッファオブジェクト（未生成時はundefined）
     */
    /**
     * VBO（頂点バッファオブジェクト）1要素のデータ構造
     * @typedef {Object} S3GLMeshVBOElement
     * @property {string} name 属性名（例："position", "normal", "uv" など）
     * @property {number} dimension 配列の次元（例：位置なら3、UVなら2など）
     * @property {typeof Float32Array | typeof Int32Array} datatype 使用する配列型
     * @property {number} array_length 配列の要素数（全頂点×次元）
     * @property {Float32Array | Int32Array} array 属性データ本体
     * @property {WebGLBuffer} [data] GL生成後のバッファオブジェクト（未生成時はundefined）
     */
    /**
     * VBO（頂点バッファオブジェクト）全体のデータ構造
     * @typedef {Object.<string, S3GLMeshVBOElement>} S3GLMeshVBOData
     * 属性名（position/normal/uv等）→S3GLVBOElementの連想配列
     */
    /**
     * _getGLArrayDataの返却値（IBOとVBOまとめて返す構造）
     * @typedef {Object} S3GLMeshArrayData
     * @property {S3GLMeshIBOData} ibo インデックスバッファ情報
     * @property {S3GLMeshVBOData} vbo 頂点バッファ情報
     */
    /**
     * メッシュ全体の頂点・インデックス情報をWebGL用のバッファ形式（VBO/IBO）に変換します。
     * すでに計算済みなら再計算は行いません。
     *
     * - IBOはポリゴン（三角形）の頂点インデックス列
     * - VBOは各頂点の属性（位置、法線、UV等）の配列
     * - 戻り値の各dataプロパティは、GLバッファ生成後のみセットされます
     *
     * @returns {S3GLMeshArrayData} IBO/VBOデータをまとめたオブジェクト
     */
    _getGLArrayData(): {
        /**
         * インデックスバッファ情報
         */
        ibo: {
            /**
             * 配列の要素数（インデックス総数）
             */
            array_length: number;
            /**
             * インデックス値の配列（WebGL用）
             */
            array: Int16Array;
            /**
             * GL生成後のバッファオブジェクト（未生成時はundefined）
             */
            data?: WebGLBuffer;
        };
        /**
         * 頂点バッファ情報
         */
        vbo: {
            [x: string]: {
                /**
                 * 属性名（例："position", "normal", "uv" など）
                 */
                name: string;
                /**
                 * 配列の次元（例：位置なら3、UVなら2など）
                 */
                dimension: number;
                /**
                 * 使用する配列型
                 */
                datatype: typeof Float32Array | typeof Int32Array;
                /**
                 * 配列の要素数（全頂点×次元）
                 */
                array_length: number;
                /**
                 * 属性データ本体
                 */
                array: Float32Array | Int32Array;
                /**
                 * GL生成後のバッファオブジェクト（未生成時はundefined）
                 */
                data?: WebGLBuffer;
            };
        };
    };
    /**
     * メッシュのGLデータ（VBO/IBO）を取得・生成します。
     * すでに生成済みならキャッシュを返します。
     * メッシュが未完成または GLContext が未セットの場合はnullを返します。
     * @returns {S3GLMeshArrayData|null} WebGL用バッファデータ（ibo, vbo等を含む）またはnull
     */
    getGLData(): {
        /**
         * インデックスバッファ情報
         */
        ibo: {
            /**
             * 配列の要素数（インデックス総数）
             */
            array_length: number;
            /**
             * インデックス値の配列（WebGL用）
             */
            array: Int16Array;
            /**
             * GL生成後のバッファオブジェクト（未生成時はundefined）
             */
            data?: WebGLBuffer;
        };
        /**
         * 頂点バッファ情報
         */
        vbo: {
            [x: string]: {
                /**
                 * 属性名（例："position", "normal", "uv" など）
                 */
                name: string;
                /**
                 * 配列の次元（例：位置なら3、UVなら2など）
                 */
                dimension: number;
                /**
                 * 使用する配列型
                 */
                datatype: typeof Float32Array | typeof Int32Array;
                /**
                 * 配列の要素数（全頂点×次元）
                 */
                array_length: number;
                /**
                 * 属性データ本体
                 */
                array: Float32Array | Int32Array;
                /**
                 * GL生成後のバッファオブジェクト（未生成時はundefined）
                 */
                data?: WebGLBuffer;
            };
        };
    } | null;
}
/**
 * WebGL描画用のマテリアル（材質）クラス。
 * 基本のS3Materialを拡張し、GL用データ生成・ハッシュ管理などWebGL用途向けの機能を追加します。
 * 色、拡散/反射/発光/環境光、テクスチャ情報などを保持し、GLSLシェーダへのuniformデータ化を担います。
 *
 * @class
 * @extends S3Material
 * @module S3
 */
declare class S3GLMaterial extends S3Material {
    /**
     * マテリアル情報を初期化します。
     * @param {S3GLSystem} s3glsystem GL用システムインスタンス（テクスチャ生成等に必要）
     * @param {string} name マテリアル名（一意識別のためGLハッシュにも使用）
     */
    constructor(s3glsystem: S3GLSystem, name: string);
    /**
     * S3GLSystem アクセス用
     * @type {S3GLSystem}
     */
    _s3gl: S3GLSystem;
    /**
     * このマテリアルの一意なハッシュ文字列を取得します。
     * 通常はマテリアル名がそのままハッシュ値になります。
     * @returns {string} マテリアルの識別用ハッシュ値（名前）
     */
    getGLHash(): string;
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
    getGLData(): {
        [key: string]: S3GLArray | WebGLTexture;
    };
}
/**
 * WebGLレンダリング用のライト（照明）クラス。
 * 基本のS3Lightを拡張し、GL用データ生成や一意ハッシュ生成などのメソッドを提供します。
 *
 * @class
 * @extends S3Light
 * @module S3
 */
declare class S3GLLight extends S3Light {
    /**
     * このライトのクローン（複製）を作成します。
     * すべてのプロパティがコピーされたS3GLLightインスタンスを返します。
     * @returns {S3GLLight} 複製されたインスタンス
     */
    clone(): S3GLLight;
    /**
     * ライトのGL用一意ハッシュ文字列を返します。
     * 各種パラメータ（モード・パワー・レンジ・位置・方向・色）をもとに生成されます。
     * @returns {string} ライトの一意な識別用ハッシュ
     */
    getGLHash(): string;
    /**
     * @typedef {Object} S3GLLightGLData
     * @property {S3GLArray} lightsData1 モード・レンジ・方向or位置 (vec4)
     * @property {S3GLArray} lightsData2 方向or位置Z成分＋カラー情報 (vec4)
     */
    /**
     * ライト情報をWebGL用に変換し、GLSLのuniform用データ形式で返します。
     * 面光源/点光源で内容（direction or position）が切り替わります。
     * 各種値はS3GLArrayでラップされ、シェーダ変数名（例: lightsData1, lightsData2）に対応しています。
     * @returns {S3GLLightGLData} GL用のライトデータ
     */
    getGLData(): {
        /**
         * モード・レンジ・方向or位置 (vec4)
         */
        lightsData1: S3GLArray;
        /**
         * 方向or位置Z成分＋カラー情報 (vec4)
         */
        lightsData2: S3GLArray;
    };
}
/**
 * InputDetect
 *
 * @module InputDetect
 * @author natade (https://github.com/natade-jp)
 * @license MIT
 */
declare class InputDetect {
    /**
     * InputDetect のインスタンスを生成します。
     * @returns {InputDetect}
     */
    static create(): InputDetect;
    /**
     * スクロールを禁止します。
     *
     * @function
     * @returns {void}
     *
     * @example
     * // ページの縦スクロールを禁止したいときに実行
     * IDTools.noScroll();
     */
    static noScroll(): void;
    /**
     * @type {IDTouch}
     * @private
     */
    private _data;
    /**
     * 対象要素にタッチイベントリスナーを設定します。
     * @param {HTMLElement} element - イベントを監視するDOM要素
     */
    setListenerOnElement(element: HTMLElement): void;
    /**
     * 現在の入力情報が入ったIDTouchインスタンスを取得します。
     * 各ボタンや位置、ホイール回転量が渡され、渡した後はホイール量がリセットされます。
     * @returns {IDTouch} - タッチデータを持つIDTouchインスタンス
     */
    pickInput(): IDTouch;
}
/**
 * WebGLのシェーダー管理クラス。
 * 頂点シェーダ／フラグメントシェーダのソースコード・型・GLオブジェクトを保持し、コンパイルや破棄、状態取得などの機能を提供します。
 * S3GLProgram 内部で利用され、単体では直接使わないことが多い設計です。
 *
 * @class
 * @module S3
 */
declare class S3GLShader {
    /**
     * WebGLシェーダーを初期化します。
     * @param {S3GLSystem} sys GLシステムインスタンス（GLコンテキスト・コンパイル補助などに必要）
     * @param {string} code シェーダーのGLSLソースコード、またはGLSLファイルのURL（1行の場合は自動判別）
     */
    constructor(sys: S3GLSystem, code: string);
    /**
     * 内部初期化処理。
     * シェーダーソースの格納、コードの取得（URLならダウンロード）、GLオブジェクト初期化などを行います。
     * @private
     * @param {S3GLSystem} sys GLシステムインスタンス（GLコンテキスト・コンパイル補助などに必要）
     * @param {string} code シェーダーのGLSLソースコード、またはGLSLファイルのURL（1行の場合は自動判別）
     */
    private _init;
    /**
     * GLシステムインスタンス
     * @type {S3GLSystem}
     */
    sys: S3GLSystem;
    /**
     * シェーダーのGLSLソースコード。GLSLコード文字列、または未ロード時はnull。
     * @type {string|null}
     */
    code: string | null;
    /**
     * コンパイル済みWebGLShaderオブジェクト。未生成またはエラー時はnull。
     * @type {?WebGLShader}
     */
    shader: WebGLShader | null;
    /**
     * シェーダーの型。gl.VERTEX_SHADER（35633）かgl.FRAGMENT_SHADER（35632）、未設定時は-1。
     * @type {number}
     */
    sharder_type: number;
    /**
     * コンパイルや生成エラーが発生した場合にtrue。
     * @type {boolean}
     */
    is_error: boolean;
    /**
     * このシェーダーでエラーが発生しているか判定します。
     * @returns {boolean} エラー発生時はtrue
     */
    isError(): boolean;
    /**
     * シェーダーのソースコードを取得します（GLSL文字列）。
     * @returns {string|null} シェーダーソース。まだ取得できていない場合はnull
     */
    getCode(): string | null;
    /**
     * シェーダーオブジェクト（GLShader）を取得します。
     * 初回はGLSLの内容から自動でタイプ（頂点/フラグメント）判定とコンパイルを行います。
     * コンパイルエラー時や準備未完了時はnullを返します。
     * @returns {?WebGLShader} コンパイル済みGLシェーダーオブジェクト、またはnull
     */
    getShader(): WebGLShader | null;
    /**
     * このシェーダーのタイプ（頂点orフラグメント）を返します。
     * 準備ができていない場合やエラー時はnullになります。
     * @returns {number|null} gl.VERTEX_SHADER または gl.FRAGMENT_SHADER、未定義時は null
     */
    getShaderType(): number | null;
    /**
     * シェーダーリソースを解放し、GLオブジェクトを破棄します。
     * 以後このシェーダーは再利用できません。
     * @returns {boolean|null} 正常終了:true、GL未設定時:null
     */
    dispose(): boolean | null;
}
/**
 * WebGL描画用の三角形インデックス・属性データ格納クラス。
 * 三角形ごとの頂点インデックス・UV・法線・接線・従法線などを保持し、
 * WebGL（GLSL）用に最適化されたデータ生成やハッシュ作成も担います。
 *
 * @class
 * @module S3
 */
declare class S3GLTriangleIndexData {
    /**
     * 三角形インデックス情報からGL用データ構造を生成します。
     * @param {S3GLTriangleIndex} triangle_index S3GLTriangleIndexなどの三角形インデックス情報
     */
    constructor(triangle_index: S3GLTriangleIndex);
    /**
     * 各頂点を示すインデックス配列
     * @type {number[]}
     */
    index: number[];
    /**
     * 面が使用するマテリアル番号
     * @type {number}
     */
    materialIndex: number;
    /**
     * 各頂点のUV座標（S3Vectorの配列）
     * @type {Array<S3Vector>}
     */
    uv: Array<S3Vector>;
    /**
     * UV情報が有効かどうか
     * @type {boolean}
     */
    _isEnabledTexture: boolean;
    /**
     * 面（フェース）単位の属性情報型。
     * S3Vector.getTangentVector で計算された面の法線・接線・従法線（すべてS3Vector型またはnull）。
     *
     * @typedef {Object} S3GLFaceAttribute
     * @property {?S3Vector} normal   面の法線ベクトル
     * @property {?S3Vector} tangent  面の接線ベクトル
     * @property {?S3Vector} binormal 面の従法線ベクトル
     */
    /**
     * 頂点単位の属性情報型。
     * 各頂点（3つ）の法線・接線・従法線（いずれもS3Vector型またはnull）の配列。
     *
     * @typedef {Object} S3GLVertexAttribute
     * @property {Array<?S3Vector>} normal   各頂点の法線ベクトル [0], [1], [2]
     * @property {Array<?S3Vector>} tangent  各頂点の接線ベクトル [0], [1], [2]
     * @property {Array<?S3Vector>} binormal 各頂点の従法線ベクトル [0], [1], [2]
     */
    /**
     * 面の法線・接線・従法線
     * @type {S3GLFaceAttribute}
     */
    face: {
        /**
         * 面の法線ベクトル
         */
        normal: S3Vector | null;
        /**
         * 面の接線ベクトル
         */
        tangent: S3Vector | null;
        /**
         * 面の従法線ベクトル
         */
        binormal: S3Vector | null;
    };
    /**
     * 各頂点（3つ）の法線・接線・従法線の配列
     * @type {S3GLVertexAttribute}
     */
    vertex: {
        /**
         * 各頂点の法線ベクトル [0], [1], [2]
         */
        normal: Array<S3Vector | null>;
        /**
         * 各頂点の接線ベクトル [0], [1], [2]
         */
        tangent: Array<S3Vector | null>;
        /**
         * 各頂点の従法線ベクトル [0], [1], [2]
         */
        binormal: Array<S3Vector | null>;
    };
    /**
     * この三角形の、指定頂点（number番目）についてWebGL用一意ハッシュ値を生成します。
     * 頂点情報・UV・法線などを元にGLバッファのキャッシュや識別に使えます。
     * @param {number} number 三角形の頂点番号（0, 1, 2）
     * @param {Array<S3GLVertex>} vertexList 全頂点配列
     * @returns {string} 頂点＋属性を加味したハッシュ文字列
     */
    getGLHash(number: number, vertexList: Array<S3GLVertex>): string;
    /**
     * 指定頂点のWebGL向け頂点属性データ（GLSL用attribute名に合わせたデータ群）を返します。
     * 位置・マテリアル番号・UV・法線・接線・従法線などがGLArray形式で格納されます。
     *
     * - vertexPosition: 頂点位置(vec3)
     * - vertexTextureCoord: UV座標(vec2)
     * - vertexMaterialFloat: マテリアル番号(float)
     * - vertexNormal: 法線ベクトル(vec3)
     * - vertexBinormal: 従法線ベクトル(vec3)
     * - vertexTangent: 接線ベクトル(vec3)
     *
     * @param {number} number 三角形内の何番目の頂点データを取得するか（0, 1, 2）
     * @param {Array<S3GLVertex>} vertexList 頂点の配列
     * @returns {{[key: string]: S3GLArray}}
     */
    getGLData(number: number, vertexList: Array<S3GLVertex>): {
        [key: string]: S3GLArray;
    };
}
/**
 * IDTouch.js
 *
 * @module InputDetect
 * @author natade (https://github.com/natade-jp)
 * @license MIT
 */
/**
 * タッチデバイス入力を管理するクラスです。
 * 最大3本指のマルチタッチ操作を検出し、それぞれをマウスの左・右・中央クリックに割り当てて管理できます。
 * タッチイベントをPCのマウスイベントとして扱う変換処理も含まれています。
 */
declare class IDTouch extends IDMouse {
    /**
     * 内部の初期化処理を行います。
     * @private
     */
    private _initIDTouch;
    /**
     * タッチ数とマウスボタン番号のマッピング
     * @type {Object<number, number>}
     */
    touchcount_to_mask: {
        [x: number]: number;
    };
    /**
     * @param {MouseEvent} e
     */
    _mousePressed: (e: MouseEvent) => void;
    /**
     * @param {MouseEvent} e
     */
    _mouseReleased: (e: MouseEvent) => void;
    /**
     * @param {MouseEvent} e
     */
    _mouseMoved: (e: MouseEvent) => void;
    /**
     * 2本指の操作中かどうか
     * @type {boolean}
     */
    isdoubletouch: boolean;
    /**
     * @type {IDPosition}
     * @private
     */
    private _doubleposition_p1;
    /**
     * @type {IDPosition}
     * @private
     */
    private _doubleposition_p2;
    /**
     * タッチ開始時、すべての座標情報を初期化します。
     * @param {MouseEvent|TouchEvent} mouseevent - マウスイベント相当のオブジェクト
     * @private
     */
    private _initPosition;
    /**
     * マウスイベントのプロパティを仮想的なマウスイベント
     * @typedef {Object} VirtualMouseEvent
     * @property {number} clientX マウスのX座標
     * @property {number} clientY マウスのY座標
     * @property {number} button マウスボタンの種類
     * @property {EventTarget} target イベントのターゲット
     * @property {number} touchcount タッチ数
     */
    /**
     * タッチイベントを仮想的なマウスイベントへ変換します。
     * 指の平均座標を計算し、タッチ数から対応するボタンを設定します。
     * @param {TouchEvent} touchevent - タッチイベント
     * @returns {MouseEvent} 仮想マウスイベントオブジェクト
     * @private
     */
    private _MultiTouchToMouse;
    /**
     * 2本指タッチによるピンチ操作を検出し、ホイール回転に変換します。
     * @param {TouchEvent} touchevent - タッチイベント
     * @private
     */
    private _MoveMultiTouch;
    /**
     * 指定されたボタンに応じて関数を呼び分けます。
     * @param {MouseEvent} mouseevent - 仮想マウスイベント
     * @param {Function} funcOn - 対象ボタンで呼ぶ関数
     * @param {Function} funcOff - それ以外のボタンで呼ぶ関数
     * @param {number} target - 対象となるボタン番号
     * @private
     */
    private _actFuncMask;
    /**
     * タッチ開始イベントを処理します。
     * @param {TouchEvent} touchevent - タッチイベント
     * @private
     */
    private _touchStart;
    /**
     * タッチ終了イベントを処理します。
     * @param {TouchEvent} touchevent - タッチイベント
     * @private
     */
    private _touchEnd;
    /**
     * タッチ移動イベントを処理します。
     * @param {TouchEvent} touchevent - タッチイベント
     * @private
     */
    private _touchMove;
}
/**
 * IDMouse.js
 *
 * @module InputDetect
 * @author natade (https://github.com/natade-jp)
 * @license MIT
 */
/**
 * マウス入力を管理するクラスです。
 * 左・中央・右クリックの状態やドラッグ・ホイール回転・マウス座標の追跡を行い、複数ボタンの同時押しにも対応しています。
 */
declare class IDMouse {
    /**
     * 各プロパティを初期化します。
     * @private
     */
    private _initIDMouse;
    /**
     * 左ボタンの状態を管理するオブジェクト
     * @type {IDDraggableSwitch}
     */
    left: IDDraggableSwitch;
    /**
     * 中央ボタンの状態を管理するオブジェクト
     * @type {IDDraggableSwitch}
     */
    center: IDDraggableSwitch;
    /**
     * 右ボタンの状態を管理するオブジェクト
     * @type {IDDraggableSwitch}
     */
    right: IDDraggableSwitch;
    /**
     * 現在のマウス座標
     * @type {IDPosition}
     */
    position: IDPosition;
    /**
     * ホイールの回転量
     * @type {number}
     */
    wheelrotation: number;
    /**
     * このインスタンスの複製を作成します。
     * @returns {IDMouse} 複製したIDMouseインスタンス
     */
    clone(): IDMouse;
    /**
     * マウスボタンが押された時の処理を行います。
     * それぞれのボタンごとに対応する状態を更新します。
     * @param {MouseEvent} mouseevent - マウスイベントまたは同等のオブジェクト
     * @protected
     */
    protected mousePressed(mouseevent: MouseEvent): void;
    /**
     * マウスボタンが離された時の処理を行います。
     * @param {MouseEvent} mouseevent - マウスイベントまたは同等のオブジェクト
     * @protected
     */
    protected mouseReleased(mouseevent: MouseEvent): void;
    /**
     * マウス移動時の処理を行います。
     * それぞれのボタンのドラッグ状態や現在位置を更新します。
     * @param {MouseEvent} mouseevent - マウスイベントまたは同等のオブジェクト
     * @protected
     */
    protected mouseMoved(mouseevent: MouseEvent): void;
    /**
     * ホイール回転イベントの処理を行います。
     * @param {WheelEvent} event - ホイールイベントまたは同等のオブジェクト
     * @protected
     */
    protected mouseWheelMoved(event: WheelEvent): void;
    /**
     * マウスカーソルが要素外に出た場合の処理（状態リセット等）を行います。
     * @protected
     */
    protected focusLost(): void;
    /**
     * 他のIDMouseインスタンスへ現在の入力情報をコピーします。
     * 各ボタンや位置、ホイール回転量が渡され、渡した後はホイール量がリセットされます。
     * @param {IDMouse} c - 情報を受け取るIDMouseインスタンス
     * @throws {string} cがIDMouseでない場合
     */
    pickInput(c: IDMouse): void;
    /**
     * 指定した要素にマウス入力イベントリスナーを登録します。
     * これにより、押下・移動・ホイール回転・フォーカスロスト等のイベントをこのクラスで検知できます。
     * @param {HTMLElement} element - イベントリスナーを設定するDOM要素
     */
    setListenerOnElement(element: HTMLElement): void;
}
declare namespace IDMouse {
    namespace MOUSE_EVENTS {
        let BUTTON1_MASK: number;
        let BUTTON2_MASK: number;
        let BUTTON3_MASK: number;
    }
    /**
     * マウスボタン番号の定数
     * BUTTON1_MASK: 左ボタン, BUTTON2_MASK: 中央ボタン, BUTTON3_MASK: 右ボタン
     */
    type MOUSE_EVENTS = number;
}
/**
 * IDDraggableSwitch.js
 *
 * @module InputDetect
 * @author natade (https://github.com/natade-jp)
 * @license MIT
 */
/**
 * ドラッグ可能なスイッチ（ボタン）の状態を管理するクラスです。
 * クリックやドラッグ操作の開始・終了・移動を追跡し、イベントごとに内部状態を更新できます。
 */
declare class IDDraggableSwitch {
    /**
     * ドラッグ操作可能なスイッチの状態を管理するクラス
     * @param {number} mask - 対象となるボタン（0:左, 1:中央, 2:右）
     * @constructor
     */
    constructor(mask: number);
    /**
     * 各プロパティを初期化します。
     * @param {number} mask - 対象ボタン番号
     * @private
     */
    private _initIDDraggableSwitch;
    /**
     * このインスタンスが監視するボタン種別（0:左, 1:中央, 2:右）
     * @type {number}
     */
    mask: number;
    /**
     * ボタンの押下状態を管理するIDSwitchインスタンス
     * @type {IDSwitch}
     */
    switch: IDSwitch;
    /**
     * 現在の位置（client座標系）
     * @type {IDPosition}
     */
    client: IDPosition;
    /**
     * ドラッグ開始位置
     * @type {IDPosition}
     */
    deltaBase: IDPosition;
    /**
     * ドラッグ量（始点からの移動量）
     * @type {IDPosition}
     */
    dragged: IDPosition;
    /**
     * このインスタンスの複製を作成します。
     * @returns {IDDraggableSwitch} 複製したIDDraggableSwitchインスタンス
     */
    clone(): IDDraggableSwitch;
    /**
     * DOMイベントの位置情報から、ノードサイズに応じた正規化座標を計算します。
     * 画像やcanvasのスケーリングに対応した正しい座標を返します。
     * @param {MouseEvent|TouchEvent} event - イベントオブジェクト
     * @returns {IDPosition} 計算済みの位置情報
     */
    correctionForDOM(event: MouseEvent | TouchEvent): IDPosition;
    /**
     * 指定イベントの座標位置で、全ての位置情報を強制的にセットします。
     * @param {MouseEvent|TouchEvent} event - イベントオブジェクト
     */
    setPosition(event: MouseEvent | TouchEvent): void;
    /**
     * マウスボタンが押された時の処理。
     * 指定ボタン（mask）が押された時のみ内部状態を更新します。
     * @param {MouseEvent} event - マウスイベント
     */
    mousePressed(event: MouseEvent): void;
    /**
     * マウスボタンが離された時の処理。
     * @param {MouseEvent} event - マウスイベント
     */
    mouseReleased(event: MouseEvent): void;
    /**
     * マウス移動時の処理。
     * ドラッグ中なら移動量（dragged）を加算していきます。
     * @param {MouseEvent} event - マウスイベント
     */
    mouseMoved(event: MouseEvent): void;
    /**
     * フォーカスが外れた場合の状態リセット処理。
     */
    focusLost(): void;
    /**
     * 他のIDDraggableSwitchインスタンスに現在の入力情報をコピーします。
     * ドラッグ量はリセットされます。
     * @param {IDDraggableSwitch} c - 情報を受け取るインスタンス
     * @throws {string} cがIDDraggableSwitchでない場合
     */
    pickInput(c: IDDraggableSwitch): void;
}
/**
 * IDPosition.js
 *
 * @module InputDetect
 * @author natade (https://github.com/natade-jp)
 * @license MIT
 */
/**
 * 位置情報を管理するクラスです。
 * x, y座標の操作や、座標同士の加算・減算、クローン生成などの機能を持ちます。
 */
declare class IDPosition {
    /**
     * 2点間の距離（ノルム）を計算します。
     * @param {IDPosition} p1 - 1点目の座標
     * @param {IDPosition} p2 - 2点目の座標
     * @returns {Number} 2点間のユークリッド距離
     */
    static norm(p1: IDPosition, p2: IDPosition): number;
    /**
     * 位置情報を表すクラス
     * @param {Number|IDPosition} [x] - x座標 または IDPositionインスタンス
     * @param {Number} [y] - y座標
     * @constructor
     */
    constructor(x?: number | IDPosition, y?: number);
    /**
     * x座標
     * @type {number}
     */
    x: number;
    /**
     * y座標
     * @type {number}
     */
    y: number;
    /**
     * 内部的に位置情報を初期化します。
     * @param {Number|IDPosition} [x] - x座標 または IDPositionインスタンス
     * @param {Number} [y] - y座標
     */
    _initIDPosition(x?: number | IDPosition, y?: number, ...args: any[]): void;
    /**
     * このインスタンスのコピーを生成します。
     * @returns {IDPosition} 複製したIDPosition
     */
    clone(): IDPosition;
    /**
     * 座標値を設定します。
     * @param {Number|IDPosition} x - x座標 または IDPositionインスタンス
     * @param {Number} [y] - y座標
     */
    set(x: number | IDPosition, y?: number): void;
    /**
     * 座標値を加算します。
     * @param {Number|IDPosition} x - 加算するx座標 または IDPositionインスタンス
     * @param {Number} [y] - 加算するy座標
     */
    add(x: number | IDPosition, y?: number): void;
    /**
     * 座標値を減算します。
     * @param {Number|IDPosition} x - 減算するx座標 または IDPositionインスタンス
     * @param {Number} [y] - 減算するy座標
     */
    sub(x: number | IDPosition, y?: number): void;
}
/**
 * IDSwitch.js
 *
 * @module InputDetect
 * @author natade (https://github.com/natade-jp)
 * @license MIT
 */
/**
 * スイッチ（ボタン）の押下状態を管理するクラスです。
 * ボタンの押下・離す・押し続け・押した瞬間・離した瞬間など、さまざまなスイッチの状態を判定できます。
 */
declare class IDSwitch {
    /**
     * スイッチの状態を初期化します。
     * @private
     */
    private _initIDSwitch;
    /**
     * 押した瞬間にtrueになります（1フレームのみ）
     * @type {boolean}
     */
    istyped: boolean;
    /**
     * 押している間trueになります（押しっぱなし判定）
     * @type {boolean}
     */
    ispressed: boolean;
    /**
     * 離した瞬間にtrueになります（1フレームのみ）
     * @type {boolean}
     */
    isreleased: boolean;
    /**
     * 押している時間（フレーム数）
     * @type {number}
     */
    pressed_time: number;
    /**
     * このスイッチの状態をコピーした新しいインスタンスを返します。
     * @returns {IDSwitch} 複製したIDSwitchインスタンス
     */
    clone(): IDSwitch;
    /**
     * ボタンが押されたことを記録します。
     * 1フレーム目はistyped、以降はispressedがtrueになります。
     */
    keyPressed(): void;
    /**
     * ボタンが離されたことを記録します。
     * isreleasedがtrueになり、ispressedがfalseになります。
     */
    keyReleased(): void;
    /**
     * フォーカスが外れた場合に状態をリセットします。
     */
    focusLost(): void;
    /**
     * 他のIDSwitchインスタンスへ現在のスイッチ状態を渡します。
     * 1フレームごとに必要な値だけを転送し、istyped/isreleasedはfalse化されます。
     * @param {IDSwitch} c - 情報を受け取るIDSwitchインスタンス
     * @throws {string} - cがIDSwitchのインスタンスでない場合
     */
    pickInput(c: IDSwitch): void;
}
