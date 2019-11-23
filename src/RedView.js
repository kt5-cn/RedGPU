"use strict"
import RedUtil from "./util/RedUtil.js"
import RedTypeSize from "./resources/RedTypeSize.js";

export default class RedView {
	#scene;
	#camera;
	#x = 0;
	#y = 0;
	#width = '100%';
	#height = '100%';
	systemUniformInfo;
	projectionMatrix;

	constructor(redGPU, scene, camera) {
		this.camera = camera;
		this.scene = scene;
		this.systemUniformInfo = this.#makeSystemUniformInfo(redGPU.device);
		this.projectionMatrix = mat4.create();
	}

	#makeSystemUniformInfo = function (device) {
		let uniformBufferSize =
			RedTypeSize.mat4 + // projectionMatrix
			RedTypeSize.mat4 + // camera
			RedTypeSize.float + // directional count
			RedTypeSize.float + // directional intensity
			RedTypeSize.float4 +  // directional color
			RedTypeSize.float3  // directional position
		;
		const uniformBufferDescriptor = {
			size: uniformBufferSize,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
			redStruct: [
				{offset: 0, valueName: 'projectionMatrix'}
			]
		};
		const bindGroupLayoutDescriptor = {
			bindings: [
				{
					binding: 0,
					visibility: GPUShaderStage.VERTEX,
					type: "uniform-buffer"
				}
			]
		};
		let uniformBuffer, uniformBindGroupLayout;
		const bindGroupDescriptor = {
			layout: uniformBindGroupLayout = device.createBindGroupLayout(bindGroupLayoutDescriptor),
			bindings: [
				{
					binding: 0,
					resource: {
						buffer: uniformBuffer = device.createBuffer(uniformBufferDescriptor),
						offset: 0,
						size: uniformBufferSize
					}
				}
			]
		};
		let uniformBindGroup = device.createBindGroup(bindGroupDescriptor);
		return {
			GPUBuffer: uniformBuffer,
			GPUBindGroupLayout: uniformBindGroupLayout,
			GPUBindGroup: uniformBindGroup
		}

	};

	updateSystemUniform(passEncoder, redGPU) {
		let systemUniformInfo = this.systemUniformInfo;
		let tView_viewRect = this.getViewRect(redGPU)
		// passEncoder.setViewport(tX, tY, this.canvas.width, this.canvas.height, 0, 1);
		passEncoder.setViewport(...tView_viewRect, 0, 1);
		passEncoder.setScissorRect(...tView_viewRect);
		passEncoder.setBindGroup(0, systemUniformInfo.GPUBindGroup);

		let aspect = Math.abs(tView_viewRect[2] / tView_viewRect[3]);
		mat4.perspective(this.projectionMatrix, (Math.PI / 180) * 60, aspect, 0.01, 10000.0);
		///
		let offset = 0;
		systemUniformInfo.GPUBuffer.setSubData(offset, this.projectionMatrix);
		systemUniformInfo.GPUBuffer.setSubData(offset += RedTypeSize.mat4, this.camera.matrix);
		let count = this.scene.directionalLightList.size;
		let tLight;
		systemUniformInfo.GPUBuffer.setSubData(offset += RedTypeSize.mat4, new Float32Array(count))
		this.scene.directionalLightList.forEach(function (tLight) {
			systemUniformInfo.GPUBuffer.setSubData(offset += RedTypeSize.float, new Float32Array(tLight.intensity))
			systemUniformInfo.GPUBuffer.setSubData(offset += RedTypeSize.float, tLight.colorRGBA)
			systemUniformInfo.GPUBuffer.setSubData(offset += RedTypeSize.float3, new Float32Array([tLight.x, tLight.y, tLight.z]))
		})


	}

	get scene() {
		return this.#scene;
	}

	set scene(value) {
		this.#scene = value;
	}

	get camera() {
		return this.#camera;
	}

	set camera(value) {
		this.#camera = value;
	}

	get y() {
		return this.#y;
	}

	get x() {
		return this.#x;
	}

	get width() {
		return this.#width;
	}

	get height() {
		return this.#height;
	}

	getViewRect(redGPU) {
		return [
			typeof this.x == 'number' ? this.x : parseInt(this.x) / 100 * redGPU.canvas.width,
			typeof this.y == 'number' ? this.y : parseInt(this.y) / 100 * redGPU.canvas.height,
			typeof this.width == 'number' ? this.width : parseInt(this.width) / 100 * redGPU.canvas.width,
			typeof this.height == 'number' ? this.height : parseInt(this.height) / 100 * redGPU.canvas.height
		]
	}

	setSize(width = this.#width, height = this.#height) {
		if (typeof width == 'number') this.#width = width < 0 ? 0 : parseInt(width);
		else {
			if (width.includes('%') && (+width.replace('%', '') >= 0)) this.#width = width;
			else RedUtil.throwFunc('RedView setSize : width는 0이상의 숫자나 %만 허용.', width);
		}
		if (typeof height == 'number') this.#height = height < 0 ? 0 : parseInt(height);
		else {
			if (height.includes('%') && (+height.replace('%', '') >= 0)) this.#height = height;
			else RedUtil.throwFunc('RedView setSize : height는 0이상의 숫자나 %만 허용.', height);
		}
	}

	setLocation(x = this.#x, y = this.#y) {
		if (typeof x == 'number') this.#x = x < 0 ? 0 : parseInt(x);
		else {
			if (x.includes('%') && (+x.replace('%', '') >= 0)) this.#x = x;
			else RedUtil.throwFunc('RedView setLocation : x는 0이상의 숫자나 %만 허용.', x);
		}
		if (typeof y == 'number') this.#y = y < 0 ? 0 : parseInt(y);
		else {
			if (y.includes('%') && (+y.replace('%', '') >= 0)) this.#y = y;
			else RedUtil.throwFunc('RedView setLocation : y는 0이상의 숫자나 %만 허용.', y);
		}
		console.log('setLocation', this.#x, this.#y)
	}

}