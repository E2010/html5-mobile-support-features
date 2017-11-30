// Check Supported Features
var isGetUserMediaSupported = false;
var isLocalStorageSupported = false;
var isGeoLocationSupported = false;
var isTouchSupported = false;
var isVibrationSupported = false;
var isOrientationSupported = false;
var isAppCacheSupported = false;
var isMeterSupported = false;
var isWebRTCSupported = false;
var isBatterySupported = false;
var isMediaDevicesSupported = false;

var GOOGLE_API_KEY = "AIzaSyBYE5sFTGdc4L3lp9Qe_N2wxtFRl26UKzQ";

window.onload = function() {
  checkSupportedFeature();
  configCamera();
  configLocation();
  configBattery();
  getLocalSavedBlogs();
}

function checkSupportedFeature() {
  var notSupportedMessage = "";

  if (Modernizr.getusermedia) {
    isGetUserMediaSupported = true;
  } else {
    notSupportedMessage = "Get User Media(access to Camera)";
  }

  if (Modernizr.localstorage) {
    isLocalStorageSupported = true;
  } else {
    notSupportedMessage = (notSupportedMessage == "" ? "" : notSupportedMessage + ", ") +
        "Local Storage";
  } 

  if (Modernizr.geolocation) {
    isGeoLocationSupported = true;
  } else {
    notSupportedMessage = (notSupportedMessage == "" ? "" : notSupportedMessage + ", ") +
        "Geo Location";
  }

  if (Modernizr.touchevents) {
    isTouchSupported = true;
  } else {
    notSupportedMessage = (notSupportedMessage == "" ? "" : notSupportedMessage + ", ") +
        "Touch Events (Gestures)";
  }

  if (Modernizr.vibrate) {
    isVibrationSupported = true;
  } else {
    notSupportedMessage = (notSupportedMessage == "" ? "" : notSupportedMessage + ", ") +
        "Vibration";
  }

  if (Modernizr.deviceorientation) {
    isOrientationSupported = true;
  } else {
    notSupportedMessage = (notSupportedMessage == "" ? "" : notSupportedMessage + ", ") +
        "Device Orientation";
  } 

  if (Modernizr.applicationcache) {
    isAppCacheSupported = true;
  } else {
    notSupportedMessage = (notSupportedMessage == "" ? "" : notSupportedMessage + ", ") +
        "Application Cache (Offline Capability)";
  }

  if (Modernizr.meter) {
    isMeterSupported = true;
  } else {
    notSupportedMessage = (notSupportedMessage == "" ? "" : notSupportedMessage + ", ") +
        "Meter";
  }

  if (Modernizr.peerconnection) {
    isWebRTCSupported = true;
  } else {
    notSupportedMessage = (notSupportedMessage == "" ? "" : notSupportedMessage + ", ") +
        "RTC Peer Connection (Camera Stream)";
  }

  //if (Modernizr.batteryapi) {
  if (navigator.getBattery) {
    isBatterySupported = true;
  } else {
    notSupportedMessage = (notSupportedMessage == "" ? "" : notSupportedMessage + ", ") +
        "Battery";
  }

  if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
    isMediaDevicesSupported = true;
  } else {
    notSupportedMessage = (notSupportedMessage == "" ? "" : notSupportedMessage + ", ") +
        "Enumerate Devices";
  }

  if (notSupportedMessage != "") {
    var msgLabel = document.getElementById("invalidFeatureLabel");
    var msgDiv = document.getElementById("invalidFeatureDiv");
    msgLabel.textContent = notSupportedMessage + " are not supported in this browser or device.";
    msgDiv.style.display = "block";
  }
}

// ----------  Camera ----------
var width = 320;    // We will scale the photo width to this
var height = 0; 
var size = 0;
var direction = 0;

var isStreaming = false;  // false: camera is not in preview mode; true: in preview mode
var video = null;
var canvas = null;
var photo = null;
var photobutton = null;
var photobutton2 = null;
var addBlog = null;
var textArea = null;
var imageData = null;
var previewDiv = null;

