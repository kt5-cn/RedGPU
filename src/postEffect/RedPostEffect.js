/*
 *   RedGPU - MIT License
 *   Copyright (c) 2019 ~ By RedCamel( webseon@gmail.com )
 *   issue : https://github.com/redcamel/RedGPU/issues
 *   Last modification time of this file - 2019.12.13 19:11:47
 *
 */
"use strict";

export default class RedPostEffect {
	#effectList = [];
	constructor(redGPUContext) {

	}
	get effectList() { return this.#effectList}
	addEffect(v) {this.#effectList.push(v)}
}
