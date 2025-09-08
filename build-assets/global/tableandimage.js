let wPath = '';
function searchableTable() {
    var tables = document.getElementsByTagName("table");
    for (i = 0; i < tables.length; i++) {
        var tblClass = tables[i].getAttribute("class");
        if (tables[i].getAttribute("class") != null &&
            tables[i].getAttribute("class") != undefined
            && tblClass.indexOf('searchtable') > -1) {
            //find the row to start with
            var tr = tables[i].getElementsByTagName("tr");
            var dataRowIndx = 1;
            for (k = 1; k < tr.length; k++) {
                if (tr[k].getElementsByTagName("th").length == 0) {
                    dataRowIndx = k;
                    break;
                }
            }
            //set unique table id
            tables[i].setAttribute("id", "tbl" + i);
            //create a row with search inputs
            var srRow = document.createElement("TR");
            var td = tr[dataRowIndx].getElementsByTagName("td");
            for (j = 0; j < td.length; j++) {
                var srtd = document.createElement("TD");
                var inpt = document.createElement("INPUT");
                inpt.setAttribute("type", "text");
                inpt.setAttribute("id", "inptbl" + i + '-' + j);
                inpt.setAttribute("placeholder", "Filter");
                inpt.classList.add("srinput");
                //Add the event function
                inpt.addEventListener("keyup", function () {
                    var tblid = this.id.split('-')[0].replace('inp', '');
                    table = document.getElementById(tblid);
                    var tr = table.getElementsByTagName("tr");
                    var indx = -1;
                    for (k = 1; k < tr.length; k++) {
                        tr[k].style.display = "";
                        if (tr[k].getElementsByTagName("th").length == 0 && indx == -1) {
                            indx = k + 1;
                        }
                    }
                    for (k = indx; k < tr.length; k++) {
                        var td = tr[k].getElementsByTagName("td");
                        for (l = 0; l < td.length; l++) {
                            if (td[l] && tr[k].style.display === "") {
                                txtValue = td[l].textContent || td[l].innerText;
                                var filter = document.getElementById(this.id.split('-')[0] + '-' + l).value.trim();
                                if (filter.length > 0 && txtValue.toUpperCase().indexOf(filter.toUpperCase()) == -1)
                                    tr[k].style.display = "none";
                            }
                        }
                    }
                });
                srtd.appendChild(inpt);
                srRow.appendChild(srtd);
            }
            tables[i].getElementsByTagName("tr")[dataRowIndx].parentNode.insertBefore(srRow, tables[i].getElementsByTagName("tr")[dataRowIndx]);
        }
    }
}
function sortTable(n) {
    var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    table = document.getElementsByClassName("sortable")[0];
    switching = true;
    //Set the sorting direction to ascending:
    dir = "asc";
    /*Make a loop that will continue until
    no switching has been done:*/
    while (switching) {
        //start by saying: no switching is done:
        switching = false;
        rows = table.rows;
        /*Loop through all table rows (except the
        first, which contains table headers):*/
        for (i = 1; i < (rows.length - 1); i++) {
            //start by saying there should be no switching:
            shouldSwitch = false;
            /*Get the two elements you want to compare,
            one from current row and one from the next:*/
            x = rows[i].getElementsByTagName("TD")[n];
            y = rows[i + 1].getElementsByTagName("TD")[n];
            /*check if the two rows should switch place,
            based on the direction, asc or desc:*/
            if (dir == "asc") {
                if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                    //if so, mark as a switch and break the loop:
                    shouldSwitch = true;
                    break;
                }
            } else if (dir == "desc") {
                if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                    //if so, mark as a switch and break the loop:
                    shouldSwitch = true;
                    break;
                }
            }
        }
        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
            //Each time a switch is done, increase this count by 1:
            switchcount++;
        } else {
            /*If no switching has been done AND the direction is "asc",
            set the direction to "desc" and run the while loop again.*/
            if (switchcount == 0 && dir == "asc") {
                dir = "desc";
                switching = true;
            }
        }
    }
}

let currentZoom = 1;
const ZOOM_STEP = 0.25;
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 3;
let originalBodyOverflow = '';
let currentImage = '';
let currentTable = '';