function configCamera() {
  if (isGetUserMediaSupported === true) {
    video = document.getElementById("video");
    canvas = document.getElementById("canvas");
    photo = document.getElementById("photo");
    photobutton = document.getElementById("photoButton");
    photobutton2 = document.getElementById("photoButton2");
    addBlog = document.getElementById("submit");
    textArea = document.getElementById("text");
    previewDiv = document.getElementById("previewDiv");
  
    selectCamera();

    configOrientation();
  } else {
    // not-supported
  }

}

function selectCamera() {
  var constraints = {video: true, audio: false};
  if (isMediaDevicesSupported === true) {
    var cameras = [];
    navigator.mediaDevices.enumerateDevices()
      .then(function(devices) {
        devices.forEach(function(device) {
          if (device.kind == "videoinput") {
            cameras.push(device.deviceId);
          }
        });

        if (cameras != null && cameras.length > 0) {
          constraints = {video: {deviceId : {exact: cameras[cameras.length - 1]}}, audio: false};          
        }

        startPreview(constraints);
        return;
      })
      .catch(function(err) {
        console.log(err.name + ": " + error.message);
        startPreview(constraints);
        return;
      }
    );
  } else {
    startPreview(constraints);
  }
}

function startPreview(constraints) {
  if (navigator.mediaDevices == null) {
    navigator.mediaDevices = navigator.mediaDevices || navigator.webkitMediaDevices || navigator.mozMediaDevices || navigator.msMediaDevices;
  }

  navigator.mediaDevices.getUserMedia(constraints)
    .then(function(stream){
      video.srcObject = stream;
    })
    .catch(function(error){
      console.log(error);
    });

  video.addEventListener('canplay', function(ev){
    if (!isStreaming) {
      height = video.videoHeight / (video.videoWidth/width);
      video.setAttribute('width', width);
      video.setAttribute('height', height);

      size = Math.max(height, width);
    
      canvas.setAttribute('width', size);
      canvas.setAttribute('height', size);
      previewDiv.style.width = size + "px";
      previewDiv.style.height = size + "px";

      isStreaming = true;
    }
  }, false);

  photobutton.addEventListener('click', function(ev){
    takepicture();
    ev.preventDefault();
  }, false);

  photobutton2.addEventListener('click', function(ev){
    takepicture();
    ev.preventDefault();
  }, false);

  clearPhoto();

}

function clearPhoto() {
  var context = canvas.getContext('2d');
  context.fillStyle = "#AAA";
  context.fillRect(0, 0, size, size);

  var data = canvas.toDataURL('image/png');
  photo.setAttribute('src', data);
}

function takepicture(){
  if (video.style.display !== "none") {
    var halfPoint = size/2;
    var rotation = direction > 45 ? 90 : (direction < -45 ? -90 : 0);
    var ctx = canvas.getContext('2d');
    var factor = 0;
    var sX = 0;
    var sY = 0;

    if (rotation != 0) {
      canvas.height = width;
      canvas.width = height;

      if (height > width) {
        sX = rotation > 0 ? 0 : height - width; 
      } else {
        sY = rotation > 0 ? (width - height) : 0;
      }
    }

    ctx.save();
    ctx.translate(halfPoint, halfPoint);
    ctx.rotate(rotation * Math.PI / 180);
    ctx.translate(-halfPoint, -halfPoint);
    ctx.drawImage(video, sX, sY, video.width, video.height);
    ctx.restore();

    var data = canvas.toDataURL('image/png');
    photo.setAttribute('src', data);
    imageData = data;
    previewMode(false);
  } else {
    previewMode(true);
  }
}

function previewMode(setting){  // false: picture mode; true: preview mode
  if (setting === true) {
    // preview mode
    video.style.display = "block";
    photo.style.display = "none";
    photobutton.textContent = "Take photo";
    photobutton2.textContent = "Take photo";
    imageData = null;
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  } else {
    video.style.display = "none";
    photo.style.display = "block";
    photobutton.textContent = "Re-take";
    photobutton2.textContent = "Re-take";
  }
}

function configOrientation(){
  if (isOrientationSupported) {
    window.addEventListener("deviceorientation", function(event){
      if (event.gamma) {
        var angle = parseInt(event.gamma);
        if (!isNaN(angle)) {
          direction = angle;
        }
      }
    }, true);
  } else {

  }
}

