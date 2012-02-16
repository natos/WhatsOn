(function(d){
	var elPosterContainer = d.getElementById('imdbPoster');
	if (elPosterContainer && elPosterContainer.getAttribute('data-programmetitle')) {
		ahah('/imdbPoster/' + elPosterContainer.getAttribute('data-programmetitle'), 'imdbPoster');
	}
})(document);