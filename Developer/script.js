let weatherApiRootUrl = 'https://apiopenweathermap.org';
let weatherApiKey ='e4b6d84d9f08d3010824b8171389a8bb';


function saveSearch() {
    let searchQuery = document.getElementById("search-input").value;

    if (searchQuery !== "") {
        let searches = JSON.parse(localStorage.getItem("searches")) || [];
      searches.push(searchQuery);
      localStorage.setItem("searches", JSON.stringify(searches));
      document.getElementById("search-input").value = "";
      displaySearches();
    }
  }

  function displaySearches() {
    let searches = JSON.parse(localStorage.getItem("searches")) || [];
    let searchHistoryElement = document.getElementById("search-history");
  
    searchHistoryElement.innerHTML = "";
  
    searches.forEach(function (search) {
      let listItem = document.createElement("li");
      listItem.className = "list-group-item";
      let link = document.createElement("a");
      link.textContent = search;
      link.href = "#"; 
      link.addEventListener("click", function() {
        performSearch(search);
      });
      listItem.appendChild(link);
      searchHistoryElement.appendChild(listItem);
    });
  }

  
  document.getElementById("search-form").addEventListener("submit", function (event) {
    event.preventDefault(); 
    saveSearch(); 
  });
  displaySearches();