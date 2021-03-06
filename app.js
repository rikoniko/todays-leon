const express = require('express');
const mysql = require('mysql');

var port = process.env.PORT || 5000;
const app = express();

//publicフォルダにあるcssを使えるようになる
app.use(express.static('public'));

//フォームから送信された値を受け入れるようになる
app.use(express.urlencoded({extended: false}));


var db_config= {
  host: 'host',
  user: 'user',
  password: 'password',
  database: 'database',
  dateStrings:'date'//日付をdate型にする
};

var connection;
function handleDisconnect() {
  console.log('INFO.CONNECTION_DB: ');
  connection = mysql.createConnection(db_config);
  
  //connection取得
  connection.connect(function(err) {
      if (err) {
          console.log('ERROR.CONNECTION_DB: ', err);
          setTimeout(handleDisconnect, 1000);
      }
  });
  
  //error('PROTOCOL_CONNECTION_LOST')時に再接続
  connection.on('error', function(err) {
      console.log('ERROR.DB: ', err);
      if (err.code === 'PROTOCOL_CONNECTION_LOST') {
          console.log('ERROR.CONNECTION_LOST: ', err);
          handleDisconnect();
      } else {
          throw err;
      }
  });
}

handleDisconnect();


connection.connect((err) => {
  if (err) {
    console.log('error connecting: ' + err.stack);
    return;
  }
  console.log('success');
});

app.get('/', (req, res) => {
  
    connection.query(
      'SELECT * FROM items',
      (error, results) => {
        console.log(results);
        //データベースの結果を得る
        res.render('top.ejs',{items:results});


      }
    );

});

//トップページの表示
app.get('/top', (req, res) => {
      connection.query(
      'SELECT * FROM items',
      (error, results) => {
        console.log(results);
        //データベースの結果を得る
        res.render('top.ejs',{items:results});


      }
    );

});

//編集画面の表示
app.get('/edit/:id',(req,res)=>{
  
    connection.query(
      'select * from items where id=?',
      [req.params.id],
      (error,results)=>{
        res.render('edit.ejs',{items:results[0]});
        

      }
    );
});

//更新するとき
app.post('/update/:id',(req,res)=>{

    connection.query(
      'update items set name=?,day=?,message=? where id=?',
      [req.body.itemName,req.body.itemDay,req.body.itemMessage,req.params.id],
      (error,results)=>{
        res.redirect('/top');

      }
    );
});

//新規のコメントの追加
app.post('/create',(req,res)=>{
  var name_db=req.body.itemName
  var message_db=req.body.itemMessage
  var day_db=req.body.itemDay

    connection.query(
      'INSERT INTO items (name,message,day) VALUES ("' + name_db + '","'+message_db+'","'+day_db+'")',
      (error, results) => {
        res.redirect('/top');

      }
    );
});

app.get('/new', (req, res) => {
  res.render('new.ejs');
});

app.post('/delete/:id',(req,res)=>{

    connection.query(
      'delete from items where id=?',
      [req.params.id],
      (error,results)=>{
        res.redirect('/top');

      }
    );

});

app.get('/', (req, res) => {
  res.render('new.ejs');
});


app.listen(port, () => console.log(`Example app listening on port ${port}!`))