var blogs = [];
var noBlogLabel = null;
var blogDiv = null;

function addNewBlog(){
  var blog;
  var location = locationInput.value == null || locationInput.value == "" ? "Unkonwn" : locationInput.value;
  var battery = batteryLevel >=0 ? batteryLevel : "Unknown";
  blog = {imageData : imageData, text : textArea.value, location: location, battery: battery};
  blogs = blogs || [];
  blogs.push(blog);

  hideNoBlogLabel();

  // Create Row for new Blog
  var rowDiv = createBlogRow(blog, blogs.length - 1);
  blogDiv.appendChild(rowDiv);

  // Save Data to location storage
  saveDataToLocalStorage();

  // clear inputs
  previewMode(true);
  textArea.value = "";
}

function hideNoBlogLabel() {
  if (noBlogLabel == null) {
    noBlogLabel = document.getElementById("noBlog");
  }

  if (noBlogLabel.style.display !== "none") {
    noBlogLabel.style.display = "none";
  }

  if (blogDiv == null) {
    blogDiv = document.getElementById("blogDiv");
  }

}

function createBlogRow(blog, index) {
  // Create row div
  var rowDiv = document.createElement("div");
  rowDiv.setAttribute('class', 'blog-row')

  // Create row Wrapper div
  var rowWrapperDiv = document.createElement("div");
  rowWrapperDiv.setAttribute('class', 'blog-row-wrapper')

  // Create image div
  var imageDiv = document.createElement("div");
  imageDiv.setAttribute('class', 'blog-image-div')

  // Create Image
  var blogImage = document.createElement("img");
  blogImage.setAttribute('class', 'blog-image');
  blogImage.setAttribute('src', (blog.imageData == null ? "default.jpg" : blog.imageData)); 

  // Create blog content div
  var contentDiv = document.createElement("div");
  contentDiv.setAttribute('class', 'blog-content-div')

  // Create Content
  var blogLabel =  document.createElement("label");
  blogLabel.setAttribute('class', 'blog-content');
  blogLabel.textContent = blog.text;

  // Create Location
  var locLabel = document.createElement("label");
  locLabel.textContent = "Location: " + blog.location;

  // Create Battery
  var batteryLabel = document.createElement("label");
  batteryLabel.textContent = "Battery: " + (isNaN(blog.battery) ? "Unknown" : blog.battery * 100 + "%");

  // Create Divider
  var dividerDiv = document.createElement("div");
  dividerDiv.setAttribute('class', 'blog-divider');

  // append elements
  imageDiv.appendChild(blogImage);
  contentDiv.appendChild(blogLabel);
  contentDiv.appendChild(document.createElement("br"));
  contentDiv.appendChild(document.createElement("br"));
  contentDiv.appendChild(locLabel);
  contentDiv.appendChild(document.createElement("br"));
  contentDiv.appendChild(document.createElement("br"));
  contentDiv.appendChild(batteryLabel);
  rowWrapperDiv.appendChild(imageDiv);
  rowWrapperDiv.appendChild(contentDiv);
  rowDiv.appendChild(rowWrapperDiv);
  rowDiv.appendChild(dividerDiv);

  if (isTouchSupported === true) {
    var mc = new Hammer(rowDiv);
    mc.on("panright panend", function(e){
      switch (e.type) {
        case 'panright':
          rowWrapperDiv.style.marginLeft = e.deltaX + "px";
          break;
        case 'panend':
          rowWrapperDiv.style.marginLeft = "150px";
          if (e.deltaX > 150) {
            confirmToDeleteBlog(index, rowDiv);
          }
      }
    });
  }

  return rowDiv;
}

function confirmToDeleteBlog(index, rowElement) {
  vibrateDevice();

  setTimeout(function(){
    var c = confirm("Delete this photo blog?");
    if (c == true) {
      if (blogs != null && blogs.length > index) {
        if (blogs.length == 1 && index == 0) {
          blogs = [];
        } else {
          blogs.splice(index, 1);
        }
        blogDiv.removeChild(rowElement);
        saveDataToLocalStorage();
      }
    } else {
      rowWrapperDiv.style.marginLeft = "0px";
    }
  }, 200);
}


