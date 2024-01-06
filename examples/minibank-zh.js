// node examples/minibank-zh.js > examples/minibank-zh.html
// Online demo: https://minio.neruthes.xyz/oss/keep/easybkjs/minibank-zh.html--bb11edd0a9d2210c51eb35da7a53a987.html

const easybkjs = require('../src/easybkjs.js');

var myBook = easybkjs.create({
    symbol: '￥'
});

easybkjs.begin_document({ title: 'Some Bank' });



myBook.import({
    assets: {
        '现金': 0,
        '同业头寸': 0,
        '短期债权': 0,
        '长期债权': 0,
    },
    debts: {
        '储户.Alice': 0,
        '储户.Bob': 0,
        '应付账款': 0,
        '@所有者权益': 0
    }
});


easybkjs.default_css();
easybkjs.default_js();





easybkjs.html_tag('h1', '某某钱庄');




// ================================================
easybkjs.html_tag('h2', '2020');
// ================================================

myBook.section('2020 Q1', function () {
    myBook.date('2020-01-01');
    myBook.expand('现金', '@所有者权益', 0, '钱庄成立');
    myBook.date('2020-02-02');
    myBook.expand('同业头寸', '储户.Alice', 1500, '存入，Alice');
    myBook.expand('同业头寸', '储户.Bob', 900, '存入，Bob');
    
    myBook.date('2020-03-12');
    myBook.shrink('同业头寸', '储户.Alice', -1321.1, '支付，Alice：生活账单代缴');
    myBook.shrink('同业头寸', '储户.Bob', -37.5, '支付，Bob：消费，淘宝代付');
});
myBook.date('2020-03-31');
myBook.dump({ format: 'html' });

myBook.section('2020 Q2', function () {
    myBook.date('2020-04-06');
    myBook.expand('同业头寸', '储户.Alice', 378, '存入，Alice');
    myBook.expand('同业头寸', '储户.Bob', 1155, '存入，Bob');
    
    myBook.date('2020-05-19');
    myBook.shrink('同业头寸', '储户.Alice', -899, '支付，Alice：生活账单代缴');
    myBook.shrink('同业头寸', '储户.Bob', -245, '支付，Bob：消费，淘宝代付');
    myBook.date('2020-06-01');
    myBook.transferD('储户.Bob', '储户.Alice', 600, '同行转账');
});
myBook.date('2020-06-30');
myBook.dump({ format: 'html' });






easybkjs.end_document();

