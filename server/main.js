//1. import node modules
const express = require('express'),
    bodyParser = require('body-parser'),
    secureEnv = require('secure-env'), //cos we are storing passwords, so need to protect env variables even more
    cors = require('cors'),
    mysql = require('mysql2/promise');

//2. instantiate express
const app = express()

//3. initialize all relevant params for express middleware
//3a. use cors as we are loading Ng from 4200 port and calling to 3000port for express
app.use(cors())
//3b. use bodyParser 
//Parse incoming request bodies in a middleware before your handlers, available under the req.body property.
/* urlencoded([options])
Returns middleware that only parses urlencoded bodies and only looks at requests where the Content-Type header matches the type option. 
This parser accepts only UTF-8 encoding of the body and supports automatic inflation of gzip and deflate encodings */
app.use(bodyParser.urlencoded({limit: '50mb', extended: true})) // limit to prevent hacking via receiving virus, extended true to accept obj & arrs to be encoded into url-encoded format
app.use(bodyParser.json({limit: '50mb'})) //limit size of json files, Returns middleware that only parses json and only looks at requests where the Content-Type header matches the type option. 

//4. integrate with secureEnv
global.env = secureEnv({secret: 'isasecret'})//decrypt the encrypted version of env (.env.enc) to get the values
/* before 4, 
- create .env file to store & set env variables with values
- create .env.sample file to store only env variables (w/o setting values), so that others who use app know what vars to set
- use npx (npm extension) in CLI as such: npx secure-env -s isasecret 
* -s is to set the hash using the key ("isasecret") set
- .env.enc (encrypted file) is created and ready to use as above(.env can be deleted)
*/

//5. get port var from secureEnv
const APP_PORT= global.env.APP_PORT
const COMMON_NAMESPACE = '/api'

//6. create Mysql connection pool & se up params
const pool = mysql.createPool({
    host:global.env.MYSQL_SERVER,
    port:global.env.MYSQL_SVR_PORT,
    user:global.env.MYSQL_USERNAME,
    password:global.env.MYSQL_PASSWORD,
    database:global.env.MYSQL_SCHEMA,
    connectionLimit:global.env.MYSQL_CON_LIMIT

})

// console.log(pool)

//7. construct MYSQL statements - select all rsvps & insert one record
const queryComputeOrdersView = 'SELECT * from compute_orders where id=?;' //* has performance issue if too many columns, so best practice is define columns out

//if u are not putting in all the fields of the table u MUST state which fields u are inserting into else cannot get result back


//8. establish connection, take in params and query to db
//done via set up currying function to make calls to db
const makeQuery = (sql, pool) => {
    console.log(sql)

    return (async (args) => {
        //init connection
        const conn = await pool.getConnection() //have to wait for connection to do next step
        try{
            console.log("args", args)
            let results = await conn.query(sql, args || []) //results returned as [result, metadata]
            console.log(results[0]);
            return results[0] 
            
        }catch(err){
            console.error(err)
            return {"msg": err}
        }
        finally{
            //release connection back to pool
            conn.release() 
        }
    })
}

//test db connection
const startApp = async(app, pool) => {
    const conn = await pool.getConnection()
    try{
        console.log('test database connection...')
        await conn.ping(); //if ping has error we will know connection got problem

    // started the process of app listening to
    // port retrieve from env var.
    app.listen(APP_PORT, ()=>{
        console.log(`Application started on port ${APP_PORT}`)
})
    }catch(e){
        console.error(e)
    }    finally{
        conn.release
    }
}



// 9. Create the closure function for the end point to
// perform crud operation against the database
const executeComputeOrdersView = makeQuery(queryComputeOrdersView, pool)





// 10. end point that return all rsvp
// invoke the findAllRsvp closure function 

app.get(`/order/total/:orderId`, (req, resp) =>{
    const orderId = req.params.orderId
    console.log(orderId)
    executeComputeOrdersView([orderId]).then(results => {
        //resp.status(200).json(res)
        //return text/html

        if (results.length > 0){
            resp.format({
                html: () => {
                    console.log("html")
                    resp.send('<h1>Hi</h1>' + JSON.stringify(results))
                },
                json: () => {
                    console.log("json")
                    resp.status(200).json(results)
                }
            })
        }else{
            throw new Error('No record in database')
        }
        
    }).catch(err => {
        console.error("get error", err)
        resp.status(500).json({err: err.message})
    })
    //resp.status(200).json({})
})



//if someone tries to access ur endpt
app.use((req, resp) => {
    resp.redirect('/')
})


startApp(app, pool)
