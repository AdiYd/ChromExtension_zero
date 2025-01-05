console.log("Content script loaded and running.");

const groups = ['checkMe', 'checkMeToo', 'checkMeThree'];

// Function to find and populate the email input field
const findAndSetEmail = () => {
    const searchInputs = document.querySelectorAll("input[type='search']");
    const searchInput = Array.from(searchInputs).find(
    (input) => input.getAttribute('aria-label') === 'Search Facebook'
    );
    console.log("searchInputs", searchInput, searchInputs);
    if (searchInput) {
    console.log("Found the search input field:", searchInput);
    searchInput.value = groups[Math.floor(Math.random() * groups.length)];
    setTimeout(()=>{
        console.log('clicking', searchInput);
        searchInput?.click();
    })
    return true; // Return true when the input is found
  }
  return false; // Return false if the input is not found
};

// MutationObserver to monitor DOM changes
const observer = new MutationObserver(() => {
  if (findAndSetEmail()) {
    console.log("Email input found via MutationObserver. Stopping observer.");
    observer.disconnect(); // Stop observing after finding the input
  }
});

// Start observing the DOM
observer.observe(document.body, { childList: true, subtree: true });

// setInterval as a fallback
const debugInterval = setInterval(() => {
  console.log("Debugging: Checking for email input field...");
  if (findAndSetEmail()) {
    console.log("Email input found via setInterval. Clearing interval.");
    clearInterval(debugInterval); // Stop interval once the input is found
  }
}, 2000);

// Optional: Timeout to stop the interval after a certain time
const timeout = setTimeout(() => {
  clearInterval(debugInterval);
  console.log("Stopping interval as email input was not found within the timeout.");
}, 10000); // 10 seconds
