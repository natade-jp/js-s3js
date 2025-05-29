// ========================================================================
// フラグメント（ピクセル）シェーダ
// このシェーダは、各ピクセル（画面上の1点）ごとに実行されます。
// ライティング、テクスチャ、マテリアル、ノーマルマップなどの情報を使って
// 最終的な色（gl_FragColor）を決定します。
// ========================================================================

// ---------- 精度の指定（必須：ESのGLSL） ------------------------------
precision mediump float;

// ---------- 材質（マテリアル）関連のuniform変数 -------------------------
// JavaScript側から各マテリアルごとにセットされる（最大4つまで）

#define MATERIALS_MAX 4

uniform vec4 materialsColorAndDiffuse[MATERIALS_MAX];
//  [R, G, B, 拡散率]（カラー＋ディフューズ）

uniform vec4 materialsSpecularAndPower[MATERIALS_MAX];
//  [R, G, B, 光沢度]（スペキュラ＋パワー）

uniform vec3 materialsEmission[MATERIALS_MAX];
//  発光色（エミッシブ）

uniform vec4 materialsAmbientAndReflect[MATERIALS_MAX];
//  [R, G, B, 反射率]（アンビエント＋リフレクト）

uniform vec2 materialsTextureExist[MATERIALS_MAX];
//  [カラーテクスチャの有無, ノーマルテクスチャの有無]（1:あり, 0:なし）

uniform sampler2D materialsTextureColor[MATERIALS_MAX];
//  カラーテクスチャ（画像）

uniform sampler2D materialsTextureNormal[MATERIALS_MAX];
//  ノーマルマップ（法線マップ用画像）

// ---------- 変換行列のuniform（主に法線変換で使う） ----------------------
uniform mat4 matrixWorldToLocal4; // ワールド→ローカル変換（逆行列など）
uniform mat3 matrixLocalToWorld3; // ローカル→ワールド変換（回転のみ3x3行列）

// ---------- ライト（光源）情報のuniform ---------------------------------

#define LIGHTS_MAX 4
#define LIGHT_MODE_NONE		0
#define LIGHT_MODE_AMBIENT	 1
#define LIGHT_MODE_DIRECTIONAL 2
#define LIGHT_MODE_POINT	   3

uniform int lightsLength;				 // 実際に使う光源の数
uniform vec4 lightsData1[LIGHTS_MAX];	 // 光源の種類・レンジ・方向/位置(XY)
uniform vec4 lightsData2[LIGHTS_MAX];	 // 方向/位置(Z), 光源色(RGB)

// ---------- カメラ情報（視線ベクトル） ---------------------------------
uniform vec3 eyeWorldDirection;

// ---------- 頂点シェーダから渡された補間値 ------------------------------
varying float interpolationMaterialFloat;	// マテリアル番号（float型）
varying vec3 interpolationNormal;		   // 法線ベクトル
varying vec3 interpolationBinormal;		 // バイノーマル
varying vec3 interpolationTangent;		  // タンジェント
varying vec3 interpolationPosition;		 // ワールド空間での頂点位置
varying vec2 interpolationTextureCoord;	 // テクスチャUV座標

