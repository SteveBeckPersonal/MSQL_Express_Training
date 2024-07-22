# Task
Run the service by running node server.js in the VS Code Terminal, then visit http://localhost:3002/api-docs/ to view the swagger documentation.
The products endpoints are protected and require authentication via the login endpoint – which uses a bearer token.
## Task Steps:
* Create a test for each products endpoint which will ensure that the endpoint cannot be used without a token – hint – think status code
* Create a test for each products endpoint which displays the endpoint working as intended. The outcomes of each product endpoint should match the data in the DB.
* Create a test for the Get and Delete by Id endpoints which attempts to find or delete a product which does not exist – the test should ensure that the request fails – hint – think error code and text.
