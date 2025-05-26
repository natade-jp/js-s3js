export { InputDetect as default };
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
