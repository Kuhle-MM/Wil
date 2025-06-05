function updateColor(select) {
    select.className = 'status-dropdown'; // Reset first
    const value = select.value.toLowerCase();
    if (value === 'present') {
        select.classList.add('present');
    } else if (value === 'absent') {
        select.classList.add('absent');
    } else {
        select.classList.add('pending');
    }
}

// Set initial status color on page load
document.querySelectorAll('.status-dropdown').forEach(updateColor);