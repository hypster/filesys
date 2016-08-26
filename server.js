
var mime=require('mime')
var fs=require('fs')

var methods=Object.create(null)
var urlToPath=function(url){
    return '.'+decodeURIComponent(require('url').parse(url).pathname)
}

var server=require('http').createServer(function(req,res){

    var respond=function(code,body,type){
        if(!type)
            type='text/plain'

        res.writeHead(code,{'content-type':type})
        if(body&&body.pipe)
            body.pipe(res)
        else
            res.end(body)
    }
    var respondWithErrorOrNothing=function(respond){
        return function(err){
            if(err)
                respond(500,err.toString())
            else
                respond(204)
        }
    }


    if(methods[req.method])
        methods[req.method](urlToPath(req.url),respond,req)
    else
        respond(405,'Method '+req.method+' not allowed.')
}).listen(8000)



methods.GET=function(path,respond){
    fs.stat(path,function(err,stat){
        if(err&&err.code=='ENOENT')
            respond(404)
        else if(err)
            respond(500,err.toString())
        else if(stat.isDirectory())
            fs.readdir(path,function(err,data){
                if(err)
                    respond(500,error.toString())
                else
                    respond(200,data.join('\n'))
            })
        else
            respond(200,fs.createReadStream(path),mime.lookup(path))
        })

}

methods.DELETE=function(path,respond){
    fs.stat(path,function(err,stat){
        if(err&&err.code=='ENOENT')
            respond(204)
        else if(err)
            respond(500,err.toString())
        else if(stat.isDirectory()){
            fs.rmdir(path,respondWithErrorOrNothing(respond))
        }else
            fs.unlink(path,respondWithErrorOrNothing(respond))
    })
}

methods.PUT=function(path,respond){
    var outStream=fs.createWriteStream(path)
    outStream.on('error',function(error){
        respond(500,error.toString())
    })
    outStream.on('finish',function(){
        respond(204)
    })
    request.pipe(outStream)
}





