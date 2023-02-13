var express = require("express");
var app = express();
var path = require("path");

const port = process.env.PORT || 3200;

app.use('/passwordResetApp/resources', express.static(__dirname + '/app'));
app.get('/passwordResetApp', function (req, res) {
    res.sendFile(path.join(__dirname + '/app/index.html'));
});

app.listen(port, () => console.log(`\n\nPassword Reset App is listening on port ${port}!!\n`));