function loadingImage(parent) {
    if (!parent) return;
    var img = parent.getElementsByTagName('img');
    if (!img) return;
    if (img && img[0].getAttribute('data-zoom') && img[0].getAttribute('data-zoom') == 'false' && !img[0].classList.contains('dynamicgif')) return;
    if (img && img[0].classList.contains('dynamicgif')) {
        if (img[0].getAttribute('data-original-src')) {
            img[0].src = img[0].getAttribute('data-original-src');
        }
    }

    currentImage = img[0];

    var modal = document.getElementById('modalFullImage');
    var modalImg = document.getElementById("modalImage");
    var imgs = parent.getElementsByTagName('img');
    if (imgs.length == 0) return;
    var img = imgs[0];

    // Store original body overflow
    originalBodyOverflow = document.body.style.overflow;

    // Reset zoom level
    currentZoom = 1;
    updateZoomUI();

    // Show modal with fade effect
    modal.style.display = "block";
    setTimeout(() => modal.classList.add('show'), 10);
    document.body.style.overflow = "hidden";

    modalImg.src = img.src;

    // Apply original image dimensions if they exist
    applyOriginalImageDimensions(modalImg, currentImage);

    // Extract and display caption
    extractAndDisplayImageCaption(img, parent);

    // Update image size info
    updateImageInfo(img);

    // Event listeners
    document.getElementById('closeImage').onclick = closeImageModal;
    document.getElementById('zoomIn').onclick = () => zoomImage(ZOOM_STEP);
    document.getElementById('zoomOut').onclick = () => zoomImage(-ZOOM_STEP);
    document.getElementById('resetZoom').onclick = resetZoom;

    // Add keyboard shortcuts
    document.addEventListener('keydown', handleImageKeyboard);
}

function closeImageModal() {
    // check if img has class dynamicgif
    if (currentImage && currentImage.classList.contains('dynamicgif')) {
        if (currentImage.getAttribute('data-paused-src')) {
            currentImage.src = currentImage.getAttribute('data-paused-src');
        }
    }

    var modal = document.getElementById('modalFullImage');
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = "none";
        // Restore original body overflow
        document.body.style.overflow = originalBodyOverflow;
        // Reset zoom when closing
        resetZoom();
        // Clear caption
        const captionElement = document.getElementById('imageCaption');
        if (captionElement) {
            captionElement.textContent = '';
            captionElement.classList.remove('show');
        }
        // Remove has-caption class from content wrapper
        const contentWrapper = document.querySelector('.modal-content-wrapper');
        if (contentWrapper) {
            contentWrapper.classList.remove('has-caption');
        }
        currentImage = '';
    }, 300);
    document.removeEventListener('keydown', handleImageKeyboard);
}

function handleImageKeyboard(e) {
    if (e.key === 'Escape') {
        closeImageModal();
    } else if (e.key === '+' || e.key === '=') {
        zoomImage(ZOOM_STEP);
    } else if (e.key === '-') {
        zoomImage(-ZOOM_STEP);
    } else if (e.key === '0') {
        resetZoom();
    }
}

function zoomImage(delta) {
    const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, currentZoom + delta));
    if (newZoom !== currentZoom) {
        currentZoom = newZoom;
        document.getElementById('modalImage').style.transform = `scale(${currentZoom})`;
        updateZoomUI();
    }
}

function resetZoom() {
    currentZoom = 1;
    const modalImg = document.getElementById('modalImage');
    modalImg.style.transform = 'scale(1)';

    // Re-apply original dimensions if they exist
    if (currentImage) {
        applyOriginalImageDimensions(modalImg, currentImage);
    }

    updateZoomUI();
}

function updateZoomUI() {
    const zoomPercent = Math.round(currentZoom * 100);
    document.getElementById('imageZoom').textContent = `${zoomPercent}%`;
}

function applyOriginalImageDimensions(modalImg, originalImg) {
    let originalWidth = '';
    let originalHeight = '';
    if (originalImg.getAttribute('width')) {
        originalWidth = originalImg.getAttribute('width') + 'px';
    } else if (originalImg.style.width) {
        originalWidth = originalImg.style.width;
    }

    if (originalImg.getAttribute('height')) {
        originalHeight = originalImg.getAttribute('height') + 'px';
    } else if (originalImg.style.height) {
        originalHeight = originalImg.style.height;
    }

    if (originalWidth || originalHeight) {
        // Apply the original dimensions to modal image
        if (originalWidth) {
            modalImg.style.width = originalWidth;
        }
        if (originalHeight) {
            modalImg.style.height = originalHeight;
        }
        modalImg.style.maxWidth = 'none';
        modalImg.style.maxHeight = 'none';
        modalImg.style.objectFit = 'contain';
    } else {
        // Use default responsive behavior
        modalImg.style.width = '';
        modalImg.style.height = '';
        modalImg.style.maxWidth = '100%';
        modalImg.style.maxHeight = 'calc(100vh - 64px)';
        modalImg.style.objectFit = 'contain';
    }
}

function updateImageInfo(img) {
    // Wait for image to load to get actual dimensions
    const updateDimensions = () => {
        const dimensions = `${img.naturalWidth} × ${img.naturalHeight}px`;
        // document.getElementById('imageSize').textContent = dimensions;
    };

    if (img.complete) {
        updateDimensions();
    } else {
        img.onload = updateDimensions;
    }
}

