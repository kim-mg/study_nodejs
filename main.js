var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
// path 보안을 위해 사용함 path를 오브젝트로 구분해 준다.
var path = require('path');
// 보안 : 출력 시 악용되거나 이상작동할 만한 html 코드를 수정하기 위한 모듈
var sanitizeHtml = require('sanitize-html');

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryDate = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;

    if(pathname === '/'){
      if(queryDate.id === undefined){
        fs.readdir('./data', function(error, filelist){
          var title = 'Welcome';
          var description = 'Hello, Node.js';
          var list = template.list(filelist);
          var html = template.html(title, list,
            `<h2>${title}</h2>${description}`,
            `<a href="/create">create</a>`);
          response.writeHead(200);
          response.end(html);
        });
      } else {
        fs.readdir('./data', function(error, filelist){
          // 보안 : 입력정보 필터링, 쿼리 필터링
          var filteredId = path.parse(queryDate.id).base;
          fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
            var title = queryDate.id;
            var sanitizedTitle = sanitizeHtml(title);
            // 보안 : 출력 시 태그를 삭제하지만 허용할 수도 있다.
            var sanitizedDescription = sanitizeHtml(description, {
              allowedTags : ['h1']
            });
            var list = template.list(filelist);
            var html = template.html(sanitizedTitle, list,
              `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
              ` <a href="/create">create</a>
                <a href="/update?id=${sanitizedTitle}">update</a>
                <form action="/delete_process" method="post">
                  <input type="hidden" name="id" value="${sanitizedTitle}">
                  <input type="submit" value="delete">
                </form>`);
            response.writeHead(200);
            response.end(html);
          });
        });
      }
    } else if(pathname === '/create'){
      fs.readdir('./data', function(error, filelist){
        var title = 'WEB - create';
        var list = template.list(filelist);
        var html = template.html(title, list, `
          <form action="/create_process" method="post">
            <p><input type="text" name="title" placeholder="title"></p>
            <p>
              <textarea name="description" placeholder="description"></textarea>
            </p>
            <p>
              <input type="submit" value="submit">
            </p>
          </form>`, ``);
        response.writeHead(200);
        response.end(html);
      });
    } else if(pathname === '/create_process'){
      var body = '';
      // data가 들어올 때마다 callback으로 실행됨
      request.on('data', function(data){
        body = body + data;
      });
      // data가 더 이상 들어오지 않을 경우 callback으로 실행
      request.on('end', function(){
        var post = qs.parse(body);
        var title = post.title;
        var description = post.description;
        fs.writeFile(`data/${title}`, description, 'utf8', function(err){
          // redirect
          response.writeHead(302, {Location: `/?id=${title}`});
          response.end('success');
        })
      });
    } else if(pathname === '/update'){
      fs.readdir('./data', function(error, filelist){
        var filteredId = path.parse(queryDate.id).base;
        fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
          var title = queryDate.id;
          var list = template.list(filelist);
          var html = template.html(title, list, `
            <form action="/update_process" method="post">
            <input type="hidden" name="id" value="${title}">
            <p><input type="text" name="title" placeholder="title" value="${title}"></p>
            <p>
              <textarea name="description" placeholder="description">${description}</textarea>
            </p>
            <p>
              <input type="submit" value="submit">
            </p>
          </form>`, `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`);
          response.writeHead(200);
          response.end(html);
        });
      });
    } else if(pathname === '/update_process'){
      var body = '';
      request.on('data', function(data){
        body = body + data;
      });
      request.on('end', function(){
        var post = qs.parse(body);
        var id = post.id;
        var title = post.title;
        var description = post.description;
        // 파일 이름 및 내용 수정
        fs.rename(`data/${id}`, `data/${title}`, function(err){
          fs.writeFile(`data/${title}`, description, 'utf8', function(err){
            // redirect
            response.writeHead(302, {Location: `/?id=${title}`});
            response.end();
          })
        })
      });
    } else if(pathname === '/delete_process'){
      var body = '';
      request.on('data', function(data){
        body = body + data;
      });
      request.on('end', function(){
        var post = qs.parse(body);
        var id = post.id;
        var filteredId = path.parse(id).base;
        fs.unlink(`data/${filteredId}`, function(err){
          response.writeHead(302, {Location: `/`});
          response.end();
        })
      });
    } else{
      response.writeHead(404);
      response.end('Not found');
    }
});
app.listen(3000);
