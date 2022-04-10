const app = require("./app");
const http = require("http");
const config = require("./utils/config");

const server = http.createServer(app);

server.listen(config.PORT, () => {
    console.log(`Server running on port ${config.PORT}`);
});

// app.get("/images", (req, res) => {

// })
// const fs = require("fs");
// const path = require("path");

// client.connect()
// .then(async () => {
//     console.log("Connected to database");
//     try {
//         const res = await client.query("select * from users");
//         console.log(res.rows, res.fields);
//     } catch(err) {
//         console.error(err);
//     }
// })
// .catch(() => console.error("Error connecting to database"))
// .finally(() => client.end());