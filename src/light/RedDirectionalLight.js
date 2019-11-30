/*
 *   RedGPU - MIT License
 *   Copyright (c) 2019 ~ By RedCamel( webseon@gmail.com )
 *   issue : https://github.com/redcamel/RedGPU/issues
 *   Last modification time of this file - 2019.11.30 16:32:22
 *
 */

"use strict";
import RedBaseLight from "../base/RedBaseLight.js";

export default class RedDirectionalLight extends RedBaseLight {
	constructor(color = '#ffffff', alpha = 1, intensity = 1) {
		super();
		this.color = color;
		this.alpha = alpha;
		this.intensity = intensity;
	}
}