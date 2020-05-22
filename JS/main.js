const url = '../pdf.pdf';

let pdfDoc = null,
    pageNum = 1,
    pageIsPending = null,
    pageIsRendering = false;

const scale = 0.85,
    canvas = document.querySelector('#pdf-render'),
    ctx = canvas.getContext('2d');

// Render the page 
const renderPage = (num) => {
    pageIsRendering = true;

    // Get the page
    pdfDoc.getPage(num)
        .then((page) => {

            // Get viewport
            const viewport = page.getViewport({ scale: scale });

            // Set the canvas
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            // Define render context
            const renderCtx = {
                viewport: viewport,
                canvasContext: ctx
            };

            page.render(renderCtx).promise
                .then(() => {

                    pageIsRendering = false;

                    if (pageIsPending !== null) {
                        renderPage(pageIsPending);
                        pageIsPending = null;
                    }
                })
                .catch(err => console.log(err));

            document.querySelector('#curr-page').textContent = pageNum;

        })
        .catch(err => console.log(err));
};

const queueRenderPage = (num) => {
    if (pageIsRendering) {
        pageIsPending = num;
        pageIsRendering = false;
    } else {
        renderPage(num);
    }
};

const showPrevPage = () => {
    if (pageNum <= 1) {
        return;
    } else {
        pageNum--;
        queueRenderPage(pageNum);
    }
};

const showNextPage = () => {
    if (pageNum >= pdfDoc.numPages) {
        return;
    } else {
        pageNum++;
        queueRenderPage(pageNum);
    }
}

pdfjsLib.getDocument(url).promise
    .then((pdfDoc_) => {
        pdfDoc = pdfDoc_;
        document.querySelector('#page-count').textContent = pdfDoc.numPages;
        renderPage(pageNum);
    }).catch((err) => {

        // Display error
        const div = document.createElement('div');
        div.className = "error";
        div.appendChild(document.createTextNode(err.message));

        // Insert before top-bar
        const bdy = document.querySelector('body');
        bdy.insertBefore(div, bdy.firstElementChild);
        
        // Remove top bar
        document.querySelector('.top-bar').style.display = 'none';

        // Remove canvas container
        document.querySelector('.canvas-container').style.display = 'none';

        // To center align
        const ctr2 = document.createElement('center');

        // Display error image
        const img = document.createElement('img');

        ctr2.appendChild(img);
        const src = '../img/undraw_page_not_found.svg';
        img.setAttribute("src",src);
        img.setAttribute("height","250px");
        img.setAttribute("width","250px");
        bdy.appendChild(ctr2);
    });

document.querySelector('#prev-btn').addEventListener('click', showPrevPage);
document.querySelector('#next-btn').addEventListener('click', showNextPage);