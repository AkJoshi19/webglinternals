const	videoView = document.querySelector("#main-video");
const _CANVAS = document.querySelector("#video-canvas");
const	context2D = _CANVAS.getContext("2d");

const fileUplaod = document.querySelector("#file-to-upload");

// Upon click this should should trigger click on the #file-to-upload file input element
// This is better than showing the not-good-looking file input element
const uploadButton = document.querySelector("#upload-button");
uploadButton.addEventListener('click', function() {
	fileUplaod.click();
});


// When user chooses a MP4 file
fileUplaod.addEventListener('change', function() {
	// Validate whether MP4
    if(['video/mp4'].indexOf(fileUplaod.files[0].type) == -1) {
        alert('Error : Only MP4 format allowed');
        return;
    }

    // Hide upload button
    uploadButton.style.display = 'none';

	// Object Url as the video source
	document.querySelector("#main-video source").setAttribute('src', URL.createObjectURL(fileUplaod.files[0]));
	
	// Load the video and show it
	videoView.load();
	videoView.style.display = 'inline';
	
	// Load metadata of the video to get video duration and dimensions
	videoView.addEventListener('loadedmetadata', function() { console.log(videoView.duration);
	    var video_duration = videoView.duration,
	    	duration_options_html = '';

	    // Set options in dropdown at 4 second interval
	    for(var i=0; i<Math.floor(video_duration); i=i+4) {
	    	duration_options_html += '<option value="' + i + '">' + i + '</option>';
	    }
	    document.querySelector("#set-video-seconds").innerHTML = duration_options_html;
	    
	    // Show the dropdown container
	    document.querySelector("#thumbnail-container").style.display = 'block';

	    // Set canvas dimensions same as video dimensions
	    _CANVAS.width = videoView.videoWidth;
		_CANVAS.height = videoView.videoHeight;
	});
});

// On changing the duration dropdown, seek the video to that duration
document.querySelector("#set-video-seconds").addEventListener('change', function() {
    videoView.currentTime = document.querySelector("#set-video-seconds").value;
    
    // Seeking might take a few milliseconds, so disable the dropdown and hide download link 
    document.querySelector("#set-video-seconds").disabled = true;
    document.querySelector("#get-thumbnail").style.display = 'none';
});

// Seeking video to the specified duration is complete 
document.querySelector("#main-video").addEventListener('timeupdate', function() {
	// Re-enable the dropdown and show the Download link
	document.querySelector("#set-video-seconds").disabled = false;
    document.querySelector("#get-thumbnail").style.display = 'inline';
});

// On clicking the Download button set the video in the canvas and download the base-64 encoded image data
document.querySelector("#get-thumbnail").addEventListener('click', function() {
  context2D.drawImage(videoView, 0, 0, videoView.videoWidth, videoView.videoHeight);

	document.querySelector("#get-thumbnail").setAttribute('href', _CANVAS.toDataURL());
	document.querySelector("#get-thumbnail").setAttribute('download', 'thumbnail.png');
});