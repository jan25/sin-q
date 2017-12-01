
$(function() {
  const IMG_URL = 'http://www.changiairport.com/content/dam/cag/5-airport-experience/3-services-facilities/free_singapore_tour_900.jpg';

  var $queryBox = $('#query-box');
  var $imagesContainer = $('#images-container');

  var img = $('<img>').attr('src', IMG_URL);
  img.on('load', function() {
    if (!this.complete || typeof this.naturalWidth == "undefined" || this.naturalWidth == 0) {
        alert('broken image!');
    } else {
        $imagesContainer.append(img);
    }
  });

  const GOOG_BASE = 'https://www.google.com.sg/search?q=singapore';
  const GOOG_BASE_TEMP = 'https://www.google.com.sg/search?q=';

  getPage(GOOG_BASE).done(function(data) {
    parseHtml(data.contents);
  }).fail(function() {
    console.error('failed search query');
  }).always(function() {
    console.log('finished processing');
  });

  $queryBox.on('input', function() {
    var query = $(this).val();
    $imagesContainer.children().remove();
    executeQuery(query);
  });

  const MAX_PAGES_VISIT = 100;
  var doneCount = 0;

  function executeQuery(query) {
    doneCount = 0;
    crawlToPage(`${GOOG_BASE_TEMP}${query}`);
  }

  function crawlToPage(url) {
    if (!(/^(http|www)/.test(url))) {
      return;
    }

    getPage(`${url}`).done(function(data) {
      doneCount += 1;
      parseHtml(data.contents);
      console.log(url);
    }).fail(function() {
      console.error('failed search query');
    }).always(function() {
      console.log('finished processing');
    });
  }

  function parseHtml(html) {
    var $page = $(html);

    var $images = fetchImages($page);
    $.each($images, (idx, img) => {
      var $newImg = $('<img>').attr('src', $(img).attr('src'));
      $newImg.on('load', () => $imagesContainer.append($newImg));
    });

    var links = fetchLinks($page);
    $.each(links, (idx, link) => crawlToPage(link));
  }

  function fetchLinks($page) {
    var links = [];
    $.each($page.find('a'), (idx, link) => links.push($(link).attr('href')));
    return links.map(link => {
      var matches = link.match(/((http|www).*)/);
      return matches && matches.length ? matches[0] : '';
    }).filter(link => link);
  }

  function fetchImages($page) {
    return $page.find('img').clone();
  }

  function getPage(pageURL) {
    return $.getJSON('http://www.whateverorigin.org/get?url=' +
                      encodeURIComponent(pageURL) + '&callback=?')
  }

});
