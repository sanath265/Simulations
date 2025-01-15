document.getElementById('aboutButton').addEventListener('click', function() {
    // Dynamically load the overlay content
    fetch('view/about.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('overlayContainer').innerHTML = html;
            document.getElementById('aboutOverlay').style.display = 'flex'; // Show overlay
            // You can apply animation or styling for the transition here
        });
});

document.getElementById('detailsButton').addEventListener('click', function() {
    // Dynamically load the overlay content
    fetch('view/details.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('overlayContainer').innerHTML = html;
            document.getElementById('aboutOverlay').style.display = 'flex'; // Show overlay
            // You can apply animation or styling for the transition here
        });
});

document.getElementById('relatedLinksButton').addEventListener('click', function() {
    // Dynamically load the overlay content
    fetch('view/relatedLinks.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('overlayContainer').innerHTML = html;
            document.getElementById('aboutOverlay').style.display = 'flex'; // Show overlay
            // You can apply animation or styling for the transition here
        });
});

document.getElementById('citationsButton').addEventListener('click', function() {
    // Dynamically load the overlay content
    fetch('view/citations.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('overlayContainer').innerHTML = html;
            document.getElementById('aboutOverlay').style.display = 'flex'; // Show overlay
            // You can apply animation or styling for the transition here
        });
});

document.getElementById('overlayContainer').addEventListener('click', function(event) {
    if (event.target.id === 'closeAbout') {
        document.getElementById('aboutOverlay').style.display = 'none'; // Close overlay
    }
});