function vibrateDevice() {
  if (isVibrationSupported === true) {
    //if (navigator.vibrate == null) {
      //navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;
    //}
    navigator.vibrate(200);
  }
}

function saveDataToLocalStorage() {
  if (isLocalStorageSupported === true) {
    // save only the last 5 blogs
    if (blogs != null && blogs.length > 0) {
      var saveBlogsAmount = Math.min(blogs.length, 5);
      localStorage.setItem("blogs", JSON.stringify(blogs.slice(-saveBlogsAmount)));
    } else {
      localStorage.setItem("blogs", JSON.stringify([]));
    }
  }
}

function getLocalSavedBlogs() {
  if (isLocalStorageSupported === true) {
    blogs = JSON.parse(localStorage.getItem("blogs"));
    if (blogs != null && blogs.length > 0) {
      hideNoBlogLabel();
      for (var i = 0; i < blogs.length; i++) {
        var rowDiv = createBlogRow(blogs[i], i);
        blogDiv.appendChild(rowDiv);
      }
    }
  }
}

var locationInput = null;

function configLocation() {
  locationInput = document.getElementById("locationInput");

  var locationSwitch = document.getElementById("locationSwitch");
  showLocationInput(locationSwitch.checked);

  locationSwitch.addEventListener('change', function() {
    if (this.checked) {
      if (isGeoLocationSupported === true) {
        locationSwitch.disabled = true;
        showLocationInput(true);
        locationInput.placeholder = "Loading Location...";
        navigator.geolocation.getCurrentPosition (
          function (position) {
            locationSwitch.disabled = false;
            var longitude = position.coords.longitude;
            var latitude = position.coords.latitude;

            showLocationInfo(latitude, longitude);
            locationInput.placeholder = "Input Location";
          },
          function (error) {
            locationSwitch.disabled = false;
            var errorTypes = {
              0: "Unknown error",
              1: "Permission denied by user",
              2: "Position is not available",
              3: "Request timed out"
            };

            var errorMessage = errorTypes[error.code];

            if (error.code == 0 || error.code == 2) {
              errorMessage += (": " + error.message);
            }

            showLocationInput(true, errorMessage);
            locationInput.placeholder = "Input Location";
          }
        );
      } else {
        showLocationInput(true, "Geolocation function is not supported");
      }
    } else {
      showLocationInput(false);
    }
  });
}

var showLocationInput = function(show, info) {
  var inputLocDiv = document.getElementById("inputLocationDiv");
  var label = document.getElementById("locationSupportInfo");
  if (show===true) {
    inputLocDiv.style.display = "block";
    if (info != null) {
      label.textContent = info;
    } else {
      label.textContent = "";
    }
  } else {
    inputLocDiv.style.display = "none";
    var input = document.getElementById("locationInput");
    input.value = "";
    label.textContent = "";
  }
}

var showLocationInfo = function(lat, lng){
  var key = "AIzaSyBYE5sFTGdc4L3lp9Qe_N2wxtFRl26UKzQ";
  var urlStr = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" 
      + lat + "," + lng + "&key=" + key;
  
  var xmlhttp = new XMLHttpRequest();

  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var response = JSON.parse(this.responseText);
      if (response && response.results && response.results.length > 0) {
        var address = response.results[0];
        if (address && address.formatted_address && address.formatted_address != "") {
          locationInput.value = address.formatted_address;
        } else {
          var label = document.getElementById("locationSupportInfo");
          label.textContent = "Cannot get address information";
        }
      }
    }
  }

  xmlhttp.open("GET", urlStr, true);
  xmlhttp.send();
}

var batteryLevel = -1;

function configBattery(){
  if (isBatterySupported === true) {
    navigator.getBattery().then(function(result){
      var batteryLabel = document.getElementById("batteryLabel");
      var batteryMeter = document.getElementById("batteryMeter");
      batteryMeter.value = result.level;
      batteryLabel.textContent = result.level * 100 + "%";
      batteryLevel = result.level;
    });
  } else {
    var div = document.getElementById("batteryDiv");
    div.style.display = "none";
  }
}
