const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const path = require('path')
var Git = require('nodegit');
var clone = Git.Clone.clone;
var fs = require('fs')
const moment = require('moment');
const bodyParser = require('body-parser')
var swaggerJSDoc = require('swagger-jsdoc');


app.use(
    bodyParser.urlencoded({
        extended: true
    })
)
app.use(bodyParser.json())

var swaggerDefinition = {
    info: {
        title: 'Node Swagger API',
        version: '1.0.0',
        description: '',
    },
    host: '/',
    basePath: '/',
};

// options for the swagger docs
var options = {
    // import swaggerDefinitions
    swaggerDefinition: swaggerDefinition,
    // path to the API docs
    apis: ['./*.js'],
};

// initialize swagger-jsdoc
var swaggerSpec = swaggerJSDoc(options);
var swaggerUi = require('swagger-ui-express')
// swaggerDocument = require('./swagger.json');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/', express.static('public'))






/**
 * @swagger
 * /getLink:
 *   post:
 *     description: Login to the application
 *     produces:
 *       - application/json
 *     parameters:
 *       - gitUrl: "https://github.com/khang21081995/demoHeoku/blob/master/index.js"
 *         description: Link github to file want download
 *         in: body
 *         required: true
 *         type: string
 *       - name: brand
 *         description: brand file download (default to master)
 *         in: body
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: done 
 */
app.post('/getLink', (req, res) => {
    try {
        var branch = 'master';
        let { gitUrl, brand } = req.body;
        if (!gitUrl || !(gitUrl + '').toLowerCase().startsWith('https://github.com/')) {
            throw new Error('Invalid params')
        }
        console.log({ swaggerSpec })
        var cloneOptions = new Git.CloneOptions();
        cloneOptions.checkoutBranch = branch;

        gitUrl = (gitUrl + '');
        let tmp = gitUrl.split('/')
        let current = moment().valueOf().toString()
        let gitLink = 'https://github.com/' + tmp[3] + '/' + tmp[4] + '.git';
        let dest = path.join(__dirname, 'public', current, tmp[3], tmp[4]);


        clone(gitLink, dest, cloneOptions).then(repo => {
            let filePathRes = gitUrl.split(gitLink.substr(0, gitLink.length - 4) + '/blob/' + branch + '/')[1]

            return res.json({ message: 'ok', link: req.protocol + '://' + path.join(req.headers.host, current, tmp[3], tmp[4], filePathRes) })
        }).catch(e => {
            return res.json({ message: e.message })
        })
    } catch (error) {
        console.log({ error })
        return res.json({ message: error.message || 'fail' })
    }
})

// swagger definition

// app.get('/swagger.json', function (req, res) {
//     res.setHeader('Content-Type', 'application/json');
//     res.send(swaggerSpec);
// });

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
