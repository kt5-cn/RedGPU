/*
 *   RedGPU - MIT License
 *   Copyright (c) 2019 ~ By RedCamel( webseon@gmail.com )
 *   issue : https://github.com/redcamel/RedGPU/issues
 *   Last modification time of this file - 2020.1.2 21:31:8
 *
 */

"use strict";
import BaseMaterial from "../../base/BaseMaterial.js";
import BasePostEffect from "../../base/BasePostEffect.js";
import PostEffect_BlurX from "./PostEffect_BlurX.js";
import PostEffect_BlurY from "./PostEffect_BlurY.js";
import ShareGLSL from "../../base/ShareGLSL.js";

export default class PostEffect_GaussianBlur extends BasePostEffect {

	static vertexShaderGLSL = `
		${ShareGLSL.GLSL_VERSION}
		void main() {}
	`;
	static fragmentShaderGLSL = `
		${ShareGLSL.GLSL_VERSION}
		void main() {}
	`;
	static PROGRAM_OPTION_LIST = {vertex: [], fragment: []};;
	static uniformsBindGroupLayoutDescriptor_material = BasePostEffect.uniformsBindGroupLayoutDescriptor_material;
	static uniformBufferDescriptor_vertex = BaseMaterial.uniformBufferDescriptor_empty;
	static uniformBufferDescriptor_fragment = BaseMaterial.uniformBufferDescriptor_empty;
	#blurX;
	#blurY;
	_radius;
	get radius() {return this._radius;}
	set radius(value) {
		this._radius = value;
		this.#blurX.size = value;
		this.#blurY.size = value;
	}
	constructor(redGPUContext) {
		super(redGPUContext);
		this.#blurX = new PostEffect_BlurX(redGPUContext);
		this.#blurY = new PostEffect_BlurY(redGPUContext);
		this.radius = 5;
	}
	render(redGPUContext, redView, renderScene, sourceTextureView) {
		this.checkSize(redGPUContext, redView);
		this.#blurX.render(redGPUContext, redView, renderScene, sourceTextureView);
		this.#blurY.render(redGPUContext, redView, renderScene, this.#blurX.baseAttachmentView);
		this.baseAttachment = this.#blurY.baseAttachment;
		this.baseAttachmentView = this.#blurY.baseAttachmentView;
	}
}
