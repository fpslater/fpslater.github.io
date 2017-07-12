"use strict";

function app() {
  var View = class {

    constructor() {
      this.elTotalItems = document.body.querySelectorAll('.total-items span')[0];
      this.elIndex = document.body.querySelectorAll('.index span')[0];
      this.elItems = document.body.querySelectorAll('.items')[0];
    }

    render(data, index, totalPages) {

      function itemMarkup(item) {
          return (
            `<article class="item item-${index}">` +
              `<img src="${item.preview.medium}" "alt="stream preview image"/>` +
              `<div class="item-name">${item.channel.display_name}</div>` +
              `<div class="item-info">${item.game} - ${item.channel.views} viewers</div>` +
              `<div class="item-description">${item.channel.description}</div>` +
            `</article>`
          );
        }

        var total = data._total;
        var streams = data.streams;

        var totalMarkup = total > 0 ? `${total}` : 0;
        var indexMarkup = total > 0 ? `${index+1}/${totalPages}` : `1/1`;

        var itemsMarkup = streams.map((item, index) => {
          return itemMarkup(item, index);
        }).join(",");

        this.elTotalItems.innerHTML = indexMarkup;
        this.elIndex.innerHTML = totalMarkup;
        this.elItems.innerHTML = itemsMarkup;
    }
  };

  function getTotalPages(limit, total) {
    return Math.ceil(total/limit);
  }

  function getOffset(limit, index) {
    return limit * index;
  }

  function paginateUp() {
    index++;
    renderView();
  }

  function paginateDown() {
    index--;
    renderView();
  }

  function search() {
    searchInput = elSearchInput.value;
    renderView();
  }

  function renderView() {
    if (!searchInput) {
      return;
    }

    var url = `https://api.twitch.tv/kraken/search/streams` +
              `?query=${searchInput}&limit=${limit}&offset=${getOffset(limit, index)}`;

    var request = new Request(url, init); 

    fetch(request).then(function(response) {
      var contentType = response.headers.get("content-type");
      if(contentType && contentType.indexOf("application/json") !== -1) {
        return response.json().then(function(json) {
          view.render(json, index, getTotalPages(limit, json._total));
        });
      } else {
        console.log("Oops, we haven't got JSON!");
      }
    });
  }
  
  var clienId = 'v4cfvv7i7crntrggfxp0zzb2h3l3pk';

  var headers = new Headers();
  headers.append('Accept', 'application/vnd.twitchtv.v5+json');
  headers.append('Client-ID', clienId);

  var init = { method: 'GET',
               headers: headers,
               mode: 'jsonp',
               cache: 'default' };

  var searchInput = '';
  var index = 0;
  var limit = 50;
   
  var view = new View();
  
  var elBack = document.body.querySelectorAll('.back')[0];
  var elForward = document.body.querySelectorAll('.forward')[0];
  var elSearchForm = document.body.querySelectorAll('.search-form')[0];
  var elSearchInput = document.body.querySelectorAll('.search-input')[0];

  elBack.addEventListener('click', paginateUp);
  elForward.addEventListener('click', paginateDown);
  elSearchInput.addEventListener('keypress', function (e) {
      var key = e.which || e.keyCode;
      if (key === 13) {
        search();
      }
  });
}

window.onload = function() {
  app();
}


