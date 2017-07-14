"use strict";

function app(clientId) {

  class View {
    constructor(clientId) {
      this.domain = `https://api.twitch.tv/kraken`;
      this.init = { 
        method: 'GET',
        headers: {
          'Accept': 'application/vnd.twitchtv.v5+json',
          'Client-ID': clientId
        },
        mode: 'jsonp',
        cache: 'default' 
      };
      this.query = '';
      
      this.total = 0;
      this.index = 0;
      this.limit = 50;

      this.elTotalItems = document.body.querySelectorAll('.total-items span')[0];
      this.elIndex = document.body.querySelectorAll('.index .indicator')[0];
      this.elItems = document.body.querySelectorAll('.items')[0];
      this.elAppContent = document.body.querySelectorAll('.app-content')[0];
      this.elBack = document.body.querySelectorAll('.back')[0];
      this.elForward = document.body.querySelectorAll('.forward')[0];

      this.elBack.addEventListener('click', () => this.paginateUp());
      this.elForward.addEventListener('click', () => this.paginateDown());
    }

    getTotalPages() {
      return Math.ceil(this.total/this.limit);
    }

    paginateUp() {
      if (this.index <= 0) { return; }
      this.index--;
      this.search();
    }

    paginateDown() {
      if (this.index+1 >= this.getTotalPages()) { return; }
      this.index++;
      this.search();
    }

    getLimit() {
      return this.limit;
    }

    getOffset(limit, index) {
      return this.limit * this.index;
    }

    search(query) {
      if (query) {
        this.query = query;
        this.index = 0;
      }

      const url = this.domain +
                  `/search/streams` +
                  `?query=${this.query}` +
                  `&limit=${this.limit}` +
                  `&offset=${this.getOffset()}`;

      const request = new Request(url, this.init); 

      fetch(request).then((response) => {
        const contentType = response.headers.get("content-type");
        if(contentType && contentType.indexOf("application/json") !== -1) {
          return response.json().then((json) => {
            view.render(json);
          });
        } else {
          console.log("Oops, we haven't got JSON!");
        }
      });
    }

    render(data) {
      function itemMarkup(item, index) {
          return (
            `<article class="item item-${index}">` +
              `<img src="${item.preview.medium}" "alt="stream preview image"/>` +
              `<div class="item-name">${item.channel.display_name}</div>` +
              `<div class="item-info">${item.game} - ${item.channel.views} viewers</div>` +
              `<div class="item-description">${item.channel.status}</div>` +
            `</article>`
          );
        }

        this.total = data ? data._total : this.total;
        this.items = data ? data.streams : this.items;

        const totalMarkup = `${this.total}`;
        const indexMarkup = `${this.index+1}/${this.getTotalPages()}`;

        const itemsMarkup = this.items.map((item, index) => {
          return itemMarkup(item, index);
        }).join('');

        this.elTotalItems.innerHTML = totalMarkup;
        this.elIndex.innerHTML = indexMarkup;
        this.elItems.innerHTML = itemsMarkup;
        this.elAppContent.classList.add('active');
    }
  };

  const elSearchInput = document.body.querySelectorAll('.search-input')[0];

  elSearchInput.addEventListener('keypress', (e) => {
      const key = e.which || e.keyCode;
      const value = e.target.value;
      if (key === 13 && value) {
        view.search(value);
      }
  });

  let view = new View(clientId);
}

window.onload = function() {
  const clientId = 'v4cfvv7i7crntrggfxp0zzb2h3l3pk';
  app(clientId);
}