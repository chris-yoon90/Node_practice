var http = require('http');
var querystring = require('querystring')
var url = require('url');
var port = 3000;

var items = [];

function show(res) {
	var html = '<h2>FORM</h2>'
			+ '<ul>'
			+ items.map(function(item) {
				return '<li><a href="/' + items.indexOf(item) + '">' + item + '</a>'
						+ '<a href = "/' + items.indexOf(item) + '/edit"> | edit </a>'
						+ '<form method="post" action="/' + items.indexOf(item) + '">'
						+ '<input type="hidden" name="_method" value="delete" />'
						+ '<input type="submit" value="Delete" />'
						+ '</form></li>';
			}).join('')
			+ '</ul>'
			+ '<form method="post" action="/">'
			+ '<input type="text" name="item" />'
			+ '<input type="submit" value="submit" />'
			+ '</form>';
			
	res.setHeader('Content-Type', 'text/html');
	res.write('<h1>First Page</h1>');
	res.end(html);
}

function showEdit(res, itemIndex) {
	var html = '<form method="post" action="/' + itemIndex + '/edit">'
			+ '<input type="hidden" name="_method" value="put" />'
			+ '<input type="text" name="item" />'
			+ '<input type="submit" value="Save" />'
			+ '</form>';

	res.setHeader('Content-Type', 'text/html');
	res.write('<h1>Edit: ' + items[itemIndex] + '</h2>');
	res.end(html);
}

function edit(oldItemIndex, newItem, res) {
	items[oldItemIndex] = newItem;
	res.writeHead(301,
		{Location: 'http://localhost:' + port});
	res.end();
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
	});
}

function deleteItem(i, res) {
	items.splice(i, 1);
	res.writeHead(301,
		{Location: 'http://localhost:' + port});
	res.end();
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
	//console.log(path);
	if('/' == path) {
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
			if('/' + i == path) {
				switch(req.method) {
					case 'DELETE':
					case 'POST':
						var body = '';
						req.setEncoding('utf8');
						req.on('data', function(chunk) {
							body += chunk;
						});
						req.on('end', function() {
							var obj = querystring.parse(body);
							if (obj._method = 'delete') {
								console.log("delete request for: " + items[i]);
								deleteItem(i, res);
							} else {
								badRequest400(res);
							}
						});
						break;
					case 'GET':
						res.end('<h1>' + items[i] + '</h1>');
						break;
					default:
						badRequest400(res);
				}
			} else if('/' + i + '/edit' == path) {
				switch(req.method) {
					case 'PUT':
					case 'POST':
						var body = '';
						req.setEncoding('utf8');
						req.on('data', function(chunk) {
							body += chunk;
						});
						req.on('end', function() {
							var obj = querystring.parse(body);
							if (obj._method = 'put') {
								var newItem = obj.item;
								console.log("edit request for: " + items[i] + "to: " + newItem);
								edit(i, newItem, res);
							} else {
								badRequest400(res);
							}
						});
						break;
					case 'GET':
						showEdit(res, i);
						break;
					default:
						badRequest400(res);
				}
			} else {
				badRequest400(res);
			}
		}
	}
	
	
}).listen(port);

console.log('Server started on: ', port);
