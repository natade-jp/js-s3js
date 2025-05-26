import S3Matrix from "../math/S3Matrix.js";
import S3GLArray from "./S3GLArray.js";

/**
 * 頂点単位の属性情報型。
 * 各頂点（3つ）の法線・接線・従法線（いずれもS3Vector型またはnull）の配列。
 *
 * @typedef {Int32Array|Float32Array|WebGLBuffer|WebGLTexture|S3GLArray|S3Matrix|number} S3GLVertexAttribute
 */
