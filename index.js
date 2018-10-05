/*
 * Primary file for the API
 *
 */

// Dependencies
// http module for listening ports and responds with data.
var http = require('http');
// url module for parsing and manipulate request url.
var url = require('url');
var decoder = require('string_decoder').StringDecoder;

// Server responds to all requests (req), with a message as response (res)
var server = http.createServer(function(req,res){

	// Get url from request and parse it.
	var parsedUrl = url.parse(req.url, true);

	// Get path from parsed url.
	var path = parsedUrl.pathname;
	
	// Discard host and port from url path.
	var trimmedPath = path.replace(/^\/+|\/+$/g,'');

	// Get the query string as an object.
	var queryStringObject = parsedUrl.query;

	// Get the HTTP Method.
	var method = req.method.toLowerCase();

	// Get the request headers as an object.
	var headers = req.headers;

	// Get the payload, if any.
	var decoder = new StringDecoder('utf-8');
	var buffer = '';
	
	// While streams are received, they are stored on a variable.
	req.on('data', function(data){
		buffer += decoder.write(data);
	});

	// When the server ends receiving the request body content as streams, we log the end of buffer.
	req.on('end', function(){
		buffer += decoder.end();

		// Choose the handler for this request.
		var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

		// Contruct the data object being sent to the handler.
		var data = {
			'trimmedPath' : trimmedPath,
			'queryStringObject' : queryStringObject,
			'method' : method,
			'headers' : headers,
			'payload' : buffer
		};

		// Route the request to the handler.
		chosenHandler(data, function(statusCode, payload){
			// Use the status code called back by the handler or define a default status code instead.
			statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

			// Use the payload called back by the handler or default to empty object.
			payload = typeof(payload) == 'object' ? payload : {};

			// Convert the payload to string.
			var payloadString = JSON.stringlify(payload);

			// Return the response.
			res.writeHead(statusCode);
			res.end(payloadString);


			// Log he respond emited to the requester.
			console.log('Response emited: ', statusCode, payloadString);

		});

	});

});

// Start the server and have it listen on port 3000
server.listen(3000, function(){
	console.log("The server is listening on port 3000 now");
});

// Handlers
var handlers = {};

// Sample handler.
handlers.sample = function(data, callback){

	// Callback an http status code and a payload object.
	callback(406, {'name' : 'sample handler'});
};

// Not found handler.
handlers.notFound = function(data, callback){
	callback(404);
};

// Request router
var router = {
	'sample' : handlers.sample
};
