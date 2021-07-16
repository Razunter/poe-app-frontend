import '../css/index.scss';
import LazyLoad from "vanilla-lazyload";
import scrollSpy from 'simple-scrollspy'

function process() {
    new LazyLoad({});

    // NAV
    scrollSpy('.mainnav ul', {
        offset: 100,
        sectionClass: '.section'
    })

    // THUMBS
    let thumbs = document.getElementsByClassName('thumb');
    let i = thumbs.length;
    while (i--) {
        thumbs[i].addEventListener('click', (event) => {
            const url = event.target.getAttribute('data-video');
            if (event.target.classList.contains('YouTubeThumb')) {
                event.target.outerHTML = '<iframe src="https://www.youtube.com/embed/' + url + '?autoplay=1" width="480" height="360" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
            } else if (event.target.classList.contains('twitchclipThumb') || event.target.classList.contains('twitchThumb')) {
                event.target.outerHTML = '<iframe src="https://player.twitch.tv/?video=v' + url + '&parent=raz-poebuilds.netlify.app" allowfullscreen="true" width="480" height="360" frameborder="0"></iframe>';
            }
            // else if (event.target.classList.contains('streamableThumb')) {
            //     event.target.outerHTML = '<iframe src="' + url + '" frameborder="0" width="480" height="360" allowfullscreen frameborder="0"></iframe>';
            // }
        });
    }
}

// in case the document is already rendered
if (document.readyState !== 'loading') {
    process();
}// modern browsers
else {
    document.addEventListener('DOMContentLoaded', process);
}
