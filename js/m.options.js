jQuery(document).ready(function() {
  var thisUrl = new URL(window.location.href);


  if (thisUrl.searchParams.get('showmeshes') == 'true') {
    meshesClick();
  }


});