// ========================================================================
// メイン処理開始
// ========================================================================
void main(void) {

	// ----- 定数定義（色やノーマルの基準値） ----------------------------
	const vec4 ZERO	  = vec4(0.0, 0.0, 0.0, 0.0);
	const vec4 ONE	   = vec4(1.0, 1.0, 1.0, 1.0);
	const vec4 WHITE	 = ONE;
	const vec3 NORMALTOP = vec3(0.5, 0.5, 1.0); // 法線マップのデフォルト

	// ----- 1. 頂点シェーダから受け取った値の初期処理 ------------------

	int   vertexMaterial = int(interpolationMaterialFloat); // マテリアル番号をintに変換
	vec3  vertexNormal   = normalize(interpolationNormal);
	vec3  vertexBinormal = normalize(interpolationBinormal);
	vec3  vertexTangent  = normalize(interpolationTangent);

	// ----- 2. 面ごとのマテリアル情報（配列から抽出） ------------------

	// 各種マテリアル属性値（色、反射率、テクスチャ有無など）を取得
	vec3  materialColor;
	float materialDiffuse;
	vec3  materialSpecular;
	float materialPower;
	vec3  materialEmission;
	vec3  materialAmbient;
	float materialReflect;
	float materialRoughness;
	vec4  materialTextureColor;
	vec3  materialTextureNormal;
	bool  materialIsSetNormal;

	{
		// 材質配列（最大4つ）から該当インデックスを選択
		if (vertexMaterial < 4) {
			// 材質番号ごとに各種パラメータを取り出す
			// 下記のような分岐は、配列に対してインデックスでアクセスしやすくするため
			if(vertexMaterial < 2) {
				if(vertexMaterial == 0) {
					materialColor		 = materialsColorAndDiffuse[0].xyz;
					materialDiffuse	   = materialsColorAndDiffuse[0].z;
					materialSpecular	  = materialsSpecularAndPower[0].xyz;
					materialPower		 = materialsSpecularAndPower[0].w;
					materialEmission	  = materialsEmission[0];
					materialAmbient	   = materialsAmbientAndReflect[0].xyz;
					materialReflect	   = materialsAmbientAndReflect[0].w;
					materialTextureColor  = materialsTextureExist[0].x > 0.5 ?
						texture2D(materialsTextureColor[0], interpolationTextureCoord) : WHITE;
					materialIsSetNormal   = materialsTextureExist[0].y > 0.5;
					materialTextureNormal = materialIsSetNormal ?
						texture2D(materialsTextureNormal[0], interpolationTextureCoord).xyz : NORMALTOP;
				}
				else {
					// 1番のマテリアル
					materialColor		 = materialsColorAndDiffuse[1].xyz;
					materialDiffuse	   = materialsColorAndDiffuse[1].z;
					materialSpecular	  = materialsSpecularAndPower[1].xyz;
					materialPower		 = materialsSpecularAndPower[1].w;
					materialEmission	  = materialsEmission[1];
					materialAmbient	   = materialsAmbientAndReflect[1].xyz;
					materialReflect	   = materialsAmbientAndReflect[1].w;
					materialTextureColor  = materialsTextureExist[1].x > 0.5 ?
						texture2D(materialsTextureColor[1], interpolationTextureCoord) : WHITE;
					materialIsSetNormal   = materialsTextureExist[1].y > 0.5;
					materialTextureNormal = materialIsSetNormal ?
						texture2D(materialsTextureNormal[1], interpolationTextureCoord).xyz : NORMALTOP;
				}
			}
			else {
				if(vertexMaterial == 2) {
					// 2番のマテリアル
					materialColor		 = materialsColorAndDiffuse[2].xyz;
					materialDiffuse	   = materialsColorAndDiffuse[2].z;
					materialSpecular	  = materialsSpecularAndPower[2].xyz;
					materialPower		 = materialsSpecularAndPower[2].w;
					materialEmission	  = materialsEmission[2];
					materialAmbient	   = materialsAmbientAndReflect[2].xyz;
					materialReflect	   = materialsAmbientAndReflect[2].w;
					materialTextureColor  = materialsTextureExist[2].x > 0.5 ?
						texture2D(materialsTextureColor[2], interpolationTextureCoord) : WHITE;
					materialIsSetNormal   = materialsTextureExist[2].y > 0.5;
					materialTextureNormal = materialIsSetNormal ?
						texture2D(materialsTextureNormal[2], interpolationTextureCoord).xyz : NORMALTOP;
				}
				else {
					// 3番のマテリアル
					materialColor		 = materialsColorAndDiffuse[3].xyz;
					materialDiffuse	   = materialsColorAndDiffuse[3].z;
					materialSpecular	  = materialsSpecularAndPower[3].xyz;
					materialPower		 = materialsSpecularAndPower[3].w;
					materialEmission	  = materialsEmission[3];
					materialAmbient	   = materialsAmbientAndReflect[3].xyz;
					materialReflect	   = materialsAmbientAndReflect[3].w;
					materialTextureColor  = materialsTextureExist[3].x > 0.5 ?
						texture2D(materialsTextureColor[3], interpolationTextureCoord) : WHITE;
					materialIsSetNormal   = materialsTextureExist[3].y > 0.5;
					materialTextureNormal = materialIsSetNormal ?
						texture2D(materialsTextureNormal[3], interpolationTextureCoord).xyz : NORMALTOP;
				}
			}
		}
		// ラフネス（ざらざら感）は光沢度から計算
		// ラフネス値(0...1)を暫定計算(大きいほどざらざらしている)
		materialRoughness = (100.0 - materialPower) * 0.01;
	}

	// ----- 3. テクスチャ反映・ノーマルマッピング ------------------------
	{
		// カラーテクスチャで色を掛ける
		materialColor *= materialTextureColor.xyz;

		// ノーマルマップ（法線テクスチャ）を使う場合
		if(materialIsSetNormal) {
			// [0,1] -> [-1,1]の範囲へ変換
			materialTextureNormal = (materialTextureNormal * 2.0 - 1.0);
			// 接線空間からワールド空間に変換
			vertexNormal = normalize(
				-materialTextureNormal.x * vertexTangent +
				materialTextureNormal.y * vertexBinormal +
				materialTextureNormal.z * vertexNormal);
		}
	}

	// ----- 4. 反射ベクトルや視線方向の計算 ------------------------------
	
	// 反射ベクトル
	vec3 vertexReflectVector = reflect(eyeWorldDirection, normalize(matrixLocalToWorld3 * vertexNormal));

	// カメラが向いている方向を取得
	vec3 eyeDirection = normalize(matrixWorldToLocal4 * vec4(eyeWorldDirection, 0.0)).xyz;

	// ----- 5. 出力色の初期化 --------------------------------------------
	vec3 destDiffuse  = materialColor * materialEmission;
	vec3 destSpecular = ZERO.xyz;
	vec3 destAmbient  = materialAmbient * 0.2;

	// 光源全体の平均色（反射表現などに使う）
	vec3 averageLightsColor = ZERO.xyz;

	// ----- 6. ライティング計算 ------------------------------------------
	{
		// 全ライトについて計算
		for(int i = 0; i < LIGHTS_MAX; i++) {
			int   lightMode   = int(lightsData1[i].x);
			float lightRange  = lightsData1[i].y;
			vec3  lightVector = vec3(lightsData1[i].zw, lightsData2[i].x);
			vec3  lightColor  = lightsData2[i].yzw;

			// 平行光源・点光源
			if((lightMode == LIGHT_MODE_DIRECTIONAL) || (lightMode == LIGHT_MODE_POINT)) {
				bool is_direction = lightMode == LIGHT_MODE_DIRECTIONAL;
				// 光源の向きや位置を求める
				// 光源の種類によって、ピクセルと光への方向ベクトルの計算を変える
				// lightsVector は、点光源なら位置を、平行光源なら方向を指す値
				vec3 lightDirection = is_direction ?
					normalize(matrixWorldToLocal4 * vec4(lightVector, 0.0)).xyz :
					normalize(matrixWorldToLocal4 * vec4(interpolationPosition - lightVector, 1.0)).xyz;
				float d = is_direction ? -1.0 : length(lightVector - interpolationPosition);

				if(d < lightRange) {
					// 距離減衰
					float rate = is_direction ? 1.0 : pow(1.0 - (d / lightRange), 0.5);
					// 拡散反射（ランバート反射）
					float diffuse = clamp(((dot(vertexNormal, lightDirection) * 0.9) + 0.1) * materialDiffuse, 0.0, 1.0);
					destDiffuse  += lightColor * materialColor.xyz * diffuse * rate;
					// 鏡面反射（ブリン・フォン）
					vec3  halfLightEye = normalize(lightDirection + eyeDirection);
					float specular	 = pow(clamp(dot(vertexNormal, halfLightEye), 0.0, 1.0), materialPower);
					destSpecular	  += lightColor * materialSpecular.xyz * specular * rate;
				}
			}
			// アンビエントライト（環境光）
			else if(lightMode == LIGHT_MODE_AMBIENT) {
				destDiffuse += lightColor * materialColor.xyz;
				destAmbient += lightColor * materialAmbient.xyz;
			}

			// 光の平均色（反射・環境エフェクト用）
			averageLightsColor += lightColor;

			// 実際に使う光源数分だけループ
			if(i == lightsLength) {
				break;
			}
		}
		// 平均色を正規化
		if(0 < lightsLength) {
			averageLightsColor /= vec3(lightsLength, lightsLength, lightsLength);
		}
	}

	// ----- 7. 反射表現（リフレクションの模様作成）-----------------------
	vec3 destColor = ZERO.xyz;

	{
		// アンビエント光
		destColor += destAmbient;

		// 拡散反射（反射率が高いほど弱くする）
		destColor += clamp(destDiffuse * (1.0 - materialReflect * 0.8), 0.0, 1.0);

		// 鏡面反射
		destColor += destSpecular;

		// 反射のエフェクト（物体に周囲の色が写り込む）
		if(materialReflect > 0.0001) {
			// リフレクト用の簡易ノイズ模様を計算（ラフネスで模様のボケ方を制御）
			float x = vertexReflectVector.y;
			float x1 = mix(-0.1, -0.5, materialRoughness);
			float x2 = mix(0.01,  0.5, materialRoughness);
			float c1 = mix(-0.3,  0.5, materialRoughness);
			float c2 = mix( 0.9,  0.6, materialRoughness);
			float c3 = mix( 0.3,  0.4, materialRoughness);
			float c4 = mix( 1.2,  0.8, materialRoughness);
			float c5 = mix( 0.3,  0.5, materialRoughness);

			x = x < x1 ? mix( c1, c2, (x + 1.0) * (1.0 / (1.0 + x1))) :
				x < 0.0 ? mix( c2, c3, (x - x1) * (1.0 / -x1)) :
				x < x2  ? mix( c3, c4, x * (1.0 / x2)) :
						  mix( c4, c5, (x - x2) * (1.0 / (1.0 - x2))) ;

			// 光沢・ラフネスの影響も反映した色模様
			//  リフレクトが大きいほどはっきり強くうつりこむ
			//  映り込む模様は、周りの光の色に影響する
			vec3 reflectColor = vec3(x, x, x) * materialReflect * averageLightsColor;

			// 映り込む模様の色
			//  ラフネスが大きいほど、物体の色で映り込む
			//  ラフネスが小さいほど、スペキュラの色で映り込む
			reflectColor *= materialRoughness * materialColor + (1.0 - materialRoughness) * materialSpecular;

			destColor += reflectColor;
		}
	}

	// ----- 8. 出力（ピクセル色の最終決定）-------------------------------
	gl_FragColor = vec4(destColor, 1.0);
}