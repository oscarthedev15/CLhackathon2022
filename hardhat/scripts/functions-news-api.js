/**
 * Chainlink Functions - News API Integration
 *
 * Searches for articles containing specific keywords and returns the count
 *
 * Expected args[0]: Full API URL with query and API key embedded
 *
 * Returns: Number of articles found (as uint256, multiplied by 100)
 */

// Get the full API URL from arguments (includes query and API key)
const apiUrl = args[0];

if (!apiUrl) {
  throw Error("API URL not provided in args[0]");
}

// Make the HTTP request
const apiResponse = await Functions.makeHttpRequest({
  url: apiUrl,
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
});

// Check if the request was successful
if (apiResponse.error) {
  throw new Error(`News API request failed: ${apiResponse.error}`);
}

// Extract totalResults from the response
const totalResults = apiResponse.data.totalResults;

if (typeof totalResults !== "number") {
  throw new Error(
    `Invalid response: expected number, got ${typeof totalResults}`
  );
}

// Return the count multiplied by 100 (to preserve precision in contract)
// Contract will divide by 100 to get actual count
return Functions.encodeUint256(totalResults * 100);
