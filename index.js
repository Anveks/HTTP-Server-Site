
const http = require('http');
const fs = require('fs').promises;
const data = require('./data/data.json');

const server = http.createServer(async (request, response) => { // create a new server
  console.log('Server is running.');
  if(request.url === '/favicon.ico') return; // ignore the favicon url

  const requestHeaders = request.headers; // getting request headers
  const myUrl = new URL(request.url, `http://${requestHeaders.host}/`); // parsing the request URL here
  const itemId = myUrl.searchParams.get('id'); // getting item id from the string URL

  if(myUrl.pathname === '/'){ // in case its home render welcome
    
    let html = await fs.readFile('./view/bicycles.html', 'utf-8');

    const bicycleCards = await fs.readFile('./view/main/main.html', 'utf-8'); // getting the html

    let bicycles = '';
    for (let i = 0; i < data.length; i++){
      console.log(data[i]);
      bicycles += replaceHtmlTemplate(bicycleCards, data[i]); // getting the same number of cards as the length of data arr
    }

    html = html.replace(/<%ALLMAIN%>/g, bicycles);

    response.writeHead(200, {'Content-Type': 'text/html'});
    response.end(html);

  } else if(myUrl.pathname === '/bicycle' && itemId >=0 && itemId <=5) { // in case it is an item
    
    let html = await fs.readFile('./view/overview.html', 'utf-8');

    // making each HTML dynamic:
    const bicycle = data.find((item) => item.id === itemId);
    html = replaceHtmlTemplate(html, bicycle)

    response.writeHead(200, {'Content-Type': 'text/html'});
    response.end(html);

  } else if (/\.(png)$/i.test(request.url)) { // handling images: testing if request has .png

    const image = await fs.readFile(`./public/image/${request.url.slice(1)}`); // getting rid of / before .png file name
    response.writeHead(200, {'Content-Type': 'image/png'}); // setting the right header
    response.end(image); // sending

  } else if(/\.(css)$/i.test(request.url)){

    const cssFile = await fs.readFile("./public/css/index.css", "utf-8"); // adding the utf-8
    response.writeHead(200, { "Content-Type": "text/css" });
    response.end(cssFile);

  } else if (/\.(svg)$/i.test(request.url)) {

    const iconSVG = await fs.readFile("./public/image/icons.svg"); // adding the utf-8
    response.writeHead(200, { "Content-Type": "image/svg+xml" });
    response.end(iconSVG);

  } else {

    response.writeHead(404, {'Content-Type': 'text/html'}); // set response.status to 404
    response.end("<h1>Route not found.</h1>");

  };
});

server.listen(3000); // state the port

function replaceHtmlTemplate(html, bicycle){
  if (!bicycle || !bicycle.image || !bicycle.name || !bicycle.originalPrice) {
    // Handle the case when bicycle or its properties are missing
    return html; // Return the original html without any replacements
  };

  console.log(bicycle);

  html = html.replace(/<%IMAGE%>/g, bicycle.image); 
  html = html.replace(/<%NAME%>/g, bicycle.name);
  html = html.replace(/<%OLDPRICE%>/g, '$' + bicycle.originalPrice)
  let price = bicycle.originalPrice;
  if (bicycle.hasDiscount){
    price = (price *(100 - bicycle.discount)) / 100;
  }
  html = html.replace(/<%NEWPRICE%>/g, `$ ${price}`);
  html = html.replace(/<%ID%>/g, +bicycle.id);

  bicycle.hasDiscount
  ? (html = html.replace(/<%DISCOUNT%>/g, `<div class="discount__rate"><p>${bicycle.discount} % Off</p></div>`))
  : (html = html.replace(/<%DISCOUNT%>/g, ``));

  return html;
}