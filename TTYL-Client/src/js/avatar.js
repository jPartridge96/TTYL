function getAvatar(success){
  let options = {
    quality: 50,
    sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
    destinationType: Camera.DestinationType.DATA_URL
  }
  function onSuccess(imageData) {
    var image = $("#avatar");
    image.prop('src', "data:image/jpeg;base64," + imageData);

    let byteString = atob(imageData);
    let ab = new ArrayBuffer(byteString.length);
    let ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    let blob = new Blob([ab], { type: 'image/jpeg' });
    success(blob);
  }

  function onFail(err) {
    if(err.message === 'undefined') {
      return;
    }
    alert(err.message);
  }
  navigator.camera.getPicture(onSuccess, onFail, options);
}
