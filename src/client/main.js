import "vite/dynamic-import-polyfill";
import "./css/index.css"
const svgs = import.meta.globEager('../img/icons/*.svg')
import 'lazysizes';

function init() {
    //  You should call it at least once so it will not be tree shaked
    svgs


}

init();
