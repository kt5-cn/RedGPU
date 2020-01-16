/*
 *   RedGPU - MIT License
 *   Copyright (c) 2019 ~ By RedCamel( webseon@gmail.com )
 *   issue : https://github.com/redcamel/RedGPU/issues
 *   Last modification time of this file - 2020.1.16 21:13:13
 *
 */

"use strict";
import RedGPUContext from "../../../RedGPUContext.js";
import AccessorInfo_GLTF from "../cls/AccessorInfo_GLTF.js";
let parseAnimationInfo;
parseAnimationInfo = function (redGLTFLoader, json, accessorIndex) {
	let dataList = [];
	let accessorInfo = new AccessorInfo_GLTF(redGLTFLoader, json, accessorIndex);
	let tBYTES_PER_ELEMENT = accessorInfo['componentType_BYTES_PER_ELEMENT'];
	let tBufferURIDataView = accessorInfo['bufferURIDataView'];
	let tGetMethod = accessorInfo['getMethod'];
	let tType = accessorInfo['accessor']['type'];
	let tCount = accessorInfo['accessor']['count'];
	let i = accessorInfo['startIndex'];
	let len;
	switch (tType) {
		case 'SCALAR' :
			len = i + tCount * 1;
			for (i; i < len; i++) dataList.push(tBufferURIDataView[tGetMethod](i * tBYTES_PER_ELEMENT, true));
			break;
		case 'VEC4' :
			len = i + tCount * 4;
			for (i; i < len; i++) dataList.push(tBufferURIDataView[tGetMethod](i * tBYTES_PER_ELEMENT, true));
			break;
		case 'VEC3' :
			len = i + tCount * 3;
			for (i; i < len; i++) dataList.push(tBufferURIDataView[tGetMethod](i * tBYTES_PER_ELEMENT, true));
			break;
		default :
			console.log('알수없는 형식 엑세서 타입', accessorInfo['accessor']);
			break
	}
	return dataList
};
let parseAnimation_GLTF = function (redGLTFLoader, json) {
	if (RedGPUContext.useDebugConsole) console.log('Animation parsing has start.');
	let nodes = json['nodes'];
	let meshes = json['meshes'];
	if (!json['animations']) json['animations'] = [];
	console.log(json['animations'])
	json['animations'].forEach(function (v, index) {
		let samplers = v['samplers'];
		//TODO: 용어를 정리해봐야겠음.
		// 이걸 애니메이션 클립으로 봐야하는가..
		let animationClip = [];
		animationClip['minTime'] = 10000000;
		animationClip['maxTime'] = -1;
		animationClip['name'] = v['name'];
		// 로더에 애니메이션 데이터들을 입력함
		redGLTFLoader['parsingResult']['animations'].push(animationClip);
		// 채널을 돌면서 파악한다.
		v['channels'].forEach(function (channel, channelIndex) {
			let tSampler;
			let tChannelTargetData;
			let tMesh;
			let tNode;
			let aniTrack; //
			let targets = [];
			tSampler = samplers[channel['sampler']];
			tChannelTargetData = channel['target'];
			tNode = nodes[tChannelTargetData['node']];
			if ('mesh' in tNode) {
				tMesh = tNode['Mesh'];
				meshes[tNode['mesh']]['primitives'].forEach(function (v) {
					targets.push(v['Mesh']);
				})
			} else {
				let tGroup;
				//TODO: 이거 개선해야함
				// console.log('여기로 오는경우가 있는건가')
				if (redGLTFLoader['parsingResult']['groups'][tChannelTargetData['node']]) {
					tGroup = redGLTFLoader['parsingResult']['groups'][tChannelTargetData['node']];
					// console.log('tGroup', tGroup)
					tMesh = tGroup;
				} else {
					console.log('여기로 오는경우가 있는건가2');
					return
				}
			}
			if (
				tChannelTargetData['path'] == 'scale'
				|| tChannelTargetData['path'] == 'rotation'
				|| tChannelTargetData['path'] == 'translation'
				|| tChannelTargetData['path'] == 'weights'
			) {
				// console.log('path', tChannelTargetData['path'])
				// // 시간축은 샘플의 input
				// console.log('시간축', tSampler['input'])
				// console.log('시간엑세서 데이터', tSampler['input'])
				// console.log('시간축 데이터리스트', animationData['time'])
				// // 로테이션 축은 샘플의 output
				// console.log('translation', tSampler['output'])
				// console.log('translation 엑세서 데이터', tSampler['output'])
				// console.log('scale 데이터리스트', t0)
				animationClip.push(aniTrack = {
						key: tChannelTargetData['path'],
						time: parseAnimationInfo(redGLTFLoader, json, tSampler['input']),
						data: parseAnimationInfo(redGLTFLoader, json, tSampler['output']),
						interpolation: tSampler['interpolation'],
						target: tMesh,
						targets: targets
					}
				)
			} else {
				console.log('파싱할수없는 데이터', tChannelTargetData['path'])
			}
			if (aniTrack) {
				if (animationClip['minTime'] > aniTrack['time'][0]) animationClip['minTime'] = aniTrack['time'][0];
				if (animationClip['maxTime'] < aniTrack['time'][aniTrack['time'].length - 1]) animationClip['maxTime'] = aniTrack['time'][aniTrack['time'].length - 1]
			}
		});
		console.log('animationClip', animationClip)
	});
	if (redGLTFLoader['parsingResult']['animations'].length) {
		redGLTFLoader['parsingResult']['animations'].forEach(function (v) {
			redGLTFLoader.playAnimation(v)
		})
	}
	if (RedGPUContext.useDebugConsole) console.log('Animation parsing has ended.');
};
export default parseAnimation_GLTF;