/*
 *   RedGPU - MIT License
 *   Copyright (c) 2019 ~ By RedCamel( webseon@gmail.com )
 *   issue : https://github.com/redcamel/RedGPU/issues
 *   Last modification time of this file - 2019.12.17 9:48:50
 *
 */
"use strict";
import RedSampler from "./RedSampler.js";
import RedUUID from "../base/RedUUID.js";
import RedImageLoader from "./system/RedImageLoader.js";
import RedCopyBufferToTexture from './system/RedCopyBufferToTexture.js'
import RedBaseTexture from "../base/RedBaseTexture.js";


let defaultSampler;
const MIPMAP_TABLE = new Map();
let makeMipmap = function (redGPUContext, imageDatas, targetTexture) {
	console.log('imageDatas', imageDatas)
	let tW = imageDatas[0].width;
	let tH = imageDatas[0].height;
	const commandEncoder = redGPUContext.device.createCommandEncoder({});
	if (targetTexture.useMipmap) targetTexture.mipMaps = Math.round(Math.log2(Math.max(tW, tH)));
	const textureDescriptor = {
		size: {
			width: tW,
			height: tH,
			depth: 1,
		},
		dimension: '2d',
		format: 'rgba8unorm',
		arrayLayerCount: targetTexture instanceof RedBitmapTexture ? 1 : 6,
		mipLevelCount: targetTexture.useMipmap ? targetTexture.mipMaps + 1 : 1,
		usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.SAMPLED
	};
	// console.log(textureDescriptor)
	const gpuTexture = redGPUContext.device.createTexture(textureDescriptor);
	MIPMAP_TABLE.set(targetTexture.mapKey, gpuTexture)
	// console.log(tW, tH)
	RedCopyBufferToTexture(commandEncoder, redGPUContext.device, imageDatas, gpuTexture, targetTexture).then(
		_ => {
			targetTexture.resolve(gpuTexture)
			if (targetTexture.onload) targetTexture.onload()
			redGPUContext.device.defaultQueue.submit([commandEncoder.finish()]);
		}
	)
}
export default class RedBitmapTexture extends RedBaseTexture {

	//TODO 옵션값이 바뀌면 어떻게 할건지 결정해야함
	constructor(redGPUContext, src, sampler, useMipmap = true, onload, onerror) {
		super()
		if (!defaultSampler) defaultSampler = new RedSampler(redGPUContext);
		this.sampler = sampler || defaultSampler;
		this.src = src
		this.onload = onload
		this.onerror = onerror
		this.mapKey = src + useMipmap;
		this.useMipmap = useMipmap
		if (!src) {
			console.log('src')
		} else {
			let self = this
			new RedImageLoader(redGPUContext, src, function () {
				console.log(MIPMAP_TABLE.get(self.mapKey))
				if (MIPMAP_TABLE.get(self.mapKey)) {
					console.log('캐싱사용')
					self.resolve(MIPMAP_TABLE.get(self.mapKey))
					if (self.onload) self.onload(self)
				} else {
					console.log('신규생성')
					makeMipmap(redGPUContext, this.imageDatas, self)
				}


			}, RedImageLoader.TYPE_2D)

		}
	}




}
