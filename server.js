var http = require('http');
var querystring = require('querystring')
var url = require('url');
var port = 3000;

var items = [];

function show(res) {
	var html = '<h2>FORM</h2>'
			+ '<ul>'
			+ items.map(function(item) {
				return '<li>' + item + '</li>';
			}).join('')
			+ '</ul>'
			+ '<form method="post" action="/">'
			+ '<input type="text" name="item" />'
			+ '<input type="submit" value-"Submit" />'
			+ '</form>';
			
	res.setHeader('Content-Type', 'text/html');
	res.write('<h1>First Page</h1>');
	res.end(html);
}

function add(req, res) {
	var body = '';
	req.setEncoding('utf8');
	req.on('data', function(chunk) {
		body += chunk;
	});
	req.on('end', function() {
		var obj = querystring.parse(body);
		items.push(obj.item);
		show(res);
	})
}

function badRequest400(res) {
	res.statusCode = 400;
	res.setHeader('Content-Type', 'text/plain');
	res.end('Bad Request');
}

function notfound404(res) {
	res.statusCode = 404;
	res.setHeader('Content-Type', 'text/plain');
	res.end('Not Found');
}


http.createServer(function(req, res) {
	var path = url.parse(req.url).pathname;
	if('/' == path) {
		console.log("Routing method: ", req.method);
		switch (req.method) { 
			case 'GET':
				show(res);
				break;
			case 'POST':
				add(req, res);
				break;
			default:
				badRequest400(res);
		}
	} else {
		var i = parseInt(path.slice(1));
		if(isNaN(i)) 
			badRequest400(res);
		else if(!items[i])
			notfound404(res);
		else {
			switch(req.method) {
				case 'DELETE':

					break;
				case 'PUT':

					break;
				case 'GET':

					break;
				default:
					badRequest400(res);
			}

		}
	}
	
	
}).listen(port);

console.log('Server started on: ', port);
