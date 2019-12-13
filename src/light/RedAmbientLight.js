/*
 *   RedGPU - MIT License
 *   Copyright (c) 2019 ~ By RedCamel( webseon@gmail.com )
 *   issue : https://github.com/redcamel/RedGPU/issues
 *   Last modification time of this file - 2019.12.13 19:11:47
 *
 */

"use strict";
import RedBaseLight from "../base/RedBaseLight.js";

export default class RedAmbientLight extends RedBaseLight {
	constructor(color = '#333', alpha = 0.1, intensity = 1) {
		super();
		this.color = color;
		this.alpha = alpha;
		this.intensity = intensity;
	}
}