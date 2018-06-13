var countEl = d3.select("#count");
var table = d3.select("#ufo-table");
var url = "https://jsonblob.com/api/jsonBlob/4176e27b-4313-11e8-a75a-d5a15cebc6ed";
var filters = {};

d3.json(url, init);

d3.selectAll(".filter").on("change", function(event) {
  var changedElement = d3.event.target;
  var filterId = changedElement.id;
  var value = changedElement.value.trim();

  if (value) {
    filters[filterId] = value;
  }
  else {
    delete filters[filterId];
  }

  data.filter();

  loadTable();
});

var data = {
  filter: function() {
    this.filtered = this.dataSet.filter(function(ufoRecord) {
      var matchesFilters = true;

      Object.entries(filters).forEach(function(entry) {
        var filterId = entry[0];
        var filterValue = entry[1];

        if (!fuzzyMatches(filterValue, ufoRecord[filterId])) {
          matchesFilters = false;
        }
      });
      return matchesFilters;
    });
  }
};

function fuzzyMatches(search, result) {
  var slicedResult = result.slice(0, search.length);

  return search === slicedResult;
}

countEl.on("change", loadTable);

var page = {
  currentPage: 1,
  numPages: function() {
    return Math.ceil(data.filtered.length / this.resultsPerPage());
  },
  resultsPerPage: function() {
    return countEl.property("value").trim();
  },
  getPageSubset: function() {
    var counter;
    if (this.currentPage < 11) {
      counter = 1;
    }
    else if (this.currentPage % 10 === 0) {
      counter = this.currentPage - 9;
    }
    else {
      counter = Math.floor(this.currentPage / 10) * 10 + 1;
    }
    var pageNumbers = [counter];
    counter++;
    while (pageNumbers[pageNumbers.length - 1] < this.numPages() && pageNumbers.length < 10) {
      pageNumbers.push(counter);
      counter++;
    }
    return pageNumbers;
  },
  paginate: function(array, pageSize, pageNumber) {
    pageNumber--;
    return array.slice(pageNumber * pageSize, (pageNumber + 1) * pageSize);
  }
};

function init(dataSet) {

  data.dataSet = dataSet;
  data.filtered = dataSet;

  loadTable();
}

function loadTable() {
  var tbody = d3.select("tbody")
    .html("");

  var resultsThisPage = page.paginate(
    data.filtered,
    page.resultsPerPage(),
    page.currentPage
  );

  for (var i = 0; i < resultsThisPage.length; i++) {
    var ufoObject = resultsThisPage[i];
    var ufoKeys = Object.keys(ufoObject);

    var row = tbody.append("tr")
      .classed("table-row", true);

    for (var j = 0; j < ufoKeys.length; j++) {
      var currentKey = ufoKeys[j];

      row.append("td")
        .html(ufoObject[currentKey])
        .classed("text-center", true)
        .attr("data-th", currentKey);
    }
  }
}