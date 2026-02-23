const http = require('http');

http.get('http://localhost:8080/jacquin_api/get_events.php', (resp) => {
    let data = '';

    resp.on('data', (chunk) => {
        data += chunk;
    });

    resp.on('end', () => {
        console.log(data);
    });

}).on("error", (err) => {
    console.log("Error: " + err.message);
});