function extractAndDisplayImageCaption(img, parent) {
    const captionElement = document.getElementById('imageCaption');
    if (!captionElement) return;

    let captionText = '';

    // Try to find caption in various sources
    // 1. Check for alt text
    if (img.alt && img.alt.trim()) {
        captionText = img.alt.trim();
    }
    // 2. Check for title attribute
    else if (img.title && img.title.trim()) {
        captionText = img.title.trim();
    }
    // 3. Look for nearby caption elements (figcaption, .caption, etc.)
    else {
        // Check if image is inside a figure element with figcaption
        const figure = img.closest('figure');
        if (figure) {
            const figcaption = figure.querySelector('figcaption');
            if (figcaption && figcaption.textContent.trim()) {
                captionText = figcaption.textContent.trim();
            }
        }

        // If no figcaption, look for nearby caption elements
        if (!captionText) {
            const parentElement = parent || img.parentElement;
            if (parentElement) {
                // Look for caption in the same container
                const caption = parentElement.querySelector('.caption, .image-caption, [class*="caption"]');
                if (caption && caption.textContent.trim()) {
                    captionText = caption.textContent.trim();
                }

                // Look for caption in next sibling
                if (!captionText && parentElement.nextElementSibling) {
                    const nextSibling = parentElement.nextElementSibling;
                    if (nextSibling.classList.contains('caption') ||
                        nextSibling.classList.contains('image-caption') ||
                        nextSibling.tagName === 'FIGCAPTION') {
                        captionText = nextSibling.textContent.trim();
                    }
                }
            }
        }
    }

    // Display caption if found
    if (captionText) {
        captionElement.textContent = captionText;
        captionElement.classList.add('show');
        // Add has-caption class to content wrapper
        const contentWrapper = document.querySelector('.modal-content-wrapper');
        if (contentWrapper) {
            contentWrapper.classList.add('has-caption');
        }
    } else {
        captionElement.classList.remove('show');
        // Remove has-caption class from content wrapper
        const contentWrapper = document.querySelector('.modal-content-wrapper');
        if (contentWrapper) {
            contentWrapper.classList.remove('has-caption');
        }
    }
}

function loadingTable(parent) {
    if (!parent) return;
    currentTable = parent;
    currentTable.style.tableLayout = 'fixed';

    var modal = document.getElementById("modalFullTable");
    var captionText = document.getElementById("tablescr");

    // Store original body overflow
    originalBodyOverflow = document.body.style.overflow;

    // Show modal with fade effect
    modal.style.display = "block";
    setTimeout(() => modal.classList.add('show'), 10);
    document.body.style.overflow = "hidden";

    // Clone and append table
    var cln = parent.cloneNode(true);
    captionText.innerHTML = '';
    captionText.appendChild(cln);

    // Event listeners
    document.getElementById('closeTable').onclick = closeTableModal;
    document.addEventListener('keydown', handleTableKeyboard);
}

function closeTableModal() {
    currentTable.style.tableLayout = 'auto';
    currentTable = '';
    var modal = document.getElementById("modalFullTable");
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = "none";
        // Restore original body overflow
        document.body.style.overflow = originalBodyOverflow;
        // Clear table content
        document.getElementById("tablescr").innerHTML = "";
    }, 300);
    document.removeEventListener('keydown', handleTableKeyboard);
}

function handleTableKeyboard(e) {
    if (e.key === 'Escape') {
        closeTableModal();
    }
}

function loadingTableButton(parent) {
    if (parent.nextElementSibling.tagName == 'TABLE') {
        loadingTable(parent.nextElementSibling);
    }
}
function loadCopyButton(parent) {
    parent.innerHTML = '<a class="buttonfullscr" style="margin-top: 2%;"><button style="width: 100%;" data-clipboard-target="#copypre" class="flscrbtn"><div style="width: 100%;"><div id="codelang" class="metricmed f16" style="width:88%;"></div><div style="width: 12%;margin-left: auto;display: flex;justify-content: center;border-left: 2px solid #dcdedf;background-color: #1aac60;color: #fff;"><i class="ux-icon ux-icon-checkmark" style="padding: 4% 0;font-size: 12px;"></i><div style="margin: auto 5px;">Copied</div></div></div></button></a>';
    copyFunction(parent.nextElementSibling);
    setTimeout(() => {
        parent.innerHTML = '<a class="buttonfullscr" onClick="javascript:loadCopyButton(this);" style="margin-top: 2%;"><button style="width: 100%;" data-clipboard-target="#copypre" class="flscrbtn"><div style="width: 100%;"><div id="codelang" class="metricmed f16" style="width:88%;"></div><div style="width: 12%;margin-left: auto;display: flex;justify-content: center;border-left: 2px solid #dcdedf;"><i class="ux-icon ux-icon-clipboard" style="padding: 4% 0;font-size: 12px;"></i><div style="margin: auto 5px;">Copy</div></div></div></button></a>';
    }, 1500);
}
function copyFunction(parent) {
    let copyText;
    if (parent) {
        copyText = parent.textContent;
    }
    if (copyText.length == 0) return;
    const textArea = document.createElement('textarea');
    textArea.textContent = copyText;
    document.body.append(textArea);
    textArea.select();
    document.execCommand("copy");
}