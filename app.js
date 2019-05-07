const express = require('express');
const app = express();
const fs = require('fs');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const ejs = require('ejs');

/* app.use(express.logger('dev'));
app.use(express.bodyParser({uploadDir: './public/temp'}));
app.use(express.methodOverride());
app.use(express.errorHandler()); */

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(multer({dest: '/temp/'}).any())

function resolvePath(dir){
    return path.resolve(__dirname, dir);
}

app.get('/index.html', (req, res)=>{
    res.sendFile(resolvePath('index.html'));
})

app.post('/file_upload', (req, res)=>{
    let name = req.body.username;
    let psw = req.body.password;
    if(name != 'zhanghl' || psw != 'upload'){
        res.send(JSON.stringify({msg: '用户名密码错误'}))
        return false;
    }
    let des_file = __dirname + '/fileHome/' + req.files[0].originalname;
    if(!fs.existsSync(resolvePath('./fileHome'))){
        fs.mkdirSync(resolvePath('fileHome'))
    }
    fs.readFile( req.files[0].path, function(err, data){
        fs.writeFile(des_file, data, function(err){
            let response = {}
            if(err) {
                console.log(err);
                response.msg = 'err'
            }
            else {
                response.msg = 'ok';
                response.filename = req.files[0].originalname;
            }
            res.send( JSON.stringify(response) );
        })
    })
})
app.get('/download/:name', (req, res)=>{
    fs.readFile(resolvePath('fileHome/' + req.params.name), function(err, data){
        if(err) res.send('下载失败')
        else res.send(data)
    })
})
app.get('/list.html', (req, res)=>{
    let list = []
    const files = fs.readdirSync(resolvePath('fileHome'));
    files.forEach(function(item){
        list.push({
            href: './download/' + item,
            name: item
        })
    })
    res.render("list.ejs", {list: list});
})


app.listen(8088)