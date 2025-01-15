document.getElementById('aboutButton').addEventListener('click', function() {
    fetch('view/about.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('overlayContainer').innerHTML = html;
            document.getElementById('aboutOverlay').style.display = 'flex';
        });
});

document.getElementById('detailsButton').addEventListener('click', function() {
    fetch('view/details.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('overlayContainer').innerHTML = html;
            document.getElementById('aboutOverlay').style.display = 'flex';
        });
});

document.getElementById('relatedLinksButton').addEventListener('click', function() {
    fetch('view/relatedLinks.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('overlayContainer').innerHTML = html;
            document.getElementById('aboutOverlay').style.display = 'flex';
        });
});

document.getElementById('citationsButton').addEventListener('click', function() {
    fetch('view/citations.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('overlayContainer').innerHTML = html;
            document.getElementById('aboutOverlay').style.display = 'flex';
        });
});

document.getElementById('overlayContainer').addEventListener('click', function(event) {
    if (event.target.id === 'closeAbout') {
        document.getElementById('aboutOverlay').style.display = 'none';
    }
});