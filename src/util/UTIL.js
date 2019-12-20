/*
 *   RedGPU - MIT License
 *   Copyright (c) 2019 ~ By RedCamel( webseon@gmail.com )
 *   issue : https://github.com/redcamel/RedGPU/issues
 *   Last modification time of this file - 2019.12.20 12:21:28
 *
 */

"use strict";
import UTILColor from './func/UTILColor.js';
import UTILMath from './func/UTILMath.js';

export default {
	throwFunc: function () {
		throw 'Error : ' + Array.prototype.slice.call(arguments).join(' ')
	},
	...UTILColor,
	...UTILMath
}