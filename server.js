// include module
var express = require("express");
var app     = express();
var path    = require("path");
var ws = require("nodejs-websocket");

// render index.html in url "/"
app.get('/',function(req,res){
    res.sendFile(path.join(__dirname+'/index.html'));
});

// create init data
var tmpJson = {
    _id: 1,
    data: [{
        id: "item1",
        title: "Đồng hồ",
        des: "Des 1",
        image: "http://donghohoangkim.vn/images/upload/Image/Dong-ho-%20Casio-%20EDIFICE%20EF-558SG-7AVDF.jpg"
    }, {
        id: "item2",
        title: "Xe tăng",
        des: "Des 2",
        image: "http://nld.vcmedia.vn/Images/Uploaded/Share/2011/09/03/xe-tang.jpg"
    }, {
        id: "item3",
        title: "Xe honda",
        des: "Des 3",
        image: "http://giaxe.2banh.vn/dataupload/products/thumbs/1381480908-86024cad1e83101d97359d7351051156-68-1.gif"
    }, {
        id: "item4",
        title: "Vợt",
        des: "Des 4",
        image: "http://www.vatgia.com/pictures_fullsize/ipb1332315791.JPG"
    }, {
        id: "item5",
        title: "Máy tính xách tay",
        des: "Des 5",
        image: "http://www.lenovo.com/shop/americas/content/img_lib/test/one-web/laptop-splitter-lenovo-g40.png"
    }],
    position: {"item1":{"top":491,"left":11},"item2":{"top":323,"left":563},"item3":{"top":155,"left":381},"item4":{"top":-13,"left":197},"item5":{"top":-181,"left":744}}
};

//create restAPI to get data from server
app.get('/test',function(req,res){
    getRow( function(row){
        res.send(row[0]);
    });
});


// run
app.listen(3000);

// login when server run ok
console.log("Running at Port 3000");

// create server websocket
var server = ws.createServer(function (connection) {
    connection.nickname = null
    connection.on("text", function (str) {
        getRow( function(row){
            if (row) {
                console.log('edit');
                editRow(str);
            } else {
                console.log('add');
                addRow(str);
            }
        });
        broadcast(str);
    })
    connection.on("close", function () {
        broadcast("close");
    })
})

// run server websocket
server.listen(8081);


// create function broadcast to send data to client
function broadcast(str) {
    server.connections.forEach(function (connection) {
        connection.sendText(str);
    })
}


// include mongodb module
var mongo = require("mongodb");
var host = "127.0.0.1";
var port = "27017";

// connect mongodb
var db = new mongo.Db("nodejs11", new mongo.Server(host, port, {}),{safe: true});	

//open connection mongodb
db.open(function(error){
    console.log("We are connected! " + host + ":" + port);
    getRow(function(row){
        if (row.length == 0) {
            addRow(tmpJson);
        } 
    });
});

// function get all data
function getRow(callback) { 
    db.collection("chotot", function(error, collection){
        collection.find().toArray(function(err, items) {
            callback(items);
        });
    });
}

// function add data
function addRow(data) {
    if (typeof(data) != 'object') {
        data = JSON.parse(data);
    }
    db.collection("chotot", function(error, collection){
        collection.insert(data, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred'});
            } else {
                console.log('Success: ');
            }
        });
    });
}

//function edit data
function editRow(data) { 
    if (typeof(data) != 'object') {
        data = JSON.parse(data);
    }
    db.collection("chotot", function(error, collection){
        collection.update(
            { _id: 1 },
            {
                $set: {
                    data: data.data,
                    position: data.position
                }
            }
        );
    });
}

// function auto update data and set timer (have issue about collection of mongodb), in this function, we can add new or update position of list ad and then render this data to client by function broadcast
/*function autoUpdateRow() {
    var x = Math.floor((Math.random() * 100) + 1);
    var position = {"item1":{"top":x,"left":11},"item2":{"top":323,"left":563},"item3":{"top":155,"left":381},"item4":{"top":-13,"left":197},"item5":{"top":-181,"left":744}};
    db.collection("chotot", function(error, collection){
        collection.update(
            { _id: 1 },
            {
                $set: {
                    data: data.data,
                    position: position
                }
            }
        );
    });
    getUser(function(row){
        broadcast(JSON.stringify(row));
    });
    
}
setInterval(autoUpdateRow, 5000);*/