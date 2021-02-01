let sourceVideo;
let targetCanvas;

async function initCamera() {
    
	var aspect = 576/765;
  const constraints = {
    audio: false,
video: {
			
				width: {
					ideal: 576,
// 					ideal: 200,
					// min: 1024,
					// max: 1920
				},
				height: {
					ideal: 765,
					// min: 776,
					// max: 1080
				},
aspectRatio: { ideal:  aspect},
                              facingMode : 'environment'
		  	}
  };

  // initialize video source
  const video = document.querySelector("#video");
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  video.srcObject = stream;

  return new Promise(resolve => {
    video.onloadedmetadata = () => {
      resolve(video);
    };
  });
};

function initTargetCanvas() {
  // target canvas should overlap source video
  targetCanvas = document.querySelector("#canvas");
  targetCanvas.width = sourceVideo.width;
  targetCanvas.height = sourceVideo.height;
}
